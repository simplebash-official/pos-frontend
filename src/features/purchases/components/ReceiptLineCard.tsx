import { t } from '@/shared/i18n/t';
import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPackage, IconTrash } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { formatMoney } from '@/shared/lib/money';
import { priceText } from '@/features/inventory/lib/priceTiers';
import type { Product } from '@/features/inventory/types';
import {
  costInMode,
  lineGoodsCents,
  effectiveSellingCents,
  marginAsked,
  lineQuantity,
  type CostEntry,
  type LineState,
} from '../lib/receiptForm';
import { LineMarginCard } from './LineMarginCard';
import { SellingPriceFields } from './SellingPriceFields';

export interface ReceiptLineCardProps {
  /** 1-based position, so people can say "Product 2". */
  position: number;
  line: LineState;
  /** Looked up from the product list; `null` until a product is picked. */
  product: Product | null;
  onChange: (line: LineState) => void;
  onPickProduct: () => void;
  /** `null` when this is the only line, which cannot be removed. */
  onRemove: (() => void) | null;
  /** What the units really cost: the price plus this line's share of the extra charges. */
  landedTotalCents: number;
  /** True when extra charges are part of that cost. */
  includesCharges: boolean;
  /** True while an extra charge is half filled in, so it is not yet counted. */
  chargesIncomplete: boolean;
  isMobile: boolean;
}

/** One product on the receipt: what arrived, what it cost, what it sells for. */
export const ReceiptLineCard = ({
  position,
  line,
  product,
  onChange,
  onPickProduct,
  onRemove,
  landedTotalCents,
  includesCharges,
  chargesIncomplete,
  isMobile,
}: ReceiptLineCardProps) => {
  const fieldSize = isMobile ? 'md' : 'sm';
  const serialized = product !== null && product.isSerialized;
  const quantity = lineQuantity(line);
  const goodsCents = lineGoodsCents(line);
  const canShowEach = costInMode(line, 'unit') !== null;

  const chooseMode = (mode: CostEntry['mode']) => {
    const cost = costInMode(line, mode);
    if (cost !== null) onChange({ ...line, cost });
  };

  const sellingCents = effectiveSellingCents(line, landedTotalCents);
  const asked = marginAsked(line, landedTotalCents);

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              {`${t('Product')} ${position}`}
            </Text>
            {product ? (
              <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                <IconPackage size={16} style={{ flexShrink: 0 }} />
                <Text size="sm" fw={600} lineClamp={1}>
                  {product.name}
                </Text>
              </Group>
            ) : null}
            {product ? (
              <Text size="xs" c="dimmed">
                {product.priceTiers.length > 0
                  ? `${t('Now selling at')} ${priceText(product)}. ${t('These units keep their own price.')}`
                  : t('What you will sell these units for.')}
              </Text>
            ) : null}
          </Stack>
          <Group gap={6} wrap="nowrap">
            {product ? (
              <ActionIcon
                variant="light"
                onClick={onPickProduct}
                size={isMobile ? 44 : 32}
                aria-label={t('Change product')}
              >
                <IconPackage size={16} />
              </ActionIcon>
            ) : null}
            {onRemove ? (
              <ActionIcon
                variant="light"
                color="red"
                onClick={onRemove}
                size={isMobile ? 44 : 32}
                aria-label={`${t('Remove')} ${t('Product')} ${position}`}
              >
                <IconTrash size={16} />
              </ActionIcon>
            ) : null}
          </Group>
        </Group>

        {product ? (
          <>
            <Stack gap={6}>
              <Text size="sm" fw={500}>
                {t('How did the supplier price this?')}
              </Text>
              <SegmentedToggle
                fullWidth
                size={isMobile ? 'md' : 'sm'}
                aria-label={t('How did the supplier price this?')}
                value={line.cost.mode}
                onChange={(value) => chooseMode(value as CostEntry['mode'])}
                data={[
                  { value: 'unit', label: t('Price each'), disabled: !canShowEach },
                  { value: 'lot', label: t('Whole lot') },
                ]}
              />
              {!canShowEach ? (
                <Text size="xs" c="dimmed">
                  {t('This lot does not divide evenly, so it cannot be shown as a price each.')}
                </Text>
              ) : null}
            </Stack>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <NumberInput
                label={t('How many arrived')}
                value={line.quantity}
                onChange={(value) =>
                  onChange({ ...line, quantity: value === '' ? '' : Number(value) })
                }
                min={1}
                allowDecimal={false}
                size={fieldSize}
              />
              {line.cost.mode === 'unit' ? (
                <MoneyInput
                  label={t('Cost of each unit')}
                  valueCents={line.cost.unitCents}
                  onChangeCents={(unitCents) =>
                    onChange({ ...line, cost: { mode: 'unit', unitCents } })
                  }
                  size={fieldSize}
                />
              ) : (
                <MoneyInput
                  label={t('Price for the whole lot')}
                  valueCents={line.cost.totalCents}
                  onChangeCents={(totalCents) =>
                    onChange({ ...line, cost: { mode: 'lot', totalCents } })
                  }
                  size={fieldSize}
                />
              )}
            </SimpleGrid>

            <SellingPriceFields
              line={line}
              landedTotalCents={landedTotalCents}
              onChange={onChange}
              isMobile={isMobile}
            />

            <LineMarginCard
              quantity={quantity}
              landedTotalCents={landedTotalCents}
              sellingPriceCents={sellingCents}
              includesCharges={includesCharges}
              chargesIncomplete={chargesIncomplete}
              askedPercent={asked === null ? null : asked.askedPercent}
              priceRoundedUp={asked !== null && sellingCents > asked.exactCents}
            />

            {serialized && quantity > 0 ? (
              <Stack gap={6}>
                <Text size="sm" fw={500}>
                  {t('Serial numbers')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(
                    'This item is tracked by serial number. Enter the serial for each unit received.'
                  )}
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                  {Array.from({ length: quantity }).map((_, index) => (
                    <TextInput
                      key={index}
                      aria-label={`${t('Serial number for unit')} ${index + 1}`}
                      placeholder={`${t('Serial number for unit')} ${index + 1}`}
                      value={line.serialNumbers[index]}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        const serialNumbers = [...line.serialNumbers];
                        serialNumbers[index] = value;
                        onChange({ ...line, serialNumbers });
                      }}
                      size={fieldSize}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            ) : null}

            <Text size="xs" c="dimmed" ta="right">
              {`${t('This product comes to')} ${formatMoney(goodsCents)}`}
            </Text>
          </>
        ) : (
          <Button
            variant="light"
            leftSection={<IconPackage size={16} />}
            onClick={onPickProduct}
            size={fieldSize}
          >
            {t('Pick the product')}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};
