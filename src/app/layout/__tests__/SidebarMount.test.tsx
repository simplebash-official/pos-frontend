/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { USER_ROLES } from '@/constants/roles';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock('@/features/inventory/hooks/useProducts', () => ({
  useLowStockProducts: () => ({ data: [] }),
}));
vi.mock('@/shared/hooks/useResponsive', () => ({ useIsMobile: () => false }));

const PERMISSIONS: string[] = [];
const store = configureStore({
  reducer: {
    auth: () => ({
      user: { name: 'T', username: 't', role: USER_ROLES.ADMIN, permissions: PERMISSIONS },
      permissions: PERMISSIONS,
    }),
  },
});

// renderToString never runs effects, so this mounts for real. jsdom has no layout, so it cannot catch
// a density oscillation (see the footer note in Sidebar.tsx); that needs a browser.
describe('Sidebar mounts in a browser', () => {
  afterEach(() => localStorage.clear());

  it.each([false, true])('settles without a render loop (rail: %s)', (isRail) => {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    (window as { matchMedia?: unknown }).matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    });
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => {
      root.render(
        <Provider store={store}>
          <MantineProvider>
            <MemoryRouter initialEntries={['/dashboard']}>
              <Sidebar isRail={isRail} onToggleCollapse={() => undefined} />
            </MemoryRouter>
          </MantineProvider>
        </Provider>
      );
    });
    expect(container.querySelector('nav')).not.toBeNull();
    act(() => root.unmount());
  });

  it('folds and unfolds a category, including the one with the open page, and remembers it', () => {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class {
      observe() {}
      disconnect() {}
    };
    (window as { matchMedia?: unknown }).matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(
        <Provider store={store}>
          <MantineProvider>
            <MemoryRouter initialEntries={['/dashboard']}>
              <Sidebar isRail={false} />
            </MemoryRouter>
          </MantineProvider>
        </Provider>
      );
    });
    const headers = () => [...container.querySelectorAll<HTMLElement>('.sidebar-section')];
    const links = () => container.querySelectorAll('nav a').length;
    const before = links();
    const first = headers()[0]; // Overview: holds the open /dashboard page
    expect(first.getAttribute('aria-expanded')).toBe('true');
    // Items sit in the indented wrapper, one step in from their header.
    expect(container.querySelector('#sidebar-section-overview')?.className).toContain(
      'sidebar-section-items'
    );

    act(() => first.click());
    expect(headers()[0].getAttribute('aria-expanded')).toBe('false');
    expect(links()).toBe(before - 1);
    expect(localStorage.getItem('pos-sidebar-folded')).toContain('overview');
    // A folded section says how many items it hides, and points at the open page when it holds it.
    expect(headers()[0].querySelector('.sidebar-section-count')?.textContent).toBe('1');
    expect(headers()[0].getAttribute('data-holds-active')).toBe('true');
    expect(headers()[0].querySelector('[aria-label="Current page is in here"]')).not.toBeNull();
    expect(headers()[1].querySelector('.sidebar-section-count')).toBeNull();
    expect(headers()[0].getAttribute('aria-controls')).toBe('sidebar-section-overview');

    const button = (label: string) =>
      container.querySelector<HTMLElement>(`button[aria-label="${label}"]`)!;
    act(() => button('Collapse All').click());
    expect(headers().every((h) => h.getAttribute('aria-expanded') === 'false')).toBe(true);
    expect(links()).toBe(0);

    act(() => button('Expand All').click());
    expect(links()).toBe(before);
    act(() => root.unmount());
  });
});
