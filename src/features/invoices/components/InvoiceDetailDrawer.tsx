import { t } from '@/shared/i18n/t';
import { useState, useEffect, lazy, Suspense } from 'react';
import {
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Divider,
  Table,
  Paper,
  Modal,
  NumberInput,
  Select,
  TextInput,
  Textarea,
  ThemeIcon,
  Grid,
  Tabs,
  ScrollArea,
} from '@mantine/core';
import {
  IconFileInvoice,
  IconReceipt,
  IconFileText,
  IconCopy,
  IconCheck,
  IconCash,
  IconArrowBackUp,
  IconPackage,
  IconWallet,
  IconCalendar,
  IconClock,
  IconKey,
  IconBan,
  IconSquareCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { Invoice, CreditNote } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { getPrintLogsForInvoice } from '../api/printLogStore';
import {
  getInvoiceStatusMeta,
  getOverdueMeta,
  getCreditNoteStatusMeta,
} from '../lib/invoiceStatus';
import { useInvoicePayments, useRecordPayment } from '@/features/billing/hooks/usePayments';
import { useInvoiceCreditNotes } from '@/features/billing/hooks/useCreditNotes';
import { useVoidInvoice, useCloseInvoice } from '@/features/billing/hooks/useInvoices';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { DetailDrawer } from '@/shared/components/DetailDrawer';

const SaleDocumentPreviewModal = lazy(() =>
  import('@/features/billing/components/SaleDocumentPreviewModal').then((m) => ({
    default: m.SaleDocumentPreviewModal,
  }))
);
const CreditNoteModal = lazy(() =>
  import('./CreditNoteModal').then((m) => ({
    default: m.CreditNoteModal,
  }))
);
import { useIsAdmin } from '@/shared/hooks/usePermissions';

export interface InvoiceDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onRefresh?: () => void;
  /** Open the Record Payment modal as soon as the drawer shows (deep link). */
  openPaymentModalOnMount?: boolean;
}

const sectionLabelStyle = { letterSpacing: '0.05em' } as const;

