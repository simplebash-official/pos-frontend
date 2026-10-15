/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useSidebarDensity } from '../sidebarDensity';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// How tall the list is at each density, against a bar whose height the test sets.
const CONTENT_HEIGHT = { comfortable: 160, compact: 120, dense: 90 } as const;
let barHeight = 100;
let observed: Element[] = [];

const Harness = ({ layout }: { layout: string }) => {
  const { ref, density } = useSidebarDensity(true);
  return <div key={layout} ref={ref} data-density={density} />;
};

describe('useSidebarDensity settles before paint', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    observed = [];
    // jsdom does no layout: derive the measurements from the density the element renders.
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get: () => barHeight,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get(this: HTMLElement) {
        return CONTENT_HEIGHT[this.dataset.density as keyof typeof CONTENT_HEIGHT];
      },
    });
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe(el: Element) {
        observed.push(el);
      }
      unobserve() {}
      disconnect() {}
    };
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const density = () => container.firstElementChild?.getAttribute('data-density');
  const render = (layout: string) => act(() => root.render(<Harness layout={layout} />));

  it('reaches the final density in one go, with no timers or animation frames', () => {
    barHeight = 100;
    render('full');
    expect(density()).toBe('dense');
  });

  it('stays comfortable when the list already fits', () => {
    barHeight = 200;
    render('full');
    expect(density()).toBe('comfortable');
  });

  it('settles again straight away when the mounted layout is swapped', () => {
    barHeight = 100;
    render('rail');
    barHeight = 100;
    render('full');
    expect(density()).toBe('dense');
    expect(observed.length).toBeGreaterThan(1);
  });
});
