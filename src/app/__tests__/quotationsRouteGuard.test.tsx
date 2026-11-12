/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequirePermission } from '../components/RequirePermission';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// What the backend puts in each role's token (see `core::constants::roles`): Admin, Manager
// and Staff hold `quotations:manage`.
const STAFF = [
  PERMISSIONS.BILLING_WRITE,
  PERMISSIONS.CUSTOMERS_WRITE,
  PERMISSIONS.QUOTATIONS_MANAGE,
];
const MANAGER = [...STAFF, PERMISSIONS.REPORTS_VIEW];

const createMockStore = (permissions: string[]) =>
  configureStore({
    reducer: {
      auth: () => ({
        user: { id: 'u1', name: 'T', username: 't', role: 'staff', permissions },
        permissions,
      }),
    },
  });

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('Quotations route guarding by permission', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderAtQuotations = async (permissions: string[]) => {
    await act(async () => {
      root.render(
        <Provider store={createMockStore(permissions)}>
          <MemoryRouter initialEntries={[ROUTES.QUOTATIONS]}>
            <Routes>
              <Route
                path={ROUTES.QUOTATIONS}
                element={
                  <RequirePermission permissions={[PERMISSIONS.QUOTATIONS_MANAGE]}>
                    <div>Quotations Protected Area</div>
                  </RequirePermission>
                }
              />
              <Route path={ROUTES.DASHBOARD} element={<div>Dashboard Fallback Area</div>} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    });
    await flush();
  };

  it('lets someone with the quotations permission in (staff, manager, and admin tokens carry it)', async () => {
    for (const perms of [STAFF, MANAGER]) {
      await renderAtQuotations(perms);
      expect(container.textContent).toContain('Quotations Protected Area');
    }
  });

  it('sends someone without the quotations permission to the dashboard', async () => {
    await renderAtQuotations([PERMISSIONS.BILLING_WRITE, PERMISSIONS.CUSTOMERS_WRITE]);
    expect(container.textContent).not.toContain('Quotations Protected Area');
    expect(container.textContent).toContain('Dashboard Fallback Area');
  });

  it('sends someone with no permissions at all to the dashboard', async () => {
    await renderAtQuotations([]);
    expect(container.textContent).toContain('Dashboard Fallback Area');
  });
});
