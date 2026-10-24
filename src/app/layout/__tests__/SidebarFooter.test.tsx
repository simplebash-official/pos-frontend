/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
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

const renderFooter = (role: UserRole) => {
  const store = configureStore({
    reducer: {
      auth: () => ({ user: { name: 'Mayura Sandakalum Sellapperuma', username: 'm', role } }),
    },
  });
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() =>
    createRoot(container).render(
      <Provider store={store}>
        <MantineProvider>
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
    // The name line holds only the name.
    expect(c.querySelector('[title="Mayura Sandakalum Sellapperuma"]')?.textContent).toBe(
      'Mayura Sandakalum Sellapperuma'
    );
  });
});
