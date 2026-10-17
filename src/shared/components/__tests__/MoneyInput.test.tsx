/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { MoneyInput } from '../MoneyInput';

const Harness = ({ start, spy }: { start: number; spy: (c: number) => void }) => {
  const [cents, setCents] = useState(start);
  return (
    <MantineProvider>
      <MoneyInput
        valueCents={cents}
        onChangeCents={(c) => {
          spy(c);
          setCents(c);
        }}
      />
      <button type="button" onClick={() => setCents(0)}>
        reset
      </button>
    </MantineProvider>
  );
};

describe('MoneyInput', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    // Mantine reads matchMedia for the colour scheme.
    window.matchMedia ??= ((q: string) => ({
      matches: false,
      media: q,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const input = () => container.querySelector('input') as HTMLInputElement;
  const type = async (value: string) => {
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input(), value);
      input().dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  it('is empty at zero and shows the Rs. 0.00 placeholder', async () => {
    await act(async () => root.render(<Harness start={0} spy={vi.fn()} />));
    expect(input().value).toBe('');
    expect(input().placeholder).toBe('Rs. 0.00');
  });

  it('shows the Rs. prefix once an amount is typed, in cents', async () => {
    const spy = vi.fn();
    await act(async () => root.render(<Harness start={0} spy={spy} />));
    await type('Rs. 25');
    expect(spy).toHaveBeenLastCalledWith(2500);
    expect(input().value).toContain('Rs.');
  });

  it('shows an amount it is given', async () => {
    await act(async () => root.render(<Harness start={12050} spy={vi.fn()} />));
    expect(input().value).toBe('Rs. 120.50');
  });

  it('clears when the parent sets the amount back to zero', async () => {
    await act(async () => root.render(<Harness start={5000} spy={vi.fn()} />));
    await act(async () =>
      Array.from(container.querySelectorAll('button'))
        .find((b) => b.textContent === 'reset')!
        .click()
    );
    expect(input().value).toBe('');
  });
});
