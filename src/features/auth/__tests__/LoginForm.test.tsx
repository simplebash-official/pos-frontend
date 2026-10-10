import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../components/LoginForm';

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

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('LoginForm', () => {
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
});
