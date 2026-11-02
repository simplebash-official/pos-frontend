/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useColorSchemeReveal } from '../useColorSchemeReveal';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockSetColorScheme = vi.fn();
let mockReduceMotion = false;

vi.mock('@mantine/core', () => ({
  useMantineColorScheme: () => ({ setColorScheme: mockSetColorScheme }),
}));
vi.mock('framer-motion', () => ({
  useReducedMotion: () => mockReduceMotion,
}));

let reveal: ReturnType<typeof useColorSchemeReveal>;
const Probe = () => {
  const value = useColorSchemeReveal();
  useEffect(() => {
    reveal = value;
  });
  return null;
};

/** A button whose box is `rect`; the circle must grow from its centre. */
const buttonAt = (rect: { left: number; top: number; width: number; height: number }) => {
  const el = document.createElement('button');
  el.getBoundingClientRect = () => ({ ...rect }) as DOMRect;
  return el;
};

let root: Root;
let animate: ReturnType<typeof vi.fn>;
let startViewTransition: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  mockSetColorScheme.mockReset();
  mockReduceMotion = false;
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1000 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
  // jsdom has neither API: run the update callback at once, like the browser does.
  startViewTransition = vi.fn((update: () => void) => {
    update();
    return { ready: Promise.resolve() };
  });
  animate = vi.fn();
  Object.defineProperty(document, 'startViewTransition', {
    configurable: true,
    value: startViewTransition,
  });
  Object.defineProperty(document.documentElement, 'animate', {
    configurable: true,
    value: animate,
  });
  root = createRoot(document.createElement('div'));
  await act(async () => root.render(<Probe />));
});

afterEach(() => {
  act(() => root.unmount());
});

const flush = () => act(async () => {});

describe('useColorSchemeReveal', () => {
  it('switches the scheme inside a view transition', async () => {
    reveal('dark', buttonAt({ left: 0, top: 0, width: 0, height: 0 }));
    await flush();
    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(mockSetColorScheme).toHaveBeenCalledWith('dark');
  });

  it('grows the new view as a circle from the control centre to the farthest corner', async () => {
    // Centre (110, 70): the farthest corner is the bottom right (1000, 800).
    reveal('light', buttonAt({ left: 100, top: 60, width: 20, height: 20 }));
    await flush();
    const radius = Math.hypot(890, 730);
    expect(animate).toHaveBeenCalledWith(
      { clipPath: ['circle(0px at 110px 70px)', `circle(${radius}px at 110px 70px)`] },
      {
        duration: 800,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  });

  it('reaches every corner when started from the middle of the screen', async () => {
    reveal('auto', buttonAt({ left: 490, top: 390, width: 20, height: 20 }));
    await flush();
    const [keyframes] = animate.mock.calls[0];
    expect(keyframes.clipPath[1]).toBe(`circle(${Math.hypot(500, 400)}px at 500px 400px)`);
  });

  it('swaps at once without the circle when the person asks for less motion', async () => {
    mockReduceMotion = true;
    await act(async () => root.render(<Probe key="reduced" />));
    reveal('dark', buttonAt({ left: 0, top: 0, width: 10, height: 10 }));
    await flush();
    expect(mockSetColorScheme).toHaveBeenCalledWith('dark');
    expect(animate).not.toHaveBeenCalled();
  });
});
