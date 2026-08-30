import { Group, Paper, Stack, Switch, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconInfoCircle } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { InteractiveTooltip } from '@/shared/components/InteractiveTooltip';
import { formatRangeLabel, type Granularity, type RangePreset } from '@/shared/lib/date';
import { useAnalyticsFilters } from '../hooks/useAnalyticsFilters';

const PRESET_LABELS: Record<RangePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This week',
  this_month: 'This month',
  last_month: 'Last month',
  this_year: 'This year',
  all_time: 'All time',
  custom: 'Custom',
};

const GRAN_LABELS: Record<Granularity, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
};

interface Props {
  controller: ReturnType<typeof useAnalyticsFilters>;
}

export const AnalyticsFilterBar = ({ controller }: Props) => {
  const isMobile = useIsMobile();
  const { filters, range, patch } = controller;

  const presetControl = (
    <SegmentedToggle
      fullWidth={isMobile}
      value={filters.preset}
      onChange={(value) => patch({ preset: value as RangePreset })}
      data={(
        ['today', 'this_week', 'this_month', 'this_year', 'all_time', 'custom'] as RangePreset[]
      ).map((p) => ({ value: p, label: t(PRESET_LABELS[p]) }))}
    />
  );

  const granularityControl = (
    <SegmentedToggle
      fullWidth={isMobile}
      value={filters.granularity}
      onChange={(value) => patch({ granularity: value as Granularity })}
      data={(['day', 'week', 'month', 'year'] as Granularity[]).map((g) => ({
        value: g,
        label: t(GRAN_LABELS[g]),
      }))}
    />
  );

  const customPicker = filters.preset === 'custom' && (
    <DatePickerInput
      type="range"
      size="sm"
      valueFormat="D MMM YYYY"
      leftSection={<IconCalendar size={16} />}
      placeholder={t('Pick a date range')}
      popoverProps={{ withinPortal: true }}
      w={isMobile ? '100%' : 260}
      value={[filters.from ?? null, filters.to ?? null]}
      onChange={([from, to]) =>
        patch({ preset: 'custom', from: from ?? undefined, to: to ?? undefined })
      }
    />
  );

  const compareSwitch = (
    <Switch
      size="sm"
      label={t('Compare to previous period')}
      checked={filters.comparePrevious}
      onChange={(e) => patch({ comparePrevious: e.currentTarget.checked })}
    />
  );

  return (
    <Paper p="sm" withBorder radius="var(--mantine-radius-default)" bg="var(--bg-card)">
      <Stack gap="sm">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="xs">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              {t('Period')}
            </Text>
            <InteractiveTooltip
              title={t('About the dates')}
              description={t('Periods use Sri Lanka time (UTC+05:30).')}
              icon={<IconInfoCircle size={16} />}
            >
              <IconInfoCircle size={14} style={{ color: 'var(--mantine-color-dimmed)' }} />
            </InteractiveTooltip>
          </Group>
          <Text size="xs" c="dimmed">
            {formatRangeLabel(range)}
          </Text>
        </Group>

        {isMobile ? (
          <Stack gap="sm">
            {presetControl}
            {customPicker}
            {granularityControl}
            {compareSwitch}
          </Stack>
        ) : (
          <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
            <Group align="flex-end" gap="md" wrap="wrap">
              {presetControl}
              {customPicker}
              {granularityControl}
            </Group>
            {compareSwitch}
          </Group>
        )}
      </Stack>
    </Paper>
  );
};
