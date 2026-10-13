import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';

// Real providers rather than module mocks, so the suite behaves the same under Vitest and Jest.
const renderSidebar = (role: string, permissions: string[], isRail = false) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: { name: 'T', username: 't', role, permissions }, permissions }),
    },
  });
  return renderToString(
    <Provider store={store}>
      <QueryClientProvider client={new QueryClient()}>
        <MantineProvider>
          <LayoutTierProvider>
            <MemoryRouter initialEntries={['/dashboard']}>
              <Sidebar isRail={isRail} />
            </MemoryRouter>
          </LayoutTierProvider>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const STAFF_PERMISSIONS = [PERMISSIONS.BILLING_WRITE, PERMISSIONS.CUSTOMERS_WRITE];

describe('Sidebar Quotations entry', () => {
  it('shows for a manager and an admin (their tokens carry quotations:manage)', () => {
    for (const role of ['manager', 'admin']) {
      const html = renderSidebar(role, [...STAFF_PERMISSIONS, PERMISSIONS.QUOTATIONS_MANAGE]);
      expect(html).toContain(`href="${ROUTES.QUOTATIONS}"`);
      expect(html).toContain('Quotations');
    }
  });

  it('shows in the narrow rail layout too', () => {
    const html = renderSidebar('manager', [PERMISSIONS.QUOTATIONS_MANAGE], true);
    expect(html).toContain(`href="${ROUTES.QUOTATIONS}"`);
  });

  it('is hidden from staff', () => {
    const html = renderSidebar('staff', STAFF_PERMISSIONS);
    expect(html).not.toContain(ROUTES.QUOTATIONS);
    expect(html).not.toContain('Quotations');
  });

  it('is hidden in the rail layout from staff', () => {
    expect(renderSidebar('staff', STAFF_PERMISSIONS, true)).not.toContain(ROUTES.QUOTATIONS);
  });
});
