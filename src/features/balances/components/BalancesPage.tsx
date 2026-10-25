import { useMemo, useState } from 'react';
import { Badge, Button, Group, Stack, Text } from '@mantine/core';
import { IconCoins, IconTruckDelivery, IconUsers } from '@tabler/icons-react';
import { AnimatedTabs } from '@/shared/components/drawer';
import { DataTable, type Column } from '@/shared/components/DataTable';
import { PageHeader } from '@/shared/components/PageHeader';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { PERMISSIONS } from '@/constants/permissions';
import { PaySupplierModal } from '@/features/purchases/components/PaySupplierModal';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { useStaffAdvances, useSupplierBalances } from '../hooks/useBalances';
import type { StaffAdvance, SupplierBalance } from '../types';
import { AdvanceHistoryModal } from './AdvanceHistoryModal';
import { BalanceOpeningModal } from './BalanceOpeningModal';
import { RecoverAdvanceModal } from './RecoverAdvanceModal';

type BalancesTab = 'suppliers' | 'staff';

// What the shop owes its suppliers and what staff still owe on advances. Both are worked out by the
// server from purchases, payments and advances; the page never recomputes them. A supplier shows
// "Not set up" until someone says what was owed on a day. Only people with the balances permission
// reach this page (see the route guard) and the backend refuses everyone else.
export const BalancesPage = () => {
  const isMobile = useIsMobile();
  const canManage = useHasPermission(PERMISSIONS.BALANCES_MANAGE);
  const canPayCash = useHasPermission(PERMISSIONS.CASH_MOVEMENTS_CREATE_MANAGED);
  const canPayLedger = useHasPermission(PERMISSIONS.EXPENSES_MANAGE);
  const canPay = canPayCash || canPayLedger;
  const [tab, setTab] = useState<BalancesTab>('suppliers');
  const suppliers = useSupplierBalances();
  const staff = useStaffAdvances();

  const [opening, setOpening] = useState<{
    subject: 'supplier' | 'staff';
    key: string;
    name: string;
    current?: { amountCents: number; asOfDate: string };
  } | null>(null);
  const [paying, setPaying] = useState<{ key: string; name: string } | null>(null);
  const [recovering, setRecovering] = useState<StaffAdvance | null>(null);
  const [history, setHistory] = useState<StaffAdvance | null>(null);

  const supplierColumns = useMemo<Column<SupplierBalance>[]>(
    () => [
      {
        key: 'name',
        header: t('Supplier'),
        align: 'left',
        render: (row) => (
          <Text size="sm" fw={600} lineClamp={1}>
            {row.name}
          </Text>
        ),
      },
      {
        key: 'bought',
        header: t('Bought'),
        align: 'right',
        render: (row) =>
          row.purchasedCents === undefined ? null : (
            <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(row.purchasedCents)}
            </Text>
          ),
      },
      {
        key: 'paid',
        header: t('Paid'),
        align: 'right',
        render: (row) =>
          row.paidCents === undefined ? null : (
            <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(row.paidCents)}
            </Text>
          ),
      },
      {
        key: 'credit',
        header: t('Credit'),
        align: 'right',
        render: (row) =>
          row.creditedCents === undefined ? null : (
            <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(row.creditedCents)}
            </Text>
          ),
      },
      {
        key: 'owed',
        header: t('We owe'),
        align: 'right',
        render: (row) =>
          row.balanceCents === undefined ? (
            <Badge variant="light" color="gray">
              {t('Not set up')}
            </Badge>
          ) : (
            <Stack gap={0} align="flex-end">
              <Text
                size="sm"
                fw={700}
                c={row.balanceCents > 0 ? 'orange' : undefined}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatMoney(row.balanceCents)}
              </Text>
              {row.balanceCents < 0 && (
                <Text size="xs" c="dimmed">
                  {t('Paid ahead')}
                </Text>
              )}
              {row.asOfDate !== undefined && (
                <Text size="xs" c="dimmed">
                  {`${t('since')} ${formatDate(row.asOfDate)}`}
                </Text>
              )}
            </Stack>
          ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (row) => (
          <Group gap={6} justify="flex-end" wrap="nowrap">
            {canPay ? (
              <Button
                variant="light"
                size="xs"
                h={isMobile ? 44 : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaying({ key: row.supplierKey, name: row.name });
                }}
                data-log-id="balances.pay-supplier"
              >
                {t('Pay')}
              </Button>
            ) : null}
            {canManage ? (
              <Button
                variant={row.balanceCents === undefined ? 'light' : 'default'}
                size="xs"
                h={isMobile ? 44 : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpening({
                    subject: 'supplier',
                    key: row.supplierKey,
                    name: row.name,
                    current:
                      row.openingBalanceCents !== undefined && row.asOfDate !== undefined
                        ? { amountCents: row.openingBalanceCents, asOfDate: row.asOfDate }
                        : undefined,
                  });
                }}
                data-log-id="balances.supplier-opening"
              >
                {row.balanceCents === undefined
                  ? t('Set opening balance')
                  : t('Change opening balance')}
              </Button>
            ) : null}
          </Group>
        ),
      },
    ],
    [canManage, canPay, isMobile]
  );

  const staffColumns = useMemo<Column<StaffAdvance>[]>(
    () => [
      {
        key: 'name',
        header: t('Staff member'),
        align: 'left',
        render: (row) => (
          <Stack gap={0}>
            <Text size="sm" fw={600} lineClamp={1}>
              {row.name}
            </Text>
            {row.lastGivenOn !== undefined && (
              <Text size="xs" c="dimmed">
                {`${t('Last advance')} ${formatDate(row.lastGivenOn)}`}
              </Text>
            )}
          </Stack>
        ),
      },
      {
        key: 'given',
        header: t('Given'),
        align: 'right',
        render: (row) => (
          <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(row.givenCents)}
          </Text>
        ),
      },
      {
        key: 'recovered',
        header: t('Taken back'),
        align: 'right',
        render: (row) => (
          <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(row.recoveredCents)}
          </Text>
        ),
      },
      {
        key: 'owes',
        header: t('Still owes'),
        align: 'right',
        render: (row) => (
          <Text
            size="sm"
            fw={700}
            c={row.outstandingCents > 0 ? 'orange' : undefined}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatMoney(row.outstandingCents)}
          </Text>
        ),
      },
      {
        key: 'actions',
        header: '',
        align: 'right',
        render: (row) => (
          <Group gap={6} justify="flex-end" wrap="nowrap" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="default"
              size="xs"
              h={isMobile ? 44 : undefined}
              onClick={() => setHistory(row)}
            >
              {t('History')}
            </Button>
            {canManage && (
              <>
                <Button
                  variant="light"
                  size="xs"
                  h={isMobile ? 44 : undefined}
                  disabled={row.outstandingCents <= 0}
                  onClick={() => setRecovering(row)}
                  data-log-id="balances.recover-advance"
                >
                  {t('Recover from pay')}
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  h={isMobile ? 44 : undefined}
                  onClick={() =>
                    setOpening({
                      subject: 'staff',
                      key: row.employeeKey,
                      name: row.name,
                      current:
                        row.openingBalanceCents !== undefined && row.asOfDate !== undefined
                          ? { amountCents: row.openingBalanceCents, asOfDate: row.asOfDate }
                          : undefined,
                    })
                  }
                >
                  {t('Earlier balance')}
                </Button>
              </>
            )}
          </Group>
        ),
      },
    ],
    [canManage, isMobile]
  );

  return (
    <>
      <Stack gap="md">
        <PageHeader
          title={t('Balances')}
          description={t(
            'What the shop owes its suppliers, and what staff still owe on advances. Worked out from purchases, payments and advances.'
          )}
        />
        <AnimatedTabs<BalancesTab>
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'suppliers', label: t('Suppliers'), icon: <IconTruckDelivery size={16} /> },
            { value: 'staff', label: t('Staff advances'), icon: <IconUsers size={16} /> },
          ]}
        >
          {(active) =>
            active === 'suppliers' ? (
              <DataTable<SupplierBalance>
                data={suppliers.data?.suppliers ?? []}
                columns={supplierColumns}
                keyExtractor={(row) => row.supplierKey}
                loading={suppliers.isLoading}
                emptyText={t('No suppliers yet.')}
                selectable={false}
                clientPagination
              />
            ) : (
              <Stack gap="xs">
                <Group gap="xs">
                  <IconCoins size={16} />
                  <Text size="xs" c="dimmed">
                    {t(
                      'Advances are staff payments filed under "Advance" or "Staff loan". A salary is not an advance.'
                    )}
                  </Text>
                </Group>
                <DataTable<StaffAdvance>
                  data={staff.data?.staff ?? []}
                  columns={staffColumns}
                  keyExtractor={(row) => row.employeeKey}
                  loading={staff.isLoading}
                  emptyText={t('No advances have been given.')}
                  selectable={false}
                  clientPagination
                />
              </Stack>
            )
          }
        </AnimatedTabs>
      </Stack>

      {opening !== null && (
        <BalanceOpeningModal
          subject={opening.subject}
          subjectKey={opening.key}
          name={opening.name}
          current={opening.current}
          onClose={() => setOpening(null)}
        />
      )}
      {paying !== null && (
        <PaySupplierModal
          opened
          onClose={() => setPaying(null)}
          supplierKey={paying.key}
          supplierName={paying.name}
        />
      )}
      {recovering !== null && (
        <RecoverAdvanceModal advance={recovering} onClose={() => setRecovering(null)} />
      )}
      {history !== null && (
        <AdvanceHistoryModal advance={history} onClose={() => setHistory(null)} />
      )}
    </>
  );
};
