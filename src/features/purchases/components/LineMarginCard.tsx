import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Button, Group, NumberInput, Paper, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { formatMoney } from '@/shared/lib/money';
import { roundedUnitCents } from '../lib/landedCost';
import {
  lineMargin,
  PRICE_STEPS_CENTS,
  suggestedPriceCents,
  type PriceStepCents,
} from '../lib/margin';

export interface LineMarginCardProps {
  quantity: number;
  /** What the units really cost: the price plus the line's share of any extra charges. */
  landedTotalCents: number;
  sellingPriceCents: number;
  /** True when extra charges are part of the cost shown. */
  includesCharges: boolean;
  /** True while a charge is half filled in, so it is not yet in the cost. */
  chargesIncomplete: boolean;
  onUsePrice: (cents: number) => void;
  isMobile: boolean;
}

const figure: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

const profitColor = (cents: number): string => {
  if (cents < 0) return 'red';
  if (cents > 0) return 'teal';
  return 'dimmed';
};

/** What this product earns, live: profit each, margin and the profit if the whole lot sells. */
export const LineMarginCard = ({
  quantity,
  landedTotalCents,
  sellingPriceCents,
  includesCharges,
  chargesIncomplete,
  onUsePrice,
  isMobile,
}: LineMarginCardProps) => {
  const fieldSize = isMobile ? 'md' : 'sm';
  const [targetPercent, setTargetPercent] = useState<number | ''>('');
  const [step, setStep] = useState<PriceStepCents | null>(null);

  const margin = lineMargin(landedTotalCents, quantity, sellingPriceCents);
  const suggestion =
    targetPercent === '' || step === null
      ? null
      : suggestedPriceCents(
          landedTotalCents,
          quantity,
          Math.round(Number(targetPercent) * 10),
          step
        );

  return (
    <Paper p="sm" bg="var(--bg-app)" aria-live="polite" data-testid="line-margin">
      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
          {t('What you earn')}
        </Text>

        {margin === null ? (
          <Text size="xs" c="dimmed">
            {t('Enter what it cost and the selling price to see your margin.')}
          </Text>
        ) : (
          <>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  {includesCharges ? t('Cost each, with extra charges') : t('Cost each')}
                </Text>
                <Text fw={600} style={figure}>
                  {formatMoney(roundedUnitCents(landedTotalCents, quantity))}
                </Text>
              </Stack>
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  {t('Profit each')}
                </Text>
                <Text fw={600} c={profitColor(margin.profitEachCents)} style={figure}>
                  {formatMoney(margin.profitEachCents)}
                </Text>
              </Stack>
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  {t('Margin')}
                </Text>
                <Text fw={600} c={profitColor(margin.lotProfitCents)} style={figure}>
                  {`${margin.marginPercent === null ? '' : margin.marginPercent.toFixed(1)}%`}
                </Text>
              </Stack>
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  {t('Profit if all sell')}
                </Text>
                <Text fw={600} c={profitColor(margin.lotProfitCents)} style={figure}>
                  {formatMoney(margin.lotProfitCents)}
                </Text>
              </Stack>
            </SimpleGrid>
            {margin.belowCost ? (
              <Text size="xs" c="red" role="alert">
                {t('You are selling for less than these units cost.')}
              </Text>
            ) : (
              <Text size="xs" c="dimmed">
                {t('Margin is the profit as a share of the selling price.')}
              </Text>
            )}
          </>
        )}

        {chargesIncomplete ? (
          <Text size="xs" c="orange">
            {t('Finish the extra charges to include them in this cost.')}
          </Text>
        ) : null}

        {landedTotalCents > 0 && quantity > 0 ? (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              {t('Work out the selling price from the margin you want')}
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <NumberInput
                label={t('Margin I want (%)')}
                value={targetPercent}
                onChange={(value) => setTargetPercent(value === '' ? '' : Number(value))}
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
                value={step === null ? null : String(step)}
                onChange={(value) =>
                  setStep(value === null ? null : (Number(value) as PriceStepCents))
                }
                allowDeselect={false}
                size={fieldSize}
              />
            </SimpleGrid>
            {suggestion !== null ? (
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Text size="sm">
                  {`${t('Sell at')} ${formatMoney(suggestion)} ${t('each to earn at least this margin.')}`}
                </Text>
                <Button
                  size={isMobile ? 'md' : 'xs'}
                  variant="light"
                  onClick={() => onUsePrice(suggestion)}
                >
                  {t('Use this price')}
                </Button>
              </Group>
            ) : null}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
};
