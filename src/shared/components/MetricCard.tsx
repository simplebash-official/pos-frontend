import type { ReactNode } from 'react';
import { Group, Paper, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { formatDateTime } from '@/shared/lib/date';

export interface MetricCardDef {
  key: string;
  label: string;
  value: ReactNode;
  color: string;
  icon: ReactNode;
  loading?: boolean;
  /** Width of the loading skeleton — match the rendered value's rough width. */
  skeletonWidth?: number;
}

/**
 * One dashboard KPI card — the shared visual for the metric strip at the top
 * of the Sales & Invoices History, Repair Jobs and Print Jobs screens. Reuse
 * this rather than hand-rolling another `Paper`/`Group`/`ThemeIcon` block.
 */
export const MetricCard = ({
  label,
  value,
  color,
  icon,
  loading,
  skeletonWidth = 80,
}: MetricCardDef) => (
  <Paper p="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
    <Group justify="space-between" align="flex-start">
      <div>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          {label}
        </Text>
        {loading ? (
          <Skeleton height={28} width={skeletonWidth} mt={4} />
        ) : (
          <Text
            size="xl"
            fw={700}
            color={color}
            mt={2}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {value}
          </Text>
        )}
      </div>
      <ThemeIcon color={color} variant="light" size="lg">
        {icon}
      </ThemeIcon>
    </Group>
  </Paper>
);

export interface MetricCardRowProps {
  cards: MetricCardDef[];
  /** Set when `cards` came from the offline cache rather than a fresh fetch. */
  staleAsOf?: string | null;
}

/** The 4-card KPI strip — same `SimpleGrid` breakpoints on every screen that uses it. */
export const MetricCardRow = ({ cards, staleAsOf }: MetricCardRowProps) => (
  <Stack gap={4}>
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {cards.map(({ key, ...card }) => (
        <MetricCard key={key} {...card} />
      ))}
    </SimpleGrid>
    {staleAsOf && (
      <Text size="xs" c="dimmed">
        Showing last known figures — updated {formatDateTime(staleAsOf)}.
      </Text>
    )}
  </Stack>
);
