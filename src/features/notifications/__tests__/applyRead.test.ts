import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { applyRead } from '../hooks/useNotifications';
import type { AppNotification, NotificationSummary } from '../types';

const n = (key: string, category: AppNotification['category'], read: boolean): AppNotification => ({
  key,
  category,
  severity: 'warning',
  title: key,
  body: 'b',
  audience: { type: 'everyone' },
  source: 'shop',
  read,
  createdAt: '2026-11-18T10:00:00Z',
});

describe('applyRead', () => {
  it('marks rows read at once and keeps the counts consistent', () => {
    const client = new QueryClient();
    const summary: NotificationSummary = {
      unreadTotal: 3,
      unreadByCategory: [
        { category: 'repairs', unread: 2 },
        { category: 'inventory', unread: 1 },
      ],
      latest: [n('a', 'repairs', false), n('b', 'repairs', false), n('c', 'inventory', false)],
    };
    client.setQueryData(queryKeys.notifications.summary(), summary);
    const unreadKey = queryKeys.notifications.history({ state: 'unread', categories: [] });
    const allKey = queryKeys.notifications.history({ state: 'all', categories: [] });
    const page = { pages: [{ items: summary.latest }], pageParams: [undefined] };
    client.setQueryData(unreadKey, page);
    client.setQueryData(allKey, page);

    applyRead(client, (item) => item.key === 'c' || item.key === 'a');

    const after = client.getQueryData<NotificationSummary>(queryKeys.notifications.summary());
    expect(after?.unreadTotal).toBe(1);
    expect(after?.unreadByCategory).toEqual([{ category: 'repairs', unread: 1 }]);
    expect(after?.latest.map((i) => i.read)).toEqual([true, false, true]);
    const unread = client.getQueryData<typeof page>(unreadKey);
    expect(unread?.pages[0].items.map((i) => i.key)).toEqual(['b']);
    const all = client.getQueryData<typeof page>(allKey);
    expect(all?.pages[0].items.map((i) => i.read)).toEqual([true, false, true]);
  });
});
