import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useReducedMotion } from 'framer-motion';
import { AppShell as MantineAppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useShellWidthTransition } from './useShellWidthTransition';
import {
  BILLING_HEADER_HEIGHT,
  SHELL_HEADER_HEIGHT,
  SHELL_NAVBAR_RAIL_WIDTH,
  SHELL_NAVBAR_WIDTH,
} from './constants';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import { selectShopProfile, setShopProfile, updateShopProfile } from '@/store/slices/settingsSlice';
import { getShopProfileApi, updateShopProfileApi } from '@/features/settings/api/settingsApi';
import { useCloudState } from '@/features/account';
import { GlobalQuickSearchModal } from '@/shared/components/GlobalQuickSearchModal';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { useLayoutTier } from '@/shared/hooks/useResponsive';
import { PRODUCT_NAME } from '@/config/branding';

// Offers to print labels when new stock comes in (see features/labels/lib/labelPrintOffer).
const LabelPrintOfferHost = lazy(() =>
  import('@/features/labels/components/LabelPrintOfferHost').then((m) => ({
    default: m.LabelPrintOfferHost,
  }))
);
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
  [ROUTES.EXPENSES]: `Expenses · ${PRODUCT_NAME}`,
  [ROUTES.INVENTORY]: `Inventory & Stock · ${PRODUCT_NAME}`,
  [ROUTES.LABELS]: `Labels · ${PRODUCT_NAME}`,
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
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const shopProfile = useAppSelector(selectShopProfile);
  const { state: cloudState } = useCloudState();
  const isBillingPage = location.pathname === ROUTES.BILLING;
  const tier = useLayoutTier();
  const reduceMotion = useReducedMotion();
  const navbarRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    getShopProfileApi()
      .then((profile) => {
        const hasNoName = !profile.tradingName?.trim() || profile.tradingName === 'SimpleBash POS';
        if (hasNoName && cloudState.linked && cloudState.shopName?.trim()) {
          const linkedName = cloudState.shopName.trim();
          const seededProfile = { ...profile, tradingName: linkedName };
          dispatch(setShopProfile(seededProfile));
          void updateShopProfileApi({ tradingName: linkedName }).catch((err) => {
            console.warn('Failed to seed linked shop name to local backend:', err);
          });
        } else {
          dispatch(setShopProfile(profile));
        }
      })
      .catch((err) => {
        console.warn('Failed to load shop profile from backend:', err);
      });
  }, [isAuthenticated, dispatch, cloudState.linked, cloudState.shopName]);

  // When device is linked to a cloud account, seed trading name if current profile is still unset
  useEffect(() => {
    if (!isAuthenticated) return;
    if (cloudState.linked && cloudState.shopName?.trim()) {
      const linkedName = cloudState.shopName.trim();
      const currentName = shopProfile.tradingName?.trim();
      if (!currentName || currentName === 'SimpleBash POS') {
        dispatch(updateShopProfile({ tradingName: linkedName }));
        void updateShopProfileApi({ tradingName: linkedName }).catch((err) => {
          console.warn('Failed to seed linked shop name to local backend on cloud link:', err);
        });
      }
    }
  }, [isAuthenticated, cloudState.linked, cloudState.shopName, shopProfile.tradingName, dispatch]);

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

  const headerHeight = isBillingPage ? BILLING_HEADER_HEIGHT : SHELL_HEADER_HEIGHT;
  const navbarWidth = isBillingPage
    ? focusMode
      ? 0
      : SHELL_NAVBAR_RAIL_WIDTH
    : tier === 'tablet'
      ? SHELL_NAVBAR_RAIL_WIDTH
      : SHELL_NAVBAR_WIDTH;

  // On a phone the navbar is a drawer that takes no room, so the page never moves with it.
  useShellWidthTransition(navbarRef, mainRef, tier === 'mobile' ? 0 : navbarWidth, !reduceMotion);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <MantineAppShell
      header={{ height: headerHeight }}
      navbar={{
        width: navbarWidth,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: isBillingPage && focusMode },
      }}
      padding={isBillingPage ? 0 : { base: 'md', sm: '3xl' }}
      transitionDuration={isBillingBoundaryChange ? 0 : 180}
      transitionTimingFunction="cubic-bezier(0.22, 1, 0.36, 1)"
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
        <MantineAppShell.Navbar ref={navbarRef} bg="var(--bg-sidebar)">
          <Sidebar
            closeMobile={close}
            isRail={tier !== 'mobile' && (isBillingPage ? !focusMode : tier === 'tablet')}
            drawerOpen={opened}
          />
        </MantineAppShell.Navbar>
      )}

      <MantineAppShell.Main
        ref={mainRef}
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
        <LabelPrintOfferHost />
      </Suspense>

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
