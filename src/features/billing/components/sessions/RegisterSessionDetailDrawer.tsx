import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Pagination,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconActivity,
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCalendar,
  IconCash,
  IconCashRegister,
  IconClock,
  IconClockPlay,
  IconCoins,
  IconCreditCard,
  IconFileText,
  IconHistory,
  IconReceipt,
  IconRefresh,
  IconScale,
  IconUser,
  IconWallet,
} from '@tabler/icons-react';
import {
  AnimatedTabs,
  DrawerAfter,
  DrawerCard,
  DrawerFooter,
  DrawerGrid,
  DrawerHero,
  DrawerMain,
  DrawerRail,
  Figure,
  InfoRow,
  KpiStrip,
  KpiTile,
  RichDrawer,
} from '@/shared/components/drawer';
import { useCashMovementList, useSessionDetail } from '../../hooks/useRegisterSession';
import { useSessionInvoices } from '../../hooks/useInvoices';
import { InvoiceDetailDrawer } from '@/features/invoices/components/InvoiceDetailDrawer';
import { getInvoiceStatusMeta } from '@/features/invoices/lib/invoiceStatus';
import type { Invoice } from '@/features/billing/types';
import { useAppSelector } from '@/store/hooks';
import { selectUserPermissions, selectUserRole } from '@/store/slices/authSlice';
import { PERMISSIONS } from '@/constants/permissions';
import { USER_ROLES } from '@/constants/roles';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { t } from '@/shared/i18n/t';
import { calculateExpectedDrawerCash } from './sessionMath';
import { ZReportModal } from './ZReportModal';
import { ReopenSessionModal } from './ReopenSessionModal';
import { ConvertVarianceModal } from './ConvertVarianceModal';
import type { CashMovement, RegisterSession } from '../../types';

export interface RegisterSessionDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  session: RegisterSession | null;
  onRefresh?: () => void;
}

type ShiftTab = 'overview' | 'invoices' | 'movements' | 'audit';

const getStatusBadge = (status: RegisterSession['status']) => {
  switch (status) {
    case 'open':
      return {
        label: t('Open Shift'),
        color: 'teal',
        icon: <IconClockPlay size={14} />,
      };
    case 'closing':
      return {
        label: t('Closing'),
        color: 'amber',
        icon: <IconClock size={14} />,
      };
    case 'closed':
      return {
        label: t('Closed'),
        color: 'gray',
        icon: <IconHistory size={14} />,
      };
    case 'reopened':
      return {
        label: t('Reopened'),
        color: 'grape',
        icon: <IconRefresh size={14} />,
      };
    default:
      return {
        label: String(status),
        color: 'gray',
        icon: null,
      };
  }
};

const getMovementTypeMeta = (type: string) => {
  switch (type) {
    case 'pay_in':
      return {
        label: t('Pay In (Float Top-up)'),
        color: 'teal',
        icon: <IconArrowDownRight size={14} />,
      };
    case 'pay_out_expense':
      return {
        label: t('Petty Cash Expense'),
        color: 'orange',
        icon: <IconArrowUpRight size={14} />,
      };
    case 'pay_out_supplier':
      return {
        label: t('Supplier Payment'),
        color: 'pink',
        icon: <IconArrowUpRight size={14} />,
      };
    case 'owner_withdrawal':
      return {
        label: t('Owner Drawings'),
        color: 'indigo',
        icon: <IconArrowUpRight size={14} />,
      };
    case 'cash_drop':
      return {
        label: t('Cash Drop to Safe'),
        color: 'blue',
        icon: <IconArrowUpRight size={14} />,
      };
    case 'drawer_open_no_sale':
      return {
        label: t('Drawer Open (No Sale)'),
        color: 'gray',
        icon: <IconActivity size={14} />,
      };
    default:
      return {
        label: type,
        color: 'gray',
        icon: null,
      };
  }
};

