/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { notificationSlice } from '@/store/slices/notificationSlice';
import { BillReminderNotifier } from '../BillReminderNotifier';
import type { RecurringBill } from '../../types';

let BILLS: RecurringBill[] = [];
let PERMISSIONS: string[] = ['expenses:view'];

vi.mock('@/features/expenses/hooks/useRecurring', () => ({
  useRecurringBills: (_inactive: boolean, enabled: boolean) => ({
    data: enabled ? BILLS : undefined,
  }),
}));

const bill = (key: string, status: RecurringBill['status'], period = '2026-10'): RecurringBill => ({
  template: {
    id: key,
    key,
    categoryKey: 'c',
    categoryName: 'Shop rent',
    amountCents: 5_000_000,
    dueDay: 5,
    remindDaysBefore: 3,
    paidFrom: 'bank',
    active: true,
    version: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  period,
  dueDate: `${period}-05`,
  daysUntilDue: status === 'overdue' ? -2 : 1,
  paidCents: 0,
  balanceCents: 5_000_000,
  status,
  payments: [],
});

describe('BillReminderNotifier', () => {
  let container: HTMLDivElement;
  let root: Root;
  let store: ReturnType<typeof makeStore>;

  const makeStore = () =>
    configureStore({
      reducer: {
        auth: () => ({
          isAuthenticated: true,
          user: { id: 'u', name: 'T', username: 't', role: 'manager', permissions: PERMISSIONS },
        }),
        notifications: notificationSlice.reducer,
      },
    });

  const mount = async () => {
    await act(async () => {
      root.render(
        <Provider store={store}>
          <BillReminderNotifier />
        </Provider>
      );
    });
  };

  beforeEach(() => {
    localStorage.clear();
    PERMISSIONS = ['expenses:view'];
    store = makeStore();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('adds one reminder per due or overdue bill, linked to its payment', async () => {
    BILLS = [bill('rexp_a', 'overdue'), bill('rexp_b', 'due'), bill('rexp_c', 'upcoming')];
    await mount();
    const items = store.getState().notifications.items;
    expect(items).toHaveLength(2);
    const overdue = items.find((n) => n.id === 'bill-rexp_a-2026-10-overdue');
    expect(overdue?.priority).toBe('urgent');
    expect(overdue?.link).toBe('/expenses?pay=rexp_a');
    expect(items.find((n) => n.id === 'bill-rexp_b-2026-10-due')?.priority).toBe('normal');
  });

  it('does not repeat a reminder on a re-render', async () => {
    BILLS = [bill('rexp_d', 'due')];
    await mount();
    await mount();
    expect(store.getState().notifications.items).toHaveLength(1);
  });

  it('reminds again when the same bill turns overdue', async () => {
    BILLS = [bill('rexp_e', 'due')];
    await mount();
    BILLS = [bill('rexp_e', 'overdue')];
    await act(async () => root.unmount());
    root = createRoot(container);
    await mount();
    expect(
      store
        .getState()
        .notifications.items.map((n) => n.id)
        .sort()
    ).toEqual(['bill-rexp_e-2026-10-due', 'bill-rexp_e-2026-10-overdue']);
  });

  it('stays quiet without the expenses permission', async () => {
    PERMISSIONS = ['inventory:read'];
    store = makeStore();
    BILLS = [bill('rexp_f', 'overdue')];
    await mount();
    expect(store.getState().notifications.items).toHaveLength(0);
  });
});
