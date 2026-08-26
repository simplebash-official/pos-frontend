import { useState } from 'react';
import { Stack, SimpleGrid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { MOCK_DASHBOARD_DATA } from '../mockData';
import { CockpitHeader } from './CockpitHeader';
import { DashboardKpiStrip } from './DashboardKpiStrip';
import { UrgentActionCenter } from './UrgentActionCenter';
import { ServicePipelineWidget } from './ServicePipelineWidget';
import { CashShiftSummaryWidget } from './CashShiftSummaryWidget';
import { TechnicianWorkloadWidget } from './TechnicianWorkloadWidget';
import { FastMoversWidget } from './FastMoversWidget';
import { LiveActivityFeed } from './LiveActivityFeed';

export const DashboardPage = () => {
  const [data, setData] = useState(MOCK_DASHBOARD_DATA);

  const handleRefresh = () => {
    setData({
      ...MOCK_DASHBOARD_DATA,
      lastRefreshed: new Date().toISOString(),
    });
    notifications.show({
      title: 'Dashboard Refreshed',
      message: 'Showing latest operational store pulse.',
      color: 'teal',
      icon: <IconCheck size={16} />,
    });
  };

  return (
    <Stack gap="lg" pb="xl">
      {/* Zone 1: Cockpit Header & Operating Pulse */}
      <CockpitHeader onRefresh={handleRefresh} />

      {/* Zone 2: High-Velocity Operational KPI Strip */}
      <DashboardKpiStrip kpis={data.kpis} />

      {/* Zone 3: Urgent Action Center / Needs Attention Now */}
      <UrgentActionCenter items={data.urgentActions} />

      {/* Zone 4: Live Service Pipelines (Phone Repairs Workshop & Print Queue) */}
      <ServicePipelineWidget
        repairPipeline={data.repairPipeline}
        printPipeline={data.printPipeline}
      />

      {/* Zone 5: Cash Register Shift & Technician Capacity Matrix (2-Column Grid) */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <CashShiftSummaryWidget shiftSummary={data.shiftSummary} />
        <TechnicianWorkloadWidget technicians={data.technicians} />
      </SimpleGrid>

      {/* Zone 6: Counter Fast Movers & Real-time Shop Activity Feed (2-Column Grid) */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <FastMoversWidget items={data.fastMovingItems} />
        <LiveActivityFeed activities={data.recentActivities} />
      </SimpleGrid>
    </Stack>
  );
};
