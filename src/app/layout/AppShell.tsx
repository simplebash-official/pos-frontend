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
import { PRODUCT_NAME } from '@/config/branding';

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
import { useGlobalCalculator } from '@/shared/components/calculator';

const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: `Shop Cockpit · ${PRODUCT_NAME}`,
  [ROUTES.BILLING]: `Billing Counter · ${PRODUCT_NAME}`,
  [ROUTES.INVOICES]: `Invoices · ${PRODUCT_NAME}`,
  [ROUTES.REPAIRS]: `Phone Repairs · ${PRODUCT_NAME}`,
  [ROUTES.PRINT_JOBS]: `Print Jobs · ${PRODUCT_NAME}`,
  [ROUTES.INVENTORY]: `Inventory & Stock · ${PRODUCT_NAME}`,
  [ROUTES.CUSTOMERS]: `Customer Directory · ${PRODUCT_NAME}`,
  [ROUTES.SUPPLIERS]: `Suppliers Directory · ${PRODUCT_NAME}`,
  [ROUTES.EMPLOYEES]: `Employees & Earnings · ${PRODUCT_NAME}`,
  [ROUTES.REPORTS]: `Reports & Analytics · ${PRODUCT_NAME}`,
  [ROUTES.SETTINGS]: `Settings · ${PRODUCT_NAME}`,
};

export const AppShell = () => {
  const [opened, { toggle, close }] = useDisclosure();
  const [focusMode, setFocusMode] = useState(false);
  const [heldDrawerOpen, setHeldDrawerOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { openCalculator, closeCalculator, toggleCalculator } = useGlobalCalculator();

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
    const title = ROUTE_TITLES[location.pathname] || `${PRODUCT_NAME} System`;
    document.title = title;
  }, [location.pathname]);

  // Focus mode hotkey (F11 on Windows, Mod+Shift+F on Mac)
  useAppShortcuts(
    [
      {
        key: ['F11', 'Mod+Shift+F'],
        ignoreInput: true,
        handler: () => setFocusMode((prev) => !prev),
      },
    ],
    isBillingPage
  );

  // Alt+C calculator hotkey
  useAppShortcuts([{ key: 'Alt+C', ignoreInput: true, handler: () => toggleCalculator() }]);

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
          onOpenCalculator={() => openCalculator()}
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
        <Outlet
          context={{
            setHeldDrawerOpen,
            setShortcutsOpen,
            setCalculatorOpen: (open: boolean | ((prev: boolean) => boolean)) => {
              if (typeof open === 'function') {
                toggleCalculator();
              } else if (open) {
                openCalculator();
              } else {
                closeCalculator();
              }
            },
            openCalculator,
            closeCalculator,
          }}
        />
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
