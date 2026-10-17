// One source of truth for how things move: short, compositor-only (opacity + transform).
import type { Transition } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1] as const;
export const DURATION = { fast: 0.15, base: 0.2 } as const;
/** The spring the tab pill and the sidebar pill glide with. */
export const SPRING: Transition = { type: 'spring', stiffness: 500, damping: 38 };
/** A later item in a list enters a touch later, capped so a long list still settles at once. */
export const STAGGER_STEP = 0.03;
export const STAGGER_CAP = 8;

export const staggerDelay = (index: number): number => Math.min(index, STAGGER_CAP) * STAGGER_STEP;

export interface MotionPresets {
  reduced: boolean;
  /** A fade+rise on enter; reduced motion keeps the fade only and does not move. */
  fadeUp: {
    initial: false | { opacity: number; y?: number };
    animate: { opacity: number; y: number };
  };
  /** A small pop (opacity + scale) for badges, ticks and counters. */
  pop: {
    initial: false | { opacity: number; scale: number };
    animate: { opacity: number; scale: number };
  };
  transition: Transition;
}

export const resolvePresets = (reduced: boolean): MotionPresets => ({
  reduced,
  fadeUp: {
    initial: reduced ? false : { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
  },
  pop: {
    initial: reduced ? false : { opacity: 0, scale: 0.85 },
    animate: { opacity: 1, scale: 1 },
  },
  transition: reduced ? { duration: 0 } : { duration: DURATION.base, ease: EASE },
});
