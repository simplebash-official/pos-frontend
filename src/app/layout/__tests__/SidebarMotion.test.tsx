/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { USER_ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useLowStockProducts: () => ({ data: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }] }),
}));

installDrawerTestEnv();

const PERMISSIONS: string[] = [];
const navigation: { go: (to: string) => void } = { go: () => undefined };

const Navigator = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigation.go = navigate;
  }, [navigate]);
  return null;
};

const store = configureStore({
  reducer: {
    auth: () => ({
      user: { name: 'T', username: 't', role: USER_ROLES.ADMIN, permissions: PERMISSIONS },
      permissions: PERMISSIONS,
    }),
  },
});

describe('Sidebar motion', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const renderSidebar = (isRail: boolean) =>
    act(() =>
      root.render(
        <Provider store={store}>
          <MantineProvider>
            <LayoutTierProvider>
              <MemoryRouter initialEntries={[ROUTES.DASHBOARD]}>
                <Navigator />
                <Sidebar isRail={isRail} />
              </MemoryRouter>
            </LayoutTierProvider>
          </MantineProvider>
        </Provider>
      )
    );

  const pillHref = (): string | null | undefined => {
    const pills = container.querySelectorAll('.sidebar-pill');
    expect(pills).toHaveLength(1);
    return pills[0].parentElement?.querySelector('a')?.getAttribute('href');
  };

  it.each([
    ['full list', false],
    ['icon rail', true],
  ])('puts one pill on the active item and moves it on navigation (%s)', (_name, isRail) => {
    renderSidebar(isRail);
    expect(pillHref()).toBe(ROUTES.DASHBOARD);

    act(() => navigation.go(ROUTES.BILLING));
    expect(pillHref()).toBe(ROUTES.BILLING);
  });

  it('shows the low-stock count beside Inventory in the full list', () => {
    renderSidebar(false);
    const inventory = container.querySelector(`a[href="${ROUTES.INVENTORY}"]`);
    expect(inventory?.textContent).toContain('3');
  });

  it('shows the low-stock count on the Inventory icon in the rail', () => {
    renderSidebar(true);
    const indicator = container
      .querySelector(`a[href="${ROUTES.INVENTORY}"]`)
      ?.closest('.mantine-Indicator-root');
    expect(indicator?.textContent).toContain('3');
  });

  it('marks each link so its own active background is switched off', () => {
    renderSidebar(false);
    const link = container.querySelector(`a[href="${ROUTES.DASHBOARD}"]`);
    expect(link?.classList.contains('sidebar-link')).toBe(true);
  });
});
