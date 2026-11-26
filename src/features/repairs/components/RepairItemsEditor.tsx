import { useMemo } from 'react';
import { Box, Group, NumberInput, SimpleGrid, Stack, Text } from '@mantine/core';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { ItemDiscountButton } from '@/shared/components/ticket-items/ItemDiscountButton';
import { ItemIcon } from '@/shared/components/ticket-items/ItemIcon';
import { ItemWarrantyButton } from '@/shared/components/ticket-items/ItemWarrantyButton';
import { StockPartPicker, type QuickFee } from '@/shared/components/ticket-items/StockPartPicker';
import { TicketItemCard } from '@/shared/components/ticket-items/TicketItemCard';
import { TicketTotals } from '@/shared/components/ticket-items/TicketTotals';
import { NO_COVER } from '@/shared/components/ticket-items/warranty';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import type { Product, SerialLookup } from '@/features/inventory/types';
import type { ProductWarranty } from '@/features/warranties';
import type { ItemDiscount } from '@/wasm';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatMoney, fromCents } from '@/shared/lib/money';
import { useRepairServices } from '../hooks/useRepairServices';
import {
  calculateOutsideProfit,
  calculatePartsProfitCents,
  DEFAULT_QUICK_FEES,
  feePriceCents,
  negative,
  partPriceCents,
  rowDiscountProblem,
  rowProblem,
  type FeeItemDraft,
  type ItemDraft,
  type LiveRepairTotals,
  type PartDraft,
  type PartItemDraft,
} from '../lib/repairItems';

let nextUid = 1000;
const genUid = () => {
  nextUid += 1;
  return `item-${nextUid}-${Date.now()}`;
};

export interface RepairItemsEditorProps {
  drafts: ItemDraft[];
  onChange: (drafts: ItemDraft[]) => void;
  rework: boolean;
  /** A handed-back job's work no longer changes. */
  readOnly: boolean;
  /** Show each row's problem (after a save was tried). */
  showProblems: boolean;
  totals: LiveRepairTotals | null;
  profit?: {
    priced: boolean;
    profitCents: number;
    hint: string | null;
  };
  /** The part window is open, so the job window must not close on Escape. */
  onNestedWindowChange?: (open: boolean) => void;
}

