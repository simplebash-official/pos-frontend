import { Stack, SimpleGrid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useDashboardLivePulse } from '../hooks/useDashboardLivePulse';
import { CockpitHeader } from './CockpitHeader';
import { DashboardKpiStrip } from './DashboardKpiStrip';
import { UrgentActionCenter } from './UrgentActionCenter';
import { ServicePipelineWidget } from './ServicePipelineWidget';
import { CashShiftSummaryWidget } from './CashShiftSummaryWidget';
import { TechnicianWorkloadWidget } from './TechnicianWorkloadWidget';
import { FastMoversWidget } from './FastMoversWidget';
import { LiveActivityFeed } from './LiveActivityFeed';

export const DashboardPage = () => {
  const { data, isLoading, refresh } = useDashboardLivePulse();

  const handleRefresh = async () => {
    await refresh();
    notifications.show({
      title: 'Store Pulse Synced',
      message: 'Pulled latest cloud transactions and local store activity.',
      color: 'teal',
      icon: <IconCheck size={16} />,
    });
  };

  return (
    <Stack gap="xl" pb="xl">
      {/* Zone 1: Cockpit Header & Operating Pulse */}
      <CockpitHeader onRefresh={handleRefresh} />

      {/* Zone 2: High-Velocity Operational KPI Strip */}
      <DashboardKpiStrip kpis={data.kpis} loading={isLoading} />

      {/* Zone 3: Urgent Action Center / Needs Attention Now */}
      <UrgentActionCenter items={data.urgentActions} />

      {/* Zone 4: Live Service Pipelines (Phone Repairs Workshop & Print Queue) */}
      <ServicePipelineWidget
        repairPipeline={data.repairPipeline}
        printPipeline={data.printPipeline}
      />

      {/* Zone 5: Cash Register Shift & Technician Capacity Matrix (2-Column Grid) */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <CashShiftSummaryWidget shiftSummary={data.shiftSummary} />
        <TechnicianWorkloadWidget technicians={data.technicians} />
      </SimpleGrid>

      {/* Zone 6: Counter Fast Movers & Real-time Shop Activity Feed (2-Column Grid) */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <FastMoversWidget items={data.fastMovingItems} />
        <LiveActivityFeed activities={data.recentActivities} />
      </SimpleGrid>
    </Stack>
  );
};
