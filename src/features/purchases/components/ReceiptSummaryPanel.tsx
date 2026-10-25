import { t } from '@/shared/i18n/t';
import { Paper, Stack, Text } from '@mantine/core';
import { formatMoney } from '@/shared/lib/money';
import type { CalcReceiptSummary } from '../types';

const figure: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

const Row = ({
  label,
  cents,
  strong,
  color,
}: {
  label: string;
  cents: number;
  strong?: boolean;
  color?: string;
}) => (
  <div
    style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}
  >
    <Text size={strong ? 'sm' : 'xs'} c={strong ? undefined : 'dimmed'} fw={strong ? 600 : 400}>
      {label}
    </Text>
    <Text size={strong ? 'md' : 'sm'} fw={strong ? 700 : 500} c={color} style={figure}>
      {formatMoney(cents)}
    </Text>
  </div>
);

/** What the bill comes to and how it is paid, as a list that reads the same on a phone. */
export const ReceiptSummaryPanel = ({
  summary,
  isCurrent,
}: {
  /** `undefined` until the server has answered the first time. */
  summary: CalcReceiptSummary | undefined;
  /** False while a newer answer is on its way; the figures then show dimmed. */
  isCurrent: boolean;
}) =>
  summary === undefined ? (
    <Paper p="md" bg="var(--bg-app)" aria-live="polite" data-testid="receipt-summary">
      <Text size="sm" c="dimmed">
        {t('Working out the figures...')}
      </Text>
    </Paper>
  ) : (
    <Paper
      p="md"
      bg="var(--bg-app)"
      aria-live="polite"
      data-testid="receipt-summary"
      style={{ opacity: isCurrent ? 1 : 0.6 }}
    >
      <Stack gap={6}>
        <Row label={t('Goods')} cents={summary.goodsCents} />
        {summary.extraBilledCents !== 0 ? (
          <Row label={t("Extra charges on the supplier's bill")} cents={summary.extraBilledCents} />
        ) : null}
        <Row label={t('Bill total')} cents={summary.totalCents} strong />
        <Row label={t('Paying now')} cents={summary.payingNowCents} />
        <Row
          label={t('Left to pay later')}
          cents={summary.leftOwedCents}
          color={summary.leftOwedCents > 0 ? 'orange' : 'green'}
        />
        {summary.paidToOthersCents !== 0 ? (
          <>
            <Row label={t('Paid to others (courier, agent)')} cents={summary.paidToOthersCents} />
            <Row label={t('Money going out today')} cents={summary.cashOutTodayCents} strong />
          </>
        ) : null}
      </Stack>
    </Paper>
  );
