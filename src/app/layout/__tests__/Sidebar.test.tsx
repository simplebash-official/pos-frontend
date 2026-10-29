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

const renderSidebar = (role: UserRole, isRail = false, onToggleCollapse?: () => void) => {
  const store = createMockStore(role);
  return renderToString(
    <Provider store={store}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Sidebar isRail={isRail} onToggleCollapse={onToggleCollapse} />
        </MemoryRouter>
      </MantineProvider>
    </Provider>
  );
};

describe('Sidebar rail width', () => {
  it('pins the rail to its own width so a wider bar mid-wipe cannot re-centre the icons', () => {
    expect(renderSidebar(USER_ROLES.ADMIN, true)).toContain('width:64px');
    expect(renderSidebar(USER_ROLES.ADMIN, false)).not.toContain('width:64px');
  });
});

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

describe('Sidebar collapse button and pinned footer', () => {
  const toggle = () => undefined;

  it('offers Collapse when full and Expand when on the rail', () => {
    expect(renderSidebar(USER_ROLES.ADMIN, false, toggle)).toContain(
      'aria-label="Collapse sidebar"'
    );
    expect(renderSidebar(USER_ROLES.ADMIN, true, toggle)).toContain('aria-label="Expand sidebar"');
  });

  it("hides the button where the width is not the user's to choose", () => {
    expect(renderSidebar(USER_ROLES.ADMIN, false)).not.toContain('sidebar"');
    expect(renderSidebar(USER_ROLES.ADMIN, true)).not.toContain('Expand sidebar');
  });

  it('keeps footer controls outside the scrolling nav list in both layouts', () => {
    const railHtml = renderSidebar(USER_ROLES.STAFF, true, toggle);
    const railNavEnd = railHtml.indexOf('</nav>');
    expect(railNavEnd).toBeGreaterThan(0);
    expect(railHtml.indexOf('aria-label="Sign Out"')).toBeGreaterThan(railNavEnd);

    const fullHtml = renderSidebar(USER_ROLES.STAFF, false, toggle);
    const fullNavEnd = fullHtml.indexOf('</nav>');
    expect(fullNavEnd).toBeGreaterThan(0);
    expect(fullHtml.indexOf('aria-label="User profile menu"')).toBeGreaterThan(fullNavEnd);
  });
});

describe('Sidebar account footer', () => {
  it('shows who is signed in and their role in the full layout', () => {
    const html = renderSidebar(USER_ROLES.MANAGER, false);
    expect(html).toContain('Test User');
    expect(html).toContain('Manager');
  });

  it('shows only the initial in the rail', () => {
    const html = renderSidebar(USER_ROLES.STAFF, true);
    expect(html).not.toContain('Test User');
    expect(html).toContain('>T<');
  });

  it('offers the three colour choices and the user profile menu in the full layout', () => {
    const html = renderSidebar(USER_ROLES.STAFF, false);
    for (const label of ['Light Mode', 'Dark Mode', 'System', 'User profile menu']) {
      expect(html).toContain(`aria-label="${label}"`);
    }
  });
});
