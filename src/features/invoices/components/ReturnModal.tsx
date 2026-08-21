import { useState, useMemo, useCallback } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Paper,
  Divider,
  Button,
  Checkbox,
  Select,
  Switch,
  Badge,
  Table,
  Textarea,
  Box,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import type { Invoice, InvoiceItem } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { loadExchangeFromInvoice } from '@/store/slices/cartSlice';
import { useProcessReturn } from '@/features/billing/hooks/useReturns';
import { syncEngine } from '@/offline/engine/SyncEngine';
import type { ProcessReturnItemInput } from '@/features/billing/api/returnsApi';

export interface ReturnModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onReturnSuccess?: () => void;
}

interface ItemReturnState {
  selected: boolean;
  quantity: number;
  restockInventory: boolean;
  reason: string;
}

const REASON_OPTIONS = [
  { value: 'defective', label: 'Defective / Not Working' },
  { value: 'wrong_item', label: 'Wrong Item or Size' },
  { value: 'customer_changed_mind', label: 'Customer Changed Mind' },
  { value: 'warranty_claim', label: 'Warranty Claim' },
  { value: 'other', label: 'Other Reason' },
];

export const ReturnModal = ({ opened, onClose, invoice, onReturnSuccess }: ReturnModalProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const processReturnMutation = useProcessReturn();

  const [returnStates, setReturnStates] = useState<Record<string, ItemReturnState>>({});
  const [returnNotes, setReturnNotes] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'cash' | 'card' | 'store_credit'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize return state whenever invoice changes or modal opens
  const items = invoice?.items ?? [];

  const getItemState = useCallback(
    (item: InvoiceItem): ItemReturnState => {
      if (returnStates[item.id]) {
        return returnStates[item.id];
      }
      const alreadyReturned = item.returnedQuantity || 0;
      const remainingQty = Math.max(0, item.quantity - alreadyReturned);
      return {
        selected: remainingQty > 0,
        quantity: Math.max(1, Math.min(1, remainingQty)),
        restockInventory: true,
        reason: 'defective',
      };
    },
    [returnStates]
  );

  const updateItemState = (itemId: string, patch: Partial<ItemReturnState>) => {
    setReturnStates((prev) => {
      const current = prev[itemId] || {
        selected: true,
        quantity: 1,
        restockInventory: true,
        reason: 'defective',
      };
      return {
        ...prev,
        [itemId]: { ...current, ...patch },
      };
    });
  };

  // Calculate live return lines and refund totals
  const selectedReturnItems = useMemo(() => {
    if (!invoice) return [];
    const list: Array<{
      item: InvoiceItem;
      quantity: number;
      restockInventory: boolean;
      returnReason: string;
      proratedDiscountCents: number;
      refundAmountCents: number;
    }> = [];

    for (const item of invoice.items) {
      const state = getItemState(item);
      const alreadyReturned = item.returnedQuantity || 0;
      const maxReturnable = Math.max(0, item.quantity - alreadyReturned);

      if (state.selected && maxReturnable > 0) {
        const clampedQty = Math.min(Math.max(1, state.quantity), maxReturnable);
        const proratedDiscount =
          item.quantity > 0 ? Math.round((item.discountCents / item.quantity) * clampedQty) : 0;
        const refundAmountCents = Math.max(0, item.unitPriceCents * clampedQty - proratedDiscount);

        list.push({
          item,
          quantity: clampedQty,
          restockInventory: state.restockInventory,
          returnReason: state.reason,
          proratedDiscountCents: proratedDiscount,
          refundAmountCents,
        });
      }
    }
    return list;
  }, [invoice, getItemState]);

  const totalRefundCents = useMemo(() => {
    return selectedReturnItems.reduce((acc, r) => acc + r.refundAmountCents, 0);
  }, [selectedReturnItems]);

  const totalReturnUnits = useMemo(() => {
    return selectedReturnItems.reduce((acc, r) => acc + r.quantity, 0);
  }, [selectedReturnItems]);

  if (!invoice) return null;

  const handleDirectCashRefund = async () => {
    if (selectedReturnItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const itemsPayload: ProcessReturnItemInput[] = selectedReturnItems.map((r) => ({
        id: r.item.id,
        productId: r.item.productId,
        productKey: r.item.productId,
        name: r.item.name,
        sku: r.item.sku,
        quantity: r.quantity,
        unitPriceCents: r.item.unitPriceCents,
        discountCents: r.proratedDiscountCents,
        refundAmountCents: r.refundAmountCents,
        restockInventory: r.restockInventory,
        reason: r.returnReason,
      }));

      await processReturnMutation.mutateAsync({
        input: {
          originalInvoiceId: invoice.id,
          originalInvoiceNumber: invoice.invoiceNumber,
          customerId: invoice.customerId,
          customerName: invoice.customerName,
          customerPhone: invoice.customerPhone,
          cashierId: authUser?.id,
          cashierName: authUser?.name || 'Cashier',
          items: itemsPayload,
          totalRefundCents,
          payoutMethod,
          notes: returnNotes.trim() || undefined,
        },
      });

      void syncEngine.syncNow();

      notifications.show({
        title: 'Refund Processed',
        message: `Refund of ${formatMoney(totalRefundCents)} paid to customer.`,
        color: 'green',
      });

      onReturnSuccess?.();
      onClose();
    } catch {
      notifications.show({
        title: 'Refund Error',
        message: 'Could not record refund. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadExchange = () => {
    if (selectedReturnItems.length === 0) return;

    dispatch(
      loadExchangeFromInvoice({
        invoice,
        returnItems: selectedReturnItems,
      })
    );

    notifications.show({
      title: 'Items Added for Exchange',
      message:
        'Return items loaded into Billing Counter. Add replacement items to finish the exchange.',
      color: 'blue',
    });

    onClose();
    navigate('/billing');
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          Process Return & Exchange — #{invoice.invoiceNumber}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        {/* Original Invoice Summary Card */}
        <Paper p="sm" withBorder bg="var(--bg-app)">
          <Group justify="space-between" mb={4}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              ORIGINAL SALE DETAILS
            </Text>
            <Badge variant="light" color="blue">
              #{invoice.invoiceNumber}
            </Badge>
          </Group>
          <Group justify="space-between" align="center">
            <div>
              <Text size="sm" fw={600}>
                {invoice.customerName || 'Walk-in Guest'}
              </Text>
              {invoice.customerPhone && (
                <Text size="xs" c="dimmed">
                  {invoice.customerPhone}
                </Text>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text size="xs" c="dimmed">
                {new Date(invoice.createdAt).toLocaleDateString()}
              </Text>
              <Text size="xs" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
                Total: {formatMoney(invoice.totalCents)}
              </Text>
            </div>
          </Group>
        </Paper>

        {/* Section Header */}
        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            SELECT ITEMS TO RETURN
          </Text>
          <Text size="xs" c="dimmed">
            Check the items being returned, set the quantity, and choose whether to restock.
          </Text>
        </Box>

        {/* Item Rows Table */}
        <Paper withBorder bg="var(--bg-card)" style={{ overflow: 'hidden' }}>
          <Table verticalSpacing="sm" horizontalSpacing="sm" striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 40 }} />
                <Table.Th>Item & Details</Table.Th>
                <Table.Th style={{ width: 120, textAlign: 'center' }}>Return Qty</Table.Th>
                <Table.Th style={{ width: 120, textAlign: 'right' }}>Refund</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => {
                const state = getItemState(item);
                const alreadyReturned = item.returnedQuantity || 0;
                const remainingQty = Math.max(0, item.quantity - alreadyReturned);
                const isFullyReturned = remainingQty === 0;

                const lineProratedDiscount =
                  item.quantity > 0
                    ? Math.round((item.discountCents / item.quantity) * state.quantity)
                    : 0;
                const lineRefundCents = Math.max(
                  0,
                  item.unitPriceCents * state.quantity - lineProratedDiscount
                );

                return (
                  <Table.Tr key={item.id} opacity={isFullyReturned ? 0.6 : 1}>
                    <Table.Td style={{ verticalAlign: 'top', paddingTop: 14 }}>
                      <Checkbox
                        checked={state.selected && !isFullyReturned}
                        disabled={isFullyReturned}
                        onChange={(e) =>
                          updateItemState(item.id, { selected: e.currentTarget.checked })
                        }
                        aria-label={`Select ${item.name} for return`}
                      />
                    </Table.Td>

                    <Table.Td>
                      <Stack gap={6}>
                        <Group gap="xs" align="center">
                          <Text size="sm" fw={600}>
                            {item.name}
                          </Text>
                          {isFullyReturned ? (
                            <Badge size="xs" color="gray" variant="light">
                              Fully Returned
                            </Badge>
                          ) : alreadyReturned > 0 ? (
                            <Badge size="xs" color="orange" variant="light">
                              {alreadyReturned} already returned
                            </Badge>
                          ) : null}
                        </Group>

                        <Group gap="xs">
                          <Text size="xs" c="dimmed">
                            Original: {item.quantity} × {formatMoney(item.unitPriceCents)}
                          </Text>
                          {item.discountCents > 0 && (
                            <Text size="xs" c="red.6">
                              (Discount: -{formatMoney(item.discountCents)})
                            </Text>
                          )}
                        </Group>

                        {state.selected && !isFullyReturned && (
                          <Stack gap={6} mt={4}>
                            <Select
                              size="xs"
                              label="Reason for Return"
                              data={REASON_OPTIONS}
                              value={state.reason}
                              onChange={(val) =>
                                updateItemState(item.id, { reason: val || 'defective' })
                              }
                            />

                            <Switch
                              size="xs"
                              color="blue"
                              label={
                                state.restockInventory
                                  ? 'Put back in stock (Sellable)'
                                  : 'Mark as damaged / defective (Do not restock)'
                              }
                              checked={state.restockInventory}
                              onChange={(e) =>
                                updateItemState(item.id, {
                                  restockInventory: e.currentTarget.checked,
                                })
                              }
                            />
                          </Stack>
                        )}
                      </Stack>
                    </Table.Td>

                    <Table.Td style={{ verticalAlign: 'top', textAlign: 'center' }}>
                      {isFullyReturned ? (
                        <Text size="xs" c="dimmed">
                          0 available
                        </Text>
                      ) : (
                        <Box style={{ display: 'inline-block' }}>
                          <QuantityInput
                            value={state.quantity}
                            min={1}
                            max={remainingQty}
                            disabled={!state.selected}
                            size="xs"
                            onChange={(val) =>
                              updateItemState(item.id, {
                                quantity: typeof val === 'number' ? Math.min(val, remainingQty) : 1,
                              })
                            }
                          />
                          <Text size="3xs" c="dimmed" mt={2}>
                            Max {remainingQty}
                          </Text>
                        </Box>
                      )}
                    </Table.Td>

                    <Table.Td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                      <Text
                        size="sm"
                        fw={700}
                        c={state.selected && !isFullyReturned ? 'orange.8' : 'dimmed'}
                        style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {state.selected && !isFullyReturned
                          ? formatMoney(lineRefundCents)
                          : formatMoney(0)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Paper>

        {/* Refund Calculation Summary */}
        <Paper p="sm" withBorder bg="var(--bg-app)">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                Selected Items for Return:
              </Text>
              <Text size="xs" fw={600}>
                {selectedReturnItems.length} lines ({totalReturnUnits} units)
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm" fw={700}>
                Total Refund Amount:
              </Text>
              <Text
                size="lg"
                fw={800}
                c="orange.8"
                style={{ fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums' }}
              >
                {formatMoney(totalRefundCents)}
              </Text>
            </Group>

            <Divider my={2} />

            <Select
              size="xs"
              label="Refund Payout Method (for direct Cash Refund)"
              data={[
                { value: 'cash', label: 'Cash Refund' },
                { value: 'card', label: 'Original Card / Card Payout' },
                { value: 'store_credit', label: 'Store Credit' },
              ]}
              value={payoutMethod}
              onChange={(val) =>
                setPayoutMethod((val as 'cash' | 'card' | 'store_credit') || 'cash')
              }
            />

            <Textarea
              size="xs"
              label="Return Notes / Reason Details (Optional)"
              placeholder="e.g. Customer reported button stopped clicking after 2 days"
              minRows={2}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.currentTarget.value)}
            />
          </Stack>
        </Paper>

        {/* Action Footer */}
        <Group justify="flex-end" mt="md" gap="sm" wrap="wrap">
          <Button variant="default" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            color="orange"
            disabled={selectedReturnItems.length === 0}
            loading={isSubmitting}
            onClick={handleDirectCashRefund}
          >
            Cash Refund · {formatMoney(totalRefundCents)}
          </Button>

          <Button
            color="blue"
            disabled={selectedReturnItems.length === 0 || isSubmitting}
            onClick={handleLoadExchange}
          >
            Exchange for Another Item
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
