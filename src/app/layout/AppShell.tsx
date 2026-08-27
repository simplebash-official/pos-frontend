import { useEffect, useState, lazy, Suspense } from 'react';
import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import {
  BILLING_HEADER_HEIGHT,
  SHELL_HEADER_HEIGHT,
  SHELL_NAVBAR_RAIL_WIDTH,
  SHELL_NAVBAR_WIDTH,
} from './constants';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { GlobalQuickSearchModal } from '@/shared/components/GlobalQuickSearchModal';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { useLayoutTier } from '@/shared/hooks/useResponsive';

const HeldSalesDrawer = lazy(() =>
  import('@/features/billing/components/HeldSalesDrawer').then((m) => ({
    default: m.HeldSalesDrawer,
  }))
);
const KeyboardShortcutsModal = lazy(() =>
  import('@/features/billing/components/KeyboardShortcutsModal').then((m) => ({
    default: m.KeyboardShortcutsModal,
  }))
);

const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: 'Shop Cockpit · JANA2U POS',
  [ROUTES.BILLING]: 'Billing Counter · JANA2U POS',
  [ROUTES.INVOICES]: 'Invoices · JANA2U POS',
  [ROUTES.REPAIRS]: 'Phone Repairs · JANA2U POS',
  [ROUTES.PRINT_JOBS]: 'Print Jobs · JANA2U POS',
  [ROUTES.INVENTORY]: 'Inventory & Stock · JANA2U POS',
  [ROUTES.CUSTOMERS]: 'Customer Directory · JANA2U POS',
  [ROUTES.SUPPLIERS]: 'Suppliers Directory · JANA2U POS',
  [ROUTES.EMPLOYEES]: 'Employees & Earnings · JANA2U POS',
  [ROUTES.REPORTS]: 'Reports & Analytics · JANA2U POS',
  [ROUTES.SETTINGS]: 'Settings · JANA2U POS',
};

export const AppShell = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const [focusMode, setFocusMode] = useState(false);
  const [heldDrawerOpen, setHeldDrawerOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isBillingPage = location.pathname === ROUTES.BILLING;
  const tier = useLayoutTier();

  // Entering/leaving billing is a navigation, not a resize: the header/navbar
  // dimension change should snap instantly instead of racing billing's heavy
  // first mount with a 200ms layout animation. In-page dimension changes
  // (tier crossings, focus-mode toggle) still animate normally.
  const [prevIsBillingPage, setPrevIsBillingPage] = useState(isBillingPage);
  const isBillingBoundaryChange = prevIsBillingPage !== isBillingPage;
  if (isBillingBoundaryChange) {
    setPrevIsBillingPage(isBillingPage);
  }

  useEffect(() => {
    const title = ROUTE_TITLES[location.pathname] || 'JANA2U POS System';
    document.title = title;
  }, [location.pathname]);

  // F11 focus mode hotkey
  useAppShortcuts(
    [{ key: 'F11', ignoreInput: true, handler: () => setFocusMode((prev) => !prev) }],
    isBillingPage
  );

  const isDashboard = location.pathname === ROUTES.DASHBOARD || location.pathname === '/';
  const [heroClockVisible, setHeroClockVisible] = useState(isDashboard);

  // Dynamic observer for hero clock on Dashboard
  useEffect(() => {
    if (!isDashboard) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeroClockVisible(false);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const setupObserver = () => {
      const heroClockEl = document.getElementById('cockpit-hero-clock');
      if (heroClockEl) {
        observer = new IntersectionObserver(
          ([entry]) => {
            setHeroClockVisible(entry.isIntersecting);
          },
          {
            threshold: 0.1,
          }
        );
        observer.observe(heroClockEl);
      } else {
        timeoutId = setTimeout(setupObserver, 50);
      }
    };

    setupObserver();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [isDashboard, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const headerHeight = isBillingPage ? BILLING_HEADER_HEIGHT : SHELL_HEADER_HEIGHT;
  const navbarWidth = isBillingPage
    ? focusMode
      ? 0
      : SHELL_NAVBAR_RAIL_WIDTH
    : tier === 'tablet'
      ? SHELL_NAVBAR_RAIL_WIDTH
      : SHELL_NAVBAR_WIDTH;

  return (
    <MantineAppShell
      header={{ height: headerHeight }}
      navbar={{
        width: navbarWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: isBillingPage && focusMode },
      }}
      padding={isBillingPage ? 0 : { base: 'md', sm: '3xl' }}
      transitionDuration={isBillingBoundaryChange ? 0 : 200}
      transitionTimingFunction="ease"
    >
      <MantineAppShell.Header bg="var(--bg-sidebar)">
        <Header
          opened={opened}
          toggle={toggle}
          focusMode={focusMode}
          heroClockVisible={heroClockVisible}
          onToggleFocusMode={() => setFocusMode((prev) => !prev)}
          onOpenHeldDrawer={() => setHeldDrawerOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />
      </MantineAppShell.Header>

      {(!isBillingPage || !focusMode) && (
        <MantineAppShell.Navbar bg="var(--bg-sidebar)">
          <Sidebar
            closeMobile={close}
            isRail={tier !== 'mobile' && (isBillingPage ? !focusMode : tier === 'tablet')}
          />
        </MantineAppShell.Navbar>
      )}

      <MantineAppShell.Main
        style={{
          backgroundColor: 'var(--bg-app)',
          height: '100dvh',
          maxHeight: '100dvh',
          boxSizing: 'border-box',
          overflowY: isBillingPage ? 'hidden' : 'auto',
        }}
      >
        <Outlet context={{ setHeldDrawerOpen, setShortcutsOpen }} />
      </MantineAppShell.Main>

      <GlobalQuickSearchModal />

      <Suspense fallback={null}>
        {heldDrawerOpen && (
          <HeldSalesDrawer opened={heldDrawerOpen} onClose={() => setHeldDrawerOpen(false)} />
        )}
        {shortcutsOpen && (
          <KeyboardShortcutsModal opened={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
        )}
      </Suspense>
    </MantineAppShell>
  );
};
