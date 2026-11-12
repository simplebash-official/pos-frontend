/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LoginForm } from '../components/LoginForm';

installDrawerTestEnv();

const mockLoginApi = vi.fn();
const mockLookupShopApi = vi.fn();
const mockNotifyShow = vi.fn();

vi.mock('../api/authApi', () => ({
  loginApi: (...args: unknown[]) => mockLoginApi(...args),
  lookupShopApi: (...args: unknown[]) => mockLookupShopApi(...args),
}));

vi.mock('@mantine/notifications', () => ({
  notifications: { show: (...args: unknown[]) => mockNotifyShow(...args) },
}));

vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => false,
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: () => ({ user: null, token: null, initialized: true }),
      settings: () => ({ shopProfile: null }),
    },
  });

const renderLoginForm = (initialEntry = '/login') => {
  const store = createTestStore();
  return renderToString(
    <Provider store={store}>
      <QueryClientProvider client={new QueryClient()}>
        <MantineProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            <LoginForm />
          </MemoryRouter>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const setNativeInputValue = (input: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

describe('LoginForm', () => {
  beforeEach(() => {
    mockLoginApi.mockReset();
    mockLookupShopApi.mockReset();
    mockNotifyShow.mockReset();
    mockLookupShopApi.mockResolvedValue({});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('renders username and password inputs with correct autocomplete attributes for password managers', () => {
    const out = renderLoginForm();
    expect(out).toContain('name="username"');
    expect(out).toContain('autoComplete="username"');
    expect(out).toContain('name="password"');
    expect(out).toContain('autoComplete="current-password"');
  });

  it('asks for a username, not an email address', () => {
    const out = renderLoginForm();
    expect(out).toContain('Username');
    expect(out).not.toContain('type="email"');
    expect(out).not.toContain('Email Address');
  });

  it('shows no shop and account card outside the desktop app', () => {
    expect(renderLoginForm()).not.toContain('shop-account-card');
  });

  it('prefills the username from an Open POS link', () => {
    const out = renderLoginForm('/login?shop=my-shop&username=admin');
    expect(out).toContain('value="admin"');
  });

  it('renders dynamic shop name from ?name= query parameter and never legacy service center string', () => {
    const out = renderLoginForm('/login?shop=my-shop&name=Lanka%20Electronics');
    expect(out).toContain('Lanka Electronics');
    expect(out).not.toContain('SimpleBash Service Center');
  });

  it('falls back to SimpleBash POS when no custom name is provided and never SimpleBash Service Center', () => {
    const out = renderLoginForm('/login');
    expect(out).toContain('SimpleBash POS');
    expect(out).not.toContain('SimpleBash Service Center');
  });

  it('renders a forgot password link preserving shop code in query', () => {
    const out = renderLoginForm('/login?shop=my-shop');
    expect(out).toContain('Forgot password?');
    expect(out).toContain('href="/forgot-password?shop=my-shop"');
  });

  it('renders a forgot password link without shop query when no shop is set', () => {
    const out = renderLoginForm('/login');
    expect(out).toContain('Forgot password?');
    expect(out).toContain('href="/forgot-password"');
  });

  it('shows a dismissible inline Alert above the form on 409 SESSION_OPEN_ON_OTHER_DEVICE', async () => {
    mockLoginApi.mockRejectedValueOnce({
      statusCode: 409,
      code: 'SESSION_OPEN_ON_OTHER_DEVICE',
      message: 'Your shift is currently open on Front Counter. Close it there first.',
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root: Root = createRoot(container);

    try {
      const store = createTestStore();
      const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

      await act(async () => {
        root.render(
          <Provider store={store}>
            <QueryClientProvider client={queryClient}>
              <MantineProvider>
                <MemoryRouter initialEntries={['/login?username=kasun']}>
                  <LoginForm />
                </MemoryRouter>
              </MantineProvider>
            </QueryClientProvider>
          </Provider>
        );
      });

      const passwordInput = container.querySelector<HTMLInputElement>('input[name="password"]');
      expect(passwordInput).not.toBeNull();

      await act(async () => {
        if (passwordInput) setNativeInputValue(passwordInput, 'secret123');
      });

      const form = container.querySelector('form');
      expect(form).not.toBeNull();

      await act(async () => {
        form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      await act(async () => {
        await vi.waitFor(
          () => {
            expect(container.textContent).toContain('Shift Open on Another Device');
          },
          { timeout: 4000 }
        );
      });

      expect(container.textContent).toContain(
        'Your shift is currently open on Front Counter. Close it there first.'
      );
      expect(container.textContent).toContain('Allow Across Devices');
      expect(mockNotifyShow).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Login Failed',
          color: 'red',
        })
      );

      const dismissBtn = container.querySelector<HTMLButtonElement>('button[aria-label="Dismiss"]');
      expect(dismissBtn).not.toBeNull();
      await act(async () => {
        dismissBtn?.click();
      });

      expect(container.textContent).not.toContain('Shift Open on Another Device');
    } finally {
      act(() => root.unmount());
      container.remove();
    }
  });
});
