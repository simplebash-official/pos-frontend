import { useState } from 'react';
import {
  Drawer,
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
} from '@mantine/core';
import { IconPrinter, IconFileText, IconCopy, IconCheck, IconCash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import type { Invoice } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { usePrint } from '@/features/billing/hooks/usePrint';
import { getPrintLogsForInvoice } from '../api/printLogStore';
import { recordPayment, getPaymentsForInvoice, getTotalPaidForInvoice } from '../api/paymentsStore';
import { queryKeys } from '@/api/queryKeys';
import { A4InvoicePreviewModal } from '@/features/billing/components/A4InvoicePreviewModal';

export interface InvoiceDetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onRefresh?: () => void;
}

export function InvoiceDetailDrawer({
  opened,
  onClose,
  invoice,
  onRefresh,
}: InvoiceDetailDrawerProps) {
  const queryClient = useQueryClient();
  const { printReceipt } = usePrint();

  // Preview modal (self-contained — not shared with BillingCounter)
  const [previewOpen, setPreviewOpen] = useState(false);

  // Payment Record Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmountRupees, setPayAmountRupees] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<string>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  if (!invoice) return null;

  // Print history — index 0 is newest (LocalStorageStore.add uses unshift)
  const logs = getPrintLogsForInvoice(invoice.invoiceNumber);
  const lastLog = logs.length > 0 ? logs[0] : null;

  // Payment records
  const payments = getPaymentsForInvoice(invoice.id);
  const totalPaidCents = getTotalPaidForInvoice(invoice.id);
  const remainingCents = Math.max(0, invoice.totalCents - totalPaidCents);
  const derivedStatus =
    !invoice.isCredit || totalPaidCents >= invoice.totalCents ? 'paid' : 'pending';

  const handleCopyInvoiceNumber = () => {
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
    const cents = typeof payAmountRupees === 'number' ? Math.round(payAmountRupees * 100) : 0;
    if (cents <= 0) return;

    setIsSubmittingPay(true);
    try {
      recordPayment({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amountCents: cents,
        paymentMethod: payMethod,
        notes: payNotes,
        recordedBy: invoice.cashierName,
        customerId: invoice.customerId,
      });

      notifications.show({
        title: 'Payment Recorded',
        message: `Payment of ${formatMoney(cents)} recorded successfully. Customer balance updated.`,
        color: 'green',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      setPaymentModalOpen(false);
      setPayNotes('');
      onRefresh?.();
      onClose();
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
      <Drawer
        opened={opened}
        onClose={onClose}
        title={
          <Group justify="space-between" style={{ width: '100%' }}>
            <Group gap="xs">
              <Text fw={700} size="lg">
                Invoice #{invoice.invoiceNumber}
              </Text>
              <Badge color={derivedStatus === 'paid' ? 'green' : 'amber'} variant="light">
                {derivedStatus === 'paid' ? 'PAID' : 'CREDIT / UNPAID'}
              </Badge>
            </Group>
          </Group>
        }
        position="right"
        size="lg"
      >
        <Stack gap="md" style={{ height: 'calc(100vh - 80px)', overflowY: 'auto' }}>
          {/* Metadata Block */}
          <Paper p="sm" radius="lg" withBorder style={{ backgroundColor: 'var(--bg-app)' }}>
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed">
                Issued Date: {new Date(invoice.createdAt).toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                Cashier: {invoice.cashierName || 'Cashier'}
              </Text>
            </Group>
            <Divider my="xs" />
            <Text size="sm" fw={700}>
              Customer: {invoice.customerName || 'Walk-in Guest'}
            </Text>
            {invoice.customerPhone && (
              <Text size="xs" c="dimmed">
                Phone: {invoice.customerPhone}
              </Text>
            )}
            {invoice.customerAddress && (
              <Text size="xs" c="dimmed">
                Address: {invoice.customerAddress}
              </Text>
            )}
          </Paper>

          {/* Line Items Table */}
          <Paper p="sm" radius="lg" withBorder>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">
              ORDER ITEMS ({invoice.items.length})
            </Text>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Item</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Qty</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Price</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {invoice.items.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Text size="xs" fw={600}>
                        {item.name}
                      </Text>
                      {item.sku && (
                        <Text size="3xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                          SKU: {item.sku}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>{item.quantity}</Table.Td>
                    <Table.Td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoney(item.unitPriceCents)}
                    </Table.Td>
                    <Table.Td
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatMoney(item.totalCents)}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>

          {/* Totals Breakdown */}
          <Paper p="sm" radius="lg" withBorder style={{ backgroundColor: 'var(--bg-app)' }}>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Subtotal
                </Text>
                <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoney(invoice.subtotalCents)}
                </Text>
              </Group>

              {invoice.discountCents > 0 && (
                <Group justify="space-between">
                  <Text size="xs" c="red">
                    Discount
                  </Text>
                  <Text size="xs" fw={600} c="red" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    -{formatMoney(invoice.discountCents)}
                  </Text>
                </Group>
              )}

              {invoice.taxCents > 0 && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Tax
                  </Text>
                  <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(invoice.taxCents)}
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
                  color="blue"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {formatMoney(invoice.totalCents)}
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Payment Method
                </Text>
                <Text size="xs" fw={700} tt="uppercase">
                  {invoice.paymentMethod}
                </Text>
              </Group>

              {invoice.tenderedAmountCents ? (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Tendered Amount
                  </Text>
                  <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatMoney(invoice.tenderedAmountCents)}
                  </Text>
                </Group>
              ) : null}

              {invoice.changeDueCents ? (
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
                    {formatMoney(invoice.changeDueCents)}
                  </Text>
                </Group>
              ) : null}

              {/* Payment history for credit invoices */}
              {invoice.isCredit && payments.length > 0 && (
                <>
                  <Divider my={4} />
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    PAYMENT HISTORY ({payments.length})
                  </Text>
                  {payments.map((p) => (
                    <Group key={p.id} justify="space-between">
                      <Text size="xs" c="dimmed">
                        {new Date(p.recordedAt).toLocaleDateString()} ·{' '}
                        {p.paymentMethod.toUpperCase()}
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
                </>
              )}
            </Stack>
          </Paper>

          {/* Print History Log */}
          <Paper p="sm" radius="lg" withBorder>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
              PRINT HISTORY ({logs.length} PRINTS)
            </Text>
            {logs.length === 0 ? (
              <Text size="xs" c="dimmed">
                No print logs recorded yet.
              </Text>
            ) : (
              <Text size="xs" c="dimmed">
                Printed {logs.length}× · Last printed on{' '}
                {lastLog ? new Date(lastLog.printedAt).toLocaleString() : 'N/A'} ({lastLog?.format})
              </Text>
            )}
          </Paper>

          {/* Action Row */}
          <Stack gap="xs" mt="auto">
            {invoice.isCredit && derivedStatus === 'pending' && (
              <Button
                color="green"
                leftSection={<IconCash size={16} />}
                onClick={handleOpenPaymentModal}
              >
                Record Payment
              </Button>
            )}

            <Group grow gap="xs">
              <Button
                variant="outline"
                color="blue"
                leftSection={<IconPrinter size={16} />}
                onClick={() => printReceipt(invoice)}
              >
                Print Receipt
              </Button>

              <Button
                variant="outline"
                color="violet"
                leftSection={<IconFileText size={16} />}
                onClick={() => setPreviewOpen(true)}
              >
                Print Invoice
              </Button>
            </Group>

            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconCopy size={16} />}
              onClick={handleCopyInvoiceNumber}
            >
              Copy Invoice #
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* A4 Invoice Preview Modal (self-contained in drawer) */}
      <A4InvoicePreviewModal
        opened={previewOpen}
        onClose={() => setPreviewOpen(false)}
        invoice={invoice}
      />

      {/* Record Payment Modal */}
      <Modal
        opened={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={<Text fw={700}>Record Payment for #{invoice.invoiceNumber}</Text>}
        radius="lg"
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

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color="green"
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
}
