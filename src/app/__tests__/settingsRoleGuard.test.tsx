// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAdmin } from '../components/RequireAdmin';
import { USER_ROLES, type UserRole } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const EMPTY_PERMISSIONS: string[] = [];

const createMockStore = (role: UserRole) => {
  const authState = {
    user: {
      id: 'u1',
      name: 'Test User',
      username: 'testuser',
      role,
      permissions: EMPTY_PERMISSIONS,
    },
    permissions: EMPTY_PERMISSIONS,
  };
  return configureStore({
    reducer: {
      auth: () => authState,
    },
  });
};

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('Settings route guarding by user role', () => {
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

  const renderAtSettingsRoute = async (role: UserRole) => {
    const store = createMockStore(role);
    await act(async () => {
      root.render(
        <Provider store={store}>
          <MemoryRouter initialEntries={[ROUTES.SETTINGS]}>
            <Routes>
              <Route
                path={ROUTES.SETTINGS}
                element={
                  <RequireAdmin>
                    <div data-testid="settings-content">Settings Protected Area</div>
                  </RequireAdmin>
                }
              />
              <Route
                path={ROUTES.DASHBOARD}
                element={<div data-testid="dashboard-content">Dashboard Fallback Area</div>}
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    });
    await flush();
  };

  it('allows access to settings route for admin role', async () => {
    await renderAtSettingsRoute(USER_ROLES.ADMIN);
    expect(container.textContent).toContain('Settings Protected Area');
    expect(container.textContent).not.toContain('Dashboard Fallback Area');
  });

  it('redirects to dashboard when manager attempts to access settings route', async () => {
    await renderAtSettingsRoute(USER_ROLES.MANAGER);
    expect(container.textContent).not.toContain('Settings Protected Area');
    expect(container.textContent).toContain('Dashboard Fallback Area');
  });

  it('redirects to dashboard when staff attempts to access settings route', async () => {
    await renderAtSettingsRoute(USER_ROLES.STAFF);
    expect(container.textContent).not.toContain('Settings Protected Area');
    expect(container.textContent).toContain('Dashboard Fallback Area');
  });
});
