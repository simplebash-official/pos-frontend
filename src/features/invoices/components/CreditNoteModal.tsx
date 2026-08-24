import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Paper,
  Button,
  Checkbox,
  Select,
  Switch,
  Table,
  Textarea,
  Box,
  NumberInput,
  Alert,
  Badge,
} from '@mantine/core';
import { IconAlertTriangle, IconShieldLock } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { Invoice, InvoiceItem } from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { useCreateCreditNote } from '@/features/billing/hooks/useCreditNotes';
import { syncEngine } from '@/offline/engine/SyncEngine';
import type {
  CreateCreditNoteExchangeItemInput,
  CreateCreditNoteItemInput,
  CreateCreditNoteRefundBreakdownInput,
} from '@/features/billing/api/creditNotesApi';
import type { CreditNoteItemCondition, CreditNoteItemDisposition } from '@/offline/db/tables';
import {
  ITEM_CONDITION_OPTIONS,
  ITEM_DISPOSITION_OPTIONS,
  RETURN_REASON_OPTIONS,
  getWarrantyMeta,
} from '../lib/invoiceStatus';

export interface CreditNoteModalProps {
  opened: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onCreditNoteSuccess?: () => void;
}

// This codebase has no `returnWindowDays` surfaced anywhere on the frontend
// yet (a backend `Config` value, not yet exposed through any API response) —
// this local fallback drives the banner threshold only, and should be
// replaced once that value is wired through (see final report).
const RETURN_WINDOW_DAYS_FALLBACK = 30;

interface SerialUnitState {
  selected: boolean;
  condition: CreditNoteItemCondition;
  disposition: CreditNoteItemDisposition | null;
  reason: string;
}

interface LineState {
  selected: boolean;
  quantity: number;
  condition: CreditNoteItemCondition;
  disposition: CreditNoteItemDisposition | null;
  reason: string;
  /** Per-unit state for a serial-tracked line — one entry per serial number, keyed by serial. */
  serialUnits?: Record<string, SerialUnitState>;
}

interface ExchangeLine {
  key: string;
  productKey: string;
  name: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
}

