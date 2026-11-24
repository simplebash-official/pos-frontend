/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { LineHandoverControl } from '../LineHandoverControl';
import type { Handover } from '../../types';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

const render = (
  value: Handover | null,
  onChange: (h: Handover) => void = () => undefined,
  disabled = false
) => {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  act(() => {
    root?.render(
      <MantineProvider>
        <LayoutTierProvider>
          <LineHandoverControl
            value={value}
            ticketNumber="REP-000002"
            onChange={onChange}
            disabled={disabled}
          />
        </LayoutTierProvider>
      </MantineProvider>
    );
  });
  return host;
};

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

const button = (label: string) =>
  document.querySelector<HTMLButtonElement>(`button[aria-label="${label}: REP-000002"]`);

describe('LineHandoverControl', () => {
  it('shows the chosen option as pressed and says what it does', () => {
    render('later');
    expect(button('Later')?.getAttribute('aria-pressed')).toBe('true');
    expect(button('Now')?.getAttribute('aria-pressed')).toBe('false');
    expect(document.body.textContent).toContain('It stays in the shop');
  });

  it('presses nothing and asks for a choice while the sale is on credit and nothing is chosen', () => {
    render(null);
    expect(button('Now')?.getAttribute('aria-pressed')).toBe('false');
    expect(button('Later')?.getAttribute('aria-pressed')).toBe('false');
    expect(document.body.textContent).toContain('Choose one to continue.');
  });

  it('keeps the choice but cannot be changed once the sale is done', () => {
    const onChange = vi.fn();
    render('later', onChange, true);
    expect(button('Later')?.getAttribute('aria-pressed')).toBe('true');
    expect(button('Now')?.disabled).toBe(true);
    act(() => button('Now')?.click());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports the option the cashier taps', () => {
    const onChange = vi.fn();
    render(null, onChange);
    act(() => button('Later')?.click());
    expect(onChange).toHaveBeenCalledWith('later');
    act(() => button('Now')?.click());
    expect(onChange).toHaveBeenCalledWith('now');
  });
});
