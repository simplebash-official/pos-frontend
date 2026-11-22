/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useEffect, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IconBox } from '@tabler/icons-react';
import { installDrawerTestEnv } from '../testEnv';
import { TestHarness } from '../TestHarness';
import { DrawerScroll } from '../DrawerLayout';
import { KpiStrip, KpiTile } from '../KpiStrip';
import { useScrollHeadroom, type Headroom } from '../useScrollHeadroom';

installDrawerTestEnv();

const strip = (
  <KpiStrip>
    <KpiTile icon={<IconBox size={16} />} color="blue" label="Amount">
      Rs. 5.00
    </KpiTile>
    <KpiTile icon={<IconBox size={16} />} color="green" label="Profit">
      Rs. 2.00
    </KpiTile>
  </KpiStrip>
);

/** Shows the hook's own numbers, which a strip only paints through transforms. */
const seen: { current: Headroom | null } = { current: null };
const Probe = () => {
  const headroom = useScrollHeadroom();
  const { ref } = headroom;
  useEffect(() => {
    seen.current = headroom;
  });
  return <div ref={ref} className="probe" />;
};
const now = (): Headroom => {
  if (seen.current === null) throw new Error('the probe has not rendered');
  return seen.current;
};

describe('KpiStrip scrolling', () => {
  let container: HTMLDivElement;
  let root: Root;
  const realOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');

  beforeEach(() => {
    // The strip is 100px tall: a scroll of 25px moves it a quarter of the way.
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 100,
    });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    if (realOffsetHeight)
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', realOffsetHeight);
  });

  const show = async (node: ReactNode) => {
    await act(async () => {
      root.render(<TestHarness role="admin">{node}</TestHarness>);
    });
  };
  const kpis = () => document.body.querySelector<HTMLElement>('.rich-drawer-kpis')!;
  const tiles = () => document.body.querySelector<HTMLElement>('.rich-drawer-kpi-tiles')!;
  const scrollTo = async (top: number) => {
    const scroller = document.body.querySelector<HTMLElement>('.rich-drawer-scroll')!;
    Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: top });
    await act(async () => {
      scroller.dispatchEvent(new Event('scroll'));
    });
  };
  /** Longer than the pause after which the strip settles. */
  const pause = () => act(async () => new Promise((resolve) => setTimeout(resolve, 250)));

  it('follows the scroll one to one, in both directions', async () => {
    await show(
      <DrawerScroll>
        <Probe />
      </DrawerScroll>
    );
    expect(now().progress.get()).toBe(0);

    await scrollTo(25);
    expect(now().progress.get()).toBeCloseTo(0.25);
    await scrollTo(50);
    expect(now().progress.get()).toBeCloseTo(0.5);
    await scrollTo(40);
    expect(now().progress.get()).toBeCloseTo(0.4);
    expect(now().pinned).toBe(true);
    expect(now().hidden).toBe(false);
  });

  it('settles to the end in the direction last scrolled once the reader stops', async () => {
    await show(
      <DrawerScroll>
        <Probe />
      </DrawerScroll>
    );
    await scrollTo(30);
    await pause();
    expect(now().progress.get()).toBe(1);
    expect(now().hidden).toBe(true);

    // A small scroll back up completes: the tiles return.
    await scrollTo(20);
    expect(now().progress.get()).toBeCloseTo(0.9);
    await pause();
    expect(now().progress.get()).toBe(0);
    expect(now().hidden).toBe(false);
  });

  it('picks up from where it is when the reader reverses mid-way', async () => {
    await show(
      <DrawerScroll>
        <Probe />
      </DrawerScroll>
    );
    await scrollTo(60);
    await scrollTo(35);
    // No jump: 0.6 less a quarter.
    expect(now().progress.get()).toBeCloseTo(0.35);
  });

  it('is fully shown and unpinned again back at its resting place', async () => {
    await show(
      <DrawerScroll>
        <Probe />
      </DrawerScroll>
    );
    await scrollTo(80);
    await pause();
    expect(now().hidden).toBe(true);

    await scrollTo(0);
    await pause();
    expect(now().progress.get()).toBe(0);
    expect(now().pinned).toBe(false);
    expect(now().hidden).toBe(false);
  });

  it('keeps hidden tiles out of reach of the keyboard and screen readers', async () => {
    await show(<DrawerScroll>{strip}</DrawerScroll>);
    expect(kpis().dataset.hidden).toBe('false');
    expect(tiles().hasAttribute('inert')).toBe(false);

    await scrollTo(120);
    await pause();
    expect(kpis().dataset.hidden).toBe('true');
    expect(kpis().dataset.pinned).toBe('true');
    expect(tiles().getAttribute('aria-hidden')).toBe('true');
    expect(tiles().hasAttribute('inert')).toBe(true);
  });

  it('lets each tile leave a beat after the one before it', async () => {
    await show(<DrawerScroll>{strip}</DrawerScroll>);
    await scrollTo(50);
    const [first, second] = Array.from(
      document.body.querySelectorAll<HTMLElement>('.rich-drawer-kpi-slot')
    );
    await vi.waitFor(() => {
      expect(Number(first.style.opacity)).toBeLessThan(Number(second.style.opacity));
    });
  });

  it('keeps still outside a drawer', async () => {
    await show(strip);
    expect(kpis().dataset.hidden).toBe('false');
    expect(kpis().dataset.pinned).toBe('false');
  });
});
