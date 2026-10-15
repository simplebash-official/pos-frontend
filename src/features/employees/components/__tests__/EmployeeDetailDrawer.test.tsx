/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { TestHarness } from '@/shared/components/drawer/TestHarness';
import { EmployeeDetailDrawer } from '../EmployeeDetailDrawer';
import type { Employee } from '../../types';

installDrawerTestEnv();

const EARNINGS = [
  {
    workId: 'w1',
    ticketOrInvoiceNumber: 'REP-1',
    workType: 'repair',
    description: 'Screen swap',
    customerName: 'Nimal',
    totalAmountCents: 1_000_000,
    costCents: 400_000,
    profitCents: 600_000,
    splitType: 'percentage',
    splitValue: 10,
    earnedAmountCents: 60_000,
    status: 'completed',
    createdAt: '2026-10-14T10:00:00Z',
  },
  {
    workId: 'w2',
    ticketOrInvoiceNumber: 'PRT-2',
    workType: 'print',
    description: 'Mug print',
    customerName: 'Kamal',
    totalAmountCents: 200_000,
    costCents: 50_000,
    profitCents: 150_000,
    splitType: 'percentage',
    splitValue: 10,
    earnedAmountCents: 15_000,
    status: 'pending',
    createdAt: '2026-10-15T10:00:00Z',
  },
];

vi.mock('../../hooks/useEmployeeEarnings', () => ({
  useEmployeeEarnings: () => ({
    data: EARNINGS,
    isLoading: false,
    isPending: false,
    isFetching: false,
  }),
}));
vi.mock('@/features/users/components/CreateLoginModal', () => ({
  CreateLoginModal: ({ opened }: { opened: boolean }) =>
    opened ? <div>create login modal</div> : null,
}));
vi.mock('@/shared/components/PermissionGuard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const makeEmployee = (overrides: Partial<Employee> = {}): Employee =>
  ({
    id: 'e1',
    key: 'emp_1',
    name: 'Sunil Fernando',
    phone: '0771112222',
    nicOrId: '901234567V',
    role: 'technician',
    defaultSplitType: 'percentage',
    defaultSplitValue: 10,
    status: 'active',
    notes: 'Certified in micro-soldering.',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-12T00:00:00Z',
    ...overrides,
  }) as Employee;

describe('EmployeeDetailDrawer', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onClose = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();

  beforeEach(() => {
    [onClose, onEdit, onDelete].forEach((fn) => fn.mockReset());
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const open = async (employee: Employee | null) => {
    await act(async () => {
      root.render(
        <TestHarness role="admin">
          <EmployeeDetailDrawer
            employee={employee}
            opened={employee !== null}
            onClose={onClose}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </TestHarness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const button = (label: string) =>
    Array.from(document.body.querySelectorAll('button')).find((b) =>
      b.textContent?.includes(label)
    ) as HTMLButtonElement | undefined;
  const tab = (label: string) =>
    Array.from(document.body.querySelectorAll('[role="tab"]')).find((el) =>
      el.textContent?.includes(label)
    ) as HTMLElement;
  const until = (check: () => void) =>
    act(async () => {
      await vi.waitFor(check, { timeout: 2000 });
    });

  it('shows nothing until an employee is chosen', async () => {
    await open(null);
    expect(text()).not.toContain('Sunil');
  });

  it('shows the hero, the earnings numbers and the default rule', async () => {
    await open(makeEmployee());
    expect(text()).toContain('Sunil Fernando');
    expect(text()).toContain('Active');
    expect(text()).toContain('Repair Technician');
    expect(text()).toContain('901234567V');
    expect(text()).toContain('Rs. 750.00'); // 600.00 + 150.00 earned
    expect(text()).toContain('Rs. 12,000.00'); // revenue
    expect(text()).toContain('10%'); // default rule
    expect(text()).toContain('of job profit');
  });

  it('marks an inactive employee', async () => {
    await open(makeEmployee({ status: 'inactive' }));
    expect(text()).toContain('Inactive');
    expect(text()).not.toContain('Active');
  });

  it('lists the work done with its commission and status', async () => {
    await open(makeEmployee());
    expect(text()).toContain('REP-1 · Screen swap');
    expect(text()).toContain('PRT-2 · Mug print');
    expect(text()).toContain('Rs. 600.00');
    expect(text()).toContain('Completed');
    expect(text()).toContain('Pending');
  });

  it('filters the history by work type', async () => {
    await open(makeEmployee());
    const prints = Array.from(document.body.querySelectorAll('label')).find((l) =>
      l.textContent?.startsWith('Prints')
    ) as HTMLElement;
    await act(async () => prints.click());
    expect(text()).toContain('PRT-2 · Mug print');
    expect(text()).not.toContain('REP-1 · Screen swap');
  });

  it('explains the split rule and a worked example on the Split Rules tab', async () => {
    await open(makeEmployee());
    await act(async () => tab('Split Rules').click());
    await until(() => expect(text()).toContain('Percentage of Job Profit: 10%'));
    expect(text()).toContain('Rs. 6,000 profit');
    expect(text()).toContain('this employee earns Rs. 600.00 (10%)');
  });

  it('offers to create a login when there is none, and shows the account when there is', async () => {
    await open(makeEmployee());
    await act(async () => tab('Login').click());
    await until(() => expect(text()).toContain('does not have a login yet'));
    await act(async () => button('Create Login')!.click());
    expect(text()).toContain('create login modal');

    act(() => root.unmount());
    root = createRoot(container);
    await open(
      makeEmployee({ login: { userId: 'u1', username: 'sunil', role: 'staff', isActive: true } })
    );
    await act(async () => tab('Login').click());
    await until(() => expect(text()).toContain('sunil'));
    expect(text()).toContain('Active');
    expect(text()).not.toContain('does not have a login yet');
  });

  it('calls back for Edit, Delete and Close', async () => {
    const employee = makeEmployee();
    await open(employee);
    await act(async () => button('Edit Details')!.click());
    expect(onEdit).toHaveBeenCalledWith(employee);
    await act(async () => button('Delete')!.click());
    expect(onDelete).toHaveBeenCalledWith(employee);
    await act(async () => button('Close')!.click());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
