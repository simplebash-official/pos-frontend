import { t } from '@/shared/i18n/t';
import { NumberInput, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { formatMoney } from '@/shared/lib/money';
import { PRICE_STEPS_CENTS, type PriceStepCents } from '../lib/priceSteps';
import type { LineState } from '../lib/receiptForm';
import type { CalcReceiptLineReply } from '../types';

export interface SellingPriceFieldsProps {
  line: LineState;
  /** What the server worked out for this line; `undefined` until its first answer. */
  reply: CalcReceiptLineReply | undefined;
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
  reply,
  onChange,
  isMobile,
}: SellingPriceFieldsProps) => {
  const fieldSize = isMobile ? 'md' : 'sm';
  const { pricing } = line;
  const worked = reply === undefined ? 0 : reply.sellingPriceCents;
  const rounding =
    reply !== undefined &&
    reply.priceRoundedUp &&
    reply.priceWithoutRoundingCents !== null &&
    pricing.mode === 'margin' &&
    pricing.marginTenths !== null
      ? t('{exact} at {percent}%, rounded up to {price}')
          .replace('{exact}', formatMoney(reply.priceWithoutRoundingCents))
          .replace('{percent}', String(pricing.marginTenths / 10))
          .replace('{price}', formatMoney(worked))
      : t('Worked out from your margin.');

  // Switching keeps the price steady, using the figures the server worked out.
  const switchTo = (mode: string) => {
    if (reply === undefined || mode === pricing.mode) return;
    if (mode === 'margin') {
      const tenths = reply.marginTenthsIfSwitched;
      onChange({
        ...line,
        pricing: { mode: 'margin', marginTenths: tenths, stepCents: tenths === null ? null : 100 },
      });
    } else {
      onChange({ ...line, pricing: { mode: 'price' }, sellingPriceCents: reply.sellingPriceCents });
    }
  };

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
        onChange={switchTo}
        data={[
          { value: 'price', label: t('I set the price'), disabled: reply === undefined },
          { value: 'margin', label: t('I set the margin'), disabled: reply === undefined },
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
                label: cents === 1 ? t("Don't round") : formatMoney(cents),
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
