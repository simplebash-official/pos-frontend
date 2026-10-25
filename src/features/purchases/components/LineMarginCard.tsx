import { t } from '@/shared/i18n/t';
import { Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { formatMoney } from '@/shared/lib/money';
import type { CalcReceiptLineReply } from '../types';

export interface LineMarginCardProps {
  /** What the server worked out for this line; `undefined` until its first answer. */
  reply: CalcReceiptLineReply | undefined;
  /** False while a newer answer is on its way; the figures then show dimmed. */
  isCurrent: boolean;
  /** True when extra charges are part of the cost shown. */
  includesCharges: boolean;
  /** True while a charge is half filled in, so it is not yet in the cost. */
  chargesIncomplete: boolean;
  /** The margin the person asked for, when the price was worked out from it; `null` when they typed the price. */
  askedPercent: number | null;
}

const figure: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

const profitColor = (cents: number): string => {
  if (cents < 0) return 'red';
  if (cents > 0) return 'teal';
  return 'dimmed';
};

/** What this product earns, live: profit each, margin and the profit if the whole lot sells. */
export const LineMarginCard = ({
  reply,
  isCurrent,
  includesCharges,
  chargesIncomplete,
  askedPercent,
}: LineMarginCardProps) => {
  const margin = reply === undefined ? null : reply.margin;

  return (
    <Paper
      p="sm"
      bg="var(--bg-app)"
      aria-live="polite"
      data-testid="line-margin"
      style={{ opacity: isCurrent ? 1 : 0.6 }}
    >
      <Stack gap="xs">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
          {t('What you earn')}
        </Text>

        {reply === undefined || margin === null ? (
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
                  {formatMoney(reply.unitCostCents)}
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
                  {`${(margin.marginTenths / 10).toFixed(1)}%`}
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
                {reply.priceRoundedUp && askedPercent !== null
                  ? t('You asked for {asked}%. Rounding the price up gives {got}%.')
                      .replace('{asked}', String(askedPercent))
                      .replace('{got}', (margin.marginTenths / 10).toFixed(1))
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
