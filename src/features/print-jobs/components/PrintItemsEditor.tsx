import { Box, Button, NumberInput, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import type { Product, SerialLookup } from '@/features/inventory/types';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { CostToShopField } from '@/shared/components/ticket-items/CostToShopField';
import { ItemDiscountButton } from '@/shared/components/ticket-items/ItemDiscountButton';
import { ItemIcon } from '@/shared/components/ticket-items/ItemIcon';
import { ItemWarrantyButton } from '@/shared/components/ticket-items/ItemWarrantyButton';
import { StockPartPicker, type QuickFee } from '@/shared/components/ticket-items/StockPartPicker';
import { TicketItemCard } from '@/shared/components/ticket-items/TicketItemCard';
import { TicketTotals } from '@/shared/components/ticket-items/TicketTotals';
import { NO_COVER } from '@/shared/components/ticket-items/warranty';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { randomUuid } from '@/shared/lib/id';
import { formatMoney } from '@/shared/lib/money';
import { notify } from '@/shared/notify';
import { usePrintServices } from '../hooks/usePrintServices';
import {
  draftUnitPriceCents,
  lineQuantity,
  MAX_LINE_QUANTITY,
  outsideDraft,
  rowDiscountProblem,
  rowProblem,
  serviceDraft,
  type LivePrintTotals,
  type PrintDraft,
  type StockDraft,
} from '../lib/printItems';

export interface PrintItemsEditorProps {
  drafts: PrintDraft[];
  onChange: (drafts: PrintDraft[]) => void;
  rework: boolean;
  /** A billed or handed-back job's lines no longer change. */
  readOnly: boolean;
  /** Show each row's problem (after a save was tried). */
  showProblems: boolean;
  totals: LivePrintTotals | null;
  /** How many were ordered, offered as a line's quantity in one tap. */
  orderQuantity: number | null;
}

/** A job's lines: the stock search and print services above, one card per line, and the totals. */
export const PrintItemsEditor = ({
  drafts,
  onChange,
  rework,
  readOnly,
  showProblems,
  totals,
  orderQuantity,
}: PrintItemsEditorProps) => {
  const isMobile = useIsMobile();
  const services = usePrintServices(false, !readOnly);
  const products = useAllProducts({ enabled: !readOnly });

  const update = (uid: string, change: (draft: PrintDraft) => PrintDraft) =>
    onChange(drafts.map((draft) => (draft.uid === uid ? change(draft) : draft)));
  const add = (draft: PrintDraft) => onChange([...drafts, draft]);
  const productOf = (key: string): Product | undefined =>
    products.data.find((candidate) => candidate.key === key);

  /** The units in stock at a line's price; `null` when that is not known. */
  const tierUnits = (draft: StockDraft): number | null => {
    const tier = productOf(draft.productKey)?.priceTiers.find(
      (candidate) => candidate.sellingPriceCents === draft.sellingPriceCents
    );
    return tier === undefined ? null : tier.quantity;
  };

  const addStockProduct = (product: Product) => {
    if (product.isSerialized) {
      // A serialized unit is named by its number, which only a scan or typing gives.
      notify.info({
        title: t('Scan the serial number'),
        message: `${product.name}: ${t('scan or type the serial number of the unit used.')}`,
      });
      return;
    }
    // The cheapest price in stock; the row lets another be chosen.
    const tier = product.priceTiers[0];
    if (tier === undefined) return;
    const existing = drafts.find(
      (draft) =>
        draft.kind === 'stock' &&
        draft.serialNumber === undefined &&
        draft.productKey === product.key &&
        draft.sellingPriceCents === tier.sellingPriceCents &&
        draft.discount === null
    );
    if (existing !== undefined) {
      const quantity = lineQuantity(existing.quantity);
      update(existing.uid, (draft) => ({
        ...draft,
        quantity: quantity === null ? 1 : Math.min(quantity + 1, tier.quantity),
      }));
      return;
    }
    add({
      uid: randomUuid(),
      kind: 'stock',
      description: product.name,
      quantity: 1,
      productKey: product.key,
      sellingPriceCents: tier.sellingPriceCents,
      unitPriceCents: tier.sellingPriceCents,
      discount: null,
      warranty: rework ? NO_COVER : product.warranty,
    });
  };

  const addSerialUnit = (found: SerialLookup) => {
    add({
      uid: randomUuid(),
      kind: 'stock',
      description: found.product.name,
      quantity: 1,
      productKey: found.product.key,
      serialNumber: found.serial.serialNumber,
      unitPriceCents: found.sellingPriceCents,
      discount: null,
      warranty: rework ? NO_COVER : found.product.warranty,
    });
  };

  // None are offered until the shop's list has loaded.
  const quickFees: QuickFee[] =
    services.data === undefined
      ? []
      : services.data.map((service) => ({
          id: service.key,
          label: service.name,
          onAdd: () =>
            add(
              serviceDraft(
                service.name,
                service.unitPriceCents,
                service.unitCostCents,
                service.warranty,
                rework
              )
            ),
        }));

  const moneyStyles = {
    input: {
      textAlign: 'right',
      fontVariantNumeric: 'tabular-nums',
      height: isMobile ? 44 : 36,
      fontSize: isMobile ? 16 : undefined,
    },
  } as const;

  const renderCard = (draft: PrintDraft, index: number) => {
    const problem = showProblems ? rowProblem(draft, rework) : null;
    const quantity = lineQuantity(draft.quantity);
    const line = totals === null ? null : totals.lines[index];
    const unitCents = draftUnitPriceCents(draft, rework);
    const serialized = draft.kind === 'stock' && draft.serialNumber !== undefined;
    const units = draft.kind === 'stock' && !serialized ? tierUnits(draft) : null;
    // A saved line's units may be all that is left, so its own count is never cut back.
    const max =
      units === null ? MAX_LINE_QUANTITY : Math.max(units, quantity === null ? 0 : quantity);

    const subline = () => {
      if (draft.kind !== 'stock') {
        const costTyped = draft.unitCostRupees !== '';
        const priceTyped = rework || draft.unitPriceRupees !== '';
        const costField = (
          <CostToShopField
            label={t('Cost to shop, each')}
            lineName={draft.description}
            placeholder={draft.kind === 'service' ? t('Optional') : '0'}
            value={draft.unitCostRupees}
            invalid={problem !== null && problem.field === 'cost'}
            onChange={(value) =>
              update(draft.uid, (current) => ({ ...current, unitCostRupees: value }))
            }
            disabled={readOnly}
            profitCents={
              costTyped && priceTyped && line !== null && line.profitCents !== undefined
                ? line.profitCents
                : null
            }
          />
        );
        if (draft.kind === 'outside') return costField;
        return (
          <Stack gap={4}>
            <Text size="xs" c="dimmed">
              {t('Service fee')}
            </Text>
            {/* A locked job with no recorded cost shows no empty box. */}
            {(!readOnly || costTyped) && costField}
          </Stack>
        );
      }
      if (draft.serialNumber !== undefined) {
        return (
          <Text size="xs" c="dimmed">
            {`${t('Serial:')} ${draft.serialNumber}`}
          </Text>
        );
      }
      const tiers = productOf(draft.productKey)?.priceTiers;
      if (!readOnly && tiers !== undefined && tiers.length > 1) {
        return (
          <Select
            size="xs"
            maw={260}
            aria-label={`${t('Price taken from stock for')} ${draft.description}`}
            allowDeselect={false}
            data={tiers.map((tier) => ({
              value: String(tier.sellingPriceCents),
              label: `${formatMoney(tier.sellingPriceCents)} · ${tier.quantity} ${t('left')}`,
            }))}
            value={String(draft.sellingPriceCents)}
            onChange={(value) => {
              if (value === null) return;
              const cents = Number(value);
              update(draft.uid, (current) => ({
                ...current,
                sellingPriceCents: cents,
                unitPriceCents: cents,
              }));
            }}
            comboboxProps={{ zIndex: 400 }}
          />
        );
      }
      return (
        <Text size="xs" c="dimmed">
          {units === null ? t('From stock') : `${t('From stock ·')} ${units} ${t('left')}`}
        </Text>
      );
    };

    const lineGross = line === null ? null : formatMoney(line.grossCents);
    const price =
      draft.kind === 'stock' ? (
        <Text
          size="sm"
          fw={600}
          w={isMobile ? '100%' : 'auto'}
          style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
        >
          {lineGross === null ? '—' : lineGross}
        </Text>
      ) : (
        <NumberInput
          size="sm"
          w={isMobile ? '100%' : 150}
          aria-label={`${t('Price for one')}: ${draft.description}`}
          placeholder={t('Price for one')}
          prefix="Rs. "
          min={0}
          thousandSeparator=","
          styles={moneyStyles}
          value={rework ? 0 : draft.unitPriceRupees}
          error={problem !== null && problem.field === 'price'}
          onChange={(value) =>
            update(draft.uid, (current) => ({ ...current, unitPriceRupees: value }))
          }
          disabled={rework || readOnly}
        />
      );

    let priceCaption: string | null;
    if (draft.kind === 'stock') {
      priceCaption =
        quantity !== null && quantity > 1 ? `${formatMoney(unitCents)} ${t('each')}` : null;
    } else if (quantity !== null && quantity > 1 && lineGross !== null) {
      priceCaption = `${t('Total:')} ${lineGross}`;
    } else {
      priceCaption = t('each');
    }

    // The order's quantity, offered while the row differs from it and stock allows it.
    const orderShortcut =
      !readOnly &&
      !serialized &&
      orderQuantity !== null &&
      orderQuantity > 1 &&
      quantity !== orderQuantity &&
      orderQuantity <= max
        ? orderQuantity
        : null;

    return (
      <TicketItemCard
        key={draft.uid}
        icon={
          <ItemIcon
            kind={
              draft.kind === 'service'
                ? { type: 'fee' }
                : draft.kind === 'outside'
                  ? { type: 'outside' }
                  : { type: 'stock', productKey: draft.productKey }
            }
          />
        }
        title={draft.description}
        subline={subline()}
        quantity={
          serialized
            ? null
            : (size) => (
                <QuantityInput
                  value={draft.quantity}
                  onChange={(value) =>
                    update(draft.uid, (current) => ({ ...current, quantity: value }))
                  }
                  min={1}
                  max={max}
                  size={size}
                  disabled={readOnly}
                  aria-label={`${t('Quantity of')} ${draft.description}`}
                  error={problem !== null && problem.field === 'quantity'}
                />
              )
        }
        price={price}
        priceCaption={priceCaption}
        onRemove={
          readOnly ? null : () => onChange(drafts.filter((other) => other.uid !== draft.uid))
        }
        problem={problem === null ? null : problem.message}
      >
        {orderShortcut !== null && (
          <Button
            variant="light"
            color="gray"
            size={isMobile ? 'sm' : 'compact-xs'}
            w="fit-content"
            leftSection={<IconCopy size={14} />}
            onClick={() =>
              update(draft.uid, (current) => ({ ...current, quantity: orderShortcut }))
            }
          >
            {`${t('Use order quantity')} (${orderShortcut})`}
          </Button>
        )}
        {rework ? (
          <Text size="xs" c="dimmed">
            {t('Covered by the original warranty')}
          </Text>
        ) : (
          <SimpleGrid cols={isMobile ? 1 : 2} spacing="sm">
            <ItemWarrantyButton
              value={draft.warranty}
              onChange={(warranty) => update(draft.uid, (current) => ({ ...current, warranty }))}
              readOnly={readOnly}
            />
            <ItemDiscountButton
              targetName={draft.description}
              discount={draft.discount}
              amountCents={line === null ? null : line.discountCents}
              originalCents={line === null ? 0 : line.grossCents}
              problem={totals === null ? null : rowDiscountProblem(index, totals)}
              onChange={(discount) => update(draft.uid, (current) => ({ ...current, discount }))}
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
            {t('Leave this empty until the order is priced.')}
          </Text>
        )}

        {!readOnly && (
          <StockPartPicker
            onStockProduct={addStockProduct}
            onSerialUnit={addSerialUnit}
            onOutsidePart={(name) => add(outsideDraft(name))}
            onFee={(name) => add(serviceDraft(name, null, undefined, NO_COVER, rework))}
            quickFees={quickFees}
          />
        )}

        {drafts.length > 0 && (
          <Box>
            <Stack gap="sm">{drafts.map(renderCard)}</Stack>

            {totals !== null && (
              <TicketTotals
                partsCents={totals.totals.partsCents}
                servicesCents={totals.totals.servicesCents}
                discountCents={totals.totals.discountCents}
                totalCents={totals.totals.priceCents}
                totalLabel={rework ? t('Total (warranty)') : t('Total')}
                profit={
                  rework
                    ? null
                    : {
                        label: t('Profit:'),
                        value: totals.costKnown
                          ? formatMoney(totals.totals.priceCents - totals.totals.costCents)
                          : t('shows once saved'),
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
