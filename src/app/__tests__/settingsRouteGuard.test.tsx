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
import { RequireSettingsAccess } from '../components/RequireSettingsAccess';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// What the backend puts in each role's token (see `core::constants::roles`).
const STAFF = [PERMISSIONS.BILLING_WRITE, PERMISSIONS.CUSTOMERS_WRITE];
const MANAGER = [...STAFF, PERMISSIONS.PAYEES_MANAGE];

const createMockStore = (role: string, permissions: string[]) =>
  configureStore({
    reducer: {
      auth: () => ({ user: { id: 'u1', name: 'T', username: 't', role, permissions } }),
    },
  });

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('Settings route guarding', () => {
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

  const renderAtSettings = async (role: string, permissions: string[]) => {
    await act(async () => {
      root.render(
        <Provider store={createMockStore(role, permissions)}>
          <MemoryRouter initialEntries={[ROUTES.SETTINGS]}>
            <Routes>
              <Route
                path={ROUTES.SETTINGS}
                element={
                  <RequireSettingsAccess>
                    <div>Settings Protected Area</div>
                  </RequireSettingsAccess>
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

  it('lets an Admin in', async () => {
    await renderAtSettings('admin', []);
    expect(container.textContent).toContain('Settings Protected Area');
  });

  it('lets a manager in through the payees permission', async () => {
    await renderAtSettings('manager', MANAGER);
    expect(container.textContent).toContain('Settings Protected Area');
  });

  it('sends staff to the dashboard', async () => {
    await renderAtSettings('staff', STAFF);
    expect(container.textContent).not.toContain('Settings Protected Area');
    expect(container.textContent).toContain('Dashboard Fallback Area');
  });
});
