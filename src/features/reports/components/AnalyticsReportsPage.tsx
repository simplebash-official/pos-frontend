import { useSearchParams } from 'react-router-dom';
import { Stack, Tabs } from '@mantine/core';
import { t } from '@/shared/i18n/t';
import { PageHeader } from '@/shared/components/PageHeader';
import { formatRangeLabel } from '@/shared/lib/date';
import { useAnalyticsFilters } from '../hooks/useAnalyticsFilters';
import { AnalyticsFilterBar } from './AnalyticsFilterBar';
import { ReportExportMenu } from './ReportExportMenu';
import { OverviewSection } from './sections/OverviewSection';
import { SalesSection } from './sections/SalesSection';
import { ProfitSection } from './sections/ProfitSection';
import { CustomersSection } from './sections/CustomersSection';
import { InventorySection } from './sections/InventorySection';
import { StaffSection } from './sections/StaffSection';

type TabValue = 'overview' | 'sales' | 'profit' | 'customers' | 'inventory' | 'staff';

const TABS: { value: TabValue; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'sales', label: 'Sales' },
  { value: 'profit', label: 'Profit' },
  { value: 'customers', label: 'Customers' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'staff', label: 'Staff' },
];

export const AnalyticsReportsPage = () => {
  const controller = useAnalyticsFilters();
  const { range, requestParams } = controller;
  const periodLabel = formatRangeLabel(range);

  const [tab, setTab] = useTabState();

  // Every panel stays mounted (`keepMounted`, Mantine's default) so a tab
  // revisited within the 5-minute staleTime shows cached data instantly — but
  // each section only fires its queries while it is the active tab, so opening
  // the page costs one tab's worth of requests, not six.

  return (
    <Stack gap="md">
      <PageHeader
        title={t('Analytics & Reports')}
        description={t(
          'Sales, profit, customers, inventory and staff performance across billing, repairs and print jobs.'
        )}
        action={<ReportExportMenu params={requestParams} periodLabel={periodLabel} />}
      />

      <AnalyticsFilterBar controller={controller} />

      <Tabs
        value={tab}
        onChange={(v) => setTab((v as TabValue) ?? 'overview')}
        variant="pills"
        classNames={{
          list: 'analytics-tabs-list',
          tab: 'analytics-tabs-tab',
        }}
      >
        <Tabs.List grow>
          {TABS.map(({ value, label }) => (
            <Tabs.Tab key={value} value={value}>
              {t(label)}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <OverviewSection params={requestParams} active={tab === 'overview'} />
        </Tabs.Panel>
        <Tabs.Panel value="sales" pt="md">
          <SalesSection params={requestParams} active={tab === 'sales'} periodLabel={periodLabel} />
        </Tabs.Panel>
        <Tabs.Panel value="profit" pt="md">
          <ProfitSection
            params={requestParams}
            active={tab === 'profit'}
            periodLabel={periodLabel}
          />
        </Tabs.Panel>
        <Tabs.Panel value="customers" pt="md">
          <CustomersSection
            params={requestParams}
            active={tab === 'customers'}
            periodLabel={periodLabel}
          />
        </Tabs.Panel>
        <Tabs.Panel value="inventory" pt="md">
          <InventorySection active={tab === 'inventory'} periodLabel={periodLabel} />
        </Tabs.Panel>
        <Tabs.Panel value="staff" pt="md">
          <StaffSection params={requestParams} active={tab === 'staff'} periodLabel={periodLabel} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

// Keep the open tab in the URL alongside the filters so a shared link lands
// on the same view.
const useTabState = (): [TabValue, (v: TabValue) => void] => {
  const [sp, setSp] = useSearchParams();
  const raw = sp.get('tab');
  const tab: TabValue = TABS.some((tabDef) => tabDef.value === raw)
    ? (raw as TabValue)
    : 'overview';

  const setTab = (v: TabValue) =>
    setSp(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', v);
        return next;
      },
      { replace: true }
    );

  return [tab, setTab];
};
