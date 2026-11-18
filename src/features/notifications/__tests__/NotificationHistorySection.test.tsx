/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { NotificationHistorySection } from '../components/NotificationHistorySection';
import type { AppNotification } from '../types';

installDrawerTestEnv();

const mockApi = {
  fetchNotificationPage: vi.fn(),
  fetchNotificationSummary: vi.fn(),
  markNotificationsRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
};

vi.mock('@/features/notifications/api/notificationsApi', () => ({
  HISTORY_PAGE_SIZE: 20,
  fetchNotificationPage: (...args: unknown[]) => mockApi.fetchNotificationPage(...args),
  fetchNotificationSummary: () => mockApi.fetchNotificationSummary(),
  markNotificationsRead: (keys: string[]) => mockApi.markNotificationsRead(keys),
  markAllNotificationsRead: (filter: unknown) => mockApi.markAllNotificationsRead(filter),
  raiseAlert: vi.fn(),
}));

const row = (key: string, over: Partial<AppNotification> = {}): AppNotification => ({
  key,
  category: 'inventory',
  severity: 'warning',
  title: `Title ${key}`,
  body: `Body ${key}`,
  audience: { type: 'everyone' },
  source: 'shop',
  read: false,
  createdAt: new Date().toISOString(),
  ...over,
});

const Search = () => <div data-testid="search">{useLocation().search}</div>;

describe('NotificationHistorySection', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockApi.fetchNotificationPage.mockReset();
    mockApi.fetchNotificationSummary.mockReset().mockResolvedValue({
      unreadTotal: 3,
      unreadByCategory: [{ category: 'inventory', unread: 3 }],
      latest: [],
    });
    mockApi.markNotificationsRead.mockReset().mockResolvedValue(1);
    mockApi.markAllNotificationsRead.mockReset().mockResolvedValue(3);
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const settle = async () => {
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
    }
  };

  const render = async (entry: string) => {
    const store = configureStore({
      reducer: {
        auth: () => ({
          isAuthenticated: true,
          user: {
            id: 'u',
            name: 'T',
            username: 't',
            role: 'staff',
            permissions: ['notifications:view'],
          },
        }),
        settings: () => ({ appLanguage: 'en' }),
      },
    });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider
            client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
          >
            <MantineProvider env="test">
              <DatesProvider settings={{}}>
                <LayoutTierProvider>
                  <MemoryRouter initialEntries={[entry]}>
                    <NotificationHistorySection />
                    <Search />
                  </MemoryRouter>
                </LayoutTierProvider>
              </DatesProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await settle();
  };

  const button = (text: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
      b.textContent?.includes(text)
    ) ?? null;

  it('loads the filters from the address and pages through older notifications', async () => {
    mockApi.fetchNotificationPage
      .mockResolvedValueOnce({ items: [row('a'), row('b')], nextCursor: 'c1' })
      .mockResolvedValueOnce({ items: [row('c')] });
    await render('/settings?nstate=unread&ncat=inventory&nsev=critical,warning&nq=charger');

    expect(mockApi.fetchNotificationPage).toHaveBeenCalledWith(
      'unread',
      {
        categories: ['inventory'],
        severities: ['critical', 'warning'],
        from: undefined,
        to: undefined,
        q: 'charger',
      },
      undefined
    );
    expect(document.querySelectorAll('.ntf-row')).toHaveLength(2);

    await act(async () => button('Show older notifications')?.click());
    await settle();
    expect(mockApi.fetchNotificationPage).toHaveBeenLastCalledWith(
      'unread',
      expect.anything(),
      'c1'
    );
    expect(document.querySelectorAll('.ntf-row')).toHaveLength(3);
    expect(button('Show older notifications')).toBeNull();
  });

  it('marks what the filters show as read, and clears the filters', async () => {
    mockApi.fetchNotificationPage.mockResolvedValue({ items: [row('a')] });
    await render('/settings?ncat=inventory');

    await act(async () => button('Mark these as read')?.click());
    await settle();
    expect(mockApi.markAllNotificationsRead).toHaveBeenCalledWith(
      expect.objectContaining({ categories: ['inventory'], severities: [] })
    );

    await act(async () => button('Clear filters')?.click());
    await settle();
    expect(document.querySelector('[data-testid="search"]')?.textContent).toBe('');
  });

  it('says so when nothing matches', async () => {
    mockApi.fetchNotificationPage.mockResolvedValue({ items: [] });
    await render('/settings?nq=nothing');
    expect(document.body.textContent).toContain('Nothing matches these filters');
  });
});
