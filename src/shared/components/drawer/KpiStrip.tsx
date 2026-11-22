import { Children, type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatMoney } from '@/shared/lib/money';
import { useScrollHeadroom } from './useScrollHeadroom';

/** Each tile starts to leave a little after the one before it, so they peel away in a wave. */
const TILE_LAG = 0.06;
const TILE_LAG_CAP = 3;
/** How far a tile shrinks and how soft it gets on its way out. */
const TILE_SCALE_DROP = 0.04;
const TILE_BLUR_PX = 6;
/** A gap (px) added to the travel so the tiles' shadows clear the top edge too. */
const TRAVEL_MARGIN = 12;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

interface TileSlotProps {
  index: number;
  progress: MotionValue<number>;
  distance: MotionValue<number>;
  reduced: boolean;
  children: ReactNode;
}

/** One tile of the strip, travelling with the shared progress but a beat after the tile before. */
const TileSlot = ({ index, progress, distance, reduced, children }: TileSlotProps) => {
  const lag = Math.min(index, TILE_LAG_CAP) * TILE_LAG;
  const own = useTransform(progress, (value) => clamp01((value - lag) / (1 - lag)));
  const opacity = useTransform(own, (value) => clamp01(1 - value * 1.15));
  const y = useTransform([own, distance], ([value, travel]: number[]) =>
    reduced ? 0 : -value * (travel + TRAVEL_MARGIN)
  );
  const scale = useTransform(own, (value) => (reduced ? 1 : 1 - TILE_SCALE_DROP * value));
  const filter = useTransform(own, (value) =>
    reduced || value === 0 ? 'none' : `blur(${value * TILE_BLUR_PX}px)`
  );
  return (
    <motion.div className="rich-drawer-kpi-slot" style={{ opacity, y, scale, filter }}>
      {children}
    </motion.div>
  );
};

/**
 * The headline numbers across the top of a drawer; tiles share the width equally, two per row
 * when narrow. They follow the drawer's scroll (down takes them away, up brings them back) and
 * settle with a spring when it stops; see `useScrollHeadroom`.
 */
export const KpiStrip = ({ children }: { children: ReactNode }) => {
  const { ref, progress, distance, hidden, pinned, reduced } = useScrollHeadroom();
  // The backing under the tiles goes with them, so a hidden strip leaves no empty band behind.
  const backing = useTransform(progress, (value) => clamp01(1 - value * 1.15));
  return (
    <div ref={ref} className="rich-drawer-kpis" data-hidden={hidden} data-pinned={pinned}>
      <div className="rich-drawer-kpi-tiles" aria-hidden={hidden} inert={hidden}>
        <motion.div className="rich-drawer-kpi-backing" style={{ opacity: backing }} />
        {Children.toArray(children).map((child, index) => (
          <TileSlot
            // The tiles are a fixed list in a fixed order.
            key={index}
            index={index}
            progress={progress}
            distance={distance}
            reduced={reduced}
          >
            {child}
          </TileSlot>
        ))}
      </div>
    </div>
  );
};

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
    <Text size="xs" c="dimmed" lh={1.3} truncate>
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
