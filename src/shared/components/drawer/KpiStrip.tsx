import type { ReactNode } from 'react';
import { Box, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatMoney } from '@/shared/lib/money';

/** The headline numbers across the top of a drawer; tiles share the width equally, two per row when narrow. */
export const KpiStrip = ({ children }: { children: ReactNode }) => (
  <Box className="rich-drawer-kpis">{children}</Box>
);

export interface KpiTileProps {
  icon: ReactNode;
  color: string;
  label: string;
  children: ReactNode;
}

/**
 * One headline number as a slim row: a tinted icon on the left, a small uppercase label above the
 * figure on the right. A tile narrower than about 170px (two to a row on a phone) puts the figure
 * under the icon and label instead, so a long amount keeps the whole width (`.kpi-tile` in
 * `global.css`).
 */
export const KpiTile = ({ icon, color, label, children }: KpiTileProps) => (
  <Paper className="kpi-tile" px="sm" py="xs" bg="var(--bg-card)" shadow="xs">
    <div className="kpi-tile-body">
      <ThemeIcon className="kpi-tile-icon" variant="light" color={color} size="lg">
        {icon}
      </ThemeIcon>
      <Text
        className="kpi-tile-label"
        size="xs"
        fw={700}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: '0.05em' }}
      >
        {label}
      </Text>
      <div className="kpi-tile-value">{children}</div>
    </div>
  </Paper>
);

/** One figure with a small line under it. */
export const Figure = ({ value, hint, color }: { value: string; hint: string; color: string }) => (
  <>
    <Text fw={800} size="lg" c={color} lh={1.15} style={{ whiteSpace: 'nowrap' }}>
      {value}
    </Text>
    <Text size="xs" c="dimmed" lh={1.3} style={{ whiteSpace: 'nowrap' }}>
      {hint}
    </Text>
  </>
);

/** The lowest and highest of a set of amounts, in cents. `null` means there is nothing to show. */
export interface AmountRange {
  min: number;
  max: number;
}

export interface RangeFigureProps {
  range: AmountRange | null;
  color: string;
  /** The line under a single amount, for example "per unit". */
  singleHint: string;
  /** The line when there is no range at all, for example "No stock". */
  emptyHint: string;
}

/**
 * An amount range spelled out: the lowest and the highest on their own labelled
 * lines, so more than one price can never be mistaken for a single one. A single
 * amount shows as one figure; no range shows a dash.
 */
export const RangeFigure = ({ range, color, singleHint, emptyHint }: RangeFigureProps) => {
  const isMobile = useIsMobile();
  if (range === null) return <Figure value="—" hint={emptyHint} color={color} />;
  if (range.min === range.max) {
    return <Figure value={formatMoney(range.min)} hint={singleHint} color={color} />;
  }
  return (
    <Stack gap={2}>
      {[
        { label: t('Lowest'), cents: range.min },
        { label: t('Highest'), cents: range.max },
      ].map(({ label, cents }) => (
        <Group key={label} justify="space-between" wrap="nowrap" gap="xs" align="baseline">
          <Text
            size={isMobile ? '3xs' : 'xs'}
            c="dimmed"
            tt="uppercase"
            style={{ letterSpacing: '0.04em' }}
          >
            {label}
          </Text>
          <Text fw={800} size={isMobile ? 'sm' : 'md'} c={color} style={{ whiteSpace: 'nowrap' }}>
            {formatMoney(cents)}
          </Text>
        </Group>
      ))}
    </Stack>
  );
};
