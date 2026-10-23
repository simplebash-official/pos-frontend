import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ActionIcon, Badge, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCalendarRepeat,
  IconCash,
  IconCoins,
  IconCreditCardPay,
  IconListDetails,
  IconPlus,
  IconSearch,
  IconWallet,
} from '@tabler/icons-react';
import { getDeviceId } from '@/api/deviceId';
import { AnimatedTabs } from '@/shared/components/drawer';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { PERMISSIONS } from '@/constants/permissions';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { useCurrentSession } from '@/features/billing/hooks/useRegisterSession';
import { useCashCategories } from '@/features/billing/hooks/useCashLookups';
import {
  CashMovementModal,
  type CashMovementPrefill,
} from '@/features/billing/components/sessions/CashMovementModal';
import { useExpenseStats, useExpenses } from '../hooks/useExpenses';
import { useRecurringBills } from '../hooks/useRecurring';
import { needsAttention } from '../lib/billView';
import { canPay, paidFromLabel, statusLook } from '../lib/expenseView';
import type {
  ExpenseListQuery,
  ExpenseRow,
  ExpenseSource,
  RecurringBill,
  RecurringExpense,
} from '../types';
import { ExpenseFormModal, type ExpensePrefill } from './ExpenseFormModal';
import { ExpensePaymentModal } from './ExpensePaymentModal';
import { RecurringFormModal } from './RecurringFormModal';
import { RegularBillsPanel } from './RegularBillsPanel';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SEARCH_DEBOUNCE_MS = 300;
const BILLS_REFRESH_MS = 5 * 60 * 1000;

type ExpensesTab = 'all' | 'bills';
type StatusFilter = 'all' | NonNullable<ExpenseListQuery['status']>;
type SourceFilter = 'all' | ExpenseSource;

const isStatusFilter = (value: string | null): value is StatusFilter =>
  value === 'all' || value === 'unpaid' || value === 'overdue' || value === 'paid';
const isSourceFilter = (value: string | null): value is SourceFilter =>
  value === 'all' || value === 'ledger' || value === 'drawer';

