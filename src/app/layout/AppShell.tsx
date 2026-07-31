import { useEffect } from 'react';
import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ROUTES } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { GlobalQuickSearchModal } from '@/shared/components/GlobalQuickSearchModal';

const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.BILLING]: 'Billing Counter · JANA2U POS',
  [ROUTES.REPAIRS]: 'Phone Repairs · JANA2U POS',
  [ROUTES.PRINT_JOBS]: 'Print Jobs · JANA2U POS',
  [ROUTES.INVENTORY]: 'Inventory & Stock · JANA2U POS',
  [ROUTES.CUSTOMERS]: 'Customer Directory · JANA2U POS',
  [ROUTES.SUPPLIERS]: 'Suppliers Directory · JANA2U POS',
  [ROUTES.EMPLOYEES]: 'Employees & Earnings · JANA2U POS',
  [ROUTES.REPORTS]: 'Reports & Analytics · JANA2U POS',
};

export function AppShell() {
  const [opened, { toggle, close }] = useDisclosure();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    const title = ROUTE_TITLES[location.pathname] || 'JANA2U POS System';
    document.title = title;
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <MantineAppShell.Header bg="var(--bg-sidebar)">
        <Header opened={opened} toggle={toggle} />
      </MantineAppShell.Header>

      <MantineAppShell.Navbar bg="var(--bg-sidebar)">
        <Sidebar closeMobile={close} />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main
        style={{ backgroundColor: 'var(--bg-app)', minHeight: 'calc(100vh - 60px)' }}
      >
        <Outlet />
      </MantineAppShell.Main>

      <GlobalQuickSearchModal />
    </MantineAppShell>
  );
}
