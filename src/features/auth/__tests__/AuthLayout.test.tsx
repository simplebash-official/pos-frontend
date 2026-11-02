/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthLayout } from '../components/AuthLayout';

let mockIsMobile = false;
vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => mockIsMobile,
}));

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: () => ({ user: null, token: null, initialized: true }),
      settings: () => ({ shopProfile: null }),
    },
  });

const renderAuthLayout = () => {
  const store = createTestStore();
  return renderToString(
    <Provider store={store}>
      <QueryClientProvider client={new QueryClient()}>
        <MantineProvider>
          <MemoryRouter>
            <AuthLayout>
              <div data-testid="login-form-child">Login Content</div>
            </AuthLayout>
          </MemoryRouter>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

afterEach(() => {
  mockIsMobile = false;
  vi.clearAllMocks();
});

describe('AuthLayout', () => {
  it('renders desktop layout with BrandPanel and children', () => {
    mockIsMobile = false;
    const out = renderAuthLayout();

    expect(out).toContain('Login Content');
    expect(out).toContain('Your shop&#x27;s accountant');
    expect(out).toContain('Every rupee, counted for you');
    expect(out).toContain('SimpleBash');
    // Ensure no static wall_login img reference remains
    expect(out).not.toContain('wall_login.jpg');
  });

  it('renders mobile layout with MobileAuthContainer when isMobile is true', () => {
    mockIsMobile = true;
    const out = renderAuthLayout();

    expect(out).toContain('mobile-auth-viewport');
    expect(out).toContain('mobile-splash-container');
    expect(out).not.toContain('wall_login.jpg');
  });
});
