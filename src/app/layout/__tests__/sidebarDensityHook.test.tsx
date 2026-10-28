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
const EXPANDED_HEIGHT = { comfortable: 160, compact: 120, dense: 90 } as const;
const COLLAPSED_HEIGHT = { comfortable: 70, compact: 60, dense: 50 } as const;
let contentMode: 'expanded' | 'collapsed' = 'expanded';
let barHeight = 100;
let observed: Element[] = [];

const Harness = ({ layout, contentKey }: { layout: string; contentKey: string }) => {
  const { ref, density } = useSidebarDensity(true, contentKey);
  return <div key={layout} ref={ref} data-density={density} />;
};

describe('useSidebarDensity settles before paint', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    observed = [];
    contentMode = 'expanded';
    // jsdom does no layout: derive the measurements from the density the element renders.
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get: () => barHeight,
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get(this: HTMLElement) {
        const heights = contentMode === 'collapsed' ? COLLAPSED_HEIGHT : EXPANDED_HEIGHT;
        return heights[this.dataset.density as keyof typeof heights];
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
  const render = (layout: string, contentKey: string) =>
    act(() => root.render(<Harness layout={layout} contentKey={contentKey} />));

  it('reaches the final density in one go, with no timers or animation frames', () => {
    barHeight = 100;
    render('full', 'full:7:0::0');
    expect(density()).toBe('dense');
  });

  it('stays comfortable when the list already fits', () => {
    barHeight = 200;
    render('full', 'full:7:0::0');
    expect(density()).toBe('comfortable');
  });

  it('settles again straight away when the mounted layout is swapped', () => {
    barHeight = 100;
    render('rail', 'rail:7:0::0');
    barHeight = 100;
    render('full', 'full:7:0::0');
    expect(density()).toBe('dense');
    expect(observed.length).toBeGreaterThan(1);
  });

  it('collapsing all after expanding all restores comfortable density', () => {
    barHeight = 100;
    // 1. Initial render with all sections expanded (overflows comfortable and compact, settles to dense)
    contentMode = 'expanded';
    render('full', 'full:7:0::0');
    expect(density()).toBe('dense');

    // 2. Collapse all sections (content shrinks, fits within barHeight)
    contentMode = 'collapsed';
    render('full', 'full:7:7:overview,billing,inventory:0');
    expect(density()).toBe('comfortable');

    // 3. Expand all again -> steps back down to dense
    contentMode = 'expanded';
    render('full', 'full:7:0::0');
    expect(density()).toBe('dense');

    // 4. Collapse all again -> restores comfortable density
    contentMode = 'collapsed';
    render('full', 'full:7:7:overview,billing,inventory:0');
    expect(density()).toBe('comfortable');
  });

  it('does not oscillate into infinite render loop when compact tier fits with > 100px headroom', () => {
    // Custom scrollHeight mapping where comfortable overflows 250, but compact is 140 (110px headroom > 100px)
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get(this: HTMLElement) {
        const heights = { comfortable: 260, compact: 140, dense: 90 };
        return heights[this.dataset.density as keyof typeof heights];
      },
    });

    barHeight = 250;
    render('full', 'full:7:0::0');
    expect(density()).toBe('compact');
  });
});
