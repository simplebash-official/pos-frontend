import { useMemo, useState } from 'react';
import { Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconCash, IconHistory, IconPlus, IconSearch, IconWallet } from '@tabler/icons-react';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { PERMISSIONS } from '@/constants/permissions';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { useIncome, useIncomeStats } from '../hooks/useIncome';
import { receivedIntoLabel } from '../lib/incomeView';
import type { IncomeRow, IncomeSource } from '../types';
import { ReceiptsAction } from '@/features/attachments/components/ReceiptsAction';
import { IncomeFormModal } from './IncomeFormModal';

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SEARCH_DEBOUNCE_MS = 300;

type SourceFilter = 'all' | IncomeSource;

const isSourceFilter = (value: string | null): value is SourceFilter =>
  value === 'all' || value === 'ledger' || value === 'drawer';

// Money the shop received that is not a sale: cash put into the drawer under an income category
// (read from the cash movements, never entered twice) together with what went to the bank, a card
// or online. Sales income is worked out from invoices and is not entered here. Search, filters and
// paging happen on the server; only people with the income permission reach this page (see the
// route guard) and the backend refuses everyone else.
export const IncomePage = () => {
  const isMobile = useIsMobile();
  const canManage = useHasPermission(PERMISSIONS.INCOME_MANAGE);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const [source, setSource] = useState<SourceFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useIncome({
    page,
    limit: pageSize,
    search: debouncedSearch === '' ? undefined : debouncedSearch,
    source: source === 'all' ? undefined : source,
  });
  const stats = useIncomeStats();

  const columns = useMemo<Column<IncomeRow>[]>(
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
          <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(row.amountCents)}
          </Text>
        ),
      },
      {
        key: 'receivedInto',
        header: t('Received in'),
        align: 'left',
        render: (row) => <Text size="sm">{receivedIntoLabel(row.receivedInto)}</Text>,
      },
      {
        key: 'receipts',
        header: '',
        align: 'right',
        render: (row) => (
          <ReceiptsAction
            ownerKind={row.source === 'drawer' ? 'cash_movement' : 'income'}
            ownerKey={row.key}
            number={row.number}
          />
        ),
      },
    ],
    []
  );

  return (
    <>
      <Stack gap="md">
        <PageHeader
          title={t('Income')}
          description={t(
            'Money received that is not a sale: into the drawer, the bank, a card or online. Sales are counted from invoices.'
          )}
          action={
            canManage ? (
              <Button
                h={isMobile ? 44 : undefined}
                leftSection={<IconPlus size={16} />}
                onClick={() => setFormOpen(true)}
                data-log-id="income.new"
              >
                {t('Record Income')}
              </Button>
            ) : null
          }
        />

        <MetricCardRow
          staleAsOf={stats.staleAsOf}
          cards={[
            {
              key: 'month',
              label: 'Received this month',
              value: stats.data ? formatMoney(stats.data.thisMonthCents) : '-',
              color: 'green',
              icon: <IconWallet size={18} />,
              loading: stats.isLoading,
              skeletonWidth: 100,
            },
            {
              key: 'drawer',
              label: 'Into the drawer',
              value: stats.data ? formatMoney(stats.data.thisMonthDrawerCents) : '-',
              color: 'teal',
              icon: <IconCash size={18} />,
              loading: stats.isLoading,
              skeletonWidth: 100,
            },
            {
              key: 'last',
              label: 'Last month',
              value: stats.data ? formatMoney(stats.data.lastMonthCents) : '-',
              color: 'blue',
              icon: <IconHistory size={18} />,
              loading: stats.isLoading,
              skeletonWidth: 100,
            },
          ]}
        />

        <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
          <TextInput
            aria-label={t('Search income')}
            placeholder={t('Search by number, what it is for, or who it came from')}
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
            aria-label={t('Received in')}
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

        <DataTable<IncomeRow>
          data={data?.incomes ?? []}
          columns={columns}
          keyExtractor={(row) => `${row.source}:${row.key}`}
          loading={isLoading}
          emptyText={t('No income found.')}
          selectable={false}
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

      {formOpen && <IncomeFormModal opened onClose={() => setFormOpen(false)} />}
    </>
  );
};
