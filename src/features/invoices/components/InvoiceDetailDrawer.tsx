import { useInvoiceBalance } from '@/features/billing/hooks/useInvoiceBalance';
import { t } from '@/shared/i18n/t';
import { useState, useEffect, lazy, Suspense } from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import {
  IconActivity,
  IconBan,
  IconCalendarPlus,
  IconCash,
  IconClock,
  IconCopy,
  IconFileInvoice,
  IconFileText,
  IconPackage,
  IconPrinter,
  IconReceipt,
  IconSquareCheck,
  IconWallet,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { Invoice, CreditNote } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { describeInvoiceUnits } from '@/shared/calculations';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { getPrintLogsForInvoice } from '../api/printLogStore';
import { getInvoiceStatusMeta, getOverdueMeta } from '../lib/invoiceStatus';
import { useInvoicePayments, useRecordPayment } from '@/features/billing/hooks/usePayments';
import { useInvoiceCreditNotes } from '@/features/billing/hooks/useCreditNotes';
import { useVoidInvoice, useCloseInvoice } from '@/features/billing/hooks/useInvoices';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
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
  IconAction,
  InfoRow,
  KpiStrip,
  KpiTile,
  RichDrawer,
} from '@/shared/components/drawer';
import { InvoiceCreditNotesCard } from './InvoiceCreditNotesCard';
import { InvoiceItemsPanel } from './InvoiceItemsPanel';
import { InvoicePaymentModal } from './InvoicePaymentModal';
import { InvoicePaymentsPanel } from './InvoicePaymentsPanel';
import { InvoiceVoidModal } from './InvoiceVoidModal';

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

type InvoiceTab = 'items' | 'payments' | 'activity';

export interface InvoiceDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onRefresh?: () => void;
  /** Open the Record Payment modal as soon as the drawer shows (deep link). */
  openPaymentModalOnMount?: boolean;
  /** Custom z-index when stacking drawers (e.g. nested invoice inspection over session drawer). */
  zIndex?: number;
}

/** Everything the drawer decides from the invoice itself, computed in one place. */
const describeInvoice = (inv: Invoice) => {
  const { totalReturnedUnits, isFullyReturned, isPartiallyReturned } = describeInvoiceUnits(
    inv.items
  );
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
  return {
    totalReturnedUnits,
    isFullyReturned,
    isPartiallyReturned,
    isCreditPending,
    canClose,
    canVoid,
    voidBlockedReason,
    statusMeta: getInvoiceStatusMeta(inv),
    overdueMeta: getOverdueMeta(inv),
  };
};

