/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';

import { SidebarFooter } from '../SidebarFooter';
import { USER_ROLES, type UserRole } from '@/constants/roles';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
// MantineProvider reads the colour scheme through matchMedia, which jsdom lacks.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList;
(globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

let activeRoot: ReturnType<typeof createRoot> | null = null;
let activeContainer: HTMLDivElement | null = null;

afterEach(() => {
  if (activeRoot) {
    act(() => {
      activeRoot?.unmount();
    });
    activeRoot = null;
  }
  if (activeContainer && activeContainer.parentNode) {
    activeContainer.parentNode.removeChild(activeContainer);
    activeContainer = null;
  }
});

const renderFooter = (role: UserRole) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: { name: 'Mayura Sandakalum Sellapperuma', username: 'm', role } }),
    },
  });
  const container = document.createElement('div');
  document.body.appendChild(container);
  activeContainer = container;
  const root = createRoot(container);
  activeRoot = root;
  act(() =>
    root.render(
      <Provider store={store}>
        <MantineProvider env="test">
          <MemoryRouter>
            <SidebarFooter
              isRail={false}
              isMobile={false}
              onLogout={() => {}}
              allFolded={false}
              onToggleFoldAll={() => {}}
            />
          </MemoryRouter>
        </MantineProvider>
      </Provider>
    )
  );
  return container;
};

describe('SidebarFooter role pill', () => {
  it.each([
    [USER_ROLES.ADMIN, 'Admin'],
    [USER_ROLES.MANAGER, 'Manager'],
    [USER_ROLES.STAFF, 'Staff'],
  ])('shows %s as its own pill, apart from the name', (role, label) => {
    const c = renderFooter(role);
    const pill = c.querySelector('.sidebar-footer-role');
    expect(pill?.textContent).toBe(label);
    expect(pill?.querySelector('svg')).not.toBeNull();
    // The name line in the card holds only the first name.
    const nameLine = Array.from(c.querySelectorAll('div, p')).find(
      (el) => el.textContent === 'Mayura'
    );
    expect(nameLine).toBeDefined();
  });
});

describe('SidebarFooter card settings button and user profile menu', () => {
  it('renders settings button with sidebar-footer-settings class for admin', () => {
    const c = renderFooter(USER_ROLES.ADMIN);
    const settingsBtn = c.querySelector('.sidebar-footer-settings');
    expect(settingsBtn).not.toBeNull();
    expect(settingsBtn?.getAttribute('aria-label')).toBe('Settings');
    expect(settingsBtn?.getAttribute('href')).toBe('/settings');
  });

  it('does not render settings button for roles without settings access', () => {
    for (const role of [USER_ROLES.MANAGER, USER_ROLES.STAFF]) {
      const c = renderFooter(role);
      const settingsBtn = c.querySelector('.sidebar-footer-settings');
      expect(settingsBtn).toBeNull();
    }
  });

  it('renders user menu trigger with sidebar-footer-identity class and reduced card height', () => {
    const c = renderFooter(USER_ROLES.ADMIN);
    const card = c.querySelector('.sidebar-footer-card') as HTMLElement;
    expect(card).not.toBeNull();
    expect(card?.style.height).toBe('58px');

    const trigger = c.querySelector('.sidebar-footer-identity') as HTMLElement;
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-label')).toBe('User profile menu');
    expect(trigger?.querySelector('.sidebar-footer-chevron')).not.toBeNull();

    act(() => {
      card.click();
    });

    const signOutBtn = document.querySelector('.sidebar-footer-signout-item');
    expect(signOutBtn).not.toBeNull();
    expect(signOutBtn?.textContent).toContain('Sign Out');

    const dropdown = document.querySelector('.sidebar-footer-popover-dropdown');
    expect(dropdown?.textContent).toContain('Mayura Sandakalum Sellapperuma');

    const popoverSettings = document.querySelector('.sidebar-footer-popover-dropdown a[href="/settings"]');
    expect(popoverSettings).toBeNull();
  });
});
