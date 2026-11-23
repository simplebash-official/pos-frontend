/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { installDrawerTestEnv } from '@/shared/components/drawer/testEnv';
import { LayoutTierProvider } from '@/shared/hooks/useResponsive';
import { queryKeys } from '@/api/queryKeys';
import { notify } from '@/shared/notify';
import { NotificationCenter } from '../components/NotificationCenter';
import type { AppNotification, NotificationSummary } from '../types';

installDrawerTestEnv();

const mockApi = {
  fetchNotificationSummary: vi.fn(),
  markNotificationsRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
};

vi.mock('@/features/notifications/api/notificationsApi', () => ({
  fetchNotificationSummary: () => mockApi.fetchNotificationSummary(),
  markNotificationsRead: (keys: string[]) => mockApi.markNotificationsRead(keys),
  markAllNotificationsRead: (filter: unknown) => mockApi.markAllNotificationsRead(filter),
  fetchNotificationPage: vi.fn(),
  raiseAlert: vi.fn(),
}));

vi.mock('@/shared/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

const row = (key: string, over: Partial<AppNotification> = {}): AppNotification => ({
  key,
  category: 'repairs',
  severity: 'success',
  title: `Title ${key}`,
  body: `Body ${key}`,
  audience: { type: 'everyone' },
  source: 'shop',
  read: false,
  createdAt: minutesAgo(5),
  ...over,
});

const summaryOf = (latest: AppNotification[]): NotificationSummary => {
  const unread = latest.filter((n) => !n.read);
  const categories = [...new Set(unread.map((n) => n.category))];
  return {
    unreadTotal: unread.length,
    unreadByCategory: categories.map((category) => ({
      category,
      unread: unread.filter((n) => n.category === category).length,
    })),
    latest,
  };
};

let PERMISSIONS: string[] = ['notifications:view'];

const Where = () => <div data-testid="where">{useLocation().pathname}</div>;

describe('NotificationCenter', () => {
  let container: HTMLDivElement;
  let root: Root;
  let client: QueryClient;

  beforeEach(() => {
    PERMISSIONS = ['notifications:view'];
    mockApi.fetchNotificationSummary.mockReset();
    mockApi.markNotificationsRead.mockReset().mockResolvedValue(1);
    mockApi.markAllNotificationsRead.mockReset().mockResolvedValue(2);
    vi.mocked(notify.error).mockClear();
    vi.mocked(notify.warning).mockClear();
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    document.body.innerHTML = '';
  });

  const render = async () => {
    const store = configureStore({
      reducer: {
        auth: () => ({
          isAuthenticated: true,
          user: { id: 'u', name: 'T', username: 't', role: 'staff', permissions: PERMISSIONS },
        }),
        settings: () => ({ appLanguage: 'en' }),
      },
    });
    await act(async () => {
      root.render(
        <Provider store={store}>
          <QueryClientProvider client={client}>
            <MantineProvider env="test">
              <LayoutTierProvider>
                <MemoryRouter initialEntries={['/billing']}>
                  <NotificationCenter />
                  <Where />
                </MemoryRouter>
              </LayoutTierProvider>
            </MantineProvider>
          </QueryClientProvider>
        </Provider>
      );
    });
    await settle();
  };

  // Lets queries resolve, async mutation steps run and leaving rows finish their exit.
  const settle = async () => {
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
      });
    }
  };

  const bell = () => document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]');
  const click = async (el: Element | null) => {
    expect(el).not.toBeNull();
    await act(async () => {
      (el as HTMLElement).click();
    });
    await settle();
  };
  const byText = (text: string) =>
    [...document.querySelectorAll<HTMLElement>('button, [role="radio"]')].find((b) =>
      b.textContent?.includes(text)
    ) ?? null;

  it('shows the unread count on the bell', async () => {
    mockApi.fetchNotificationSummary.mockResolvedValue(
      summaryOf([row('a'), row('b'), row('c', { read: true })])
    );
    await render();
    expect(bell()?.getAttribute('aria-label')).toBe('Notifications, 2 not read yet');
    expect(document.querySelector('.ntf-badge')?.textContent).toBe('2');
  });

  it('opens the newest notifications and filters them by read state and category', async () => {
    mockApi.fetchNotificationSummary.mockResolvedValue(
      summaryOf([
        row('a'),
        row('b', { category: 'inventory', severity: 'warning' }),
        row('c', { read: true }),
      ])
    );
    await render();
    await click(bell());
    expect(document.body.textContent).toContain('Today');
    expect(document.querySelectorAll('.ntf-row')).toHaveLength(3);

    await click(byText('Unread'));
    expect(document.querySelectorAll('.ntf-row')).toHaveLength(2);

    await click(
      [...document.querySelectorAll('.ntf-chip')].find((c) => c.textContent?.includes('Stock')) ??
        null
    );
    const titles = [...document.querySelectorAll('.ntf-row')].map((r) => r.textContent);
    expect(titles).toHaveLength(1);
    expect(titles[0]).toContain('Title b');
  });

  it('marks a notification read and opens its screen', async () => {
    mockApi.fetchNotificationSummary.mockResolvedValue(
      summaryOf([row('a', { link: { path: '/repairs?jobKey=rep_1', label: 'Open job' } })])
    );
    await render();
    await click(bell());
    await click(document.querySelector('.ntf-row-main'));
    expect(mockApi.markNotificationsRead).toHaveBeenCalledWith(['a']);
    expect(document.querySelector('[data-testid="where"]')?.textContent).toBe('/repairs');
  });

  it('marks everything read at once', async () => {
    mockApi.fetchNotificationSummary.mockResolvedValue(summaryOf([row('a'), row('b')]));
    await render();
    await click(bell());
    // What the server answers once everything is read.
    mockApi.fetchNotificationSummary.mockResolvedValue(
      summaryOf([row('a', { read: true }), row('b', { read: true })])
    );
    await click(document.querySelector('button[aria-label="Mark all as read"]'));
    expect(mockApi.markAllNotificationsRead).toHaveBeenCalledWith({
      categories: [],
      severities: [],
    });
    const summary = client.getQueryData<NotificationSummary>(queryKeys.notifications.summary());
    expect(summary?.unreadTotal).toBe(0);
    expect(document.querySelector('.ntf-badge')).toBeNull();
    expect(document.querySelectorAll('.ntf-row[data-unread]')).toHaveLength(0);
  });

  it('pops up an urgent alert that arrives, but not what was already there', async () => {
    mockApi.fetchNotificationSummary.mockResolvedValue(
      summaryOf([row('old', { severity: 'critical' })])
    );
    await render();
    expect(notify.error).not.toHaveBeenCalled();

    mockApi.fetchNotificationSummary.mockResolvedValue(
      summaryOf([
        row('new', {
          severity: 'critical',
          title: 'Out of stock: Charger',
          createdAt: minutesAgo(0),
        }),
        row('old', { severity: 'critical' }),
      ])
    );
    await act(async () => {
      await client.invalidateQueries({ queryKey: queryKeys.notifications.all });
    });
    await settle();
    expect(notify.error).toHaveBeenCalledWith({
      title: 'Out of stock: Charger',
      message: 'Body new',
    });
  });

  it('shows nothing to someone without the permission', async () => {
    PERMISSIONS = [];
    mockApi.fetchNotificationSummary.mockResolvedValue(summaryOf([row('a')]));
    await render();
    expect(bell()).toBeNull();
    expect(mockApi.fetchNotificationSummary).not.toHaveBeenCalled();
  });
});
