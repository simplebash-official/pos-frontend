import { useState } from 'react';
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
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { getPrintLogsForInvoice } from '../api/printLogStore';
import { getInvoiceStatusMeta } from '../lib/invoiceStatus';
import { useInvoicePayments, useRecordPayment } from '@/features/billing/hooks/usePayments';
import { useInvoiceReturns } from '@/features/billing/hooks/useReturns';
import { SaleDocumentPreviewModal } from '@/features/billing/components/SaleDocumentPreviewModal';
import { ReturnModal } from './ReturnModal';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { DetailDrawer } from '@/shared/components/DetailDrawer';

export interface InvoiceDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onRefresh?: () => void;
}

const sectionLabelStyle = { letterSpacing: '0.05em' } as const;

export const InvoiceDetailDrawer = ({
  opened,
  onClose,
  invoice,
  onRefresh,
}: InvoiceDetailDrawerProps) => {
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState<string>('items');

  // Document preview modal state ('receipt' | 'invoice' | null)
  const [previewDocumentKind, setPreviewDocumentKind] = useState<'invoice' | 'receipt' | null>(
    null
  );

  // Return & Exchange Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);

  // Payment Record Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmountRupees, setPayAmountRupees] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<string>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const { data: payments } = useInvoicePayments(invoice?.id);
  const { data: invoiceReturns } = useInvoiceReturns(invoice?.id);
  const recordPaymentMutation = useRecordPayment();

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
                Invoice #{invoice?.invoiceNumber}
              </Text>
              <Text size="xs" c="dimmed">
                Sale Details, Payments & Returns
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

          const statusMeta = getInvoiceStatusMeta(inv, totalPaidCents);
          const isCreditPending = !!inv.isCredit && totalPaidCents < inv.totalCents;

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
                  <Badge color={statusMeta.color} variant="filled" size="sm">
                    {statusMeta.label}
                  </Badge>
                  {(isFullyReturned || isPartiallyReturned) && (
                    <Badge color={isFullyReturned ? 'gray' : 'orange'} variant="light" size="sm">
                      {isFullyReturned
                        ? 'Fully Returned'
                        : `Partially Returned (${totalReturnedUnits})`}
                    </Badge>
                  )}
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
                    Issued {formatDateTime(inv.createdAt)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Cashier: {inv.cashierName || 'Cashier'}
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
                          Grand Total
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
                          Items
                        </Text>
                      </Group>
                      <Group gap={4} align="baseline">
                        <Text fw={800} size="md" c="teal">
                          {inv.items.length}
                        </Text>
                        {totalReturnedUnits > 0 && (
                          <Text size="xs" c="dimmed">
                            ({totalReturnedUnits} returned)
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

              {/* Returns & Refunds — always visible, never tucked behind a tab */}
              <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={sectionLabelStyle}>
                      Returns & Refunds
                    </Text>
                    {invoiceReturns.length > 0 && (
                      <Badge size="xs" color="orange" variant="light">
                        {invoiceReturns.reduce((sum, r) => sum + r.items.length, 0)} items returned
                      </Badge>
                    )}
                  </Group>

                  {invoiceReturns.length === 0 ? (
                    <Text size="xs" c="dimmed">
                      No returns have been processed for this invoice yet.
                    </Text>
                  ) : (
                    <Stack gap="xs">
                      {invoiceReturns.map((ret) => (
                        <Paper
                          key={ret.id}
                          p="xs"
                          withBorder
                          bg="var(--bg-app)"
                          radius="var(--mantine-radius-default)"
                        >
                          <Group justify="space-between" mb={2}>
                            <Text size="xs" fw={700} c="orange.8">
                              Refund: {formatMoney(ret.totalRefundCents)}
                            </Text>
                            <Badge size="xs" color="orange" variant="light" tt="uppercase">
                              {ret.payoutMethod}
                            </Badge>
                          </Group>
                          <Text size="2xs" c="dimmed">
                            {formatDateTime(ret.createdAt)} · {ret.items.length} line(s)
                          </Text>
                          {ret.notes && (
                            <Text size="xs" c="dimmed" mt={2} fs="italic">
                              &ldquo;{ret.notes}&rdquo;
                            </Text>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  )}

                  {isFullyReturned ? (
                    <Text size="xs" c="dimmed" ta="center">
                      All items on this invoice have already been returned.
                    </Text>
                  ) : (
                    <Button
                      variant="light"
                      color="orange"
                      leftSection={<IconArrowBackUp size={16} />}
                      onClick={() => setReturnModalOpen(true)}
                    >
                      Process Return / Exchange
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
                  <Tabs.Tab value="items">Items ({inv.items.length})</Tabs.Tab>
                  <Tabs.Tab value="activity">Activity</Tabs.Tab>
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
                            <Table.Th>Item</Table.Th>
                            <Table.Th style={{ textAlign: 'center' }}>Qty</Table.Th>
                            <Table.Th>Price</Table.Th>
                            <Table.Th>Total</Table.Th>
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
                                      SKU: {item.sku}
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
                          Subtotal
                        </Text>
                        <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatMoney(inv.subtotalCents)}
                        </Text>
                      </Group>

                      {inv.discountCents > 0 && (
                        <Group justify="space-between">
                          <Text size="xs" c="red">
                            Discount
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
                          Grand Total
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
                          Payment Method
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
                              Split Breakdown
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
                            Amount Received
                          </Text>
                          <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {formatMoney(inv.amountReceivedCents)}
                          </Text>
                        </Group>
                      ) : null}

                      {inv.changeDueCents ? (
                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            Change Due
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
                        Payment History ({payments.length})
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
                            Remaining Balance
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
                      Print History
                    </Text>
                    {logs.length === 0 ? (
                      <Text size="xs" c="dimmed">
                        No print logs recorded yet.
                      </Text>
                    ) : (
                      <Text size="xs" c="dimmed">
                        Printed {logs.length}× · Last printed{' '}
                        {lastLog ? formatDateTime(lastLog.printedAt) : 'N/A'} ({lastLog?.format})
                      </Text>
                    )}
                  </Paper>

                  <Divider my="xs" />

                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={sectionLabelStyle}>
                    Metadata
                  </Text>

                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Group gap="xs">
                        <IconCalendar size={16} style={{ opacity: 0.6 }} />
                        <Text size="xs" c="dimmed">
                          Issued On
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
                            Last Printed
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
                          Invoice Key
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
                  Show Receipt
                </Button>

                <Button
                  variant="outline"
                  color="blue"
                  leftSection={<IconFileText size={16} />}
                  onClick={() => setPreviewDocumentKind('invoice')}
                >
                  Show Invoice
                </Button>
              </Group>

              {/* Footer */}
              <Group justify="space-between" mt="md">
                {isCreditPending ? (
                  <Button
                    variant="filled"
                    color="blue"
                    size="sm"
                    leftSection={<IconCash size={16} />}
                    onClick={handleOpenPaymentModal}
                  >
                    Record Payment
                  </Button>
                ) : (
                  <div />
                )}

                <Group gap="sm">
                  <Button
                    variant="subtle"
                    color="blue"
                    size="sm"
                    leftSection={<IconCopy size={16} />}
                    onClick={handleCopyInvoiceNumber}
                  >
                    Copy Invoice #
                  </Button>
                  <Button variant="default" size="sm" onClick={handleClose}>
                    Close
                  </Button>
                </Group>
              </Group>
            </Stack>
          );
        }}
      </DetailDrawer>

      {/* Return & Exchange Modal */}
      <ReturnModal
        opened={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        invoice={invoice}
        onReturnSuccess={() => {
          onRefresh?.();
        }}
      />

      {/* Sale Document Preview Modal (shows Receipt or Invoice in PdfCanvasViewer) */}
      <SaleDocumentPreviewModal
        opened={previewDocumentKind !== null}
        onClose={() => {
          setPreviewDocumentKind(null);
          onRefresh?.();
        }}
        invoice={invoice}
        documentKind={previewDocumentKind}
      />

      {/* Record Payment Modal */}
      <Modal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={
          <Text fw={700} size="lg">
            Record Payment — #{invoice?.invoiceNumber}
          </Text>
        }
        centered
        fullScreen={isMobile}
      >
        <Stack gap="md">
          <NumberInput
            label="Payment Amount (Rs.)"
            prefix="Rs. "
            min={1}
            value={payAmountRupees}
            onChange={(val) => setPayAmountRupees(typeof val === 'number' ? val : '')}
          />

          <Select
            label="Payment Method"
            value={payMethod}
            onChange={(v) => setPayMethod(v || 'cash')}
            data={[
              { label: 'Cash', value: 'cash' },
              { label: 'Online / Bank Transfer', value: 'online' },
              { label: 'Card', value: 'card' },
            ]}
          />

          <TextInput
            label="Note / Transaction Ref (Optional)"
            placeholder="e.g. Slip TRX-12345"
            value={payNotes}
            onChange={(e) => setPayNotes(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md" gap="sm">
            <Button
              variant="default"
              onClick={() => setPaymentModalOpen(false)}
              disabled={isSubmittingPay}
            >
              Cancel
            </Button>
            <Button
              color="blue"
              loading={isSubmittingPay}
              onClick={handleRecordPayment}
              leftSection={<IconCheck size={16} />}
            >
              Confirm & Update Balance
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
