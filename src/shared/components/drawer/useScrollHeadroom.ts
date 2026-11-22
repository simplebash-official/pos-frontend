import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

/** How far (px) the panel must scroll in one direction before the strip changes its mind. */
const DEAD_ZONE = 6;

export interface Headroom {
  /** Goes on the strip itself. */
  ref: RefObject<HTMLDivElement | null>;
  /** The strip has been scrolled down past and the last real movement was downward. */
  hidden: boolean;
  /** The strip has scrolled past its resting place and is pinned over the content. */
  pinned: boolean;
}

/**
 * Hides a drawer's headline strip when its panel scrolls down and brings it back when it scrolls
 * up (like a header that gets out of the way). The strip is pinned over the content while it is
 * away from its resting place, so showing and hiding it never moves the content under the
 * reader. Outside a drawer's scrolling area (`.rich-drawer-scroll`) it stays where it is.
 */
export const useScrollHeadroom = (): Headroom => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ hidden: false, pinned: false });

  useLayoutEffect(() => {
    const element = ref.current;
    const scroller = element?.closest<HTMLElement>('.rich-drawer-scroll') ?? null;
    if (element === null || scroller === null) return;

    // Where the strip rests, from the top of what scrolls. Read as if it were not pinned (static, with no
    // sticky offset), since pinning moves it. The strip itself is never transformed (its tiles slide inside it).
    const restingTop = () => {
      element.style.position = 'relative';
      element.style.top = 'auto';
      const rest =
        element.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
      element.style.position = '';
      element.style.top = '';
      return rest;
    };
    let origin = restingTop();
    let last = scroller.scrollTop;

    const onScroll = () => {
      const top = scroller.scrollTop;
      if (top <= origin) {
        last = top;
        setState((now) => (now.hidden || now.pinned ? { hidden: false, pinned: false } : now));
        return;
      }
      const moved = top - last;
      if (Math.abs(moved) < DEAD_ZONE) return;
      last = top;
      const hidden = moved > 0;
      setState((now) => (now.hidden === hidden && now.pinned ? now : { hidden, pinned: true }));
    };

    // The panel or the strip changing size (a rotated phone, a wider window, tiles wrapping to
    // two rows) moves where the strip rests.
    const observer = new ResizeObserver(() => {
      origin = restingTop();
    });
    observer.observe(scroller);
    observer.observe(element);

    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      observer.disconnect();
      scroller.removeEventListener('scroll', onScroll);
    };
  }, []);

  return { ref, ...state };
};
