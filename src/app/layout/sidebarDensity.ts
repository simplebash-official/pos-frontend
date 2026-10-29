import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Vertical-density tier for the standard (non-mobile) sidebar. The sidebar measures itself against
 * the navbar height and steps down this scale so its content fits without an internal scrollbar for
 * as long as possible; `dense` is the floor, below which the root `overflowY: 'auto'` takes over.
 */
export type SidebarDensity = 'comfortable' | 'compact' | 'dense';

const ORDER: SidebarDensity[] = ['comfortable', 'compact', 'dense'];

export interface SidebarDensityPreset {
  /** Outer `Stack` padding — Mantine spacing token. */
  rootPad: string;
  /** Gap between category groups — Mantine spacing token. */
  groupGap: string;
  /** Gap between items within a category — px. */
  itemGap: number;
  /** NavLink vertical padding — px. */
  navlinkPy: number;
}

export const SIDEBAR_DENSITY_PRESETS: Record<SidebarDensity, SidebarDensityPreset> = {
  comfortable: {
    rootPad: 'sm',
    groupGap: 'sm',
    itemGap: 4,
    navlinkPy: 8,
  },
  compact: {
    rootPad: 'xs',
    groupGap: 'xs',
    itemGap: 4,
    navlinkPy: 6,
  },
  dense: {
    rootPad: 'xs',
    groupGap: 'xs',
    itemGap: 3,
    navlinkPy: 4,
  },
};

/** The next-denser tier, saturating at `dense`. */
export const denser = (d: SidebarDensity): SidebarDensity =>
  ORDER[Math.min(ORDER.indexOf(d) + 1, ORDER.length - 1)];

/** The next-looser tier, saturating at `comfortable`. */
export const looser = (d: SidebarDensity): SidebarDensity =>
  ORDER[Math.max(ORDER.indexOf(d) - 1, 0)];

/** Pure one-step transition: compress when overflowing, otherwise hold. */
export const stepDensity = (current: SidebarDensity, isOverflowing: boolean): SidebarDensity =>
  isOverflowing ? denser(current) : current;

export interface SidebarDensityResult {
  /** Callback ref — attach to the scroll container of whichever sidebar layout is mounted. */
  ref: (el: HTMLDivElement | null) => void;
  density: SidebarDensity;
}

interface DensityBox {
  el: HTMLDivElement | null;
  ro: ResizeObserver | null;
  timer: number;
  lastAvail: number;
  ceiling: SidebarDensity | null;
  density: SidebarDensity;
  pending: SidebarDensity | null;
  enabled: boolean;
}

/** Quiet window after the last resize event before the tier is allowed to change, in ms. */
const SETTLE_DELAY = 120;
/** Height jitter (px) below which the anti-oscillation ceiling is kept rather than reset. */
const AVAIL_DEADZONE = 4;

/**
 * Picks the sidebar density by measuring the attached scroll container against its own content.
 *
 * All the observer wiring lives in a mutable box behind a callback ref, never in React state, so
 * swapping the mounted layout (standard ↔ rail) re-attaches the `ResizeObserver` without any render
 * feedback.
 *
 * **Resize behaviour:** a `ResizeObserver` event only *debounces* a re-evaluation (`SETTLE_DELAY`
 * after the last event) — so while the window is being dragged the tier is frozen and the sidebar
 * does not re-render. Once quiet, `evaluate` runs and self-drives the multi-step settle (each step
 * re-measures in a layout effect, before paint):
 *
 *  - overflowing → step denser, and remember this tier as a `ceiling` never to loosen back into
 *  - fits        → step looser, unless the looser tier is the known ceiling for this height
 *
 * The ceiling clears only when the available height changes by more than `AVAIL_DEADZONE`, so
 * stepping down and stepping up are disjoint and the value converges without oscillating. The first
 * measurement (on ref attach) runs immediately, with no debounce, to avoid a flash of the wrong
 * tier on load.
 *
 * Pass `enabled = false` (mobile, where the navbar is a full-screen drawer that may scroll freely)
 * to skip measurement and always report `comfortable`.
 */
export function useSidebarDensity(enabled: boolean, contentKey: string): SidebarDensityResult {
  const [density, setDensity] = useState<SidebarDensity>('comfortable');
  const box = useRef<DensityBox>({
    el: null,
    ro: null,
    timer: 0,
    lastAvail: -1,
    ceiling: null,
    density,
    pending: null,
    enabled,
  });

  useLayoutEffect(() => {
    box.current.density = density;
    box.current.pending = null;
  }, [density]);
  useLayoutEffect(() => {
    box.current.enabled = enabled;
  }, [enabled]);

  // One measure-and-maybe-step pass. Named function expression so it can re-schedule itself
  // without a forward reference. `setDensity` and `box` are stable, so `[]` deps are correct.
  const evaluate = useCallback(function evaluate() {
    const b = box.current;
    const el = b.el;
    if (!el || !b.enabled) return;
    if (b.pending !== null && b.pending !== b.density) return;

    const avail = el.clientHeight;
    if (avail === 0) return;
    if (Math.abs(avail - b.lastAvail) > AVAIL_DEADZONE) {
      b.lastAvail = avail;
      b.ceiling = null;
    }

    let next = b.density;
    if (el.scrollHeight > avail + 1) {
      if (b.density !== 'dense') {
        b.ceiling = b.density;
        next = denser(b.density);
      }
    } else {
      const up = looser(b.density);
      if (up !== b.density && up !== b.ceiling) next = up;
    }

    if (next === b.density) return;
    // Step; the layout effect below re-measures once this render has committed, still before paint.
    b.pending = next;
    setDensity(next);
  }, []);

  // When contentKey changes (sections fold/unfold, item counts change), clear stale ceilings
  // and evaluate immediately before browser paint.
  useLayoutEffect(() => {
    window.clearTimeout(box.current.timer);
    box.current.ceiling = null;
    box.current.pending = null;
    evaluate();
  }, [contentKey, evaluate]);

  // Keep settling until it fits, inside the same frame: an update made in the layout phase is
  // flushed before the browser paints, so only the final density is ever seen (an animation-frame
  // step would paint each intermediate one — the flicker when the rail swaps for the full list).
  useLayoutEffect(() => {
    evaluate();
  }, [density, evaluate]);

  // A resize event never changes the tier directly — it only (re)arms a short quiet timer. While
  // the window is being dragged the timer keeps resetting and nothing re-renders; the tier settles
  // once, `SETTLE_DELAY` after the drag stops.
  const scheduleDebounced = useCallback(() => {
    const b = box.current;
    window.clearTimeout(b.timer);
    b.timer = window.setTimeout(evaluate, SETTLE_DELAY);
  }, [evaluate]);

  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      const b = box.current;
      b.ro?.disconnect();
      b.ro = null;
      window.clearTimeout(b.timer);
      b.el = el;
      b.lastAvail = -1;
      b.ceiling = null;
      b.pending = null;
      if (!el) return;

      b.ro = new ResizeObserver(scheduleDebounced);
      b.ro.observe(el);
      if (el.firstElementChild) b.ro.observe(el.firstElementChild);
      evaluate(); // first pass is immediate — no flash of the wrong tier on load
    },
    [evaluate, scheduleDebounced]
  );

  useEffect(() => {
    const b = box.current;
    return () => {
      b.ro?.disconnect();
      window.clearTimeout(b.timer);
    };
  }, []);

  return { ref, density: enabled ? density : 'comfortable' };
}