export const InvoiceDetailDrawer = ({
  opened,
  onClose,
  invoice,
  onRefresh,
  openPaymentModalOnMount = false,
  zIndex,
}: InvoiceDetailDrawerProps) => {
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<InvoiceTab>('items');

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

  // What is still owed, worked out by the server (total less payments less returns).
  const balance = useInvoiceBalance(invoice ? invoice.id : '', Boolean(invoice));
  const remainingCents = balance.data === undefined ? 0 : balance.data.balanceDueCents;

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
      <RichDrawer
        data={invoice}
        opened={opened}
        onClose={handleClose}
        width="wide"
        zIndex={zIndex ?? 300}
        title={{
          icon: <IconFileInvoice size={20} />,
          text: `${t('Invoice #')}${invoice?.invoiceNumber ?? ''}`,
          subtitle: t('Sale Details, Payments & Returns'),
        }}
        footer={(inv) => {
          const d = describeInvoice(inv);
          return (
            <DrawerFooter
              start={
                isAdmin && d.canVoid ? (
                  <Button
                    variant="light"
                    color="red"
                    size="sm"
                    leftSection={<IconBan size={16} />}
                    onClick={() => setVoidModalOpen(true)}
                  >
                    {t('Void Invoice')}
                  </Button>
                ) : undefined
              }
            >
              {isMobile ? (
                <IconAction
                  kind="neutral"
                  label={t('Copy Invoice #')}
                  icon={<IconCopy size={16} />}
                  onClick={handleCopyInvoiceNumber}
                />
              ) : (
                <Button
                  variant="subtle"
                  color="blue"
                  size="sm"
                  leftSection={<IconCopy size={16} />}
                  onClick={handleCopyInvoiceNumber}
                >
                  {t('Copy Invoice #')}
                </Button>
              )}
              {isAdmin && d.canClose && (
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
              <Button variant="default" size="sm" onClick={handleClose}>
                {t('Close')}
              </Button>
              {d.isCreditPending && (
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
            </DrawerFooter>
          );
        }}
      >
        {(inv) => {
          const d = describeInvoice(inv);

          // Print history — index 0 is newest (LocalStorageStore.add uses unshift)
          const logs = getPrintLogsForInvoice(inv.invoiceNumber);
          const lastLog = logs.length > 0 ? logs[0] : null;

          const heroStatus = d.overdueMeta
            ? {
                color: d.overdueMeta.color,
                label: `${d.statusMeta.label} · ${d.overdueMeta.label}`,
              }
            : { color: d.statusMeta.color, label: d.statusMeta.label };

          const tabs: {
            value: InvoiceTab;
            label: string;
            icon: React.ReactNode;
            count?: number;
          }[] = [
            {
              value: 'items',
              label: t('Items'),
              icon: <IconPackage size={16} />,
              count: inv.items.length,
            },
            ...(inv.isCredit && payments.length > 0
              ? [
                  {
                    value: 'payments' as const,
                    label: t('Payments'),
                    icon: <IconCash size={16} />,
                    count: payments.length,
                  },
                ]
              : []),
            { value: 'activity', label: t('Activity'), icon: <IconActivity size={16} /> },
          ];
          // A credit invoice with no payments has no Payments tab, so fall back if it was selected.
          const tab: InvoiceTab = tabs.some((x) => x.value === activeTab) ? activeTab : 'items';

          return (
            <DrawerGrid>
              <KpiStrip>
                <KpiTile icon={<IconCash size={16} />} color="blue" label={t('Grand Total')}>
                  <Figure
                    value={formatMoney(inv.totalCents)}
                    hint={`${inv.items.length} ${t('Items')}`}
                    color="blue"
                  />
                </KpiTile>
                <KpiTile
                  icon={<IconWallet size={16} />}
                  color={d.isCreditPending ? 'red' : inv.changeDueCents ? 'green' : 'gray'}
                  label={
                    d.isCreditPending
                      ? t('Balance Due')
                      : inv.changeDueCents
                        ? t('Change Due')
                        : t('Payment')
                  }
                >
                  <Figure
                    value={
                      d.isCreditPending
                        ? formatMoney(remainingCents)
                        : inv.changeDueCents
                          ? formatMoney(inv.changeDueCents)
                          : inv.paymentMethod.toUpperCase()
                    }
                    hint={
                      d.isCreditPending && inv.dueDate
                        ? `${t('Due')} ${formatDate(inv.dueDate)}`
                        : t(d.statusMeta.label)
                    }
                    color={d.isCreditPending ? 'red' : inv.changeDueCents ? 'green' : 'gray'}
                  />
                </KpiTile>
                <KpiTile icon={<IconPackage size={16} />} color="teal" label={t('Items')}>
                  <Figure
                    value={String(inv.items.length)}
                    hint={
                      d.totalReturnedUnits > 0
                        ? `${d.totalReturnedUnits} ${t('returned')}`
                        : t('none returned')
                    }
                    color="teal"
                  />
                </KpiTile>
              </KpiStrip>

              <DrawerRail>
                <DrawerHero
                  accent={heroStatus.color}
                  icon={<IconFileInvoice size={32} />}
                  eyebrow={`#${inv.invoiceNumber}`}
                  status={heroStatus}
                  title={inv.customerName || 'Walk-in Guest'}
                  subtitle={
                    <>
                      {inv.customerPhone ? <div>{inv.customerPhone}</div> : null}
                      {inv.customerAddress ? <div>{inv.customerAddress}</div> : null}
                      {inv.hasCreditNotes ? (
                        <div>
                          {inv.creditNoteCount} {t('Credit Note')}
                          {inv.creditNoteCount === 1 ? '' : 's'}
                          {d.isFullyReturned
                            ? ` · ${t('Fully Returned')}`
                            : d.isPartiallyReturned
                              ? ` · ${t('Partially Returned')} (${d.totalReturnedUnits})`
                              : ''}
                        </div>
                      ) : null}
                    </>
                  }
                >
                  <Group justify="space-between" wrap="wrap" gap="xs">
                    <Text size="xs" c="dimmed">
                      {t('Issued')} {formatDateTime(inv.createdAt)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('Cashier:')} {inv.cashierName || 'Cashier'}
                    </Text>
                  </Group>
                </DrawerHero>

                <DrawerAfter>
                  <DrawerCard label={t('Payment')} icon={<IconWallet size={14} />}>
                    <Stack gap="xs">
                      <InfoRow icon={<IconCash size={16} />} label={t('Payment Method')}>
                        {inv.paymentMethod.toUpperCase()}
                        {inv.paymentMethod === 'card' && (inv.cardLast4 || inv.cardRef)
                          ? ` (•••• ${inv.cardLast4 || inv.cardRef})`
                          : ''}
                      </InfoRow>
                      {inv.paymentMethod === 'split' &&
                        inv.splitPayments &&
                        inv.splitPayments.map((sp, idx) => (
                          <InfoRow
                            key={sp.id || idx}
                            icon={<IconWallet size={16} />}
                            label={`${sp.method.toUpperCase()}${
                              sp.method === 'card' && (sp.cardLast4 || sp.reference)
                                ? ` (•••• ${sp.cardLast4 || sp.reference})`
                                : ''
                            }`}
                          >
                            {formatMoney(sp.amountCents)}
                          </InfoRow>
                        ))}
                      {inv.amountReceivedCents ? (
                        <InfoRow icon={<IconWallet size={16} />} label={t('Amount Received')}>
                          {formatMoney(inv.amountReceivedCents)}
                        </InfoRow>
                      ) : null}
                      {inv.changeDueCents ? (
                        <InfoRow icon={<IconWallet size={16} />} label={t('Change Due')}>
                          <Text span inherit c="green">
                            {formatMoney(inv.changeDueCents)}
                          </Text>
                        </InfoRow>
                      ) : null}
                      {isAdmin && d.voidBlockedReason ? (
                        <Text size="xs" c="dimmed">
                          {d.voidBlockedReason}
                        </Text>
                      ) : null}
                    </Stack>
                  </DrawerCard>
                </DrawerAfter>

                <DrawerAfter>
                  <DrawerCard label={t('Documents')} icon={<IconFileText size={14} />}>
                    <Group grow gap="sm">
                      <Button
                        variant="light"
                        color="blue"
                        leftSection={<IconReceipt size={16} />}
                        onClick={() => setPreviewDocumentKind('receipt')}
                      >
                        {t('Show Receipt')}
                      </Button>
                      <Button
                        variant="light"
                        color="blue"
                        leftSection={<IconFileText size={16} />}
                        onClick={() => setPreviewDocumentKind('invoice')}
                      >
                        {t('Show Invoice')}
                      </Button>
                    </Group>
                  </DrawerCard>
                </DrawerAfter>

                <DrawerAfter>
                  <DrawerCard label={t('Details')} icon={<IconClock size={14} />}>
                    <Stack gap="xs">
                      <InfoRow icon={<IconCalendarPlus size={16} />} label={t('Issued On')}>
                        {formatDateTime(inv.createdAt)}
                      </InfoRow>
                      {lastLog && (
                        <InfoRow icon={<IconPrinter size={16} />} label={t('Last Printed')}>
                          {formatDateTime(lastLog.printedAt)}
                        </InfoRow>
                      )}
                    </Stack>
                  </DrawerCard>
                </DrawerAfter>
              </DrawerRail>

              <DrawerMain>
                <InvoiceCreditNotesCard
                  creditNotes={invoiceCreditNotes}
                  isFullyReturned={d.isFullyReturned}
                  onPreview={setPreviewCreditNote}
                  onProcessReturn={() => setCreditNoteModalOpen(true)}
                />

                <AnimatedTabs<InvoiceTab> value={tab} onChange={setActiveTab} tabs={tabs}>
                  {(value) => {
                    if (value === 'items') return <InvoiceItemsPanel invoice={inv} />;
                    if (value === 'payments') {
                      return (
                        <InvoicePaymentsPanel payments={payments} remainingCents={remainingCents} />
                      );
                    }
                    return (
                      <Stack gap="xs">
                        <Text size="sm" fw={700}>
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
                            {lastLog ? formatDateTime(lastLog.printedAt) : 'N/A'} ({lastLog?.format}
                            )
                          </Text>
                        )}
                      </Stack>
                    );
                  }}
                </AnimatedTabs>
              </DrawerMain>
            </DrawerGrid>
          );
        }}
      </RichDrawer>

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

      <InvoicePaymentModal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        invoiceNumber={invoice?.invoiceNumber}
        amountRupees={payAmountRupees}
        onAmountChange={setPayAmountRupees}
        method={payMethod}
        onMethodChange={setPayMethod}
        notes={payNotes}
        onNotesChange={setPayNotes}
        submitting={isSubmittingPay}
        onConfirm={handleRecordPayment}
        fullScreen={isMobile}
      />

      <InvoiceVoidModal
        opened={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        invoiceNumber={invoice?.invoiceNumber}
        reason={voidReason}
        onReasonChange={setVoidReason}
        voiding={isVoiding}
        onConfirm={handleVoidInvoice}
      />
    </>
  );
};
