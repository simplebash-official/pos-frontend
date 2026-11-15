/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MantineProvider } from '@mantine/core';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import type { Employee } from '../../types';
import { AssigneeSection, type AssigneeValues } from '../AssigneeSection';

let EMPLOYEES: Employee[] = [];
const createProfile = vi.fn();

vi.mock('../../hooks/useEmployees', () => ({
  useAllEmployees: () => ({ data: EMPLOYEES }),
  useCreateOwnerProfile: () => ({ mutateAsync: createProfile, isPending: false }),
}));

const employee = (overrides: Partial<Employee>): Employee =>
  ({
    id: '1',
    key: 'emp_1',
    name: 'Kamal',
    phone: '0771234567',
    role: 'technician',
    defaultSplitType: 'percentage',
    defaultSplitValue: 20,
    status: 'active',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
    ...overrides,
  }) as Employee;

const OWNER = employee({
  id: '2',
  key: 'emp_owner',
  name: 'Mayura',
  role: 'owner',
  login: { userId: 'u1', username: 'admin', role: 'admin', isActive: true },
});

const Harness = ({ role, children }: { role: string; children: ReactNode }) => {
  const [store] = useState(() =>
    configureStore({
      reducer: {
        auth: () => ({ user: { id: 'u1', name: 'T', username: 'admin', role, permissions: [] } }),
      },
    })
  );
  return (
    <Provider store={store}>
      <MantineProvider>
        <LayoutTierProvider>{children}</LayoutTierProvider>
      </MantineProvider>
    </Provider>
  );
};

const FIGURES = {
  priced: true,
  hint: null,
  profitCents: 100_000,
  payoutCents: 20_000,
  capped: false,
};

describe('AssigneeSection', () => {
  let container: HTMLDivElement;
  let root: Root;
  const onChange = vi.fn();
  const onNested = vi.fn();

  const Host = ({ start }: { start: AssigneeValues }) => {
    const [values, setValues] = useState(start);
    return (
      <AssigneeSection
        heading="Assignment"
        label="Assign"
        placeholder="Pick someone"
        profitNoun="repair"
        values={values}
        onChange={(changes) => {
          onChange(changes);
          setValues((previous) => ({ ...previous, ...changes }));
        }}
        figures={FIGURES}
        onNestedWindowChange={onNested}
      />
    );
  };

  const render = async (role: string, start: AssigneeValues = {}) => {
    await act(async () => {
      root.render(
        <Harness role={role}>
          <Host start={start} />
        </Harness>
      );
    });
  };
  const text = () => document.body.textContent ?? '';
  const openList = async () => {
    await act(async () => document.querySelector<HTMLInputElement>('input')?.click());
  };
  const options = () => [...document.querySelectorAll('[role="option"]')];
  const pick = async (label: string) => {
    const option = options().find((o) => o.textContent === label);
    if (option === undefined)
      throw new Error(`no option ${label}: ${options().map((o) => o.textContent)}`);
    await act(async () => (option as HTMLElement).click());
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    onChange.mockReset();
    onNested.mockReset();
    createProfile.mockReset();
    EMPLOYEES = [employee({})];
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('offers an admin with no profile a way to add themselves', async () => {
    await render('admin');
    await openList();
    expect(options().map((o) => o.textContent)).toEqual([
      'Unassigned (No Employee)',
      'Add me as a technician',
      'Kamal (TECHNICIAN)',
    ]);
  });

  it('makes the profile from a phone number and picks it with no split', async () => {
    createProfile.mockResolvedValue(OWNER);
    await render('admin');
    await openList();
    await pick('Add me as a technician');
    expect(onNested).toHaveBeenLastCalledWith(true);
    await vi.waitFor(() => expect(text()).toContain('You will be listed with your staff'));

    const phone = document.querySelector<HTMLInputElement>('input[placeholder="e.g. 0771234567"]');
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(
        phone,
        '0771234567'
      );
      phone?.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      document
        .querySelectorAll('form')
        .forEach((form) =>
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
        );
    });
    await vi.waitFor(() => expect(createProfile).toHaveBeenCalledWith({ phone: '0771234567' }));
    await vi.waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith({
        assignedEmployeeId: 'emp_owner',
        assignedEmployeeName: 'Mayura',
        splitType: undefined,
        splitValueRupeesOrPercent: undefined,
      })
    );
    expect(onNested).toHaveBeenLastCalledWith(false);
  });

  it('leaves the list empty when the add-me window is cancelled', async () => {
    await render('admin');
    await openList();
    await pick('Add me as a technician');
    await vi.waitFor(() => expect(text()).toContain('You will be listed with your staff'));
    const cancel = [...document.querySelectorAll('button')].find((b) => b.textContent === 'Cancel');
    await act(async () => cancel?.click());
    expect(onChange).not.toHaveBeenCalled();
    expect(onNested).toHaveBeenLastCalledWith(false);
    expect(
      document.querySelector<HTMLInputElement>('input[placeholder="Pick someone"]')?.value
    ).toBe('');
  });

  it('lists an admin with a profile as "Me" and takes no commission for them', async () => {
    EMPLOYEES = [employee({}), OWNER];
    await render('admin');
    await openList();
    expect(options().map((o) => o.textContent)).toEqual([
      'Unassigned (No Employee)',
      'Me (Mayura)',
      'Kamal (TECHNICIAN)',
    ]);
    await pick('Me (Mayura)');
    expect(text()).toContain('You keep the whole profit, so no commission is paid.');
    expect(text()).not.toContain('Split Type');
  });

  it('shows the usual split for a technician', async () => {
    EMPLOYEES = [employee({}), OWNER];
    await render('admin');
    await openList();
    await pick('Kamal (TECHNICIAN)');
    expect(text()).toContain('Split Type');
    expect(text()).toContain('Employee Commission Payout:');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ assignedEmployeeId: 'emp_1', splitType: 'percentage' })
    );
  });

  it('offers nobody but an admin the add-me choice', async () => {
    await render('manager');
    await openList();
    expect(options().map((o) => o.textContent)).toEqual([
      'Unassigned (No Employee)',
      'Kamal (TECHNICIAN)',
    ]);
  });
});
