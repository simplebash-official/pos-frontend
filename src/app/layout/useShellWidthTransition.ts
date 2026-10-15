import { useLayoutEffect, useRef, type RefObject } from 'react';

const DURATION_MS = 220;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Makes a change of the navbar's width (standard page ↔ Billing, or crossing the desktop/tablet
 * breakpoint) look smooth without animating any layout property.
 *
 * The shell still lays out once, at the new width. Then, on the compositor/paint side only:
 *  - `Main` starts translated back to where its left edge was and slides to its new place
 *    (`transform`), and
 *  - the navbar is wiped open or shut with a `clip-path` (when it shrinks it is first kept at its
 *    old width so there is something to wipe away).
 * A navbar that collapses to or opens from nothing (Billing focus mode) is already slid by Mantine's
 * own `transform`, so only `Main` is handled there.
 */
export const useShellWidthTransition = (
  navbarRef: RefObject<HTMLElement | null>,
  mainRef: RefObject<HTMLElement | null>,
  navbarWidth: number,
  enabled: boolean
): void => {
  const previousWidth = useRef(navbarWidth);

  useLayoutEffect(() => {
    const from = previousWidth.current;
    previousWidth.current = navbarWidth;
    const main = mainRef.current;
    const navbar = navbarRef.current;
    if (!enabled || from === navbarWidth || !main) return;

    const delta = from - navbarWidth;
    const options: KeyframeAnimationOptions = { duration: DURATION_MS, easing: EASING };
    const animations: Animation[] = [
      main.animate(
        [{ transform: `translateX(${delta}px)` }, { transform: 'translateX(0)' }],
        options
      ),
    ];

    // The shifted page must not make the document scroll sideways while it slides.
    const root = document.documentElement;
    const previousOverflow = root.style.overflowX;
    root.style.overflowX = 'clip';

    let restoreWidth = false;
    if (navbar && from > 0 && navbarWidth > 0) {
      if (delta > 0) {
        navbar.style.width = `${from}px`;
        restoreWidth = true;
        animations.push(
          navbar.animate(
            [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: `inset(0 ${delta}px 0 0)` }],
            options
          )
        );
      } else {
        animations.push(
          navbar.animate(
            [{ clipPath: `inset(0 ${-delta}px 0 0)` }, { clipPath: 'inset(0 0 0 0)' }],
            options
          )
        );
      }
    }

    const finish = () => {
      if (restoreWidth) navbar!.style.width = '';
      root.style.overflowX = previousOverflow;
    };
    // A later width change cleans this one up itself; its late promise must not undo the new run.
    let cleanedUp = false;
    Promise.allSettled(animations.map((a) => a.finished)).then(() => {
      if (!cleanedUp) finish();
    });

    return () => {
      cleanedUp = true;
      animations.forEach((a) => a.cancel());
      finish();
    };
  }, [navbarWidth, enabled, navbarRef, mainRef]);
};
