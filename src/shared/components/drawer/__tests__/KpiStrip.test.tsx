/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { IconBox } from '@tabler/icons-react';
import { installDrawerTestEnv } from '../testEnv';
import { TestHarness } from '../TestHarness';
import { DrawerScroll } from '../DrawerLayout';
import { KpiStrip, KpiTile } from '../KpiStrip';

installDrawerTestEnv();

const strip = (
  <KpiStrip>
    <KpiTile icon={<IconBox size={16} />} color="blue" label="Amount">
      Rs. 5.00
    </KpiTile>
  </KpiStrip>
);

describe('KpiStrip scrolling', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
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

  it('slides away on a downward scroll and comes back on an upward one', async () => {
    await show(<DrawerScroll>{strip}</DrawerScroll>);
    expect(kpis().dataset.hidden).toBe('false');
    expect(kpis().dataset.pinned).toBe('false');

    await scrollTo(120);
    expect(kpis().dataset.hidden).toBe('true');
    expect(kpis().dataset.pinned).toBe('true');
    expect(tiles().getAttribute('aria-hidden')).toBe('true');
    expect(tiles().hasAttribute('inert')).toBe(true);

    // A twitch inside the dead zone changes nothing.
    await scrollTo(117);
    expect(kpis().dataset.hidden).toBe('true');

    await scrollTo(90);
    expect(kpis().dataset.hidden).toBe('false');
    expect(kpis().dataset.pinned).toBe('true');
    expect(tiles().hasAttribute('inert')).toBe(false);

    await scrollTo(200);
    expect(kpis().dataset.hidden).toBe('true');

    // Back at the top it is simply where it rests.
    await scrollTo(0);
    expect(kpis().dataset.hidden).toBe('false');
    expect(kpis().dataset.pinned).toBe('false');
  });

  it('keeps still outside a drawer', async () => {
    await show(strip);
    expect(kpis().dataset.hidden).toBe('false');
    expect(kpis().dataset.pinned).toBe('false');
  });
});
