import { Text } from '@mantine/core';
import {
  IconClipboardList,
  IconHourglassLow,
  IconShieldCheck,
  IconTool,
} from '@tabler/icons-react';
import { MetricCardRow } from '@/shared/components/MetricCard';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import { useWarrantyStats } from '../hooks/useWarranties';
import type { WarrantyStats } from '../types';

const NO_FIGURE = '—';

/** A big figure with a small plain-language note beside it; inline, as it sits in a `<p>`. */
const FigureWithNote = ({ figure, note }: { figure: string; note: string | null }) => (
  <>
    {figure}
    {note !== null && (
      <Text span size="xs" fw={600} c="dimmed" ml={6}>
        {note}
      </Text>
    )}
  </>
);

/**
 * The warranty desk at a glance: what is covered, what ends this week, the claims in hand and
 * what free rework cost this month. Every number comes from the server (`/warranties/stats`).
 */
export const WarrantyMetrics = () => {
  const { data: stats, isLoading, staleAsOf } = useWarrantyStats();
  // A dash, not a zero, when the numbers could not be fetched and none were kept.
  const count = (pick: (s: WarrantyStats) => number) =>
    stats === undefined ? NO_FIGURE : String(pick(stats));
  const lateNote =
    stats === undefined || stats.lateClaimCount === 0
      ? null
      : `${stats.lateClaimCount} ${t('late')}`;

  return (
    <MetricCardRow
      staleAsOf={staleAsOf}
      cards={[
        {
          key: 'in-force',
          label: 'Covered now',
          value: count((s) => s.inForceCount),
          color: 'teal',
          icon: <IconShieldCheck size={20} />,
          loading: isLoading,
          skeletonWidth: 50,
        },
        {
          key: 'ending',
          label: 'Ending this week',
          value: count((s) => s.endingSoonCount),
          color: 'orange',
          icon: <IconHourglassLow size={20} />,
          loading: isLoading,
          skeletonWidth: 50,
        },
        {
          key: 'claims',
          label: 'Open claims',
          value: <FigureWithNote figure={count((s) => s.openClaimCount)} note={lateNote} />,
          color: stats !== undefined && stats.lateClaimCount > 0 ? 'red' : 'blue',
          icon: <IconClipboardList size={20} />,
          loading: isLoading,
          skeletonWidth: 50,
        },
        {
          key: 'rework',
          label: 'Rework this month',
          value: stats === undefined ? NO_FIGURE : formatMoney(stats.reworkCostThisMonthCents),
          color: 'grape',
          icon: <IconTool size={20} />,
          loading: isLoading,
          skeletonWidth: 90,
        },
      ]}
    />
  );
};
