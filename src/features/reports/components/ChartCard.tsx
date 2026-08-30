import type { ReactNode } from 'react';
import { Box, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { EmptyState } from '@/shared/components/EmptyState';
import { IconChartBar } from '@tabler/icons-react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  /** When true, show the empty state instead of `children`. */
  empty?: boolean;
  emptyText?: string;
  /** Chart height used for the loading skeleton. */
  minHeight?: number;
  children: ReactNode;
}

/**
 * Standard container for a chart on the Analytics page: titled `Paper`, a
 * loading skeleton, an empty state, and — importantly — an `overflow-x`
 * scroll region so a wide chart never widens the page (CLAUDE.md responsive
 * rule).
 */
export const ChartCard = ({
  title,
  subtitle,
  action,
  loading,
  empty,
  emptyText,
  minHeight = 240,
  children,
}: ChartCardProps) => (
  <Paper p="md" withBorder radius="var(--mantine-radius-default)" bg="var(--bg-card)">
    <Stack gap="sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
        <div>
          <Text fw={700} size="sm">
            {t(title)}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed">
              {t(subtitle)}
            </Text>
          )}
        </div>
        {action}
      </Group>

      {loading ? (
        <Skeleton height={minHeight} radius="sm" />
      ) : empty ? (
        <EmptyState
          icon={<IconChartBar size={28} />}
          title={t(emptyText ?? 'No data for this period')}
        />
      ) : (
        <Box style={{ overflowX: 'auto', overflowY: 'hidden', minWidth: 0 }}>{children}</Box>
      )}
    </Stack>
  </Paper>
);
