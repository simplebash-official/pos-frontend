import { useState } from 'react';
import { Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import {
  IconArrowsExchange,
  IconCalendarDue,
  IconChartBar,
  IconReportMoney,
} from '@tabler/icons-react';
import { AnimatedTabs } from '@/shared/components/drawer';
import { PageHeader } from '@/shared/components/PageHeader';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatDate } from '@/shared/lib/date';
import { t } from '@/shared/i18n/t';
import {
  useCashFlow,
  useExpenseBreakdown,
  usePayables,
  useProfitLoss,
} from '../hooks/useFinanceReports';
import { periodProblem, presetPeriod, type PeriodPreset } from '../lib/reportView';
import type { ReportPeriod } from '../types';
import { CashFlowPanel } from './CashFlowPanel';
import { ExpensesPanel } from './ExpensesPanel';
import { PayablesPanel } from './PayablesPanel';
import { ProfitLossPanel } from './ProfitLossPanel';

type ReportTab = 'profit' | 'costs' | 'flow' | 'bills';

/** The ways to pick the days; labels are functions so `t()` runs at render. */
const PRESETS: { value: PeriodPreset; label: () => string }[] = [
  { value: 'this_month', label: () => t('This month') },
  { value: 'last_month', label: () => t('Last month') },
  { value: 'this_year', label: () => t('This year') },
  { value: 'custom', label: () => t('Pick days') },
];

const toDay = (value: Date | string | null): string | null =>
  value === null ? null : dayjs(value).format('YYYY-MM-DD');

// The owner's money reports: profit and loss, what was spent, where the money moved, and what is
// still to pay. Every figure comes from the server; the page only picks the days. Only people with
// the reports permission reach it (route guard) and the server refuses everyone else.
export const MoneyReportsPage = () => {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<ReportTab>('profit');
  const [preset, setPreset] = useState<PeriodPreset>('this_month');
  const [custom, setCustom] = useState<ReportPeriod>(presetPeriod('this_month'));

  const period = preset === 'custom' ? custom : presetPeriod(preset);
  const problem = preset === 'custom' ? periodProblem(custom) : null;
  const ready = problem === null;

  const profit = useProfitLoss(period, ready);
  const costs = useExpenseBreakdown(period, ready);
  const flow = useCashFlow(period, ready);
  const bills = usePayables();

  return (
    <Stack gap="md">
      <PageHeader
        title={t('Money Reports')}
        description={t(
          'How the shop is doing: profit, what was spent, where the money moved and what is still to pay.'
        )}
      />

      {tab !== 'bills' && (
        <Paper withBorder p="sm" bg="var(--bg-card)">
          <Stack gap="xs">
            <Group gap="sm" align="center">
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                style={{ letterSpacing: '0.05em' }}
              >
                {t('Period')}
              </Text>
              {isMobile ? (
                // Four labels do not fit one row on a phone, so they become a two by two grid of big buttons.
                <SimpleGrid cols={2} spacing="xs" style={{ flex: 1, minWidth: 220 }}>
                  {PRESETS.map((p) => (
                    <Button
                      key={p.value}
                      variant={p.value === preset ? 'filled' : 'default'}
                      h={44}
                      onClick={() => setPreset(p.value)}
                      aria-pressed={p.value === preset}
                    >
                      {p.label()}
                    </Button>
                  ))}
                </SimpleGrid>
              ) : (
                <SegmentedToggle
                  size="sm"
                  value={preset}
                  onChange={(value) => setPreset(value as PeriodPreset)}
                  data={PRESETS.map((p) => ({ value: p.value, label: p.label() }))}
                  aria-label={t('Period')}
                />
              )}
            </Group>
            {preset === 'custom' ? (
              <Group gap="sm" grow={isMobile} align="flex-start">
                <DateInput
                  label={t('First day')}
                  value={custom.from}
                  onChange={(value) => {
                    const day = toDay(value);
                    if (day !== null) setCustom({ ...custom, from: day });
                  }}
                  valueFormat="DD MMM YYYY"
                  maxDate={custom.to}
                />
                <DateInput
                  label={t('Last day')}
                  value={custom.to}
                  onChange={(value) => {
                    const day = toDay(value);
                    if (day !== null) setCustom({ ...custom, to: day });
                  }}
                  valueFormat="DD MMM YYYY"
                  minDate={custom.from}
                  error={problem}
                />
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                {`${formatDate(period.from)} – ${formatDate(period.to)}`}
              </Text>
            )}
          </Stack>
        </Paper>
      )}

      <AnimatedTabs<ReportTab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'profit', label: t('Profit and loss'), icon: <IconReportMoney size={16} /> },
          { value: 'costs', label: t('What was spent'), icon: <IconChartBar size={16} /> },
          { value: 'flow', label: t('Where money moved'), icon: <IconArrowsExchange size={16} /> },
          {
            value: 'bills',
            label: t('Still to pay'),
            icon: <IconCalendarDue size={16} />,
          },
        ]}
      >
        {(active) => {
          switch (active) {
            case 'profit':
              return <ProfitLossPanel report={profit.data} loading={profit.isLoading} />;
            case 'costs':
              return <ExpensesPanel report={costs.data} loading={costs.isLoading} />;
            case 'flow':
              return <CashFlowPanel report={flow.data} loading={flow.isLoading} />;
            case 'bills':
              return <PayablesPanel report={bills.data} loading={bills.isLoading} />;
          }
        }}
      </AnimatedTabs>
    </Stack>
  );
};
