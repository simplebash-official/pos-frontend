/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

/**
 * Layout tiers used to pick between the desktop / tablet / mobile arrangements of a screen.
 *
 * - `mobile`  — below the `sm` breakpoint (phones)
 * - `tablet`  — between `sm` and `lg` (tablets and small laptops)
 * - `desktop` — `lg` and up (the POS terminal / full-size browser)
 */
export type LayoutTier = 'mobile' | 'tablet' | 'desktop';

/**
 * `visibleFrom`/`hiddenFrom` in Mantine subtract one pixel-ish step from the breakpoint so the
 * "below" and "at or above" queries never both match. Mirror that here so a JS tier check and a
 * CSS `visibleFrom` on the same breakpoint always agree.
 */
const below = (breakpoint: string): string => {
  return `(max-width: calc(${breakpoint} - 0.0625em))`;
};

/**
 * `getInitialValueInEffect: false` makes the query resolve during the first render instead of in an
 * effect. The default (`true`) would render the mobile tier for one frame on desktop, which on the
 * billing counter is a visible column-collapse flash.
 */
const MEDIA_QUERY_OPTIONS = { getInitialValueInEffect: false };

interface LayoutTierContextValue {
  tier: LayoutTier;
  isMobile: boolean;
}

const LayoutTierContext = createContext<LayoutTierContextValue | null>(null);

/**
 * Computes the layout tier exactly once for the whole app. `useLayoutTier`/`useIsMobile` read from
 * this context instead of each opening their own `useMediaQuery` subscription — with ~40 call sites,
 * independent subscriptions meant a single breakpoint crossing fired a synchronized re-render burst
 * across the whole tree at the same moment layout-dependent CSS transitions were trying to animate.
 */
export const LayoutTierProvider = ({ children }: { children: ReactNode }) => {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(below(theme.breakpoints.sm), false, MEDIA_QUERY_OPTIONS);
  const isBelowDesktop = useMediaQuery(below(theme.breakpoints.lg), false, MEDIA_QUERY_OPTIONS);

  const tier: LayoutTier = isMobile ? 'mobile' : isBelowDesktop ? 'tablet' : 'desktop';

  const value = useMemo(() => ({ tier, isMobile }), [tier, isMobile]);

  return <LayoutTierContext.Provider value={value}>{children}</LayoutTierContext.Provider>;
};

const useLayoutTierContext = (): LayoutTierContextValue => {
  const ctx = useContext(LayoutTierContext);
  if (!ctx) {
    throw new Error('useLayoutTier/useIsMobile must be used within a LayoutTierProvider');
  }
  return ctx;
};

export const useLayoutTier = (): LayoutTier => useLayoutTierContext().tier;

/** True below the `sm` breakpoint — the phone tier. */
export const useIsMobile = (): boolean => useLayoutTierContext().isMobile;
