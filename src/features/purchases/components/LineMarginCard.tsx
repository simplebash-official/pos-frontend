import { t } from '@/shared/i18n/t';
import { Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { formatMoney } from '@/shared/lib/money';
import { roundedUnitCents } from '../lib/landedCost';
import { lineMargin } from '../lib/margin';

export interface LineMarginCardProps {
  quantity: number;
  /** What the units really cost: the price plus the line's share of any extra charges. */
  landedTotalCents: number;
  sellingPriceCents: number;
  /** True when extra charges are part of the cost shown. */
  includesCharges: boolean;
  /** True while a charge is half filled in, so it is not yet in the cost. */
  chargesIncomplete: boolean;
  /** The margin the person asked for, when the price was worked out from it; `null` when they typed the price. */
  askedPercent: number | null;
  /** True when rounding the price up moved it above what the asked margin needs. */
  priceRoundedUp: boolean;
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
  askedPercent,
  priceRoundedUp,
}: LineMarginCardProps) => {
  const margin = lineMargin(landedTotalCents, quantity, sellingPriceCents);

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
                  {askedPercent === null ? t('Margin') : t('Margin you get')}
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
                {priceRoundedUp && askedPercent !== null && margin.marginPercent !== null
                  ? t('You asked for {asked}%. Rounding the price up gives {got}%.')
                      .replace('{asked}', String(askedPercent))
                      .replace('{got}', margin.marginPercent.toFixed(1))
                  : t('Margin is the profit as a share of the selling price.')}
              </Text>
            )}
          </>
        )}

        {chargesIncomplete ? (
          <Text size="xs" c="orange">
            {t('Finish the extra charges to include them in this cost.')}
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
};
