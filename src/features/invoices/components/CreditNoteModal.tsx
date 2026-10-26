import { t } from '@/shared/i18n/t';
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
import type {
  Invoice,
  InvoiceItem,
  CreditNoteItemCondition,
  CreditNoteItemDisposition,
} from '@/features/billing/types';
import { formatMoney } from '@/shared/lib/money';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
import { useAllProducts, useProductBatches } from '@/features/inventory/hooks/useProducts';
import { PriceTierPickerModal } from '@/features/inventory/components/PriceTierPickerModal';
import {
  formatCentsRange,
  sellingPriceRange,
  tiersWithRoom,
} from '@/features/inventory/lib/priceTiers';
import type { PriceTier, Product } from '@/features/inventory/types';
import { useCreateCreditNote } from '@/features/billing/hooks/useCreditNotes';
import { useCalc } from '@/shared/hooks/useCalc';
import { calcCreditNote } from '@/features/billing/api/calcApi';
import type {
  CreateCreditNoteExchangeItemInput,
  CreateCreditNoteItemInput,
  CreateCreditNoteRefundBreakdownInput,
} from '@/features/billing/api/creditNotesApi';
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
  // TODO: this override is Admin-only, but the copy at line ~434 tells the
  // cashier "a manager needs to approve this" — the backend has no
  // permission distinguishing "may override the return window" from Admin
  // specifically (`POST /credit-notes` only requires `billing:write`), so
  // this mismatch predates the permission-system migration and is left
  // for a follow-up decision (extend to Manager, or fix the copy) rather
  // than silently resolved here.
  const isAdmin = useIsAdmin();
  const createCreditNoteMutation = useCreateCreditNote();
  const { data: products } = useAllProducts();

  const [lineStates, setLineStates] = useState<Record<string, LineState>>({});
  const [noReceipt, setNoReceipt] = useState(false);
  const [noReceiptProductKey, setNoReceiptProductKey] = useState<string | null>(null);
  const [noReceiptQty, setNoReceiptQty] = useState<number | ''>(1);
  const [noReceiptPriceCents, setNoReceiptPriceCents] = useState<string | null>(null);
  const [exchangePickerProduct, setExchangePickerProduct] = useState<Product | null>(null);
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
    setNoReceiptPriceCents(null);
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
    setNoReceiptPriceCents(null);
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
      /** Position of the line on the invoice, which is how the server finds it. */
      lineIndex: number;
      state: LineState;
      quantity: number;
    }[] = [];

    for (const [lineIndex, item] of items.entries()) {
      if (item.serialNumbers?.length) continue;
      const state = getLineState(item);
      const remaining = Math.max(0, item.quantity - (item.returnedQuantity || 0));
      if (state.selected && remaining > 0) {
        const qty = Math.min(Math.max(1, state.quantity), remaining);
        rows.push({ item, lineIndex, state, quantity: qty });
      }
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, items, lineStates, getLineState]);

  const serializedLines = useMemo(() => {
    if (!invoice) return [];
    const rows: {
      item: InvoiceItem;
      lineIndex: number;
      serial: string;
      unit: SerialUnitState;
      withinWarranty: boolean;
    }[] = [];
    for (const [lineIndex, item] of items.entries()) {
      if (!item.serialNumbers?.length) continue;
      const state = getLineState(item);
      const product = productMap.get(item.productId);
      const withinWarranty = Boolean(
        product?.warrantyMonths &&
        nowMs < new Date(invoice.createdAt).getTime() + product.warrantyMonths * 30 * 86_400_000
      );
      for (const serial of item.serialNumbers) {
        const unit = state.serialUnits?.[serial];
        if (!unit?.selected) continue;
        rows.push({ item, lineIndex, serial, unit, withinWarranty });
      }
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice, items, lineStates, productMap, getLineState, nowMs]);

  const noReceiptProduct = noReceiptProductKey ? productMap.get(noReceiptProductKey) : undefined;
  // Every price the product has ever been received at — a no-receipt return
  // goes back into the newest delivery at the price it was sold at.
  const { data: noReceiptBatches } = useProductBatches(noReceiptProductKey ?? undefined, {
    enabled: noReceipt && noReceiptProductKey !== null,
  });
  const noReceiptPriceOptions = useMemo(
    () =>
      [...new Set((noReceiptBatches ?? []).map((b) => b.sellingPriceCents))]
        .sort((a, b) => a - b)
        .map((cents) => ({ value: String(cents), label: formatMoney(cents) })),
    [noReceiptBatches]
  );
  const noReceiptPrice = noReceiptPriceCents === null ? null : Number(noReceiptPriceCents);
  // What the return comes to is the server's answer for exactly what is picked: the refund each
  // line is worth, the net, the cash that goes back (capped at what was paid), where it goes, and
  // whether the sale is past the return window.
  const noReceiptEntry =
    noReceipt && noReceiptProduct
      ? {
          unitPriceCents: noReceiptPrice === null ? 0 : noReceiptPrice,
          quantity: typeof noReceiptQty === 'number' ? noReceiptQty : 0,
        }
      : null;
  const calc = useCalc(
    'credit-note',
    {
      invoiceKey: noReceipt || !invoice ? null : invoice.id,
      returned: noReceipt
        ? []
        : [
            ...selectedLines.map((l) => ({ lineIndex: l.lineIndex, quantity: l.quantity })),
            ...serializedLines.map((l) => ({ lineIndex: l.lineIndex, quantity: 1 })),
          ],
      noReceipt: noReceipt
        ? noReceiptEntry === null
          ? { unitPriceCents: 0, quantity: 0 }
          : noReceiptEntry
        : null,
      exchanged: exchangeLines.map((l) => ({
        unitPriceCents: l.unitPriceCents,
        quantity: l.quantity,
      })),
    },
    calcCreditNote
  );
  const answer = calc.data;
  /** What returned line number `position` (plain lines first, then serial units) is worth back. */
  const refundOf = (position: number): number | null =>
    answer !== undefined && calc.isCurrent && position < answer.lines.length
      ? answer.lines[position].refundCents
      : null;
  const netRefundCents = answer === undefined ? null : answer.netRefundCents;
  const needsOverride = noReceipt || (answer !== undefined && answer.pastReturnWindow);
  const refundLegTargets = answer === undefined ? [] : answer.refundLegs;
  const isSplitPaid = refundLegTargets.length > 1;

  const hasMissingDisposition =
    selectedLines.some((l) => l.state.condition === 'damaged' && !l.state.disposition) ||
    serializedLines.some((l) => l.unit.condition === 'damaged' && !l.unit.disposition);

  const canSubmit =
    (noReceipt
      ? !!noReceiptProduct && answer !== undefined && answer.returnSubtotalCents > 0
      : selectedLines.length > 0 || serializedLines.length > 0) &&
    calc.isCurrent &&
    !hasMissingDisposition &&
    (!needsOverride || (isAdmin && overrideReason.trim().length > 0));

  if (!invoice) return null;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting || answer === undefined) return;
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
              sellingPriceCents: noReceiptPrice!,
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
              sellingPriceCents:
                item.sourceType === 'retail' || !item.sourceType ? item.unitPriceCents : undefined,
            })),
            ...serializedLines.map(({ item, serial, unit }) => ({
              productKey: item.productId || undefined,
              name: item.name,
              quantity: 1,
              reason: unit.reason,
              condition: unit.condition,
              disposition: unit.condition === 'damaged' ? unit.disposition! : undefined,
              unitPriceCents: item.unitPriceCents,
              sellingPriceCents: item.unitPriceCents,
              serialNumber: serial,
            })),
          ];

      const exchangeItemsInput: CreateCreditNoteExchangeItemInput[] = exchangeLines.map((l) => ({
        productKey: l.productKey,
        name: l.name,
        quantity: l.quantity,
        discountCents: 0,
        sourceType: 'retail',
        sellingPriceCents: l.unitPriceCents,
      }));

      let refundBreakdownInput: CreateCreditNoteRefundBreakdownInput[] | undefined;
      if (isSplitPaid && answer.netRefundCents > 0) {
        refundBreakdownInput = refundLegTargets
          .map((leg) => ({
            method: leg.method as CreateCreditNoteRefundBreakdownInput['method'],
            amountCents: refundBreakdown[leg.method] ?? leg.amountCents,
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

      notifications.show({
        title: 'Credit Note Created',
        message:
          answer.netRefundCents > 0
            ? `Refund of ${formatMoney(answer.netRefundCents)} processed.`
            : answer.netRefundCents < 0
              ? `Customer owes ${formatMoney(-answer.netRefundCents)} for the exchange.`
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

  const priceLabel = (p: Product): string => {
    const range = sellingPriceRange(p);
    return range === null ? t('Out of stock') : formatCentsRange(range);
  };
  const productOptions = products.map((p) => ({
    value: p.key,
    label: `${p.name} (${p.sku}) — ${priceLabel(p)}`,
  }));
  // A replacement is sold like a sale line (one line per product and price);
  // a serial-tracked unit can't be chosen here, so those are left out.
  const exchangeProductOptions = products
    .filter((p) => !p.isSerialized && p.priceTiers.length > 0)
    .map((p) => ({ value: p.key, label: `${p.name} (${p.sku}) — ${priceLabel(p)}` }));

  /** Units of each product already taken as replacements, per price. */
  const exchangeReservedByPrice = (productKey: string): Map<number, number> => {
    const byPrice = new Map<number, number>();
    for (const line of exchangeLines) {
      if (line.productKey !== productKey) continue;
      byPrice.set(line.unitPriceCents, (byPrice.get(line.unitPriceCents) ?? 0) + line.quantity);
    }
    return byPrice;
  };

  const addExchangeAt = (product: Product, tier: PriceTier) => {
    setExchangeLines((prev) => {
      const existing = prev.find(
        (l) => l.productKey === product.key && l.unitPriceCents === tier.sellingPriceCents
      );
      if (existing) {
        return prev.map((l) => (l === existing ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [
        ...prev,
        {
          key: `${product.key}-${tier.sellingPriceCents}`,
          productKey: product.key,
          name: product.name,
          sku: product.sku,
          unitPriceCents: tier.sellingPriceCents,
          quantity: 1,
        },
      ];
    });
    setExchangeProductKey(null);
  };

  const handleAddExchange = () => {
    const product = products.find((p) => p.key === exchangeProductKey);
    if (!product) return;
    const withRoom = tiersWithRoom(product.priceTiers, exchangeReservedByPrice(product.key)).filter(
      (tier) => tier.left > 0
    );
    if (withRoom.length === 0) {
      notifications.show({
        title: t('Out of stock'),
        message: `${product.name}: ${t('no more units left to give.')}`,
        color: 'red',
      });
      return;
    }
    if (withRoom.length === 1) {
      addExchangeAt(product, withRoom[0]);
      return;
    }
    setExchangePickerProduct(product);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      zIndex={400}
      title={
        <Text fw={700} size="lg">
          {t('Process Credit Note — #')}
          {invoice.invoiceNumber}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        {answer !== undefined && answer.pastReturnWindow && !noReceipt && (
          <Alert color="amber" icon={<IconAlertTriangle size={16} />}>
            {t('This sale was made')} {answer.daysSinceSale} {t('days ago — outside our')}{' '}
            {answer.returnWindowDays}
            {t('-day return window.')}{' '}
            {isAdmin ? 'You can approve it anyway below.' : 'A manager needs to approve this.'}
          </Alert>
        )}

        {isAdmin ? (
          <Switch
            label={t('This customer has no receipt')}
            checked={noReceipt}
            onChange={(e) => setNoReceipt(e.currentTarget.checked)}
          />
        ) : (
          <Text size="xs" c="dimmed">
            {t('A manager needs to approve a return with no receipt.')}
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
                {t('Item Being Returned (No Receipt)')}
              </Text>
              <Select
                label={t('Product')}
                placeholder={t('Search for the item')}
                searchable
                data={productOptions}
                value={noReceiptProductKey}
                onChange={(key) => {
                  setNoReceiptProductKey(key);
                  setNoReceiptPriceCents(null);
                }}
              />
              {noReceiptProduct && (
                <Select
                  label={t('Price it was sold at')}
                  placeholder={t('Pick the price')}
                  data={noReceiptPriceOptions}
                  value={noReceiptPriceCents}
                  onChange={setNoReceiptPriceCents}
                />
              )}
              <QuantityInput value={noReceiptQty} min={1} onChange={setNoReceiptQty} />
              {noReceiptProduct && noReceiptPrice !== null && answer !== undefined && (
                <Text size="xs" c="dimmed">
                  {formatMoney(noReceiptPrice)} {t('each —')}{' '}
                  {formatMoney(answer.returnSubtotalCents)} {t('total.')}
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
                  <Table.Th>{t('Item & Condition')}</Table.Th>
                  <Table.Th style={{ width: 135, textAlign: 'center' }}>{t('Qty')}</Table.Th>
                  <Table.Th style={{ width: 110, textAlign: 'right' }}>{t('Refund')}</Table.Th>
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
                    // Each picked unit's worth comes from the server, which answers serial units
                    // after the plain lines, in the order they were asked.
                    const unitRefunds = itemSerialLines.map((l) =>
                      refundOf(selectedLines.length + serializedLines.indexOf(l))
                    );
                    const itemRefundCents = unitRefunds.some((cents) => cents === null)
                      ? null
                      : unitRefunds.reduce<number>((sum, cents) => sum + (cents as number), 0);
                    return (
                      <Table.Tr key={item.id}>
                        <Table.Td />
                        <Table.Td colSpan={2}>
                          <Stack gap={6}>
                            <Text size="sm" fw={600}>
                              {item.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {t('Tracked by serial number —')} {itemSerialLines.length} {t('of')}{' '}
                              {item.serialNumbers?.length ?? 0} {t('selected for return.')}
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
                                          label={t('Condition')}
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
                                            label={t('What happens to it?')}
                                            placeholder={t('Choose one')}
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
                            {itemRefundCents === null ? '' : formatMoney(itemRefundCents)}
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
                                label={t('Reason')}
                                data={RETURN_REASON_OPTIONS}
                                value={state.reason}
                                onChange={(v) => updateLine(item.id, { reason: v || 'defective' })}
                              />
                              <Select
                                size="xs"
                                label={t('Condition')}
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
                                  label={t('What happens to it?')}
                                  placeholder={t('Choose one')}
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
                              {t('0 available')}
                            </Badge>
                            {item.quantity > 0 && (
                              <Text size="3xs" c="dimmed">
                                {t('All')} {item.quantity} {t('returned')}
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
                                {t('Max:')} {remaining}
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
                                {t('Max')}
                              </Button>
                            </Group>
                            {Boolean(item.returnedQuantity && item.returnedQuantity > 0) && (
                              <Text
                                size="3xs"
                                c="dimmed"
                                style={{ fontSize: 10, whiteSpace: 'nowrap' }}
                              >
                                ({item.returnedQuantity} {t('of')} {item.quantity} {t('returned)')}
                              </Text>
                            )}
                          </Stack>
                        )}
                      </Table.Td>
                      <Table.Td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                        <Text size="sm" fw={700} c={line ? 'orange.8' : 'dimmed'}>
                          {line === undefined || refundOf(selectedLines.indexOf(line)) === null
                            ? ''
                            : formatMoney(refundOf(selectedLines.indexOf(line)) as number)}
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
            label={t('Manager override reason')}
            placeholder={t('Why is this being approved?')}
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
            {t('Add Replacement Items (Exchange)')}
          </Text>
          <Text size="xs" c="dimmed" mb={4}>
            {t(
              'Optional — add items the customer is taking instead. Leave empty for a plain refund.'
            )}
          </Text>
          <Group gap="xs" align="flex-end">
            <Select
              placeholder={t('Search for a replacement item')}
              searchable
              style={{ flex: 1 }}
              data={exchangeProductOptions}
              value={exchangeProductKey}
              onChange={setExchangeProductKey}
            />
            <Button variant="light" disabled={!exchangeProductKey} onClick={handleAddExchange}>
              {t('Add')}
            </Button>
          </Group>
          {exchangeLines.length > 0 && (
            <Stack gap={4} mt="xs">
              {exchangeLines.map((line) => (
                <Group key={line.key} justify="space-between">
                  <Text size="xs">
                    {line.name} ({formatMoney(line.unitPriceCents)}) × {line.quantity}
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
                      {t('Remove')}
                    </Button>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Box>

        {isSplitPaid && netRefundCents !== null && netRefundCents > 0 && (
          <Paper p="sm" withBorder>
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              tt="uppercase"
              mb="xs"
              style={{ letterSpacing: '0.05em' }}
            >
              {t('Refund Split Across Payment Methods')}
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
                      : leg.amountCents / 100
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
                {netRefundCents === null || netRefundCents >= 0
                  ? 'Refund Due to Customer'
                  : 'Customer Pays Extra'}
              </Text>
              <Text size="lg" fw={800} c="orange.8">
                {netRefundCents === null ? '' : formatMoney(Math.abs(netRefundCents))}
              </Text>
            </Group>
            <Textarea
              size="xs"
              label={t('Notes (Optional)')}
              minRows={2}
              value={notes}
              onChange={(e) => setNotes(e.currentTarget.value)}
            />
          </Stack>
        </Paper>

        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="default" onClick={handleClose} disabled={isSubmitting}>
            {t('Cancel')}
          </Button>
          <Button color="blue" loading={isSubmitting} disabled={!canSubmit} onClick={handleSubmit}>
            {t('Create Credit Note')}
          </Button>
        </Group>
      </Stack>
      {exchangePickerProduct !== null && (
        <PriceTierPickerModal
          key={exchangePickerProduct.key}
          opened
          onClose={() => setExchangePickerProduct(null)}
          product={exchangePickerProduct}
          reservedByPrice={exchangeReservedByPrice(exchangePickerProduct.key)}
          onSelect={(tier) => addExchangeAt(exchangePickerProduct, tier)}
        />
      )}
    </Modal>
  );
};
