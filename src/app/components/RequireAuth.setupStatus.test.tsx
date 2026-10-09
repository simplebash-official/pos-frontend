// @vitest-environment jsdom
// Vitest-only (lives outside __tests__/, which is all Jest collects): it renders
// the real router + React Query in jsdom, which the Jest setup can't host.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import authReducer, { loginSuccess, setInitialized } from '@/store/slices/authSlice';
import { queryKeys } from '@/api/queryKeys';
import { ROUTES } from '@/constants/routes';
import type { SetupStatus } from '@/features/onboarding/types';
import { getSetupStatusApi } from '@/features/onboarding/api/onboardingApi';
import { RequireAuth } from './RequireAuth';

vi.mock('@/features/onboarding/api/onboardingApi', () => ({
  getSetupStatusApi: vi.fn(),
  initializeSetupApi: vi.fn(),
}));
vi.mock('@/shared/components/PageLoader', () => ({
  PageLoader: () => <div>loading</div>,
}));
vi.mock('@/shared/lib/runtime', () => ({ isTauri: () => false }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const status = (setupCompleted: boolean): SetupStatus => ({
  setup_completed: setupCompleted,
  is_first_run: !setupCompleted,
  installation_id: 'tnt_1',
  installed_at: '',
  setup_completed_at: null,
  sample_data_loaded: false,
  app_version: '0.7.0',
  platform: 'Cloud (Multi-Tenant)',
});

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('RequireAuth setup-status gate', () => {
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
    vi.mocked(getSetupStatusApi).mockReset();
  });

  const renderAt = (store: ReturnType<typeof makeStore>, queryClient: QueryClient) =>
    act(() =>
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={[ROUTES.DASHBOARD]}>
              <Routes>
                <Route path={ROUTES.WELCOME} element={<div>welcome wizard</div>} />
                <Route
                  path="*"
                  element={
                    <RequireAuth>
                      <div>dashboard</div>
                    </RequireAuth>
                  }
                />
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>
        </Provider>
      )
    );

  const makeStore = () => configureStore({ reducer: { auth: authReducer } });

  it('ignores the anonymous "not set up" answer cached from the login page', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    // What the login page left behind: the backend can't tell which shop a guest is.
    queryClient.setQueryData(queryKeys.system.setupStatus('guest'), status(false));
    vi.mocked(getSetupStatusApi).mockResolvedValue(status(true));

    const store = makeStore();
    store.dispatch(setInitialized(true));
    store.dispatch(
      loginSuccess({
        user: { id: 'u1', name: 'Ann', username: 'ann', role: 'admin' },
        token: 't',
      })
    );

    await renderAt(store, queryClient);
    await flush();

    expect(container.textContent).toBe('dashboard');
    expect(getSetupStatusApi).toHaveBeenCalledTimes(1);
  });

  it('still sends a shop that is not set up to the welcome wizard', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(getSetupStatusApi).mockResolvedValue(status(false));

    const store = makeStore();
    store.dispatch(setInitialized(true));
    store.dispatch(
      loginSuccess({
        user: { id: 'u2', name: 'Bob', username: 'bob', role: 'admin' },
        token: 't',
      })
    );

    await renderAt(store, queryClient);
    await flush();

    expect(container.textContent).toBe('welcome wizard');
  });
});
