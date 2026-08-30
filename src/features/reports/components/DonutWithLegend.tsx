import { Box, Group, Stack, Text } from '@mantine/core';
import { DonutChart } from '@mantine/charts';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { DONUT } from '../lib/analyticsCharts';

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: DonutSlice[];
  /** Formats a slice value for the legend and tooltip. */
  valueFormatter: (value: number) => string;
  /** Text shown in the centre of the ring. */
  centerLabel?: string;
  /** Minimum height of the chart container (defaults to 240). */
  minHeight?: number;
}

/**
 * A donut with the chart on the left and a vertical legend on the right —
 * Mantine's built-in `withLegend` only does a horizontal wrap-around legend,
 * so we render `DonutChart` bare and lay the legend out ourselves. Stacks
 * vertically on mobile. Both layouts are centered within the parent container.
 */
export const DonutWithLegend = ({ data, valueFormatter, centerLabel, minHeight = 220 }: Props) => {
  const isMobile = useIsMobile();
  const total = data.reduce((sum, s) => sum + s.value, 0);

  const legend = (
    <Stack
      gap={6}
      style={{
        minWidth: 0,
        width: isMobile ? '100%' : undefined,
        maxWidth: isMobile ? 280 : undefined,
      }}
    >
      {data.map((slice) => (
        <Group key={slice.name} gap="xs" wrap="nowrap" align="center">
          <Box
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              flexShrink: 0,
              backgroundColor: `var(--mantine-color-${slice.color.replace('.', '-')})`,
            }}
          />
          <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
            {slice.name}
          </Text>
          <Text size="xs" fw={600} ml="auto" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {total > 0 ? valueFormatter(slice.value) : '—'}
          </Text>
        </Group>
      ))}
    </Stack>
  );

  const chart = (
    <DonutChart
      size={DONUT.size}
      thickness={DONUT.thickness}
      withTooltip
      tooltipDataSource="segment"
      valueFormatter={valueFormatter}
      chartLabel={centerLabel}
      data={data}
      style={{ flexShrink: 0 }}
    />
  );

  return isMobile ? (
    <Stack align="center" justify="center" gap="md" style={{ width: '100%', minHeight }}>
      {chart}
      {legend}
    </Stack>
  ) : (
    <Group
      align="center"
      justify="center"
      gap="xl"
      wrap="nowrap"
      style={{ width: '100%', minHeight }}
    >
      {chart}
      {legend}
    </Group>
  );
};