export const RepairItemsEditor = ({
  drafts,
  onChange,
  rework,
  readOnly,
  showProblems,
  totals,
  profit,
}: RepairItemsEditorProps) => {
  const isMobile = useIsMobile();
  const services = useRepairServices(false, !readOnly);
  const products = useAllProducts({ enabled: !readOnly });

  const handleSelectStockProduct = (product: Product) => {
    if (!product.isSerialized) {
      const existingIndex = drafts.findIndex(
        (d) =>
          d.kind === 'part' &&
          d.part.source === 'stock' &&
          !d.part.serialNumber &&
          d.part.productKey === product.key
      );
      if (existingIndex >= 0) {
        const existing = drafts[existingIndex];
        if (existing.kind === 'part' && existing.part.source === 'stock') {
          const maxStock =
            typeof existing.part.stockQuantity === 'number'
              ? existing.part.stockQuantity
              : product.stockQuantity;
          if (existing.quantity < maxStock) {
            const nextDrafts = [...drafts];
            nextDrafts[existingIndex] = {
              ...existing,
              quantity: existing.quantity + 1,
            };
            onChange(nextDrafts);
          }
          return;
        }
      }
    }

    let priceCents = 0;
    let costCents: number | null = null;
    if (product.priceTiers.length > 0) {
      const defaultTier = product.priceTiers[0];
      priceCents = defaultTier.sellingPriceCents;
      if (typeof defaultTier.minUnitCostCents === 'number') {
        costCents = defaultTier.minUnitCostCents;
      }
    }

    const partDraft: PartDraft = {
      source: 'stock',
      productKey: product.key,
      productName: product.name,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      sellingPriceCents: priceCents,
      priceCents,
      costCents,
    };

    let warranty: ProductWarranty = NO_COVER;
    if (rework) {
      warranty = NO_COVER;
    } else if (product.warranty) {
      warranty = product.warranty;
    }

    const newRow: PartItemDraft = {
      uid: genUid(),
      kind: 'part',
      quantity: 1,
      description: product.name,
      part: partDraft,
      discount: null,
      warranty,
    };

    onChange([...drafts, newRow]);
  };

  const handleAddOutsidePart = (name: string) => {
    const newRow: PartItemDraft = {
      uid: genUid(),
      kind: 'part',
      quantity: 1,
      description: name,
      part: {
        source: 'outside',
        name,
        priceRupees: '',
        costRupees: '',
      },
      discount: null,
      warranty: NO_COVER,
    };
    onChange([...drafts, newRow]);
  };

  const handleAddFee = (name: string, defaultCents = 0, warranty = NO_COVER) => {
    const newRow: FeeItemDraft = {
      uid: genUid(),
      kind: 'fee',
      description: name,
      feeRupees: defaultCents > 0 ? fromCents(defaultCents) : '',
      discount: null,
      warranty: rework ? NO_COVER : warranty,
    };
    onChange([...drafts, newRow]);
  };

  const handleAddSerialUnit = (found: SerialLookup) => {
    const partDraft: PartDraft = {
      source: 'stock',
      productKey: found.product.key,
      productName: found.product.name,
      serialNumber: found.serial.serialNumber,
      sku: found.product.sku,
      stockQuantity: found.product.stockQuantity,
      sellingPriceCents: found.sellingPriceCents,
      priceCents: found.sellingPriceCents,
      costCents: null,
    };
    let serialWarranty: ProductWarranty = NO_COVER;
    if (rework) {
      serialWarranty = NO_COVER;
    } else if (found.product.warranty) {
      serialWarranty = found.product.warranty;
    }
    const newRow: PartItemDraft = {
      uid: genUid(),
      kind: 'part',
      quantity: 1,
      description: found.product.name,
      part: partDraft,
      discount: null,
      warranty: serialWarranty,
    };
    onChange([...drafts, newRow]);
  };

  const quickFees: QuickFee[] = [
    ...DEFAULT_QUICK_FEES.map((feeName) => ({
      id: feeName,
      label: t(feeName),
      onAdd: () => handleAddFee(feeName),
    })),
    ...(services.data ?? []).map((service) => ({
      id: service.key,
      label: service.name,
      onAdd: () => handleAddFee(service.name, service.laborCents, service.warranty),
    })),
  ];

  const updateDraftQuantity = (uid: string, nextQty: number) => {
    onChange(
      drafts.map((d) => {
        if (d.uid !== uid || d.kind !== 'part') return d;
        let clamped = Math.max(1, nextQty);
        if (
          d.part.source === 'stock' &&
          typeof d.part.stockQuantity === 'number' &&
          d.part.stockQuantity >= 1
        ) {
          clamped = Math.min(d.part.stockQuantity, clamped);
        }
        return { ...d, quantity: clamped };
      })
    );
  };

  const updateDraftWarranty = (uid: string, warranty: ProductWarranty) => {
    onChange(drafts.map((d) => (d.uid === uid ? { ...d, warranty } : d)));
  };

  const updateDraftDiscount = (uid: string, discount: ItemDiscount | null) => {
    onChange(drafts.map((d) => (d.uid === uid ? { ...d, discount } : d)));
  };

  const updateOutsidePart = (
    uid: string,
    field: 'priceRupees' | 'costRupees',
    value: number | string
  ) => {
    onChange(
      drafts.map((d) => {
        if (d.uid !== uid || d.kind !== 'part' || d.part.source !== 'outside') return d;
        return {
          ...d,
          part: {
            ...d.part,
            [field]: value,
          },
        };
      })
    );
  };

  const updateFeeRupees = (uid: string, feeRupees: number | string) => {
    onChange(
      drafts.map((d) => {
        if (d.uid !== uid || d.kind !== 'fee') return d;
        return { ...d, feeRupees };
      })
    );
  };

  const removeDraft = (uid: string) => {
    onChange(drafts.filter((d) => d.uid !== uid));
  };

  const partsProfitCents = useMemo(
    () => (totals === null ? null : calculatePartsProfitCents(drafts, totals.itemDiscountsCents)),
    [drafts, totals]
  );

  const inputHeight = isMobile ? 44 : 36;
  const moneyInputStyles = {
    input: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
      height: inputHeight,
      fontSize: isMobile ? 16 : undefined,
    },
  } as const;

  /** One piece of work as a card: what and how much on top, then the two buttons. */
  const renderCard = (draft: ItemDraft, index: number) => {
    const label = draft.kind === 'fee' ? t('Service fee') : null;
    const unitPriceCents =
      draft.kind === 'fee' ? feePriceCents(draft) : partPriceCents(draft.part, rework);
    const linePriceCents = draft.kind === 'part' ? unitPriceCents * draft.quantity : unitPriceCents;
    const isSerialized =
      draft.kind === 'part' &&
      draft.part.source === 'stock' &&
      typeof draft.part.serialNumber === 'string';
    const problem = showProblems ? rowProblem(draft, rework) : null;

    // A part already saved on the ticket does not carry its stock; read it from the item list.
    const stockLine = (productKey: string, known: number | undefined): string => {
      const left =
        typeof known === 'number'
          ? known
          : products.data.find((p) => p.key === productKey)?.stockQuantity;
      return left === undefined ? t('From stock') : `${t('From stock ·')} ${left} ${t('left')}`;
    };

    const subline =
      draft.kind === 'fee' ? (
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      ) : draft.part.source === 'stock' ? (
        <Text size="xs" c="dimmed">
          {draft.part.serialNumber
            ? `${t('Serial:')} ${draft.part.serialNumber}`
            : stockLine(draft.part.productKey, draft.part.stockQuantity)}
        </Text>
      ) : (
        <Group gap="xs" align="center" wrap="wrap">
          <Text size="xs" c="dimmed">
            {t('Cost to shop')}
          </Text>
          <NumberInput
            size="sm"
            w={110}
            placeholder="0"
            min={0}
            styles={{ input: { height: inputHeight, fontSize: isMobile ? 16 : undefined } }}
            value={draft.part.costRupees}
            error={
              problem !== null &&
              problem.field === 'part' &&
              (draft.part.costRupees === '' || negative(draft.part.costRupees))
            }
            onChange={(val) => updateOutsidePart(draft.uid, 'costRupees', val)}
            disabled={readOnly}
          />
          {(() => {
            const rowProfit = calculateOutsideProfit(
              draft.part.priceRupees,
              draft.part.costRupees,
              totals === null ? null : totals.itemDiscountsCents[index],
              draft.quantity
            );
            if (rowProfit === null) return null;
            return (
              <Text size="xs" fw={700} c={rowProfit >= 0 ? 'teal' : 'red'}>
                {t('Profit Rs.')} {rowProfit.toLocaleString()}
              </Text>
            );
          })()}
        </Group>
      );

    const typedPrice =
      draft.kind === 'fee'
        ? draft.feeRupees
        : draft.part.source === 'outside'
          ? draft.part.priceRupees
          : '';

    // The price a customer pays for the work: typed for a fee or a bought-in part, the price
    // tier (read-only) for a stock part, nothing on a rework.
    const price =
      draft.kind === 'part' && draft.part.source === 'stock' ? (
        <Text
          size="sm"
          fw={600}
          w={isMobile ? '100%' : 'auto'}
          style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
        >
          {formatMoney(linePriceCents)}
        </Text>
      ) : (
        <NumberInput
          size="sm"
          w={isMobile ? '100%' : 150}
          aria-label={
            draft.kind === 'fee'
              ? `${t('Fee')} ${index + 1}`
              : `${t('Price of')} ${draft.description}`
          }
          prefix="Rs. "
          min={0}
          thousandSeparator=","
          styles={moneyInputStyles}
          value={rework ? 0 : typedPrice}
          error={
            problem !== null &&
            (draft.kind === 'fee'
              ? problem.field === 'fee'
              : problem.field === 'part' &&
                draft.part.source === 'outside' &&
                (draft.part.priceRupees === '' ||
                  Number(draft.part.priceRupees) <= 0 ||
                  negative(draft.part.priceRupees)))
          }
          onChange={(val) =>
            draft.kind === 'fee'
              ? updateFeeRupees(draft.uid, val)
              : updateOutsidePart(draft.uid, 'priceRupees', val)
          }
          disabled={rework || readOnly}
        />
      );

    return (
      <TicketItemCard
        key={draft.uid}
        icon={
          <ItemIcon
            kind={
              draft.kind === 'fee'
                ? { type: 'fee' }
                : draft.part.source === 'stock'
                  ? { type: 'stock', productKey: draft.part.productKey }
                  : { type: 'outside' }
            }
          />
        }
        title={draft.description}
        subline={subline}
        quantity={
          draft.kind === 'part' && !isSerialized
            ? (size) => (
                <QuantityInput
                  value={draft.quantity}
                  onChange={(val) =>
                    updateDraftQuantity(draft.uid, typeof val === 'number' ? val : 1)
                  }
                  min={1}
                  max={
                    draft.part.source === 'stock' && typeof draft.part.stockQuantity === 'number'
                      ? draft.part.stockQuantity
                      : undefined
                  }
                  size={size}
                  disabled={readOnly}
                />
              )
            : null
        }
        price={price}
        priceCaption={
          draft.kind === 'part' && draft.quantity > 1
            ? draft.part.source === 'stock'
              ? `${formatMoney(unitPriceCents)} ${t('each')}`
              : `${t('Total:')} ${formatMoney(linePriceCents)}`
            : null
        }
        onRemove={readOnly ? null : () => removeDraft(draft.uid)}
        problem={problem === null ? null : problem.message}
      >
        {rework ? (
          <Text size="xs" c="dimmed">
            {t('Covered by the original warranty')}
          </Text>
        ) : (
          <SimpleGrid cols={isMobile ? 1 : 2} spacing="sm">
            <ItemWarrantyButton
              value={draft.warranty}
              onChange={(w) => updateDraftWarranty(draft.uid, w)}
              readOnly={readOnly}
            />
            <ItemDiscountButton
              targetName={draft.description}
              discount={draft.discount}
              amountCents={totals === null ? null : totals.itemDiscountsCents[index]}
              originalCents={linePriceCents}
              problem={totals === null ? null : rowDiscountProblem(index, totals.blockers)}
              onChange={(discount) => updateDraftDiscount(draft.uid, discount)}
              readOnly={readOnly}
            />
          </SimpleGrid>
        )}
      </TicketItemCard>
    );
  };

  return (
    <Box>
      <Stack gap="md">
        {/* The card around this editor carries the title and the item count. */}
        {drafts.length === 0 && (
          <Text size="xs" c="dimmed">
            {t('Leave this empty until the device is checked.')}
          </Text>
        )}

        {!readOnly && (
          <StockPartPicker
            onStockProduct={handleSelectStockProduct}
            onSerialUnit={handleAddSerialUnit}
            onOutsidePart={handleAddOutsidePart}
            onFee={handleAddFee}
            quickFees={quickFees}
          />
        )}

        {drafts.length > 0 && (
          <Box>
            {/* One card per piece of work */}
            <Stack gap="sm">{drafts.map((draft, index) => renderCard(draft, index))}</Stack>

            {totals !== null && (
              <TicketTotals
                partsCents={totals.totals.partsCents}
                servicesCents={totals.totals.laborCents}
                discountCents={totals.totals.discountCents}
                totalCents={totals.totals.priceCents}
                totalLabel={rework ? t('Total (warranty)') : t('Total')}
                profit={
                  rework
                    ? null
                    : {
                        label: t('Profit on parts:'),
                        value:
                          partsProfitCents !== null
                            ? formatMoney(partsProfitCents)
                            : profit && typeof profit.hint === 'string'
                              ? profit.hint
                              : '—',
                      }
                }
              />
            )}
          </Box>
        )}
      </Stack>
    </Box>
  );
};
