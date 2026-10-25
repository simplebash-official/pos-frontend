import { t } from '@/shared/i18n/t';
import { NumberInput, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { formatMoney } from '@/shared/lib/money';
import { PRICE_STEPS_CENTS, type PriceStepCents } from '../lib/margin';
import {
  effectiveSellingCents,
  marginAsked,
  pricingInMode,
  type LineState,
  type PricingEntry,
} from '../lib/receiptForm';

export interface SellingPriceFieldsProps {
  line: LineState;
  /** What the units really cost: the price plus the line's share of any extra charges. */
  landedTotalCents: number;
  onChange: (line: LineState) => void;
  isMobile: boolean;
}

/**
 * How the selling price is set, one way at a time: type the price (and read the margin it earns),
 * or type the margin you want (and read the price it needs). The field that is not in charge is
 * hidden or read-only, so two inputs never fight over the same number.
 */
export const SellingPriceFields = ({
  line,
  landedTotalCents,
  onChange,
  isMobile,
}: SellingPriceFieldsProps) => {
  const fieldSize = isMobile ? 'md' : 'sm';
  const { pricing } = line;
  const worked = effectiveSellingCents(line, landedTotalCents);
  const asked = marginAsked(line, landedTotalCents);
  const rounding =
    asked !== null && worked > asked.exactCents
      ? t('{exact} at {percent}%, rounded up to {price}')
          .replace('{exact}', formatMoney(asked.exactCents))
          .replace('{percent}', String(asked.askedPercent))
          .replace('{price}', formatMoney(worked))
      : t('Worked out from your margin.');

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {t('How do you want to set the selling price?')}
      </Text>
      <SegmentedToggle
        fullWidth
        size={isMobile ? 'md' : 'sm'}
        aria-label={t('How do you want to set the selling price?')}
        value={pricing.mode}
        onChange={(value) =>
          onChange(pricingInMode(line, value as PricingEntry['mode'], landedTotalCents))
        }
        data={[
          { value: 'price', label: t('I set the price') },
          { value: 'margin', label: t('I set the margin') },
        ]}
      />

      {pricing.mode === 'price' ? (
        <MoneyInput
          label={t('Selling price each')}
          valueCents={line.sellingPriceCents}
          onChangeCents={(sellingPriceCents) => onChange({ ...line, sellingPriceCents })}
          size={fieldSize}
        />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            <NumberInput
              label={t('Margin I want (%)')}
              value={pricing.marginTenths === null ? '' : pricing.marginTenths / 10}
              onChange={(value) =>
                onChange({
                  ...line,
                  pricing: {
                    ...pricing,
                    marginTenths: value === '' ? null : Math.round(Number(value) * 10),
                  },
                })
              }
              min={0}
              max={99.9}
              decimalScale={1}
              size={fieldSize}
            />
            <Select
              label={t('Round the price up to')}
              placeholder={t('Pick one')}
              data={PRICE_STEPS_CENTS.map((cents) => ({
                value: String(cents),
                label: formatMoney(cents),
              }))}
              value={pricing.stepCents === null ? null : String(pricing.stepCents)}
              onChange={(value) =>
                onChange({
                  ...line,
                  pricing: {
                    ...pricing,
                    stepCents: value === null ? null : (Number(value) as PriceStepCents),
                  },
                })
              }
              allowDeselect={false}
              size={fieldSize}
            />
          </SimpleGrid>
          <TextInput
            label={t('Selling price each')}
            description={rounding}
            placeholder={t('Fill in the margin and the rounding')}
            value={worked > 0 ? formatMoney(worked) : ''}
            readOnly
            variant="filled"
            size={fieldSize}
          />
        </>
      )}
    </Stack>
  );
};
