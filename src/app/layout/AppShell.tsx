import { useEffect, useState } from 'react';
import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BILLING_HEADER_HEIGHT, SHELL_HEADER_HEIGHT } from './constants';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { GlobalQuickSearchModal } from '@/shared/components/GlobalQuickSearchModal';
import { HeldSalesDrawer } from '@/features/billing/components/HeldSalesDrawer';
import { KeyboardShortcutsModal } from '@/features/billing/components/KeyboardShortcutsModal';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';

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
  const [focusMode, setFocusMode] = useState(false);
  const [heldDrawerOpen, setHeldDrawerOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isBillingPage = location.pathname === ROUTES.BILLING;

  useEffect(() => {
    const title = ROUTE_TITLES[location.pathname] || 'JANA2U POS System';
    document.title = title;
  }, [location.pathname]);

  // F11 focus mode hotkey
  useAppShortcuts(
    [{ key: 'F11', ignoreInput: true, handler: () => setFocusMode((prev) => !prev) }],
    isBillingPage
  );

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const headerHeight = isBillingPage ? BILLING_HEADER_HEIGHT : SHELL_HEADER_HEIGHT;
  const navbarWidth = isBillingPage ? (focusMode ? 0 : 64) : 250;

  return (
    <MantineAppShell
      header={{ height: headerHeight }}
      navbar={{
        width: navbarWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: isBillingPage && focusMode },
      }}
      padding={isBillingPage ? 0 : 'md'}
    >
      <MantineAppShell.Header bg="var(--bg-sidebar)">
        <Header
          opened={opened}
          toggle={toggle}
          focusMode={focusMode}
          onToggleFocusMode={() => setFocusMode((prev) => !prev)}
          onOpenHeldDrawer={() => setHeldDrawerOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />
      </MantineAppShell.Header>

      {(!isBillingPage || !focusMode) && (
        <MantineAppShell.Navbar bg="var(--bg-sidebar)">
          <Sidebar closeMobile={close} isRail={isBillingPage && !focusMode} />
        </MantineAppShell.Navbar>
      )}

      <MantineAppShell.Main
        style={{
          backgroundColor: 'var(--bg-app)',
          minHeight: `calc(100dvh - ${headerHeight}px)`,
          overflow: isBillingPage ? 'hidden' : 'auto',
        }}
      >
        <Outlet context={{ setHeldDrawerOpen, setShortcutsOpen }} />
      </MantineAppShell.Main>

      <GlobalQuickSearchModal />

      <HeldSalesDrawer opened={heldDrawerOpen} onClose={() => setHeldDrawerOpen(false)} />
      <KeyboardShortcutsModal opened={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </MantineAppShell>
  );
}