export const CreditNoteModal = ({
  opened,
  onClose,
  invoice,
  onCreditNoteSuccess,
}: CreditNoteModalProps) => {
  const isMobile = useIsMobile();
  const authUser = useAppSelector(selectAuthUser);
  const isAdmin = authUser?.role === USER_ROLES.ADMIN;
  const createCreditNoteMutation = useCreateCreditNote();
  const { data: products } = useAllProducts();

  const [lineStates, setLineStates] = useState<Record<string, LineState>>({});
  const [noReceipt, setNoReceipt] = useState(false);
  const [noReceiptProductKey, setNoReceiptProductKey] = useState<string | null>(null);
  const [noReceiptQty, setNoReceiptQty] = useState<number | ''>(1);
  const [overrideReason, setOverrideReason] = useState('');
  const [refundBreakdown, setRefundBreakdown] = useState<Record<string, number>>({});
  const [exchangeLines, setExchangeLines] = useState<ExchangeLine[]>([]);
  const [exchangeProductKey, setExchangeProductKey] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevInvoiceId, setPrevInvoiceId] = useState(invoice?.id);
  if (invoice?.id !== prevInvoiceId) {
    setPrevInvoiceId(invoice?.id);
    setLineStates({});
    setNoReceipt(false);
    setNoReceiptProductKey(null);
    setNoReceiptQty(1);
    setOverrideReason('');
    setRefundBreakdown({});
    setExchangeLines([]);
    setExchangeProductKey(null);
    setNotes('');
  }

  const items = useMemo(() => invoice?.items ?? [], [invoice?.items]);
  const [nowMs] = useState(() => Date.now());

  const resetForm = useCallback(() => {
    setLineStates({});
    setNoReceipt(false);
    setNoReceiptProductKey(null);
    setNoReceiptQty(1);
    setOverrideReason('');
    setRefundBreakdown({});
    setExchangeLines([]);
    setExchangeProductKey(null);
    setNotes('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const getLineState = useCallback(
    (item: InvoiceItem): LineState => {
      if (lineStates[item.id]) return lineStates[item.id];
      const remaining = Math.max(0, item.quantity - (item.returnedQuantity || 0));
      const serialUnits: Record<string, SerialUnitState> | undefined = item.serialNumbers?.length
        ? Object.fromEntries(
            item.serialNumbers.map((serial) => [
              serial,
              {
                selected: false,
                condition: 'resalable' as CreditNoteItemCondition,
                disposition: null,
                reason: 'defective',
              },
            ])
          )
        : undefined;
      return {
        selected: remaining > 0,
        quantity: Math.min(1, remaining) || 1,
        condition: 'resalable',
        disposition: null,
        reason: 'defective',
        serialUnits,
      };
    },
    [lineStates]
  );

  const updateLine = useCallback(
    (itemId: string, patch: Partial<LineState>) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;
      setLineStates((prev) => {
        const current = prev[itemId] || getLineState(item);
        return {
          ...prev,
          [itemId]: { ...current, ...patch },
        };
      });
    },
    [items, getLineState]
  );

  const updateSerialUnit = useCallback(
    (item: InvoiceItem, serial: string, patch: Partial<SerialUnitState>) => {
      setLineStates((prev) => {
        const current = prev[item.id] || getLineState(item);
        const currentUnit = current.serialUnits?.[serial] ?? {
          selected: false,
          condition: 'resalable' as CreditNoteItemCondition,
          disposition: null,
          reason: 'defective',
        };
        return {
          ...prev,
          [item.id]: {
            ...current,
            serialUnits: { ...current.serialUnits, [serial]: { ...currentUnit, ...patch } },
          },
        };
      });
    },
    [getLineState]
  );

  const productMap = useMemo(() => new Map(products.map((p) => [p.key, p])), [products]);

  const selectedLines = useMemo(() => {
    if (!invoice) return [];
    const rows: {
      item: InvoiceItem;
      state: LineState;
      quantity: number;
      refundAmountCents: number;
    }[] = [];

    for (const item of items) {
      if (item.serialNumbers?.length) continue;
      const state = getLineState(item);
      const remaining = Math.max(0, item.quantity - (item.returnedQuantity || 0));
      if (state.selected && remaining > 0) {
        const qty = Math.min(Math.max(1, state.quantity), remaining);
        const proratedDiscount =
          item.quantity > 0 ? Math.round((item.discountCents / item.quantity) * qty) : 0;
        const refundAmountCents = Math.max(0, item.unitPriceCents * qty - proratedDiscount);
        rows.push({ item, state, quantity: qty, refundAmountCents });
      }
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, items, lineStates, getLineState]);

  const serializedLines = useMemo(() => {
    if (!invoice) return [];
    const rows: {
      item: InvoiceItem;
      serial: string;
      unit: SerialUnitState;
      refundAmountCents: number;
      withinWarranty: boolean;
    }[] = [];
    for (const item of items) {
      if (!item.serialNumbers?.length) continue;
      const state = getLineState(item);
      const proratedDiscount =
        item.quantity > 0 ? Math.round(item.discountCents / item.quantity) : 0;
      const refundAmountCents = Math.max(0, item.unitPriceCents - proratedDiscount);
      const product = productMap.get(item.productId);
      const withinWarranty = Boolean(
        product?.warrantyMonths &&
        nowMs < new Date(invoice.createdAt).getTime() + product.warrantyMonths * 30 * 86_400_000
      );
      for (const serial of item.serialNumbers) {
        const unit = state.serialUnits?.[serial];
        if (!unit?.selected) continue;
        rows.push({ item, serial, unit, refundAmountCents, withinWarranty });
      }
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, items, lineStates, productMap, getLineState, nowMs]);

  const noReceiptProduct = noReceiptProductKey ? productMap.get(noReceiptProductKey) : undefined;
  const noReceiptRefundCents =
    noReceipt && noReceiptProduct && typeof noReceiptQty === 'number'
      ? noReceiptProduct.sellingPriceCents * noReceiptQty
      : 0;

  const returnSubtotalCents = noReceipt
    ? noReceiptRefundCents
    : selectedLines.reduce((sum, l) => sum + l.refundAmountCents, 0) +
      serializedLines.reduce((sum, l) => sum + l.refundAmountCents, 0);

  const exchangeSubtotalCents = exchangeLines.reduce(
    (sum, l) => sum + l.unitPriceCents * l.quantity,
    0
  );
  const netRefundCents = returnSubtotalCents - exchangeSubtotalCents;

  const daysSinceSale = invoice
    ? Math.floor((nowMs - new Date(invoice.createdAt).getTime()) / 86_400_000)
    : 0;
  const isPastReturnWindow = !noReceipt && daysSinceSale > RETURN_WINDOW_DAYS_FALLBACK;
  const needsOverride = noReceipt || isPastReturnWindow;

  const isSplitPaid = invoice?.paymentMethod === 'split' && !!invoice.splitPayments?.length;
  const refundLegTargets = useMemo(() => {
    if (!isSplitPaid || !invoice?.splitPayments) return [];
    const totalSplit = invoice.splitPayments.reduce((s, p) => s + p.amountCents, 0) || 1;
    return invoice.splitPayments.map((p) => ({
      method: p.method,
      proportional: Math.round((p.amountCents / totalSplit) * Math.max(0, netRefundCents)),
    }));
  }, [isSplitPaid, invoice, netRefundCents]);

  const hasMissingDisposition =
    selectedLines.some((l) => l.state.condition === 'damaged' && !l.state.disposition) ||
    serializedLines.some((l) => l.unit.condition === 'damaged' && !l.unit.disposition);

  const canSubmit =
    (noReceipt
      ? !!noReceiptProduct && noReceiptRefundCents > 0
      : selectedLines.length > 0 || serializedLines.length > 0) &&
    !hasMissingDisposition &&
    (!needsOverride || (isAdmin && overrideReason.trim().length > 0));

  if (!invoice) return null;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const returnedItems: CreateCreditNoteItemInput[] = noReceipt
        ? [
            {
              productKey: noReceiptProduct!.key,
              name: noReceiptProduct!.name,
              quantity: typeof noReceiptQty === 'number' ? noReceiptQty : 1,
              reason: 'other',
              condition: 'pending_inspection',
              unitPriceCents: noReceiptProduct!.sellingPriceCents,
            },
          ]
        : [
            ...selectedLines.map(({ item, state, quantity }) => ({
              productKey:
                item.sourceType === 'retail' || !item.sourceType
                  ? item.productId || undefined
                  : undefined,
              sourceTicketKey:
                item.sourceType && item.sourceType !== 'retail'
                  ? item.productId || undefined
                  : undefined,
              name: item.name,
              quantity,
              reason: state.reason,
              condition: state.condition,
              disposition: state.condition === 'damaged' ? state.disposition! : undefined,
              unitPriceCents: item.unitPriceCents,
            })),
            ...serializedLines.map(({ item, serial, unit }) => ({
              productKey: item.productId || undefined,
              name: item.name,
              quantity: 1,
              reason: unit.reason,
              condition: unit.condition,
              disposition: unit.condition === 'damaged' ? unit.disposition! : undefined,
              unitPriceCents: item.unitPriceCents,
              serialNumber: serial,
            })),
          ];

      const exchangeItemsInput: CreateCreditNoteExchangeItemInput[] = exchangeLines.map((l) => ({
        productKey: l.productKey,
        name: l.name,
        quantity: l.quantity,
        discountCents: 0,
        sourceType: 'retail',
        unitPriceCents: l.unitPriceCents,
      }));

      let refundBreakdownInput: CreateCreditNoteRefundBreakdownInput[] | undefined;
      if (isSplitPaid && netRefundCents > 0) {
        refundBreakdownInput = refundLegTargets
          .map((leg) => ({
            method: leg.method as CreateCreditNoteRefundBreakdownInput['method'],
            amountCents: refundBreakdown[leg.method] ?? leg.proportional,
          }))
          .filter((leg) => leg.amountCents > 0);
      }

      await createCreditNoteMutation.mutateAsync({
        input: {
          invoiceKey: noReceipt ? undefined : invoice.id,
          returnedItems,
          exchangeItems: exchangeItemsInput.length > 0 ? exchangeItemsInput : undefined,
          notes: notes.trim() || undefined,
          noReceipt: noReceipt || undefined,
          overrideReason: needsOverride ? overrideReason.trim() : undefined,
          refundBreakdown: refundBreakdownInput,
        },
      });

      void syncEngine.syncNow();

      notifications.show({
        title: 'Credit Note Created',
        message:
          netRefundCents > 0
            ? `Refund of ${formatMoney(netRefundCents)} processed.`
            : netRefundCents < 0
              ? `Customer owes ${formatMoney(-netRefundCents)} for the exchange.`
              : 'Exchange settled — no money changed hands.',
        color: 'green',
      });
      resetForm();
      onCreditNoteSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create credit note', error);
      notifications.show({
        title: 'Could Not Create Credit Note',
        message: 'Please check the details and try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const productOptions = products.map((p) => ({
    value: p.key,
    label: `${p.name} (${p.sku}) — ${formatMoney(p.sellingPriceCents)}`,
  }));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          Process Credit Note — #{invoice.invoiceNumber}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        {isPastReturnWindow && !noReceipt && (
          <Alert color="amber" icon={<IconAlertTriangle size={16} />}>
            This sale was made {daysSinceSale} days ago — outside our {RETURN_WINDOW_DAYS_FALLBACK}
            -day return window.{' '}
            {isAdmin ? 'You can approve it anyway below.' : 'A manager needs to approve this.'}
          </Alert>
        )}

        {isAdmin ? (
          <Switch
            label="This customer has no receipt"
            checked={noReceipt}
            onChange={(e) => setNoReceipt(e.currentTarget.checked)}
          />
        ) : (
          <Text size="xs" c="dimmed">
            A manager needs to approve a return with no receipt.
          </Text>
        )}

        {noReceipt ? (
          <Paper p="sm" withBorder>
            <Stack gap="sm">
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                style={{ letterSpacing: '0.05em' }}
              >
                Item Being Returned (No Receipt)
              </Text>
              <Select
                label="Product"
                placeholder="Search for the item"
                searchable
                data={productOptions}
                value={noReceiptProductKey}
                onChange={setNoReceiptProductKey}
              />
              <QuantityInput value={noReceiptQty} min={1} onChange={setNoReceiptQty} />
              {noReceiptProduct && (
                <Text size="xs" c="dimmed">
                  Valued at today&apos;s selling price:{' '}
                  {formatMoney(noReceiptProduct.sellingPriceCents)} each —{' '}
                  {formatMoney(noReceiptRefundCents)} total.
                </Text>
              )}
            </Stack>
          </Paper>
        ) : (
          <Paper withBorder style={{ overflowX: 'auto' }}>
            <Table verticalSpacing="sm" horizontalSpacing="sm" striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ width: 40 }} />
                  <Table.Th>Item & Condition</Table.Th>
                  <Table.Th style={{ width: 135, textAlign: 'center' }}>Qty</Table.Th>
                  <Table.Th style={{ width: 110, textAlign: 'right' }}>Refund</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item) => {
                  const state = getLineState(item);
                  const remaining = Math.max(0, item.quantity - (item.returnedQuantity || 0));
                  const isFullyReturned = remaining === 0;
                  const line = selectedLines.find((l) => l.item.id === item.id);
                  const isSerialized = Boolean(item.serialNumbers?.length);

                  if (isSerialized) {
                    const itemSerialLines = serializedLines.filter((l) => l.item.id === item.id);
                    const itemRefundCents = itemSerialLines.reduce(
                      (sum, l) => sum + l.refundAmountCents,
                      0
                    );
                    return (
                      <Table.Tr key={item.id}>
                        <Table.Td />
                        <Table.Td colSpan={2}>
                          <Stack gap={6}>
                            <Text size="sm" fw={600}>
                              {item.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              Tracked by serial number — {itemSerialLines.length} of{' '}
                              {item.serialNumbers?.length ?? 0} selected for return.
                            </Text>
                            {(item.serialNumbers ?? []).map((serial) => {
                              const unit = state.serialUnits?.[serial] ?? {
                                selected: false,
                                condition: 'resalable' as CreditNoteItemCondition,
                                disposition: null,
                                reason: 'defective',
                              };
                              const product = products.find((p) => p.key === item.productId);
                              const withinWarranty = Boolean(
                                product?.warrantyMonths &&
                                nowMs <
                                  new Date(invoice.createdAt).getTime() +
                                    product.warrantyMonths * 30 * 86_400_000
                              );
                              const warrantyMeta = getWarrantyMeta(withinWarranty);
                              return (
                                <Paper key={serial} p="xs" withBorder bg="var(--bg-app)">
                                  <Stack gap={6}>
                                    <Group justify="space-between" wrap="nowrap">
                                      <Group gap="xs" wrap="nowrap">
                                        <Checkbox
                                          checked={unit.selected}
                                          onChange={(e) =>
                                            updateSerialUnit(item, serial, {
                                              selected: e.currentTarget.checked,
                                            })
                                          }
                                          aria-label={`Select unit ${serial} for credit note`}
                                        />
                                        <Text size="sm" fw={600}>
                                          {serial}
                                        </Text>
                                      </Group>
                                      <Badge size="xs" color={warrantyMeta.color} variant="light">
                                        {warrantyMeta.label}
                                      </Badge>
                                    </Group>
                                    {unit.selected && (
                                      <Group grow>
                                        <Select
                                          size="xs"
                                          label="Condition"
                                          data={ITEM_CONDITION_OPTIONS}
                                          value={unit.condition}
                                          onChange={(v) =>
                                            updateSerialUnit(item, serial, {
                                              condition:
                                                (v as CreditNoteItemCondition) || 'resalable',
                                              disposition:
                                                v === 'damaged' ? unit.disposition : null,
                                            })
                                          }
                                        />
                                        {unit.condition === 'damaged' && (
                                          <Select
                                            size="xs"
                                            label="What happens to it?"
                                            placeholder="Choose one"
                                            required
                                            error={
                                              !unit.disposition
                                                ? 'Required for a damaged item'
                                                : undefined
                                            }
                                            data={ITEM_DISPOSITION_OPTIONS}
                                            value={unit.disposition}
                                            onChange={(v) =>
                                              updateSerialUnit(item, serial, {
                                                disposition:
                                                  (v as CreditNoteItemDisposition) || null,
                                              })
                                            }
                                          />
                                        )}
                                      </Group>
                                    )}
                                  </Stack>
                                </Paper>
                              );
                            })}
                          </Stack>
                        </Table.Td>
                        <Table.Td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                          <Text
                            size="sm"
                            fw={700}
                            c={itemSerialLines.length ? 'orange.8' : 'dimmed'}
                          >
                            {formatMoney(itemRefundCents)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  }

                  return (
                    <Table.Tr key={item.id} opacity={isFullyReturned ? 0.6 : 1}>
                      <Table.Td style={{ verticalAlign: 'top', paddingTop: 14 }}>
                        <Checkbox
                          checked={state.selected && !isFullyReturned}
                          disabled={isFullyReturned}
                          onChange={(e) =>
                            updateLine(item.id, { selected: e.currentTarget.checked })
                          }
                          aria-label={`Select ${item.name} for credit note`}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Stack gap={6}>
                          <Text size="sm" fw={600}>
                            {item.name}
                          </Text>
                          {state.selected && !isFullyReturned && (
                            <Stack gap={6} mt={4}>
                              <Select
                                size="xs"
                                label="Reason"
                                data={RETURN_REASON_OPTIONS}
                                value={state.reason}
                                onChange={(v) => updateLine(item.id, { reason: v || 'defective' })}
                              />
                              <Select
                                size="xs"
                                label="Condition"
                                data={ITEM_CONDITION_OPTIONS}
                                value={state.condition}
                                onChange={(v) =>
                                  updateLine(item.id, {
                                    condition: (v as CreditNoteItemCondition) || 'resalable',
                                    disposition: v === 'damaged' ? state.disposition : null,
                                  })
                                }
                              />
                              {state.condition === 'damaged' && (
                                <Select
                                  size="xs"
                                  label="What happens to it?"
                                  placeholder="Choose one"
                                  required
                                  error={
                                    !state.disposition ? 'Required for a damaged item' : undefined
                                  }
                                  data={ITEM_DISPOSITION_OPTIONS}
                                  value={state.disposition}
                                  onChange={(v) =>
                                    updateLine(item.id, {
                                      disposition: (v as CreditNoteItemDisposition) || null,
                                    })
                                  }
                                />
                              )}
                            </Stack>
                          )}
                        </Stack>
                      </Table.Td>
                      <Table.Td style={{ verticalAlign: 'top', textAlign: 'center' }}>
                        {isFullyReturned ? (
                          <Stack gap={2} align="center">
                            <Badge size="xs" color="gray" variant="light">
                              0 available
                            </Badge>
                            {item.quantity > 0 && (
                              <Text size="3xs" c="dimmed">
                                All {item.quantity} returned
                              </Text>
                            )}
                          </Stack>
                        ) : (
                          <Stack gap={4} align="center">
                            <QuantityInput
                              value={state.quantity}
                              min={1}
                              max={remaining}
                              disabled={!state.selected}
                              size="xs"
                              onChange={(v) =>
                                updateLine(item.id, {
                                  quantity: typeof v === 'number' ? Math.min(v, remaining) : 1,
                                })
                              }
                            />
                            <Group gap={4} align="center" justify="center" wrap="nowrap">
                              <Text
                                size="xs"
                                c="dimmed"
                                style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                              >
                                Max: {remaining}
                              </Text>
                              <Button
                                size="compact-xs"
                                variant="light"
                                color="blue"
                                disabled={state.selected && state.quantity >= remaining}
                                onClick={() =>
                                  updateLine(item.id, { selected: true, quantity: remaining })
                                }
                                style={{
                                  fontSize: 10,
                                  height: 18,
                                  paddingLeft: 6,
                                  paddingRight: 6,
                                }}
                              >
                                Max
                              </Button>
                            </Group>
                            {Boolean(item.returnedQuantity && item.returnedQuantity > 0) && (
                              <Text
                                size="3xs"
                                c="dimmed"
                                style={{ fontSize: 10, whiteSpace: 'nowrap' }}
                              >
                                ({item.returnedQuantity} of {item.quantity} returned)
                              </Text>
                            )}
                          </Stack>
                        )}
                      </Table.Td>
                      <Table.Td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                        <Text size="sm" fw={700} c={line ? 'orange.8' : 'dimmed'}>
                          {formatMoney(line?.refundAmountCents ?? 0)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Paper>
        )}

        {needsOverride && (
          <Textarea
            label="Manager override reason"
            placeholder="Why is this being approved?"
            required
            minRows={2}
            disabled={!isAdmin}
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.currentTarget.value)}
            leftSection={<IconShieldLock size={14} />}
          />
        )}

        <Box>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
            Add Replacement Items (Exchange)
          </Text>
          <Text size="xs" c="dimmed" mb={4}>
            Optional — add items the customer is taking instead. Leave empty for a plain refund.
          </Text>
          <Group gap="xs" align="flex-end">
            <Select
              placeholder="Search for a replacement item"
              searchable
              style={{ flex: 1 }}
              data={productOptions}
              value={exchangeProductKey}
              onChange={setExchangeProductKey}
            />
            <Button
              variant="light"
              disabled={!exchangeProductKey}
              onClick={() => {
                const product = products.find((p) => p.key === exchangeProductKey);
                if (!product) return;
                setExchangeLines((prev) => [
                  ...prev,
                  {
                    key: `${product.key}-${Date.now()}`,
                    productKey: product.key,
                    name: product.name,
                    sku: product.sku,
                    unitPriceCents: product.sellingPriceCents,
                    quantity: 1,
                  },
                ]);
                setExchangeProductKey(null);
              }}
            >
              Add
            </Button>
          </Group>
          {exchangeLines.length > 0 && (
            <Stack gap={4} mt="xs">
              {exchangeLines.map((line) => (
                <Group key={line.key} justify="space-between">
                  <Text size="xs">
                    {line.name} × {line.quantity}
                  </Text>
                  <Group gap="xs">
                    <Text size="xs" fw={600}>
                      {formatMoney(line.unitPriceCents * line.quantity)}
                    </Text>
                    <Button
                      size="compact-xs"
                      variant="subtle"
                      color="red"
                      onClick={() =>
                        setExchangeLines((prev) => prev.filter((l) => l.key !== line.key))
                      }
                    >
                      Remove
                    </Button>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Box>

        {isSplitPaid && netRefundCents > 0 && (
          <Paper p="sm" withBorder>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              tt="uppercase"
              mb="xs"
              style={{ letterSpacing: '0.05em' }}
            >
              Refund Split Across Payment Methods
            </Text>
            <Stack gap="xs">
              {refundLegTargets.map((leg) => (
                <NumberInput
                  key={leg.method}
                  label={`${leg.method.toUpperCase()} refund amount (Rs.)`}
                  min={0}
                  value={
                    refundBreakdown[leg.method] !== undefined
                      ? refundBreakdown[leg.method] / 100
                      : leg.proportional / 100
                  }
                  onChange={(v) =>
                    setRefundBreakdown((prev) => ({
                      ...prev,
                      [leg.method]: typeof v === 'number' ? Math.round(v * 100) : 0,
                    }))
                  }
                />
              ))}
            </Stack>
          </Paper>
        )}

        <Paper p="sm" withBorder bg="var(--bg-app)">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm" fw={700}>
                {netRefundCents >= 0 ? 'Refund Due to Customer' : 'Customer Pays Extra'}
              </Text>
              <Text size="lg" fw={800} c="orange.8">
                {formatMoney(Math.abs(netRefundCents))}
              </Text>
            </Group>
            <Textarea
              size="xs"
              label="Notes (Optional)"
              minRows={2}
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
            />
          </Stack>
        </Paper>

        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="default" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button color="blue" loading={isSubmitting} disabled={!canSubmit} onClick={handleSubmit}>
            Create Credit Note
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
