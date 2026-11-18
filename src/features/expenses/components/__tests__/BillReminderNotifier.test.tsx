/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BillReminderNotifier } from '../BillReminderNotifier';
import type { RecurringBill } from '../../types';

let BILLS: RecurringBill[] = [];
let PERMISSIONS: string[] = ['expenses:view', 'notifications:view'];
const raised: Array<Record<string, unknown>> = [];
let failNext = false;

vi.mock('@/features/expenses/hooks/useRecurring', () => ({
  useRecurringBills: (_inactive: boolean, enabled: boolean) => ({
    data: enabled ? BILLS : undefined,
  }),
}));

vi.mock('@/features/notifications', () => ({
  useNotificationsEnabled: () => PERMISSIONS.includes('notifications:view'),
  raiseAlert: (alert: Record<string, unknown>) => {
    if (failNext) {
      failNext = false;
      return Promise.reject(new Error('offline'));
    }
    raised.push(alert);
    return Promise.resolve(alert);
  },
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

  const makeStore = () =>
    configureStore({
      reducer: {
        auth: () => ({
          isAuthenticated: true,
          user: { id: 'u', name: 'T', username: 't', role: 'manager', permissions: PERMISSIONS },
        }),
      },
    });

  const mount = async () => {
    await act(async () => {
      root.render(
        <Provider store={makeStore()}>
          <BillReminderNotifier />
        </Provider>
      );
    });
  };

  beforeEach(() => {
    raised.length = 0;
    failNext = false;
    PERMISSIONS = ['expenses:view', 'notifications:view'];
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('raises one shop alert per due or overdue bill, for people who see expenses', async () => {
    BILLS = [bill('rexp_a', 'overdue'), bill('rexp_b', 'due'), bill('rexp_c', 'upcoming')];
    await mount();
    expect(raised).toHaveLength(2);
    const overdue = raised.find((n) => n.dedupeKey === 'bill:rexp_a:2026-10:overdue');
    expect(overdue).toMatchObject({
      category: 'expenses',
      severity: 'critical',
      link: { path: '/expenses?pay=rexp_a', label: 'Pay now' },
      audience: { type: 'permission', permission: 'expenses:view' },
    });
    expect(raised.find((n) => n.dedupeKey === 'bill:rexp_b:2026-10:due')?.severity).toBe('warning');
  });

  it('does not send the same reminder again on a re-render', async () => {
    BILLS = [bill('rexp_d', 'due')];
    await mount();
    await mount();
    expect(raised).toHaveLength(1);
  });

  it('reminds again when the same bill turns overdue', async () => {
    BILLS = [bill('rexp_e', 'due')];
    await mount();
    BILLS = [bill('rexp_e', 'overdue')];
    await mount();
    expect(raised.map((n) => n.dedupeKey).sort()).toEqual([
      'bill:rexp_e:2026-10:due',
      'bill:rexp_e:2026-10:overdue',
    ]);
  });

  it('tries again on the next check when sending failed', async () => {
    failNext = true;
    BILLS = [bill('rexp_g', 'due')];
    await mount();
    expect(raised).toHaveLength(0);
    BILLS = [bill('rexp_g', 'due')];
    await mount();
    expect(raised).toHaveLength(1);
  });

  it('stays quiet without the expenses permission', async () => {
    PERMISSIONS = ['inventory:read', 'notifications:view'];
    BILLS = [bill('rexp_f', 'overdue')];
    await mount();
    expect(raised).toHaveLength(0);
  });
});