export const InvoiceDetailDrawer = ({
  opened,
  onClose,
  invoice,
  onRefresh,
  openPaymentModalOnMount = false,
}: InvoiceDetailDrawerProps) => {
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<string>('items');

  // Document preview modal state ('receipt' | 'invoice' | null)
  const [previewDocumentKind, setPreviewDocumentKind] = useState<'invoice' | 'receipt' | null>(
    null
  );
  const [previewCreditNote, setPreviewCreditNote] = useState<CreditNote | null>(null);

  // Credit Note Modal State
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);

  // Payment Record Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmountRupees, setPayAmountRupees] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<string>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Void Modal State
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [isVoiding, setIsVoiding] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { data: payments } = useInvoicePayments(invoice?.id);
  const { data: invoiceCreditNotes } = useInvoiceCreditNotes(invoice?.id);
  const recordPaymentMutation = useRecordPayment();
  const voidInvoiceMutation = useVoidInvoice();
  const closeInvoiceMutation = useCloseInvoice();
  const isAdmin = useIsAdmin();

  const totalPaidCents = payments.reduce((sum, p) => sum + p.amountCents, 0);
  const remainingCents = invoice ? Math.max(0, invoice.totalCents - totalPaidCents) : 0;

  const handleClose = () => {
    setActiveTab('items');
    onClose();
  };

  const handleCopyInvoiceNumber = () => {
    if (!invoice) return;
    navigator.clipboard.writeText(invoice.invoiceNumber);
    notifications.show({
      title: 'Copied',
      message: `Invoice #${invoice.invoiceNumber} copied to clipboard`,
      color: 'green',
    });
  };

  const handleOpenPaymentModal = () => {
    setPayAmountRupees(Math.round(remainingCents / 100));
    setPaymentModalOpen(true);
  };

  // Deep link (dashboard "Record Payment"): open the payment modal once the
  // drawer is showing a payable invoice.
  useEffect(() => {
    const payable = invoice?.status === 'pending' || invoice?.status === 'partially_paid';
    if (opened && openPaymentModalOnMount && payable) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPayAmountRupees(Math.round(remainingCents / 100));
      setPaymentModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, openPaymentModalOnMount, invoice?.id]);

  const handleRecordPayment = async () => {
    if (!invoice) return;
    const cents = typeof payAmountRupees === 'number' ? Math.round(payAmountRupees * 100) : 0;
    if (cents <= 0) return;

    setIsSubmittingPay(true);
    try {
      await recordPaymentMutation.mutateAsync({
        invoiceKey: invoice.id,
        input: {
          amountCents: cents,
          paymentMethod: payMethod,
          notes: payNotes || undefined,
        },
      });

      notifications.show({
        title: 'Payment Recorded',
        message: `Payment of ${formatMoney(cents)} recorded successfully. Customer balance updated.`,
        color: 'green',
      });
      setPaymentModalOpen(false);
      setPayNotes('');
      onRefresh?.();
      handleClose();
    } catch {
      notifications.show({
        title: 'Payment Error',
        message: 'Failed to record payment',
        color: 'red',
      });
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const handleVoidInvoice = async () => {
    if (!invoice || !voidReason.trim()) return;
    setIsVoiding(true);
    try {
      await voidInvoiceMutation.mutateAsync({
        invoiceKey: invoice.id,
        reason: voidReason.trim(),
      });
      notifications.show({
        title: 'Invoice Voided',
        message: `Invoice #${invoice.invoiceNumber} has been voided and its stock/payment effects reversed.`,
        color: 'gray',
      });
      setVoidModalOpen(false);
      setVoidReason('');
      onRefresh?.();
      handleClose();
    } catch {
      notifications.show({
        title: 'Could Not Void Invoice',
        message: 'Please try again.',
        color: 'red',
      });
    } finally {
      setIsVoiding(false);
    }
  };

  const handleCloseInvoice = async () => {
    if (!invoice) return;
    setIsClosing(true);
    try {
      await closeInvoiceMutation.mutateAsync({ invoiceKey: invoice.id });
      notifications.show({
        title: 'Invoice Closed',
        message: `Invoice #${invoice.invoiceNumber} is now marked closed.`,
        color: 'violet',
      });
      onRefresh?.();
      handleClose();
    } catch {
      notifications.show({
        title: 'Could Not Close Invoice',
        message: 'This invoice may still have an open credit note against it.',
        color: 'red',
      });
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <>
      <DetailDrawer
        data={invoice}
        opened={opened}
        onClose={handleClose}
        size="lg"
        title={
          <Group gap="xs">
            <ThemeIcon
              color="blue"
              variant="light"
              size="lg"
              radius="var(--mantine-radius-default)"
            >
              <IconFileInvoice size={20} />
            </ThemeIcon>
            <div>
              <Text fw={800} size="md">
                {t('Invoice #')}
                {invoice?.invoiceNumber}
              </Text>
              <Text size="xs" c="dimmed">
                {t('Sale Details, Payments & Returns')}
              </Text>
            </div>
          </Group>
        }
      >
        {(inv) => {
          const totalReturnedUnits = inv.items.reduce(
            (acc, item) => acc + (item.returnedQuantity || 0),
            0
          );
          const totalOriginalUnits = inv.items.reduce((acc, item) => acc + item.quantity, 0);
          const isFullyReturned =
            totalOriginalUnits > 0 && totalReturnedUnits >= totalOriginalUnits;
          const isPartiallyReturned = totalReturnedUnits > 0 && !isFullyReturned;

          // Print history — index 0 is newest (LocalStorageStore.add uses unshift)
          const logs = getPrintLogsForInvoice(inv.invoiceNumber);
          const lastLog = logs.length > 0 ? logs[0] : null;

          const statusMeta = getInvoiceStatusMeta(inv);
          const overdueMeta = getOverdueMeta(inv);
          const isCreditPending = inv.status === 'pending' || inv.status === 'partially_paid';
          const canClose = inv.status === 'paid' && !inv.hasCreditNotes;
          // Mirrors the backend's own guard (`void_invoice` refuses when the
          // invoice's payment records no longer match exactly what the
          // original sale created): any credit note against it means a
          // refund payment was recorded, and any payment on a credit
          // invoice beyond "none yet" means an installment was recorded —
          // either way, voiding can't safely reverse that automatically.
          const hasExtraPayments = inv.hasCreditNotes || (inv.isCredit && inv.status !== 'pending');
          const isAlreadyFinal = inv.status === 'voided' || inv.status === 'closed';
          const canVoid = !isAlreadyFinal && !hasExtraPayments;
          const voidBlockedReason =
            !isAlreadyFinal && hasExtraPayments
              ? inv.hasCreditNotes
                ? 'This invoice has a return or refund recorded against it, so it can no longer be voided directly.'
                : 'This invoice has payment installments recorded against it, so it can no longer be voided directly.'
              : null;

          return (
            <Stack gap="md" pt="xs">
              {/* Hero Identity Card */}
              <Paper
                p="md"
                radius="var(--mantine-radius-default)"
                withBorder
                bg="var(--mantine-color-body)"
              >
                <Group justify="space-between" align="flex-start" mb="xs">
                  <Group gap={6}>
                    <Badge color={statusMeta.color} variant="filled" size="sm">
                      {statusMeta.label}
                    </Badge>
                    {overdueMeta && (
                      <Badge color={overdueMeta.color} variant="filled" size="sm">
                        {overdueMeta.label}
                      </Badge>
                    )}
                  </Group>
                  <Group gap={6}>
                    {inv.hasCreditNotes && (
                      <Badge color="indigo" variant="light" size="sm">
                        {inv.creditNoteCount} {t('Credit Note')}
                        {inv.creditNoteCount === 1 ? '' : 's'}
                      </Badge>
                    )}
                    {(isFullyReturned || isPartiallyReturned) && (
                      <Badge color={isFullyReturned ? 'gray' : 'orange'} variant="light" size="sm">
                        {isFullyReturned
                          ? 'Fully Returned'
                          : `Partially Returned (${totalReturnedUnits})`}
                      </Badge>
                    )}
                  </Group>
                </Group>

                <Text fw={800} size="lg" mb={4}>
                  {inv.customerName || 'Walk-in Guest'}
                </Text>

                {(inv.customerPhone || inv.customerAddress) && (
                  <Stack gap={2} mb="xs">
                    {inv.customerPhone && (
                      <Text size="xs" c="dimmed">
                        {inv.customerPhone}
                      </Text>
                    )}
                    {inv.customerAddress && (
                      <Text size="xs" c="dimmed">
                        {inv.customerAddress}
                      </Text>
                    )}
                  </Stack>
                )}

                <Divider my="xs" />

                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t('Issued')} {formatDateTime(inv.createdAt)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('Cashier:')} {inv.cashierName || 'Cashier'}
                  </Text>
                </Group>
              </Paper>

              {/* Metrics Snapshot */}
              <Paper p="md" withBorder radius="var(--mantine-radius-default)">
                <Grid gap={0} align="flex-start">
                  <Grid.Col
                    span={4}
                    pr="sm"
                    style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
                  >
                    <Stack gap={2}>
                      <Group gap={4} wrap="nowrap">
                        <IconCash
                          size={12}
                          style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }}
                        />
                        <Text size="xs" c="dimmed" tt="uppercase">
                          {t('Grand Total')}
                        </Text>
                      </Group>
                      <Text
                        fw={800}
                        size="md"
                        c="blue"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatMoney(inv.totalCents)}
                      </Text>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col
                    span={4}
                    px="sm"
                    style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
                  >
                    <Stack gap={2}>
                      <Group gap={4} wrap="nowrap">
                        <IconPackage
                          size={12}
                          style={{ color: 'var(--mantine-color-teal-6)', flexShrink: 0 }}
                        />
                        <Text size="xs" c="dimmed" tt="uppercase">
                          {t('Items')}
                        </Text>
                      </Group>
                      <Group gap={4} align="baseline">
                        <Text fw={800} size="md" c="teal">
                          {inv.items.length}
                        </Text>
                        {totalReturnedUnits > 0 && (
                          <Text size="xs" c="dimmed">
                            ({totalReturnedUnits} {t('returned)')}
                          </Text>
                        )}
                      </Group>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={4} pl="sm">
                    <Stack gap={2}>
                      <Group gap={4} wrap="nowrap">
                        <IconWallet
                          size={12}
                          style={{
                            color: isCreditPending
                              ? 'var(--mantine-color-red-6)'
                              : inv.changeDueCents
                                ? 'var(--mantine-color-green-6)'
                                : 'var(--mantine-color-gray-6)',
                            flexShrink: 0,
                          }}
                        />
                        <Text size="xs" c="dimmed" tt="uppercase">
                          {isCreditPending
                            ? 'Balance Due'
                            : inv.changeDueCents
                              ? 'Change Due'
                              : 'Payment'}
                        </Text>
                      </Group>
                      {isCreditPending ? (
                        <Text
                          fw={800}
                          size="md"
                          c="red"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatMoney(remainingCents)}
                        </Text>
                      ) : inv.changeDueCents ? (
                        <Text
                          fw={800}
                          size="md"
                          c="green"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatMoney(inv.changeDueCents)}
                        </Text>
                      ) : (
                        <Text fw={800} size="md" tt="uppercase">
                          {inv.paymentMethod}
                        </Text>
                      )}
                    </Stack>
                  </Grid.Col>
                </Grid>
              </Paper>

              {/* Credit Notes — always visible, never tucked behind a tab */}
              <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={sectionLabelStyle}>
                      {t('Credit Notes')}
                    </Text>
                    {invoiceCreditNotes.length > 0 && (
                      <Badge size="xs" color="orange" variant="light">
                        {invoiceCreditNotes.reduce((sum, cn) => sum + cn.items.length, 0)}{' '}
                        {t(
                          'items\n                                                              returned'
                        )}
                      </Badge>
                    )}
                  </Group>

                  {invoiceCreditNotes.length === 0 ? (
                    <Text size="xs" c="dimmed">
                      {t('No credit notes have been issued against this invoice yet.')}
                    </Text>
                  ) : (
                    <Stack gap="xs">
                      {invoiceCreditNotes.map((cn) => {
                        const statusMeta = getCreditNoteStatusMeta(cn.status);
                        return (
                          <Paper
                            key={cn.id}
                            p="xs"
                            withBorder
                            bg="var(--bg-app)"
                            radius="var(--mantine-radius-default)"
                          >
                            <Group justify="space-between" mb={2}>
                              <Text size="xs" fw={700} c="orange.8">
                                {cn.netRefundCents >= 0 ? 'Refund' : 'Charged'}:{' '}
                                {formatMoney(Math.abs(cn.netRefundCents))}
                              </Text>
                              <Group gap={4}>
                                {cn.exchangeReference && (
                                  <Badge size="xs" color="indigo" variant="light">
                                    {t('Exchange')}
                                  </Badge>
                                )}
                                {cn.noReceipt && (
                                  <Badge size="xs" color="red" variant="light">
                                    {t('No Receipt')}
                                  </Badge>
                                )}
                                <Badge size="xs" color={statusMeta.color} variant="light">
                                  {statusMeta.label}
                                </Badge>
                              </Group>
                            </Group>
                            <Group justify="space-between" align="center">
                              <Text size="2xs" c="dimmed">
                                {formatDateTime(cn.createdAt)} · {cn.creditNoteNumber} ·{' '}
                                {cn.items.length} {t('line(s)')}
                              </Text>
                              <Button
                                size="compact-xs"
                                variant="subtle"
                                onClick={() => setPreviewCreditNote(cn)}
                              >
                                {t('View / Print')}
                              </Button>
                            </Group>
                            {cn.notes && (
                              <Text size="xs" c="dimmed" mt={2} fs="italic">
                                {t('&ldquo;')}
                                {cn.notes}
                                {t('&rdquo;')}
                              </Text>
                            )}
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}

                  {isFullyReturned ? (
                    <Text size="xs" c="dimmed" ta="center">
                      {t('All items on this invoice have already been returned.')}
                    </Text>
                  ) : (
                    <Button
                      variant="light"
                      color="orange"
                      leftSection={<IconArrowBackUp size={16} />}
                      onClick={() => setCreditNoteModalOpen(true)}
                    >
                      {t('Process Return / Exchange')}
                    </Button>
                  )}
                </Stack>
              </Paper>

              {/* Tabbed Content */}
              <Tabs
                value={activeTab}
                onChange={(val) => setActiveTab(val ?? 'items')}
                color="blue"
                mt="xs"
              >
                <Tabs.List grow>
                  <Tabs.Tab value="items">
                    {t('Items (')}
                    {inv.items.length})
                  </Tabs.Tab>
                  <Tabs.Tab value="activity">{t('Activity')}</Tabs.Tab>
                </Tabs.List>
              </Tabs>

              {/* TAB 1: Order Items & Totals */}
              {activeTab === 'items' && (
                <Stack gap="md">
                  <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
                    <ScrollArea.Autosize
                      mah="40dvh"
                      offsetScrollbars
                      classNames={{ viewport: 'scrollarea-fluid-content' }}
                    >
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>{t('Item')}</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>{t('Qty')}</Table.Th>
                            <Table.Th>{t('Price')}</Table.Th>
                            <Table.Th>{t('Total')}</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {inv.items.map((item) => {
                            const alreadyReturned = item.returnedQuantity || 0;
                            const isItemFullyReturned = alreadyReturned >= item.quantity;
                            return (
                              <Table.Tr key={item.id}>
                                <Table.Td>
                                  <Group gap="xs" align="center">
                                    <Text size="xs" fw={600}>
                                      {item.name}
                                    </Text>
                                    {alreadyReturned > 0 && (
                                      <Badge
                                        size="xs"
                                        color={isItemFullyReturned ? 'gray' : 'orange'}
                                        variant="light"
                                      >
                                        {isItemFullyReturned
                                          ? 'Fully Returned'
                                          : `Returned: ${alreadyReturned}`}
                                      </Badge>
                                    )}
                                  </Group>
                                  {item.sku && (
                                    <Text size="3xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                      {t('SKU:')} {item.sku}
                                    </Text>
                                  )}
                                </Table.Td>
                                <Table.Td style={{ textAlign: 'center' }}>{item.quantity}</Table.Td>
                                <Table.Td style={{ fontVariantNumeric: 'tabular-nums' }}>
                                  {formatMoney(item.unitPriceCents)}
                                </Table.Td>
                                <Table.Td
                                  style={{
                                    fontWeight: 700,
                                    fontVariantNumeric: 'tabular-nums',
                                  }}
                                >
                                  {formatMoney(item.totalCents)}
                                </Table.Td>
                              </Table.Tr>
                            );
                          })}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea.Autosize>
                  </Paper>

                  <Paper
                    p="sm"
                    withBorder
                    bg="var(--bg-app)"
                    radius="var(--mantine-radius-default)"
                  >
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          {t('Subtotal')}
                        </Text>
                        <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatMoney(inv.subtotalCents)}
                        </Text>
                      </Group>

                      {inv.discountCents > 0 && (
                        <Group justify="space-between">
                          <Text size="xs" c="red">
                            {t('Discount')}
                          </Text>
                          <Text
                            size="xs"
                            fw={600}
                            c="red"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            -{formatMoney(inv.discountCents)}
                          </Text>
                        </Group>
                      )}

                      <Divider my={4} />

                      <Group justify="space-between">
                        <Text size="sm" fw={700}>
                          {t('Grand Total')}
                        </Text>
                        <Text
                          size="md"
                          fw={700}
                          c="blue"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatMoney(inv.totalCents)}
                        </Text>
                      </Group>

                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          {t('Payment Method')}
                        </Text>
                        <Text size="xs" fw={700} tt="uppercase">
                          {inv.paymentMethod}
                          {inv.paymentMethod === 'card' && (inv.cardLast4 || inv.cardRef)
                            ? ` (•••• ${inv.cardLast4 || inv.cardRef})`
                            : ''}
                        </Text>
                      </Group>

                      {inv.paymentMethod === 'split' &&
                        inv.splitPayments &&
                        inv.splitPayments.length > 0 && (
                          <Stack gap={2} mt={2}>
                            <Text
                              size="xs"
                              fw={700}
                              c="dimmed"
                              tt="uppercase"
                              style={sectionLabelStyle}
                            >
                              {t('Split Breakdown')}
                            </Text>
                            {inv.splitPayments.map((sp, idx) => (
                              <Group key={sp.id || idx} justify="space-between">
                                <Text size="xs" c="dimmed">
                                  {sp.method.toUpperCase()}
                                  {sp.method === 'card' && (sp.cardLast4 || sp.reference)
                                    ? ` (•••• ${sp.cardLast4 || sp.reference})`
                                    : ''}
                                </Text>
                                <Text
                                  size="xs"
                                  fw={600}
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {formatMoney(sp.amountCents)}
                                </Text>
                              </Group>
                            ))}
                          </Stack>
                        )}

                      {inv.amountReceivedCents ? (
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            {t('Amount Received')}
                          </Text>
                          <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {formatMoney(inv.amountReceivedCents)}
                          </Text>
                        </Group>
                      ) : null}

                      {inv.changeDueCents ? (
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            {t('Change Due')}
                          </Text>
                          <Text
                            size="xs"
                            fw={600}
                            c="green.6"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatMoney(inv.changeDueCents)}
                          </Text>
                        </Group>
                      ) : null}
                    </Stack>
                  </Paper>
                </Stack>
              )}

              {/* TAB 2: Activity — payments, print history, metadata */}
              {activeTab === 'activity' && (
                <Stack gap="md">
                  {inv.isCredit && payments.length > 0 && (
                    <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
                      <Text
                        size="xs"
                        fw={700}
                        c="dimmed"
                        tt="uppercase"
                        mb="xs"
                        style={sectionLabelStyle}
                      >
                        {t('Payment History (')}
                        {payments.length})
                      </Text>
                      <Stack gap="xs">
                        {payments.map((p) => (
                          <Group key={p.id} justify="space-between">
                            <Text size="xs" c="dimmed">
                              {formatDateTime(p.recordedAt)} · {p.paymentMethod.toUpperCase()}
                              {p.notes ? ` · ${p.notes}` : ''}
                            </Text>
                            <Text
                              size="xs"
                              fw={600}
                              c="green.7"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                              {formatMoney(p.amountCents)}
                            </Text>
                          </Group>
                        ))}
                        <Divider my={2} />
                        <Group justify="space-between">
                          <Text size="xs" fw={700}>
                            {t('Remaining Balance')}
                          </Text>
                          <Text
                            size="xs"
                            fw={700}
                            c={remainingCents > 0 ? 'red' : 'green'}
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatMoney(remainingCents)}
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  )}

                  <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
                    <Text
                      size="xs"
                      fw={700}
                      c="dimmed"
                      tt="uppercase"
                      mb={4}
                      style={sectionLabelStyle}
                    >
                      {t('Print History')}
                    </Text>
                    {logs.length === 0 ? (
                      <Text size="xs" c="dimmed">
                        {t('No print logs recorded yet.')}
                      </Text>
                    ) : (
                      <Text size="xs" c="dimmed">
                        {t('Printed')} {logs.length}
                        {t('× · Last printed')}{' '}
                        {lastLog ? formatDateTime(lastLog.printedAt) : 'N/A'} ({lastLog?.format})
                      </Text>
                    )}
                  </Paper>

                  <Divider my="xs" />

                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={sectionLabelStyle}>
                    {t('Metadata')}
                  </Text>

                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <IconCalendar size={16} style={{ opacity: 0.6 }} />
                        <Text size="xs" c="dimmed">
                          {t('Issued On')}
                        </Text>
                      </Group>
                      <Text size="xs" fw={700}>
                        {formatDateTime(inv.createdAt)}
                      </Text>
                    </Group>

                    {lastLog && (
                      <Group justify="space-between">
                        <Group gap="xs">
                          <IconClock size={16} style={{ opacity: 0.6 }} />
                          <Text size="xs" c="dimmed">
                            {t('Last Printed')}
                          </Text>
                        </Group>
                        <Text size="xs" fw={700}>
                          {formatDateTime(lastLog.printedAt)}
                        </Text>
                      </Group>
                    )}

                    <Group justify="space-between">
                      <Group gap="xs">
                        <IconKey size={16} style={{ opacity: 0.6 }} />
                        <Text size="xs" c="dimmed">
                          {t('Invoice Key')}
                        </Text>
                      </Group>
                      <Text size="xs" fw={600} c="dimmed" style={{ fontFamily: 'monospace' }}>
                        {inv.id}
                      </Text>
                    </Group>
                  </Stack>
                </Stack>
              )}

              <Divider my="xs" />

              {/* Document Actions */}
              <Group grow gap="sm">
                <Button
                  variant="outline"
                  color="blue"
                  leftSection={<IconReceipt size={16} />}
                  onClick={() => setPreviewDocumentKind('receipt')}
                >
                  {t('Show Receipt')}
                </Button>

                <Button
                  variant="outline"
                  color="blue"
                  leftSection={<IconFileText size={16} />}
                  onClick={() => setPreviewDocumentKind('invoice')}
                >
                  {t('Show Invoice')}
                </Button>
              </Group>

              {/* Footer */}
              <Group justify="space-between" mt="md" wrap="wrap" gap="sm">
                <Group gap="sm">
                  {isCreditPending && (
                    <Button
                      variant="filled"
                      color="blue"
                      size="sm"
                      leftSection={<IconCash size={16} />}
                      onClick={handleOpenPaymentModal}
                    >
                      {t('Record Payment')}
                    </Button>
                  )}
                  {isAdmin && canClose && (
                    <Button
                      variant="light"
                      color="violet"
                      size="sm"
                      leftSection={<IconSquareCheck size={16} />}
                      loading={isClosing}
                      onClick={handleCloseInvoice}
                    >
                      {t('Close Invoice')}
                    </Button>
                  )}
                  {isAdmin && canVoid && (
                    <Button
                      variant="light"
                      color="red"
                      size="sm"
                      leftSection={<IconBan size={16} />}
                      onClick={() => setVoidModalOpen(true)}
                    >
                      {t('Void Invoice')}
                    </Button>
                  )}
                  {isAdmin && voidBlockedReason && (
                    <Text size="xs" c="dimmed" maw={280}>
                      {voidBlockedReason}
                    </Text>
                  )}
                </Group>

                <Group gap="sm">
                  <Button
                    variant="subtle"
                    color="blue"
                    size="sm"
                    leftSection={<IconCopy size={16} />}
                    onClick={handleCopyInvoiceNumber}
                  >
                    {t('Copy Invoice #')}
                  </Button>
                  <Button variant="default" size="sm" onClick={handleClose}>
                    {t('Close')}
                  </Button>
                </Group>
              </Group>
            </Stack>
          );
        }}
      </DetailDrawer>

      <Suspense fallback={null}>
        {/* Credit Note (Return & Exchange) Modal */}
        {creditNoteModalOpen && (
          <CreditNoteModal
            opened={creditNoteModalOpen}
            onClose={() => setCreditNoteModalOpen(false)}
            invoice={invoice}
            onCreditNoteSuccess={() => {
              onRefresh?.();
            }}
          />
        )}

        {/* Sale Document Preview Modal (shows Receipt or Invoice in PdfCanvasViewer) */}
        {previewDocumentKind !== null && (
          <SaleDocumentPreviewModal
            opened={previewDocumentKind !== null}
            onClose={() => {
              setPreviewDocumentKind(null);
              onRefresh?.();
            }}
            subject={invoice ? { kind: 'invoice', invoice } : null}
            documentKind={previewDocumentKind}
          />
        )}

        {/* Credit Note Document Preview */}
        {previewCreditNote !== null && (
          <SaleDocumentPreviewModal
            opened={previewCreditNote !== null}
            onClose={() => setPreviewCreditNote(null)}
            subject={
              previewCreditNote ? { kind: 'creditNote', creditNote: previewCreditNote } : null
            }
            documentKind="credit-note"
          />
        )}
      </Suspense>

      {/* Record Payment Modal */}
      <Modal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={
          <Text fw={700} size="lg">
            {t('Record Payment — #')}
            {invoice?.invoiceNumber}
          </Text>
        }
        centered
        fullScreen={isMobile}
      >
        <Stack gap="md">
          <NumberInput
            label={t('Payment Amount (Rs.)')}
            prefix="Rs. "
            min={1}
            value={payAmountRupees}
            onChange={(val) => setPayAmountRupees(typeof val === 'number' ? val : '')}
          />

          <Select
            label={t('Payment Method')}
            value={payMethod}
            onChange={(v) => setPayMethod(v || 'cash')}
            data={[
              { label: 'Cash', value: 'cash' },
              { label: 'Online / Bank Transfer', value: 'online' },
              { label: 'Card', value: 'card' },
            ]}
          />

          <TextInput
            label={t('Note / Transaction Ref (Optional)')}
            placeholder={t('e.g. Slip TRX-12345')}
            value={payNotes}
            onChange={(e) => setPayNotes(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md" gap="sm">
            <Button
              variant="default"
              onClick={() => setPaymentModalOpen(false)}
              disabled={isSubmittingPay}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="blue"
              loading={isSubmittingPay}
              onClick={handleRecordPayment}
              leftSection={<IconCheck size={16} />}
            >
              {t('Confirm & Update Balance')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Void Invoice Confirmation — small centered dialog, not fullScreen, per
          the "very small confirmation dialogs" exception to the center-modal
          family (see ConfirmDialog.tsx). Needs its own Modal rather than
          ConfirmDialog since a void reason is mandatory input, not just a
          yes/no message. */}
      <Modal
        opened={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        title={
          <Text fw={700} size="lg">
            {t('Void Invoice — #')}
            {invoice?.invoiceNumber}
          </Text>
        }
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            {t(
              'This reverses the sale — any stock and payments already recorded against this invoice\n                                  are undone. This cannot be undone from here, so please explain why.'
            )}
          </Text>
          <Textarea
            label={t('Reason for voiding')}
            placeholder={t('e.g. Entered by mistake, duplicate sale')}
            required
            minRows={2}
            value={voidReason}
            onChange={(e) => setVoidReason(e.currentTarget.value)}
          />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setVoidModalOpen(false)} disabled={isVoiding}>
              {t('Cancel')}
            </Button>
            <Button
              color="red"
              onClick={handleVoidInvoice}
              loading={isVoiding}
              disabled={!voidReason.trim()}
            >
              {t('Void Invoice')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
