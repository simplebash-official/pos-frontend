/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { HeldSalesDrawer } from '../HeldSalesDrawer';

installDrawerTestEnv();

const loadHeldCart = vi.fn();
const removeHeldCart = vi.fn();
let HELD: unknown[] = [];

vi.mock('../../hooks/useCart', () => ({
  useHeldCarts: () => ({ heldCarts: HELD, loadHeldCart, removeHeldCart }),
}));

// What each parked cart comes to is the server's answer, scripted here by cart id.
let ANSWERS: Record<string, number> = {};
vi.mock('../../hooks/useCheckout', () => ({
  useHeldCartTotals: (carts: Array<{ id: string }>) =>
    new Map(
      carts
        .filter((cart) => cart.id in ANSWERS)
        .map((cart) => [cart.id, { totalCents: ANSWERS[cart.id] }])
    ),
}));

const held = (id: string, label: string, hoursAgo: number, itemCount: number) => ({
  id,
  label,
  items: Array.from({ length: itemCount }, () => ({})),
  heldAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
});

describe('HeldSalesDrawer', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();

  beforeEach(() => {
    [onClose, loadHeldCart, removeHeldCart].forEach((fn) => fn.mockReset());
    HELD = [];
    ANSWERS = {};
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async () => {
    await act(async () => {
      root.render(
        <TestHarness role="staff">
          <HeldSalesDrawer opened onClose={onClose} />
        </TestHarness>
      );
    });
    // the age labels are filled in on the next tick
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label)
    ) as HTMLButtonElement | undefined;

  it('says how to park a sale when none are parked', async () => {
    await open();
    expect(text()).toContain('No sales currently parked');
    expect(text()).toContain('Parked / held sales');
  });

  it('shows the count and the combined value of the parked sales', async () => {
    HELD = [held('h1', 'Nimal', 0.1, 2), held('h2', 'Kamal', 0.2, 1)];
    ANSWERS = { h1: 14_000, h2: 20_000 };
    await open();
    expect(text()).toContain('2 parked');
    expect(text()).toContain('Rs. 340.00'); // the server's two totals added
  });

  it('lists each sale with its item count, total and age', async () => {
    HELD = [held('h1', 'Nimal', 0.1, 2)];
    ANSWERS = { h1: 14_000 };
    await open();
    expect(text()).toContain('Nimal');
    expect(text()).toContain('2 item(s)');
    expect(text()).toContain('Rs. 140.00');
    expect(text()).toContain('ago');
  });

  it('flags a sale parked for over two hours as stale, and not a fresh one', async () => {
    HELD = [held('h1', 'Old sale', 3, 1), held('h2', 'Fresh sale', 0.1, 1)];
    await open();
    expect(text().match(/Stale/g)).toHaveLength(1);
  });

  it('restores a sale to the cart and closes', async () => {
    HELD = [held('h1', 'Nimal', 0.1, 1)];
    await open();
    await act(async () => button('Restore to cart')!.click());
    expect(loadHeldCart).toHaveBeenCalledWith('h1');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('discards a held sale', async () => {
    HELD = [held('h1', 'Nimal', 0.1, 1)];
    await open();
    await act(async () =>
      (
        document.body.querySelector('button[aria-label="Discard held sale"]') as HTMLButtonElement
      ).click()
    );
    expect(removeHeldCart).toHaveBeenCalledWith('h1');
  });
});