const formatShiftDuration = (openedAt: string, closedAt?: string | null) => {
  const start = new Date(openedAt).getTime();
  const end = closedAt ? new Date(closedAt).getTime() : Date.now();
  if (isNaN(start) || isNaN(end) || end < start) return '-';
  const diffMinutes = Math.max(1, Math.round((end - start) / (1000 * 60)));
  if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? 'min' : 'mins'}`;
  }
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const RegisterSessionDetailDrawer: React.FC<RegisterSessionDetailDrawerProps> = ({
  opened,
  onClose,
  session: initialSession,
  onRefresh,
}) => {
  const permissions = useAppSelector(selectUserPermissions);
  const role = useAppSelector(selectUserRole);
  const canManage =
    role === USER_ROLES.ADMIN ||
    role === USER_ROLES.MANAGER ||
    permissions.includes(PERMISSIONS.REGISTER_SESSIONS_MANAGE);

  // Keep live/cached detail in sync with backend
  const { session: liveSession } = useSessionDetail(opened ? initialSession?.key : undefined);
  const session = liveSession ?? initialSession;

  const [activeTab, setActiveTab] = useState<ShiftTab>('overview');
  const [zReportModalOpened, setZReportModalOpened] = useState(false);
  const [reopenModalOpened, setReopenModalOpened] = useState(false);
  const [convertModalOpened, setConvertModalOpened] = useState(false);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceDrawerOpened, setInvoiceDrawerOpened] = useState(false);

  // Query invoices for this session (only when tab is invoices or drawer is open)
  const {
    data: invoicesData,
    isLoading: invoicesLoading,
    refetch: refetchInvoices,
  } = useSessionInvoices(
    session?.key,
    invoicesPage,
    15,
    opened && (activeTab === 'invoices' || Boolean(selectedInvoice))
  );
  const invoices: Invoice[] = useMemo(() => invoicesData?.invoices ?? [], [invoicesData?.invoices]);
  const invoicesTotal = invoicesData?.total;
  const invoicesTotalPages = invoicesData?.totalPages ?? 1;

  // Query cash movements for this session
  const { data: movementsData, isLoading: movementsLoading } = useCashMovementList(
    opened && session?.key ? { sessionKey: session.key, limit: 100 } : undefined
  );
  const movements: CashMovement[] = useMemo(
    () => movementsData?.movements ?? [],
    [movementsData?.movements]
  );

  const totalMovementsInCents = useMemo(
    () =>
      movements
        .filter((m) => m.movementType === 'pay_in')
        .reduce((acc, m) => acc + (m.amountCents || 0), 0),
    [movements]
  );

  const totalMovementsOutCents = useMemo(
    () =>
      movements
        .filter((m) => m.movementType !== 'pay_in' && m.movementType !== 'drawer_open_no_sale')
        .reduce((acc, m) => acc + (m.amountCents || 0), 0),
    [movements]
  );

  if (!session) return null;

  const statusMeta = getStatusBadge(session.status);
  const totalSales =
    (session.totalCashSalesCents || 0) +
    (session.totalCardSalesCents || 0) +
    (session.totalOnlineSalesCents || 0) +
    (session.totalCreditSalesCents || 0);

  const expectedCash = session.expectedCashCents ?? calculateExpectedDrawerCash(session);
  const countedCash = session.countedCashCents;
  const variance = session.cashVarianceCents;

  const handleCopySessionNumber = () => {
    void navigator.clipboard.writeText(session.sessionNumber);
    notifications.show({
      title: t('Copied'),
      message: `${t('Session number copied to clipboard')}: ${session.sessionNumber}`,
      color: 'blue',
    });
  };

  // Denominations object parsing if available
  const rawDenoms = session.closingDenominations ?? session.openingDenominations;
  const denomsObj: Record<string, number> =
    rawDenoms && typeof rawDenoms === 'object' && !Array.isArray(rawDenoms)
      ? (rawDenoms as Record<string, number>)
      : {};
  const hasDenominations = Object.keys(denomsObj).length > 0;

  const tabs = [
    {
      value: 'overview' as const,
      label: t('Sales & Tenders'),
      icon: <IconWallet size={16} />,
    },
    {
      value: 'invoices' as const,
      label: t('Invoices'),
      icon: <IconReceipt size={16} />,
      count: invoicesTotal,
    },
    {
      value: 'movements' as const,
      label: t('Cash Movements'),
      icon: <IconCoins size={16} />,
      count: movements.length,
    },
    {
      value: 'audit' as const,
      label: t('Audit & Notes'),
      icon: <IconHistory size={16} />,
    },
  ];

  const totalDrawerInflows =
    session.openingFloatCents + (session.totalCashSalesCents || 0) + (session.totalPayInCents || 0);

  const totalDrawerOutflows =
    (session.totalPayOutCents || 0) +
    (session.totalCashRefundsCents || 0) +
    (session.totalCashDropsCents || 0) +
    (session.totalOwnerWithdrawalsCents || 0);

  return (
    <>
      <RichDrawer
        data={session}
        opened={opened}
        onClose={onClose}
        width="wide"
        title={{
          icon: <IconCashRegister size={22} />,
          text: session.sessionNumber,
          subtitle: `${t('Terminal')}: ${session.terminalId} · ${statusMeta.label}`,
        }}
        footer={(s) => (
          <DrawerFooter
            start={
              <Button
                variant="filled"
                color="blue"
                size="sm"
                leftSection={<IconFileText size={16} />}
                onClick={() => setZReportModalOpened(true)}
              >
                {t('View Z-Report')}
              </Button>
            }
          >
            {canManage && s.status === 'closed' && (
              <Button
                variant="light"
                color="orange"
                size="sm"
                leftSection={<IconRefresh size={16} />}
                onClick={() => setReopenModalOpened(true)}
              >
                {t('Reopen Shift')}
              </Button>
            )}

            {canManage && s.status === 'closed' && s.cashVarianceCents !== 0 && (
              <Button
                variant="light"
                color="indigo"
                size="sm"
                leftSection={<IconScale size={16} />}
                onClick={() => setConvertModalOpened(true)}
              >
                {t('Convert Variance')}
              </Button>
            )}

            <Button variant="default" size="sm" onClick={onClose}>
              {t('Close')}
            </Button>
          </DrawerFooter>
        )}
      >
        {(s) => (
          <DrawerGrid>
            <KpiStrip>
              <KpiTile icon={<IconCash size={16} />} color="blue" label={t('Total Gross Sales')}>
                <Figure
                  value={formatMoney(totalSales)}
                  hint={t('All payment methods')}
                  color="blue"
                />
              </KpiTile>

              <KpiTile
                icon={<IconBuildingBank size={16} />}
                color="teal"
                label={t('Opening Float')}
              >
                <Figure
                  value={formatMoney(s.openingFloatCents)}
                  hint={t('Starting drawer balance')}
                  color="teal"
                />
              </KpiTile>

              <KpiTile
                icon={<IconWallet size={16} />}
                color="cyan"
                label={s.status === 'closed' ? t('Counted Cash') : t('Expected Cash')}
              >
                <Figure
                  value={
                    s.status === 'closed' && countedCash != null
                      ? formatMoney(countedCash)
                      : formatMoney(expectedCash)
                  }
                  hint={
                    s.status === 'closed'
                      ? `${t('Expected')}: ${formatMoney(expectedCash)}`
                      : t('Ledger balance')
                  }
                  color="cyan"
                />
              </KpiTile>

              <KpiTile
                icon={<IconScale size={16} />}
                color={
                  variance === 0 || variance == null ? 'teal' : variance < 0 ? 'red' : 'orange'
                }
                label={t('Cash Variance')}
              >
                <Figure
                  value={
                    variance == null
                      ? '-'
                      : variance === 0
                        ? t('Balanced')
                        : `${variance > 0 ? '+' : ''}${formatMoney(variance)}`
                  }
                  hint={
                    variance == null
                      ? t('Active shift')
                      : variance === 0
                        ? t('Exact match')
                        : variance < 0
                          ? t('Shortage')
                          : t('Overage')
                  }
                  color={
                    variance === 0 || variance == null ? 'teal' : variance < 0 ? 'red' : 'orange'
                  }
                />
              </KpiTile>
            </KpiStrip>

            <DrawerRail>
              <DrawerHero
                accent={statusMeta.color}
                icon={<IconCashRegister size={32} />}
                eyebrow={s.sessionNumber}
                status={{
                  color: statusMeta.color,
                  label: statusMeta.label,
                }}
                title={s.cashierNameSnapshot || s.cashierId || t('Register Shift')}
                subtitle={
                  <Stack gap={2}>
                    <Text size="xs" c="dimmed">
                      {t('Terminal')}: <strong>{s.terminalId}</strong>
                    </Text>
                    <Text size="xs" c="dimmed">
                      {formatDateTime(s.openedAt)}{' '}
                      {s.closedAt ? `→ ${formatDateTime(s.closedAt)}` : `(${t('In Progress')})`} ·{' '}
                      <Text component="span" fw={600} c="var(--text-primary)" inherit>
                        {formatShiftDuration(s.openedAt, s.closedAt)}
                      </Text>
                    </Text>
                  </Stack>
                }
              >
                {s.status === 'closed' && variance !== 0 && variance != null && (
                  <Paper p="xs" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
                    <Group gap="xs" wrap="nowrap" align="flex-start">
                      <IconAlertCircle
                        size={16}
                        style={{
                          color: variance < 0 ? 'var(--status-error)' : 'orange',
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      />
                      <Text size="xs" c={variance < 0 ? 'red' : 'orange'}>
                        <strong>{variance < 0 ? t('Cash Shortage') : t('Cash Overage')}:</strong>{' '}
                        {formatMoney(Math.abs(variance))}.{' '}
                        {s.varianceReason
                          ? `(${s.varianceReason})`
                          : t('Requires manager reconciliation.')}
                      </Text>
                    </Group>
                  </Paper>
                )}
              </DrawerHero>

              <DrawerAfter>
                <DrawerCard
                  label={t('Shift Session Details')}
                  icon={<IconCashRegister size={14} />}
                >
                  <Stack gap="xs">
                    <InfoRow icon={<IconCashRegister size={14} />} label={t('Session Number')}>
                      <Group gap={4} wrap="nowrap">
                        <Text size="xs" fw={700} ff="monospace">
                          {s.sessionNumber}
                        </Text>
                        <Tooltip label={t('Copy')}>
                          <Button
                            variant="subtle"
                            size="compact-xs"
                            onClick={handleCopySessionNumber}
                          >
                            {t('Copy')}
                          </Button>
                        </Tooltip>
                      </Group>
                    </InfoRow>

                    <InfoRow icon={<IconActivity size={14} />} label={t('Terminal / Register')}>
                      {s.terminalId}
                    </InfoRow>

                    <InfoRow icon={<IconUser size={14} />} label={t('Opening Cashier')}>
                      {s.cashierNameSnapshot || s.cashierId}
                    </InfoRow>

                    <InfoRow icon={<IconClockPlay size={14} />} label={t('Opened At')}>
                      {formatDateTime(s.openedAt)}
                    </InfoRow>

                    {s.closedAt && (
                      <>
                        <InfoRow icon={<IconUser size={14} />} label={t('Closing Cashier')}>
                          {s.closingCashierNameSnapshot || s.closingCashierId || '-'}
                        </InfoRow>
                        <InfoRow icon={<IconClock size={14} />} label={t('Closed At')}>
                          {formatDateTime(s.closedAt)}
                        </InfoRow>
                      </>
                    )}

                    <InfoRow icon={<IconClock size={14} />} label={t('Shift Duration')}>
                      {formatShiftDuration(s.openedAt, s.closedAt)}
                    </InfoRow>
                  </Stack>
                </DrawerCard>
              </DrawerAfter>

              <DrawerAfter>
                <DrawerCard
                  label={t('Drawer Balance Reconciliation')}
                  icon={<IconScale size={14} />}
                >
                  <Stack gap="xs">
                    <InfoRow icon={<IconBuildingBank size={14} />} label={t('Starting Float')}>
                      +{formatMoney(s.openingFloatCents)}
                    </InfoRow>
                    <InfoRow icon={<IconCash size={14} />} label={t('Net Cash Sales')}>
                      +{formatMoney(s.totalCashSalesCents || 0)}
                    </InfoRow>
                    {(s.totalPayInCents || 0) > 0 && (
                      <InfoRow
                        icon={<IconArrowDownRight size={14} />}
                        label={t('Pay-Ins (Top-ups)')}
                      >
                        +{formatMoney(s.totalPayInCents || 0)}
                      </InfoRow>
                    )}
                    {(s.totalPayOutCents || 0) > 0 && (
                      <InfoRow
                        icon={<IconArrowUpRight size={14} />}
                        label={t('Pay-Outs (Expenses)')}
                      >
                        -{formatMoney(s.totalPayOutCents || 0)}
                      </InfoRow>
                    )}
                    {(s.totalCashRefundsCents || 0) > 0 && (
                      <InfoRow icon={<IconArrowUpRight size={14} />} label={t('Cash Refunds')}>
                        -{formatMoney(s.totalCashRefundsCents || 0)}
                      </InfoRow>
                    )}
                    {(s.totalCashDropsCents || 0) > 0 && (
                      <InfoRow
                        icon={<IconArrowUpRight size={14} />}
                        label={t('Cash Drops to Safe')}
                      >
                        -{formatMoney(s.totalCashDropsCents || 0)}
                      </InfoRow>
                    )}
                    {(s.totalOwnerWithdrawalsCents || 0) > 0 && (
                      <InfoRow icon={<IconArrowUpRight size={14} />} label={t('Owner Withdrawals')}>
                        -{formatMoney(s.totalOwnerWithdrawalsCents || 0)}
                      </InfoRow>
                    )}
                    <Divider my={4} />
                    <InfoRow icon={<IconWallet size={14} />} label={t('Expected Drawer Cash')}>
                      <Text size="xs" fw={700}>
                        {formatMoney(expectedCash)}
                      </Text>
                    </InfoRow>
                    {s.status === 'closed' && (
                      <>
                        <InfoRow icon={<IconCoins size={14} />} label={t('Counted Cash')}>
                          <Text size="xs" fw={700}>
                            {countedCash != null ? formatMoney(countedCash) : '-'}
                          </Text>
                        </InfoRow>
                        <InfoRow icon={<IconScale size={14} />} label={t('Cash Variance')}>
                          <Badge
                            variant={variance === 0 || variance == null ? 'light' : 'filled'}
                            color={
                              variance === 0 || variance == null
                                ? 'teal'
                                : variance < 0
                                  ? 'red'
                                  : 'orange'
                            }
                            size="sm"
                          >
                            {variance == null
                              ? '-'
                              : variance === 0
                                ? t('Balanced')
                                : `${variance > 0 ? '+' : ''}${formatMoney(variance)}`}
                          </Badge>
                        </InfoRow>
                      </>
                    )}
                  </Stack>
                </DrawerCard>
              </DrawerAfter>
            </DrawerRail>

            <DrawerMain>
              <AnimatedTabs
                tabs={tabs}
                value={activeTab}
                onChange={(tab) => setActiveTab(tab as ShiftTab)}
              >
                {(tab) => {
                  if (tab === 'invoices') {
                    return (
                      <Stack gap="md">
                        <DrawerCard
                          label={t('Shift Invoices')}
                          icon={<IconReceipt size={16} />}
                          action={
                            invoicesTotal !== undefined ? (
                              <Badge variant="light" color="blue" size="sm">
                                {invoicesTotal} {t('Invoices')}
                              </Badge>
                            ) : undefined
                          }
                        >
                          {invoicesLoading && invoices.length === 0 ? (
                            <Text size="sm" c="dimmed" p="md">
                              {t('Loading invoices...')}
                            </Text>
                          ) : invoices.length === 0 ? (
                            <Stack gap="md" py="lg">
                              <Center>
                                <ThemeIcon size={52} radius="xl" variant="light" color="gray">
                                  <IconReceipt size={26} />
                                </ThemeIcon>
                              </Center>
                              <Text fw={700} size="sm" ta="center">
                                {t('No Invoices Recorded')}
                              </Text>
                              <Text size="xs" c="dimmed" maw={420} mx="auto" ta="center">
                                {t(
                                  'No sales transactions or invoices have been billed during this register shift.'
                                )}
                              </Text>
                            </Stack>
                          ) : (
                            <Stack gap="sm">
                              <Table striped highlightOnHover verticalSpacing="xs">
                                <Table.Thead>
                                  <Table.Tr>
                                    <Table.Th>{t('Invoice #')}</Table.Th>
                                    <Table.Th>{t('Customer')}</Table.Th>
                                    <Table.Th>{t('Tender')}</Table.Th>
                                    <Table.Th ta="center">{t('Status')}</Table.Th>
                                    <Table.Th ta="right">{t('Total')}</Table.Th>
                                    <Table.Th ta="right">{t('Time')}</Table.Th>
                                  </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                  {invoices.map((inv) => {
                                    const { color, label } = getInvoiceStatusMeta(inv);
                                    return (
                                      <Table.Tr
                                        key={inv.id || inv.invoiceNumber}
                                        onClick={() => {
                                          setSelectedInvoice(inv);
                                          setInvoiceDrawerOpened(true);
                                        }}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        <Table.Td>
                                          <Text size="xs" fw={700} ff="monospace">
                                            {inv.invoiceNumber}
                                          </Text>
                                        </Table.Td>
                                        <Table.Td>
                                          <Text size="xs" truncate maw={120}>
                                            {inv.customerName || t('Walk-in Customer')}
                                          </Text>
                                        </Table.Td>
                                        <Table.Td>
                                          <Text size="xs" tt="uppercase" fw={600}>
                                            {inv.paymentMethod}
                                          </Text>
                                        </Table.Td>
                                        <Table.Td ta="center">
                                          <Badge size="xs" color={color}>
                                            {label}
                                          </Badge>
                                        </Table.Td>
                                        <Table.Td
                                          ta="right"
                                          style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                          <Text size="xs" fw={700}>
                                            {formatMoney(inv.totalCents)}
                                          </Text>
                                        </Table.Td>
                                        <Table.Td
                                          ta="right"
                                          style={{ fontVariantNumeric: 'tabular-nums' }}
                                        >
                                          <Text size="xs" c="dimmed">
                                            {formatDateTime(inv.createdAt).split(' ')[1] ||
                                              formatDateTime(inv.createdAt)}
                                          </Text>
                                        </Table.Td>
                                      </Table.Tr>
                                    );
                                  })}
                                </Table.Tbody>
                              </Table>

                              {invoicesTotalPages > 1 && (
                                <Group justify="space-between" align="center" pt="xs">
                                  <Text size="xs" c="dimmed">
                                    {t('Showing')} {(invoicesPage - 1) * 15 + 1} -{' '}
                                    {Math.min(invoicesPage * 15, invoicesTotal ?? 0)}{' '}
                                    {t('of')} {invoicesTotal}
                                  </Text>
                                  <Pagination
                                    total={invoicesTotalPages}
                                    value={invoicesPage}
                                    onChange={setInvoicesPage}
                                    size="sm"
                                  />
                                </Group>
                              )}
                            </Stack>
                          )}
                        </DrawerCard>
                      </Stack>
                    );
                  }

                  if (tab === 'movements') {
                    return (
                      <Stack gap="md">
                        {movements.length > 0 && (
                          <SimpleGrid cols={3} spacing="sm">
                            <Paper p="xs" withBorder>
                              <Text size="xs" c="dimmed">
                                {t('Total Inflows')}
                              </Text>
                              <Text size="sm" fw={700} c="teal">
                                +{formatMoney(totalMovementsInCents)}
                              </Text>
                            </Paper>
                            <Paper p="xs" withBorder>
                              <Text size="xs" c="dimmed">
                                {t('Total Outflows')}
                              </Text>
                              <Text size="sm" fw={700} c="orange">
                                -{formatMoney(totalMovementsOutCents)}
                              </Text>
                            </Paper>
                            <Paper p="xs" withBorder>
                              <Text size="xs" c="dimmed">
                                {t('Total Movements')}
                              </Text>
                              <Text size="sm" fw={700}>
                                {movements.length}
                              </Text>
                            </Paper>
                          </SimpleGrid>
                        )}

                        <DrawerCard
                          label={t('Cash Movements Log')}
                          icon={<IconCoins size={16} />}
                          action={
                            <Badge variant="light" color="blue" size="sm">
                              {movements.length} {t('Movements')}
                            </Badge>
                          }
                        >
                          {movementsLoading ? (
                            <Text size="sm" c="dimmed" p="md">
                              {t('Loading movements...')}
                            </Text>
                          ) : movements.length === 0 ? (
                            <Stack gap="md" py="lg">
                              <Center>
                                <ThemeIcon size={52} radius="xl" variant="light" color="gray">
                                  <IconCoins size={26} />
                                </ThemeIcon>
                              </Center>
                              <Text fw={700} size="sm" ta="center">
                                {t('No Cash Movements Recorded')}
                              </Text>
                              <Text size="xs" c="dimmed" maw={420} mx="auto" ta="center">
                                {t(
                                  'No petty cash expenses, supplier payouts, cash drops to safe, or owner drawings were recorded during this shift.'
                                )}
                              </Text>
                              <SimpleGrid cols={3} spacing="xs" mt="xs">
                                <Paper p="xs" withBorder ta="center">
                                  <Text size="xs" c="dimmed">
                                    {t('Pay-Ins')}
                                  </Text>
                                  <Text size="sm" fw={700} c="teal">
                                    +{formatMoney(s.totalPayInCents || 0)}
                                  </Text>
                                </Paper>
                                <Paper p="xs" withBorder ta="center">
                                  <Text size="xs" c="dimmed">
                                    {t('Pay-Outs')}
                                  </Text>
                                  <Text size="sm" fw={700} c="orange">
                                    -{formatMoney(s.totalPayOutCents || 0)}
                                  </Text>
                                </Paper>
                                <Paper p="xs" withBorder ta="center">
                                  <Text size="xs" c="dimmed">
                                    {t('Cash Drops')}
                                  </Text>
                                  <Text size="sm" fw={700} c="blue">
                                    -{formatMoney(s.totalCashDropsCents || 0)}
                                  </Text>
                                </Paper>
                              </SimpleGrid>
                            </Stack>
                          ) : (
                            <Table striped highlightOnHover verticalSpacing="xs">
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th>{t('Type')}</Table.Th>
                                  <Table.Th>{t('Amount')}</Table.Th>
                                  <Table.Th>{t('By')}</Table.Th>
                                  <Table.Th>{t('Reason / Note')}</Table.Th>
                                  <Table.Th>{t('Recorded At')}</Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {movements.map((m) => {
                                  const meta = getMovementTypeMeta(m.movementType);
                                  return (
                                    <Table.Tr key={m.id || m.key}>
                                      <Table.Td>
                                        <Badge
                                          size="xs"
                                          variant="light"
                                          color={meta.color}
                                          leftSection={meta.icon}
                                        >
                                          {meta.label}
                                        </Badge>
                                      </Table.Td>
                                      <Table.Td style={{ fontVariantNumeric: 'tabular-nums' }}>
                                        <Text fw={700} size="xs">
                                          {formatMoney(m.amountCents)}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="xs">
                                          {m.recordedByNameSnapshot || m.recordedByUserId}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="xs" c="dimmed">
                                          {m.reason || '-'}
                                        </Text>
                                      </Table.Td>
                                      <Table.Td>
                                        <Text size="xs" c="dimmed">
                                          {formatDateTime(m.createdAt)}
                                        </Text>
                                      </Table.Td>
                                    </Table.Tr>
                                  );
                                })}
                              </Table.Tbody>
                            </Table>
                          )}
                        </DrawerCard>
                      </Stack>
                    );
                  }

                  if (tab === 'audit') {
                    return (
                      <Stack gap="md">
                        <DrawerCard
                          label={t('Shift Audit & Notes')}
                          icon={<IconHistory size={16} />}
                        >
                          <Stack gap="sm">
                            {s.openingNote ? (
                              <Paper p="sm" withBorder>
                                <Group gap="xs" mb={4}>
                                  <ThemeIcon size="sm" variant="light" color="teal">
                                    <IconClockPlay size={12} />
                                  </ThemeIcon>
                                  <Text size="xs" fw={700}>
                                    {t('Opening Note')}
                                  </Text>
                                </Group>
                                <Text size="xs" c="dimmed">
                                  {s.openingNote}
                                </Text>
                              </Paper>
                            ) : null}

                            {s.closingNote ? (
                              <Paper p="sm" withBorder>
                                <Group gap="xs" mb={4}>
                                  <ThemeIcon size="sm" variant="light" color="gray">
                                    <IconClock size={12} />
                                  </ThemeIcon>
                                  <Text size="xs" fw={700}>
                                    {t('Closing Note')}
                                  </Text>
                                </Group>
                                <Text size="xs" c="dimmed">
                                  {s.closingNote}
                                </Text>
                              </Paper>
                            ) : null}

                            {s.varianceReason ? (
                              <Paper
                                p="sm"
                                withBorder
                                style={{ borderColor: 'var(--status-error)' }}
                              >
                                <Group gap="xs" mb={4}>
                                  <ThemeIcon size="sm" variant="light" color="orange">
                                    <IconAlertCircle size={12} />
                                  </ThemeIcon>
                                  <Text size="xs" fw={700} c="orange">
                                    {t('Cash Discrepancy Explanation')}
                                  </Text>
                                </Group>
                                <Text size="xs" c="orange">
                                  {s.varianceReason}
                                </Text>
                              </Paper>
                            ) : null}

                            {s.reopenedAt ? (
                              <Paper
                                p="sm"
                                withBorder
                                style={{ borderColor: 'var(--mantine-color-grape-6)' }}
                              >
                                <Group gap="xs" mb={4}>
                                  <ThemeIcon size="sm" variant="light" color="grape">
                                    <IconRefresh size={12} />
                                  </ThemeIcon>
                                  <Text size="xs" fw={700} c="grape">
                                    {t('Shift Reopened Event')}
                                  </Text>
                                </Group>
                                <Text size="xs" c="dimmed">
                                  {`${t('Reopened by')} ${s.reopenedByName || s.reopenedById || 'Manager'} ${t('at')} ${formatDateTime(s.reopenedAt)}`}
                                </Text>
                                {s.reopenedReason ? (
                                  <Text size="xs" fw={500} mt={4}>
                                    {t('Reason')}: {s.reopenedReason}
                                  </Text>
                                ) : null}
                              </Paper>
                            ) : null}

                            {!s.openingNote &&
                              !s.closingNote &&
                              !s.varianceReason &&
                              !s.reopenedAt && (
                                <Paper p="md" withBorder style={{ textAlign: 'center' }}>
                                  <Text size="xs" c="dimmed">
                                    {t(
                                      'No operational notes or variance audit logs were recorded for this shift.'
                                    )}
                                  </Text>
                                </Paper>
                              )}
                          </Stack>
                        </DrawerCard>

                        <DrawerCard
                          label={t('Shift Integrity Checklist')}
                          icon={<IconActivity size={16} />}
                        >
                          <Stack gap="xs">
                            <InfoRow icon={<IconActivity size={14} />} label={t('Shift Version')}>
                              <Text size="xs" fw={600} ff="monospace">
                                v{s.version}
                              </Text>
                            </InfoRow>
                            <InfoRow icon={<IconActivity size={14} />} label={t('Late Movements')}>
                              <Badge
                                size="xs"
                                variant="light"
                                color={s.hasLateMovements ? 'red' : 'teal'}
                              >
                                {s.hasLateMovements
                                  ? t('Late movements detected')
                                  : t('None (Clean)')}
                              </Badge>
                            </InfoRow>
                            <InfoRow icon={<IconCalendar size={14} />} label={t('Record Created')}>
                              {formatDateTime(s.createdAt)}
                            </InfoRow>
                            <InfoRow icon={<IconClock size={14} />} label={t('Last Updated')}>
                              {formatDateTime(s.updatedAt)}
                            </InfoRow>
                          </Stack>
                        </DrawerCard>
                      </Stack>
                    );
                  }

                  // Default: 'overview' (Sales & Tenders)
                  return (
                    <Stack gap="md">
                      <DrawerCard
                        label={t('Sales by Payment Tender')}
                        icon={<IconWallet size={16} />}
                      >
                        <Stack gap="sm">
                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                            <Paper p="sm" withBorder>
                              <Stack gap="xs">
                                <Group gap="xs" wrap="nowrap">
                                  <ThemeIcon color="teal" variant="light" size="sm">
                                    <IconCash size={14} />
                                  </ThemeIcon>
                                  <Text size="xs" fw={600} c="dimmed">
                                    {t('Cash Sales')}
                                  </Text>
                                </Group>
                                <Text
                                  size="md"
                                  fw={800}
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {formatMoney(s.totalCashSalesCents || 0)}
                                </Text>
                              </Stack>
                            </Paper>

                            <Paper p="sm" withBorder>
                              <Stack gap="xs">
                                <Group gap="xs" wrap="nowrap">
                                  <ThemeIcon color="blue" variant="light" size="sm">
                                    <IconCreditCard size={14} />
                                  </ThemeIcon>
                                  <Text size="xs" fw={600} c="dimmed">
                                    {t('Card Sales')}
                                  </Text>
                                </Group>
                                <Text
                                  size="md"
                                  fw={800}
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {formatMoney(s.totalCardSalesCents || 0)}
                                </Text>
                              </Stack>
                            </Paper>

                            <Paper p="sm" withBorder>
                              <Stack gap="xs">
                                <Group gap="xs" wrap="nowrap">
                                  <ThemeIcon color="grape" variant="light" size="sm">
                                    <IconBuildingBank size={14} />
                                  </ThemeIcon>
                                  <Text size="xs" fw={600} c="dimmed">
                                    {t('Online / Bank Transfer')}
                                  </Text>
                                </Group>
                                <Text
                                  size="md"
                                  fw={800}
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {formatMoney(s.totalOnlineSalesCents || 0)}
                                </Text>
                              </Stack>
                            </Paper>

                            <Paper p="sm" withBorder>
                              <Stack gap="xs">
                                <Group gap="xs" wrap="nowrap">
                                  <ThemeIcon color="orange" variant="light" size="sm">
                                    <IconScale size={14} />
                                  </ThemeIcon>
                                  <Text size="xs" fw={600} c="dimmed">
                                    {t('Credit / On Account')}
                                  </Text>
                                </Group>
                                <Text
                                  size="md"
                                  fw={800}
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {formatMoney(s.totalCreditSalesCents || 0)}
                                </Text>
                              </Stack>
                            </Paper>
                          </SimpleGrid>

                          <Paper p="sm" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
                            <Group justify="space-between" align="center">
                              <Text size="xs" fw={600} c="dimmed">
                                {t('Total Gross Sales (All Tenders)')}
                              </Text>
                              <Text
                                size="md"
                                fw={800}
                                c="blue"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {formatMoney(totalSales)}
                              </Text>
                            </Group>
                          </Paper>
                        </Stack>
                      </DrawerCard>

                      <DrawerCard
                        label={t('Drawer Cash Flow Dynamics')}
                        icon={<IconCoins size={16} />}
                      >
                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                          <Paper p="sm" withBorder>
                            <Stack gap={4}>
                              <Text size="xs" fw={600} c="dimmed">
                                {t('Total Inflows')}
                              </Text>
                              <Text
                                size="md"
                                fw={800}
                                c="teal"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                +{formatMoney(totalDrawerInflows)}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {t('Float + Cash Sales + Pay-ins')}
                              </Text>
                            </Stack>
                          </Paper>

                          <Paper p="sm" withBorder>
                            <Stack gap={4}>
                              <Text size="xs" fw={600} c="dimmed">
                                {t('Total Outflows')}
                              </Text>
                              <Text
                                size="md"
                                fw={800}
                                c="orange"
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                -{formatMoney(totalDrawerOutflows)}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {t('Expenses + Refunds + Drops')}
                              </Text>
                            </Stack>
                          </Paper>

                          <Paper p="sm" withBorder>
                            <Stack gap={4}>
                              <Text size="xs" fw={600} c="dimmed">
                                {t('Net Drawer Balance')}
                              </Text>
                              <Text
                                size="md"
                                fw={800}
                                style={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {formatMoney(expectedCash)}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {t('Inflows minus Outflows')}
                              </Text>
                            </Stack>
                          </Paper>
                        </SimpleGrid>
                      </DrawerCard>

                      {hasDenominations ? (
                        <DrawerCard
                          label={t('Denomination Count Breakdown')}
                          icon={<IconCoins size={16} />}
                        >
                          <Table striped highlightOnHover verticalSpacing="xs">
                            <Table.Thead>
                              <Table.Tr>
                                <Table.Th>{t('Denomination')}</Table.Th>
                                <Table.Th ta="right">{t('Quantity')}</Table.Th>
                                <Table.Th ta="right">{t('Subtotal')}</Table.Th>
                              </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                              {Object.entries(denomsObj)
                                .map(([denom, qty]) => {
                                  const numDenom = Number(denom);
                                  const subtotalCents = Math.round(numDenom * 100 * qty);
                                  return { denom: numDenom, qty, subtotalCents };
                                })
                                .sort((a, b) => b.denom - a.denom)
                                .map((row) => (
                                  <Table.Tr key={row.denom}>
                                    <Table.Td>
                                      <Text size="xs" fw={600}>
                                        {formatMoney(Math.round(row.denom * 100))}
                                      </Text>
                                    </Table.Td>
                                    <Table.Td
                                      ta="right"
                                      style={{ fontVariantNumeric: 'tabular-nums' }}
                                    >
                                      <Text size="xs">{row.qty}</Text>
                                    </Table.Td>
                                    <Table.Td
                                      ta="right"
                                      style={{ fontVariantNumeric: 'tabular-nums' }}
                                    >
                                      <Text size="xs" fw={700}>
                                        {formatMoney(row.subtotalCents)}
                                      </Text>
                                    </Table.Td>
                                  </Table.Tr>
                                ))}
                            </Table.Tbody>
                          </Table>
                        </DrawerCard>
                      ) : (
                        <DrawerCard
                          label={t('Denomination Count Breakdown')}
                          icon={<IconCoins size={16} />}
                        >
                          <Paper
                            p="sm"
                            withBorder
                            style={{ textAlign: 'center', backgroundColor: 'var(--bg-card)' }}
                          >
                            <Text size="xs" c="dimmed">
                              {s.status === 'closed'
                                ? `${t('This shift was closed with a lump-sum counted cash total of')} ${formatMoney(s.countedCashCents ?? expectedCash)} ${t('without an itemized denomination breakdown.')}`
                                : t(
                                    'Itemized denomination breakdown will be available once counted cash is entered.'
                                  )}
                            </Text>
                          </Paper>
                        </DrawerCard>
                      )}
                    </Stack>
                  );
                }}
              </AnimatedTabs>
            </DrawerMain>
          </DrawerGrid>
        )}
      </RichDrawer>

      <ZReportModal
        opened={zReportModalOpened}
        onClose={() => setZReportModalOpened(false)}
        sessionKey={session.key}
      />

      <ReopenSessionModal
        opened={reopenModalOpened}
        onClose={() => setReopenModalOpened(false)}
        session={session}
        onSuccess={() => {
          onRefresh?.();
        }}
      />

      <ConvertVarianceModal
        opened={convertModalOpened}
        onClose={() => setConvertModalOpened(false)}
        session={session}
        onSuccess={() => {
          onRefresh?.();
        }}
      />

      <InvoiceDetailDrawer
        opened={invoiceDrawerOpened}
        onClose={() => setInvoiceDrawerOpened(false)}
        invoice={selectedInvoice}
        zIndex={300}
        onRefresh={() => {
          void refetchInvoices();
          onRefresh?.();
        }}
      />
    </>
  );
};
