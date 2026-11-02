import { flushSync } from 'react-dom';
import { useMantineColorScheme, type MantineColorScheme } from '@mantine/core';
import { useReducedMotion } from 'framer-motion';

const REVEAL_MS = 800;

/**
 * Circular reveal theme switch: the new scheme grows out of the centre of `origin`
 * (the control that was used) until it covers the screen, via the View Transitions API.
 */
export const useColorSchemeReveal = () => {
  const { setColorScheme } = useMantineColorScheme();
  const reduceMotion = useReducedMotion();

  return (next: MantineColorScheme, origin: HTMLElement) => {
    const { left, top, width, height } = origin.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    // flushSync: the new scheme must be in the DOM before the "new" snapshot is taken.
    const transition = document.startViewTransition(() => flushSync(() => setColorScheme(next)));
    if (reduceMotion) return;

    void transition.ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: REVEAL_MS,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    );
  };
};
