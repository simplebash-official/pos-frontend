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
import { BalancesPage } from '../BalancesPage';
import { RecoverAdvanceModal } from '../RecoverAdvanceModal';
import type { StaffAdvance, SupplierBalance } from '../../types';

installDrawerTestEnv();

const SUPPLIERS: SupplierBalance[] = [
  {
    supplierKey: 'sup_1',
    name: 'Mobile Parts Ltd',
    openingBalanceCents: 100_000,
    asOfDate: '2026-10-01',
    purchasedCents: 500_000,
    paidCents: 50_000,
    balanceCents: 550_000,
  },
  { supplierKey: 'sup_2', name: 'Cable House' },
];
const STAFF: StaffAdvance[] = [
  {
    employeeKey: 'emp_1',
    name: 'Nimal',
    givenCents: 80_000,
    recoveredCents: 30_000,
    outstandingCents: 50_000,
    lastGivenOn: '2026-10-20',
  },
];

const recover = { mutateAsync: vi.fn(), isPending: false };

vi.mock('@/features/balances/hooks/useBalances', () => ({
  useSupplierBalances: () => ({ data: { suppliers: SUPPLIERS }, isLoading: false }),
  useStaffAdvances: () => ({ data: { staff: STAFF }, isLoading: false }),
  useStaffAdvanceDetail: () => ({ data: undefined, isLoading: true }),
  useSetBalanceOpening: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRecoverAdvance: () => recover,
}));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const Harness = ({ permissions, children }: { permissions: string[]; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({
          user: { id: 'u1', name: 'T', username: 't', role: 'manager', permissions },
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

const VIEW = ['balances:view'];
const MANAGE = ['balances:view', 'balances:manage'];

describe('Balances', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    recover.mutateAsync.mockReset();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (permissions: string[], ui: ReactNode) => {
    await act(async () => {
      root.render(<Harness permissions={permissions}>{ui}</Harness>);
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll<HTMLElement>('button, [role="tab"]')).find((b) =>
      (b.textContent ?? '').trim().startsWith(label)
    );
  const click = async (label: string) => {
    const target = button(label);
    if (!target) throw new Error(`no button named ${label}`);
    await act(async () => target.click());
  };

  it('shows what is owed to a supplier set up, and "Not set up" for one that is not', async () => {
    await render(MANAGE, <BalancesPage />);
    expect(text()).toContain('Mobile Parts Ltd');
    expect(text()).toContain('Rs. 5,500.00');
    expect(text()).toContain('Cable House');
    expect(text()).toContain('Not set up');
  });

  it('lets only people who manage balances set where a supplier started', async () => {
    await render(MANAGE, <BalancesPage />);
    expect(button('Set opening balance')).toBeTruthy();
    expect(button('Change opening balance')).toBeTruthy();
    act(() => root.unmount());
    root = createRoot(container);
    await render(VIEW, <BalancesPage />);
    expect(button('Set opening balance')).toBeUndefined();
  });

  it('shows what a staff member still owes on advances', async () => {
    await render(MANAGE, <BalancesPage />);
    await click('Staff advances');
    expect(text()).toContain('Nimal');
    expect(text()).toContain('Rs. 500.00');
    expect(button('Recover from pay')).toBeTruthy();
  });

  it('refuses to recover more than is owed and saves a valid amount', async () => {
    recover.mutateAsync.mockResolvedValue({});
    const onClose = vi.fn();
    await render(MANAGE, <RecoverAdvanceModal advance={STAFF[0]} onClose={onClose} />);
    const amount = Array.from(document.body.querySelectorAll<HTMLLabelElement>('label'))
      .find((l) => (l.textContent ?? '').startsWith('Amount taken from pay'))
      ?.closest('div')
      ?.querySelector('input') as HTMLInputElement;
    const type = async (value: string) =>
      act(async () => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
        setter.call(amount, value);
        amount.dispatchEvent(new Event('input', { bubbles: true }));
      });
    const submit = async () =>
      act(async () => {
        document.body
          .querySelector('form')!
          .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

    await type('600');
    await submit();
    expect(recover.mutateAsync).not.toHaveBeenCalled();
    expect(text()).toContain('That is more than this person still owes on advances.');

    await type('300');
    await submit();
    expect(recover.mutateAsync).toHaveBeenCalledTimes(1);
    expect(recover.mutateAsync.mock.calls[0][0]).toMatchObject({
      employeeKey: 'emp_1',
      input: { amountCents: 30_000 },
    });
    expect(onClose).toHaveBeenCalled();
  });
});
