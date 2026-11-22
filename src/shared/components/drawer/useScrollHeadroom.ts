import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { animate, useMotionValue, useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useMotionPresets } from '@/shared/motion';

/** How long (ms) after the last scroll the strip settles to its shown or hidden end. */
const SETTLE_IDLE_MS = 120;
/** A reduced-motion reader gets no travelling strip: it flips once the panel moves this far (px). */
const REDUCED_STEP = 6;

export interface Headroom {
  /** Goes on the strip itself. */
  ref: RefObject<HTMLDivElement | null>;
  /** 0 while the tiles are shown, 1 once hidden, anything between while the reader scrolls. */
  progress: MotionValue<number>;
  /** How far (px) the tiles travel to get fully out of view. */
  distance: MotionValue<number>;
  /** The tiles are settled out of view. */
  hidden: boolean;
  /** The strip has scrolled past its resting place and is pinned over the content. */
  pinned: boolean;
  /** The reader asked for reduced motion: no travelling, only fading. */
  reduced: boolean;
}

/**
 * Drives a drawer's headline strip like a scroll-linked header: while the panel scrolls, the tiles
 * follow it one to one (down takes them away, up brings them back); when scrolling stops they
 * settle to the nearer end, in the direction last scrolled, with a spring that carries on from
 * wherever they were, so a reversal mid-way never jolts. The strip is pinned over the content
 * while away from its resting place, so none of this moves the content under the reader. Outside
 * a drawer's scrolling area (`.rich-drawer-scroll`) it stays where it is.
 */
export const useScrollHeadroom = (): Headroom => {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const distance = useMotionValue(0);
  const { settle, reduced } = useMotionPresets();
  const [hidden, setHidden] = useState(false);
  const [pinned, setPinned] = useState(false);

  useMotionValueEvent(progress, 'change', (value) => {
    const away = value >= 0.99;
    setHidden((now) => (now === away ? now : away));
  });

  useLayoutEffect(() => {
    const element = ref.current;
    const scroller = element?.closest<HTMLElement>('.rich-drawer-scroll') ?? null;
    if (element === null || scroller === null) return;

    // Where the strip rests, from the top of what scrolls. Read as if it were not pinned (static,
    // with no sticky offset), since pinning moves it. The strip itself is never transformed (its
    // tiles move inside it).
    const measure = () => {
      element.style.position = 'relative';
      element.style.top = 'auto';
      const rest =
        element.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
      element.style.position = '';
      element.style.top = '';
      distance.set(element.offsetHeight);
      return rest;
    };
    let origin = measure();
    let last = scroller.scrollTop;
    let direction = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let settling: { stop: () => void } | undefined;

    const stopSettling = () => {
      clearTimeout(timer);
      settling?.stop();
    };
    const settleTo = (target: 0 | 1) => {
      settling?.stop();
      settling = animate(progress, target, settle);
    };

    const onScroll = () => {
      const top = scroller.scrollTop;
      const moved = top - last;
      last = top;
      stopSettling();

      if (top <= origin) {
        // Back where it rests: it travels with the content again and is fully shown.
        setPinned(false);
        if (progress.get() !== 0) settleTo(0);
        return;
      }
      setPinned(true);
      if (moved === 0) return;
      direction = moved > 0 ? 1 : 0;

      if (reduced) {
        if (Math.abs(moved) >= REDUCED_STEP) settleTo(direction === 1 ? 1 : 0);
        return;
      }
      progress.set(Math.min(1, Math.max(0, progress.get() + moved / Math.max(distance.get(), 1))));
      timer = setTimeout(() => settleTo(direction === 1 ? 1 : 0), SETTLE_IDLE_MS);
    };

    // The panel or the strip changing size (a rotated phone, a wider window, tiles wrapping to
    // two rows) moves where the strip rests and how far its tiles have to travel.
    const observer = new ResizeObserver(() => {
      origin = measure();
    });
    observer.observe(scroller);
    observer.observe(element);

    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      stopSettling();
      observer.disconnect();
      scroller.removeEventListener('scroll', onScroll);
    };
  }, [distance, progress, reduced, settle]);

  return { ref, progress, distance, hidden, pinned, reduced };
};
