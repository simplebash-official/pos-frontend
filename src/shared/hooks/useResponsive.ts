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
function below(breakpoint: string): string {
  return `(max-width: calc(${breakpoint} - 0.0625em))`;
}

/**
 * `getInitialValueInEffect: false` makes the query resolve during the first render instead of in an
 * effect. The default (`true`) would render the mobile tier for one frame on desktop, which on the
 * billing counter is a visible column-collapse flash.
 */
const MEDIA_QUERY_OPTIONS = { getInitialValueInEffect: false };

export function useLayoutTier(): LayoutTier {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(below(theme.breakpoints.sm), false, MEDIA_QUERY_OPTIONS);
  const isBelowDesktop = useMediaQuery(below(theme.breakpoints.lg), false, MEDIA_QUERY_OPTIONS);

  if (isMobile) {
    return 'mobile';
  }
  if (isBelowDesktop) {
    return 'tablet';
  }
  return 'desktop';
}

/** True below the `sm` breakpoint — the phone tier. */
export function useIsMobile(): boolean {
  const theme = useMantineTheme();
  return useMediaQuery(below(theme.breakpoints.sm), false, MEDIA_QUERY_OPTIONS);
}
