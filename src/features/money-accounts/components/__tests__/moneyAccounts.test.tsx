/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { MoneyAccountsPage } from '../MoneyAccountsPage';
import type { AccountSummary } from '../../types';

installDrawerTestEnv();

const ACCOUNTS: AccountSummary[] = [
  { kind: 'drawer', balanceCents: 485_000 },
  {
    kind: 'bank',
    openingBalanceCents: 1_000_000,
    asOfDate: '2026-10-01',
    balanceCents: 1_480_000,
    activity: {
      salesCents: 0,
      refundsCents: 0,
      incomeCents: 450_000,
      expensesCents: 120_000,
      depositsCents: 200_000,
      withdrawalsCents: 50_000,
    },
  },
  { kind: 'card' },
  { kind: 'online' },
];

const setOpening = { mutateAsync: vi.fn(), isPending: false };

vi.mock('@/features/money-accounts/hooks/useAccounts', () => ({
  useAccounts: () => ({ data: { accounts: ACCOUNTS }, isLoading: false }),
  useSetAccountOpening: () => setOpening,
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const Harness = ({ permissions, children }: { permissions: string[]; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role: 'admin', permissions },
        }),
      },
    })
  );
  const [queryClient] = useState(() => new QueryClient());
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider env="test">
          <LayoutTierProvider>{children}</LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const VIEW = ['accounts:view'];
const MANAGE = ['accounts:view', 'accounts:manage'];

describe('Money accounts', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    setOpening.mutateAsync.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (permissions: string[]) => {
    await act(async () => {
      root.render(
        <Harness permissions={permissions}>
          <MoneyAccountsPage />
        </Harness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      (b.textContent ?? '').trim().startsWith(label)
    );

  it('shows each balance and where the bank balance came from', async () => {
    await render(MANAGE);
    expect(text()).toContain('Rs. 4,850.00');
    expect(text()).toContain('Rs. 14,800.00');
    expect(text()).toContain('Cash taken to the bank');
    expect(text()).toContain('+ Rs. 2,000.00');
    expect(text()).toContain('− Rs. 1,200.00');
    expect(text()).toContain('Not set up yet.');
  });

  it('lets only the owner set where an account started', async () => {
    await render(MANAGE);
    expect(button('Set opening balance')).toBeTruthy();
    expect(button('Change opening balance')).toBeTruthy();

    act(() => root.unmount());
    root = createRoot(container);
    await render(VIEW);
    expect(button('Set opening balance')).toBeUndefined();
    expect(button('Change opening balance')).toBeUndefined();
    expect(text()).toContain('The owner can set where this account started.');
  });

  it('saves an opening balance for the account that was picked', async () => {
    setOpening.mutateAsync.mockResolvedValue({});
    await render(MANAGE);
    await act(async () => button('Set opening balance')!.click());
    expect(text()).toContain('Opening balance — Card');
    await act(async () => {
      document.body
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(setOpening.mutateAsync).toHaveBeenCalledTimes(1);
    const call = setOpening.mutateAsync.mock.calls[0][0];
    expect(call.kind).toBe('card');
    expect(call.input.openingBalanceCents).toBe(0);
    expect(call.input.asOfDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
