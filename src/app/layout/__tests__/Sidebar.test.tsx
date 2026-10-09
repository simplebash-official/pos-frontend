import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { USER_ROLES, type UserRole } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useLowStockProducts: () => ({ data: [] }),
}));

vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => false,
}));

const EMPTY_PERMISSIONS: string[] = [];

const createMockStore = (role: UserRole) => {
  const authState = {
    user: { name: 'Test User', username: 'testuser', role, permissions: EMPTY_PERMISSIONS },
    permissions: EMPTY_PERMISSIONS,
  };
  return configureStore({
    reducer: {
      auth: () => authState,
    },
  });
};

const renderSidebar = (role: UserRole, isRail = false) => {
  const store = createMockStore(role);
  return renderToString(
    <Provider store={store}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Sidebar isRail={isRail} />
        </MemoryRouter>
      </MantineProvider>
    </Provider>
  );
};

describe('Sidebar settings visibility by user role', () => {
  describe('Admin role', () => {
    it('renders Settings link in standard full layout for admin', () => {
      const html = renderSidebar(USER_ROLES.ADMIN, false);
      expect(html).toContain(ROUTES.SETTINGS);
      expect(html).toContain('Settings');
    });

    it('renders Settings action icon in rail layout for admin', () => {
      const html = renderSidebar(USER_ROLES.ADMIN, true);
      expect(html).toContain(ROUTES.SETTINGS);
    });
  });

  describe('Manager role', () => {
    it('does not render Settings link in standard full layout for manager', () => {
      const html = renderSidebar(USER_ROLES.MANAGER, false);
      expect(html).not.toContain(ROUTES.SETTINGS);
      expect(html).not.toContain('Settings');
    });

    it('does not render Settings action icon in rail layout for manager', () => {
      const html = renderSidebar(USER_ROLES.MANAGER, true);
      expect(html).not.toContain(ROUTES.SETTINGS);
    });
  });

  describe('Staff role', () => {
    it('does not render Settings link in standard full layout for staff', () => {
      const html = renderSidebar(USER_ROLES.STAFF, false);
      expect(html).not.toContain(ROUTES.SETTINGS);
      expect(html).not.toContain('Settings');
    });

    it('does not render Settings action icon in rail layout for staff', () => {
      const html = renderSidebar(USER_ROLES.STAFF, true);
      expect(html).not.toContain(ROUTES.SETTINGS);
    });
  });
});
