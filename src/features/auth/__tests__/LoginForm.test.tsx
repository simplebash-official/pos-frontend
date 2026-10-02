import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
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
      <MantineProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <LoginForm />
        </MemoryRouter>
      </MantineProvider>
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