// Every business cost, newest first: what was paid from the cash drawer (read from the cash
// movements, never entered twice) together with what was paid from the bank, a card or online and
// the bills still to pay; plus the shop's regular monthly bills with their reminders. Search,
// filters and paging happen on the server; only people with the expenses permission reach this
// page (see the route guard) and the backend refuses everyone else.
export const ExpensesPage = () => {
  const isMobile = useIsMobile();
  const canManage = useHasPermission(PERMISSIONS.EXPENSES_MANAGE);
  // A bell reminder opens the page on the bills tab.
  const [tab, setTab] = useState<ExpensesTab>(() =>
    new URLSearchParams(window.location.search).has('pay') ? 'bills' : 'all'
  );
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [source, setSource] = useState<SourceFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  const { data, isLoading } = useExpenses({
    page,
    limit: pageSize,
    search: debouncedSearch === '' ? undefined : debouncedSearch,
    status: status === 'all' ? undefined : status,
    source: source === 'all' ? undefined : source,
  });
  const stats = useExpenseStats();

  const [searchParams, updateSearchParams] = useSearchParams();
  const bills = useRecurringBills(false, true, BILLS_REFRESH_MS);
  const { session } = useCurrentSession(getDeviceId());
  const { data: categories = [] } = useCashCategories({ forExpenses: true }, true);

  const [formOpen, setFormOpen] = useState(false);
  const [paying, setPaying] = useState<ExpenseRow | null>(null);
  const [recurringForm, setRecurringForm] = useState<{ editing?: RecurringExpense } | null>(null);
  const [cashPrefill, setCashPrefill] = useState<CashMovementPrefill | null>(null);
  const [expensePrefill, setExpensePrefill] = useState<ExpensePrefill | null>(null);

  // What paying a regular bill opens: the cash form for the drawer (it needs this register's open
  // shift), otherwise the expense form, either with the bill's details filled in.
  const planPayment = (
    bill: RecurringBill
  ):
    | { kind: 'cash'; prefill: CashMovementPrefill }
    | { kind: 'expense'; prefill: ExpensePrefill }
    | { kind: 'needs-shift' } => {
    const { template } = bill;
    if (template.paidFrom === 'drawer') {
      const category = categories.find((c) => c.key === template.categoryKey);
      if (session === null || category === undefined) return { kind: 'needs-shift' };
      return {
        kind: 'cash',
        prefill: {
          movementType: category.movementType,
          categoryKey: template.categoryKey,
          payeeKey: template.payeeKey,
          amountCents: bill.balanceCents,
          period: bill.period,
        },
      };
    }
    const today = formatDate(new Date(), 'YYYY-MM-DD');
    return {
      kind: 'expense',
      prefill: {
        categoryKey: template.categoryKey,
        payeeKey: template.payeeKey,
        amountCents: bill.balanceCents,
        paidFrom: template.paidFrom,
        // A bill of an earlier month is dated on its due day so it counts towards that month.
        date: bill.dueDate < today ? bill.dueDate : today,
      },
    };
  };

  const startPayment = (bill: RecurringBill) => {
    const plan = planPayment(bill);
    if (plan.kind === 'needs-shift') {
      notifications.show({
        title: t('Open a shift first'),
        message: t('Paying from the drawer needs an open shift on this register.'),
        color: 'orange',
      });
    } else if (plan.kind === 'cash') {
      setCashPrefill(plan.prefill);
    } else {
      setExpensePrefill(plan.prefill);
    }
  };

  // A bell reminder links here with ?pay=<bill key>: start that payment once the bills are in. It is
  // done while rendering (React's "adjust state when a value changes") and the link is tidied after.
  const [handledPay, setHandledPay] = useState<string | null>(null);
  const payKey = searchParams.get('pay');
  if (payKey !== null && payKey !== handledPay && bills.data !== undefined) {
    setHandledPay(payKey);
    const bill = bills.data.find((b) => b.template.key === payKey);
    if (bill !== undefined && canManage && bill.status !== 'paid') {
      const plan = planPayment(bill);
      if (plan.kind === 'cash') setCashPrefill(plan.prefill);
      if (plan.kind === 'expense') setExpensePrefill(plan.prefill);
    }
  }
  useEffect(() => {
    if (payKey !== null && payKey === handledPay) updateSearchParams({}, { replace: true });
  }, [payKey, handledPay, updateSearchParams]);

  const columns = useMemo<Column<ExpenseRow>[]>(
    () => [
      {
        key: 'date',
        header: t('Date'),
        align: 'left',
        render: (row) => (
          <Stack gap={0}>
            <Text size="sm">{formatDate(row.date)}</Text>
            <Text size="xs" c="dimmed">
              {row.number}
            </Text>
          </Stack>
        ),
      },
      {
        key: 'for',
        header: t('For'),
        align: 'left',
        render: (row) => (
          <Stack gap={0}>
            <Text size="sm" fw={600} lineClamp={1}>
              {row.categoryName}
            </Text>
            {row.payeeName && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {row.payeeName}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        key: 'amount',
        header: t('Amount'),
        align: 'right',
        render: (row) => (
          <Stack gap={0} align="flex-end">
            <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(row.amountCents)}
            </Text>
            {row.balanceCents > 0 && (
              <Text size="xs" c="dimmed" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {t('Owed')} {formatMoney(row.balanceCents)}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        key: 'paidFrom',
        header: t('Paid from'),
        align: 'left',
        render: (row) => <Text size="sm">{paidFromLabel(row.paidFrom)}</Text>,
      },
      {
        key: 'status',
        header: t('Status'),
        align: 'center',
        render: (row) => {
          const look = statusLook(row);
          return (
            <Stack gap={2} align="center">
              <Badge size="sm" variant="light" color={look.color}>
                {look.label}
              </Badge>
              {row.dueDate && row.balanceCents > 0 && (
                <Text size="xs" c="dimmed">
                  {t('Due')} {formatDate(row.dueDate)}
                </Text>
              )}
            </Stack>
          );
        },
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (row) =>
          canManage && canPay(row) ? (
            <Group gap={6} justify="flex-end" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
              <ActionIcon
                variant="light"
                color="blue"
                size={isMobile ? 44 : 32}
                aria-label={`${t('Pay bill')} ${row.number}`}
                onClick={() => setPaying(row)}
                data-log-id="expenses.pay"
              >
                <IconCreditCardPay size={16} />
              </ActionIcon>
            </Group>
          ) : null,
      },
    ],
    [isMobile, canManage]
  );

  return (
    <>
      <Stack gap="md">
        <PageHeader
          title={t('Expenses')}
          description={t(
            'Everything the shop spends: from the drawer, the bank, a card or online, and bills still to pay.'
          )}
          action={
            canManage ? (
              <Button
                h={isMobile ? 44 : undefined}
                leftSection={<IconPlus size={16} />}
                onClick={() => (tab === 'bills' ? setRecurringForm({}) : setFormOpen(true))}
                data-log-id={tab === 'bills' ? 'expenses.new-regular-bill' : 'expenses.new'}
              >
                {tab === 'bills' ? t('Add Regular Bill') : t('Add Expense')}
              </Button>
            ) : null
          }
        />

        <MetricCardRow
          staleAsOf={stats.staleAsOf}
          cards={[
            {
              key: 'month',
              label: 'Spent this month',
              value: stats.data ? formatMoney(stats.data.thisMonthCents) : '-',
              color: 'blue',
              icon: <IconWallet size={18} />,
              loading: stats.isLoading,
              skeletonWidth: 100,
            },
            {
              key: 'drawer',
              label: 'From the drawer',
              value: stats.data ? formatMoney(stats.data.thisMonthDrawerCents) : '-',
              color: 'teal',
              icon: <IconCash size={18} />,
              loading: stats.isLoading,
              skeletonWidth: 100,
            },
            {
              key: 'owed',
              label: 'Still owed',
              value: stats.data ? formatMoney(stats.data.unpaidCents) : '-',
              color: 'orange',
              icon: <IconCoins size={18} />,
              loading: stats.isLoading,
              skeletonWidth: 100,
            },
            {
              key: 'overdue',
              label: 'Overdue',
              value: stats.data ? formatMoney(stats.data.overdueCents) : '-',
              color: 'red',
              icon: <IconAlertTriangle size={18} />,
              loading: stats.isLoading,
              skeletonWidth: 100,
            },
          ]}
        />

        <AnimatedTabs<ExpensesTab>
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'all', label: t('All expenses'), icon: <IconListDetails size={16} /> },
            {
              value: 'bills',
              label: t('Regular bills'),
              icon: <IconCalendarRepeat size={16} />,
              count:
                bills.data === undefined ? undefined : bills.data.filter(needsAttention).length,
            },
          ]}
        >
          {(active) =>
            active === 'bills' ? (
              <RegularBillsPanel
                bills={bills.data}
                loading={bills.isLoading}
                canManage={canManage}
                onPay={startPayment}
                onEdit={(editing) => setRecurringForm({ editing })}
                onAdd={() => setRecurringForm({})}
              />
            ) : (
              <Stack gap="md">
                <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
                  <TextInput
                    aria-label={t('Search expenses')}
                    placeholder={t('Search by number, what it is for, or who was paid')}
                    leftSection={<IconSearch size={16} />}
                    size={isMobile ? 'md' : 'sm'}
                    styles={isMobile ? { input: { minHeight: 44 } } : undefined}
                    value={search}
                    onChange={(event) => {
                      setSearch(event.currentTarget.value);
                      setPage(1);
                    }}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <Select
                    aria-label={t('Show')}
                    size={isMobile ? 'md' : 'sm'}
                    styles={isMobile ? { input: { minHeight: 44 } } : undefined}
                    allowDeselect={false}
                    data={[
                      { value: 'all', label: t('All expenses') },
                      { value: 'unpaid', label: t('Still owed') },
                      { value: 'overdue', label: t('Overdue') },
                      { value: 'paid', label: t('Paid') },
                    ]}
                    value={status}
                    onChange={(value) => {
                      if (isStatusFilter(value)) {
                        setStatus(value);
                        setPage(1);
                      }
                    }}
                    style={{ width: isMobile ? '100%' : 180, flexShrink: 0 }}
                  />
                  <Select
                    aria-label={t('Paid from')}
                    size={isMobile ? 'md' : 'sm'}
                    styles={isMobile ? { input: { minHeight: 44 } } : undefined}
                    allowDeselect={false}
                    data={[
                      { value: 'all', label: t('Any account') },
                      { value: 'drawer', label: t('Cash drawer') },
                      { value: 'ledger', label: t('Bank, card or online') },
                    ]}
                    value={source}
                    onChange={(value) => {
                      if (isSourceFilter(value)) {
                        setSource(value);
                        setPage(1);
                      }
                    }}
                    style={{ width: isMobile ? '100%' : 200, flexShrink: 0 }}
                  />
                </Group>

                <DataTable<ExpenseRow>
                  data={data?.expenses ?? []}
                  columns={columns}
                  keyExtractor={(row) => `${row.source}:${row.key}`}
                  loading={isLoading}
                  emptyText={t('No expenses found.')}
                  selectable={false}
                  onRowClick={(row) => {
                    if (canManage && canPay(row)) setPaying(row);
                  }}
                  clientPagination={false}
                  page={page}
                  pageSize={pageSize}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  total={data?.total ?? 0}
                  totalPages={data?.totalPages ?? 1}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                />
              </Stack>
            )
          }
        </AnimatedTabs>
      </Stack>

      {formOpen && <ExpenseFormModal opened onClose={() => setFormOpen(false)} />}
      {expensePrefill !== null && (
        <ExpenseFormModal opened prefill={expensePrefill} onClose={() => setExpensePrefill(null)} />
      )}
      {recurringForm !== null && (
        <RecurringFormModal
          opened
          editing={recurringForm.editing}
          onClose={() => setRecurringForm(null)}
        />
      )}
      {cashPrefill !== null && session !== null && (
        <CashMovementModal
          opened
          prefill={cashPrefill}
          terminalId={getDeviceId()}
          sessionKey={session.key}
          onClose={() => setCashPrefill(null)}
        />
      )}
      <ExpensePaymentModal expense={paying} onClose={() => setPaying(null)} />
    </>
  );
};
