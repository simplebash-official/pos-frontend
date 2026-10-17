/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { resolvePresets, staggerDelay, STAGGER_CAP, STAGGER_STEP } from '../presets';
import { AnimatedNumber } from '../AnimatedNumber';

installDrawerTestEnv();

describe('presets', () => {
  it('drops movement and time for reduced motion', () => {
    const p = resolvePresets(true);
    expect(p.fadeUp.initial).toBe(false);
    expect(p.pop.initial).toBe(false);
    expect(p.transition).toEqual({ duration: 0 });
  });

  it('moves a little by default', () => {
    expect(resolvePresets(false).fadeUp.initial).toEqual({ opacity: 0, y: 6 });
  });

  it('caps the stagger', () => {
    expect(staggerDelay(100)).toBeCloseTo(STAGGER_CAP * STAGGER_STEP);
    expect(staggerDelay(0)).toBe(0);
  });
});

describe('AnimatedNumber', () => {
  it('shows the formatted value and follows changes', async () => {
    const el = document.createElement('div');
    const root = createRoot(el);
    const fmt = (v: number) => `Rs. ${v.toFixed(2)}`;
    await act(async () => root.render(<AnimatedNumber value={5} format={fmt} />));
    expect(el.textContent).toBe('Rs. 5.00');
    await act(async () => root.render(<AnimatedNumber value={9} format={fmt} />));
    await act(async () => new Promise((r) => setTimeout(r, 50)));
    expect(el.textContent).toBe('Rs. 9.00');
    await act(async () => root.unmount());
  });
});
