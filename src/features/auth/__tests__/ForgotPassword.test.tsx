/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ForgotPasswordScreen } from '../components/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../components/ResetPasswordScreen';
import * as authApi from '../api/authApi';
import { notifications } from '@mantine/notifications';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => false,
  useLayoutTier: () => 'desktop',
  LayoutTierProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: () => ({ user: null, token: null, initialized: true }),
      settings: () => ({ shopProfile: null }),
    },
  });

describe('ForgotPasswordScreen', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = '';
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('renders initial form with header, subtitle, staff guidance note, and back link', () => {
    const store = createTestStore();
    const html = renderToString(
      <Provider store={store}>
        <QueryClientProvider client={new QueryClient()}>
          <MantineProvider>
            <MemoryRouter initialEntries={['/forgot-password']}>
              <ForgotPasswordScreen />
            </MemoryRouter>
          </MantineProvider>
        </QueryClientProvider>
      </Provider>
    );

    expect(html).toContain('Reset Admin Password');
    expect(html).toContain('Enter your shop code and registered admin username or email.');
    expect(html).toContain('Back to Sign In');
    expect(html).toContain('Username or Email');
    expect(html).toContain('Are you a cashier or staff member?');
    expect(html).toContain('Send Reset Instructions');
  });

  it('preserves shop code in back link when ?shop= parameter is provided', () => {
    const store = createTestStore();
    const html = renderToString(
      <Provider store={store}>
        <QueryClientProvider client={new QueryClient()}>
          <MantineProvider>
            <MemoryRouter initialEntries={['/forgot-password?shop=central-pos']}>
              <ForgotPasswordScreen />
            </MemoryRouter>
          </MantineProvider>
        </QueryClientProvider>
      </Provider>
    );

    expect(html).toContain('href="/login?shop=central-pos"');
  });

  it('shows notification when submitted without identifier', async () => {
    const store = createTestStore();
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={new QueryClient()}>
            <MantineProvider>
              <MemoryRouter initialEntries={['/forgot-password']}>
                <ForgotPasswordScreen />
              </MemoryRouter>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Information Required',
        color: 'red',
      })
    );
  });

  it('submits successfully and switches to success alert', async () => {
    const forgotSpy = vi.spyOn(authApi, 'forgotPasswordApi').mockResolvedValue({
      message: 'Reset email sent',
    });

    const store = createTestStore();
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={new QueryClient()}>
            <MantineProvider>
              <MemoryRouter initialEntries={['/forgot-password']}>
                <ForgotPasswordScreen />
              </MemoryRouter>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });

    const input = container.querySelector('input[name="identifier"]') as HTMLInputElement;
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(input, 'admin@example.com');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(forgotSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'admin@example.com',
      })
    );

    expect(container.textContent).toContain('Check your email');
    expect(container.textContent).toContain(
      "Check your email. If an account matches those details, we've sent password reset instructions. The link will expire in 15 minutes."
    );
    expect(container.textContent).toContain('Return to Sign In');
  });
});

describe('ResetPasswordScreen', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = '';
  });

  it('renders invalid link alert when no token is present', async () => {
    const store = createTestStore();
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={new QueryClient()}>
            <MantineProvider>
              <MemoryRouter initialEntries={['/reset-password']}>
                <ResetPasswordScreen />
              </MemoryRouter>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });

    expect(container.textContent).toContain('Invalid or Expired Link');
    expect(container.textContent).toContain('Request a New Reset Link');
  });

  it('renders invalid link alert when token verification fails', async () => {
    vi.spyOn(authApi, 'verifyResetTokenApi').mockResolvedValue({
      valid: false,
      message: 'Token has expired.',
    });

    const store = createTestStore();
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={new QueryClient()}>
            <MantineProvider>
              <MemoryRouter initialEntries={['/reset-password?token=expired-123']}>
                <ResetPasswordScreen />
              </MemoryRouter>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });

    expect(container.textContent).toContain('Invalid or Expired Link');
    expect(container.textContent).toContain('Token has expired.');
    expect(container.textContent).toContain('Request a New Reset Link');
  });

  it('validates token, presents form, validates requirements, and submits new password', async () => {
    vi.spyOn(authApi, 'verifyResetTokenApi').mockResolvedValue({
      valid: true,
    });
    const resetSpy = vi.spyOn(authApi, 'resetPasswordApi').mockResolvedValue({
      message: 'Password reset successfully',
    });

    const store = createTestStore();
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={new QueryClient()}>
            <MantineProvider>
              <MemoryRouter initialEntries={['/reset-password?token=valid-secret-token']}>
                <Routes>
                  <Route path="/reset-password" element={<ResetPasswordScreen />} />
                  <Route path="/login" element={<div>Login Page Target</div>} />
                </Routes>
              </MemoryRouter>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });

    expect(container.textContent).toContain('Set New Password');
    expect(container.textContent).toContain('At least 8 characters');
    expect(container.textContent).toContain('Passwords must match');

    const newPasswordInput = container.querySelector(
      'input[name="newPassword"]'
    ) as HTMLInputElement;
    const confirmPasswordInput = container.querySelector(
      'input[name="confirmPassword"]'
    ) as HTMLInputElement;
    const submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;

    // Initially requirements not met, submit is disabled
    expect(submitButton.disabled).toBe(true);

    // Enter matching 8+ character password
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
      setter.call(newPasswordInput, 'ValidPass123!');
      newPasswordInput.dispatchEvent(new Event('input', { bubbles: true }));
      newPasswordInput.dispatchEvent(new Event('change', { bubbles: true }));

      setter.call(confirmPasswordInput, 'ValidPass123!');
      confirmPasswordInput.dispatchEvent(new Event('input', { bubbles: true }));
      confirmPasswordInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(submitButton.disabled).toBe(false);

    // Submit form
    const form = container.querySelector('form')!;
    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });

    expect(resetSpy).toHaveBeenCalledWith({
      token: 'valid-secret-token',
      newPassword: 'ValidPass123!',
    });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Password Reset Successful',
        color: 'green',
      })
    );

    // Navigated to /login
    expect(container.textContent).toContain('Login Page Target');
  });
});
