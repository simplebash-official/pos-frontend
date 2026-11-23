import {
  type InfiniteData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/slices/authSlice';
import {
  fetchNotificationPage,
  fetchNotificationSummary,
  markAllNotificationsRead,
  markNotificationsRead,
} from '../api/notificationsApi';
import type {
  AppNotification,
  NotificationFilter,
  NotificationPage,
  NotificationSummary,
  ReadStateFilter,
} from '../types';

/** Reload the bell this often even when the live stream is down (the stream is the fast path). */
const SUMMARY_SAFETY_POLL_MS = 60_000;

/** Whether the signed-in user can use notifications at all. */
export const useNotificationsEnabled = (): boolean => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const canView = useHasPermission(PERMISSIONS.NOTIFICATIONS_VIEW);
  return isAuthenticated && canView;
};

/** Unread counts and the newest notifications, for the header bell. */
export const useNotificationSummary = () => {
  const enabled = useNotificationsEnabled();
  return useQuery({
    queryKey: queryKeys.notifications.summary(),
    queryFn: fetchNotificationSummary,
    enabled,
    refetchInterval: enabled ? SUMMARY_SAFETY_POLL_MS : false,
  });
};

export interface HistoryQuery {
  state: ReadStateFilter;
  filter: NotificationFilter;
}

/** The history, newest first, one page at a time. */
export const useNotificationHistory = ({ state, filter }: HistoryQuery) => {
  const enabled = useNotificationsEnabled();
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.history({ state, ...filter }),
    queryFn: ({ pageParam }) => fetchNotificationPage(state, filter, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: NotificationPage) => last.nextCursor,
    enabled,
  });
};

type HistoryData = InfiniteData<NotificationPage, string | undefined>;

interface Snapshot {
  summary: NotificationSummary | undefined;
  histories: Array<[readonly unknown[], HistoryData | undefined]>;
}

const snapshot = (client: QueryClient): Snapshot => ({
  summary: client.getQueryData<NotificationSummary>(queryKeys.notifications.summary()),
  histories: client.getQueriesData<HistoryData>({
    queryKey: [...queryKeys.notifications.all, 'history'],
  }),
});

const restore = (client: QueryClient, saved: Snapshot) => {
  client.setQueryData(queryKeys.notifications.summary(), saved.summary);
  for (const [key, data] of saved.histories) client.setQueryData(key, data);
};

/** The bell and every loaded history page as if `isRead(item)` items were read. */
export const applyRead = (
  client: QueryClient,
  isRead: (item: AppNotification) => boolean
): void => {
  client.setQueryData<NotificationSummary>(queryKeys.notifications.summary(), (summary) => {
    if (summary === undefined) return summary;
    const newlyRead = summary.latest.filter((item) => !item.read && isRead(item));
    const perCategory = new Map<string, number>();
    for (const item of newlyRead) {
      perCategory.set(item.category, (perCategory.get(item.category) ?? 0) + 1);
    }
    const unreadByCategory = summary.unreadByCategory
      .map((entry) => ({
        ...entry,
        unread: Math.max(0, entry.unread - (perCategory.get(entry.category) ?? 0)),
      }))
      .filter((entry) => entry.unread > 0);
    return {
      latest: summary.latest.map((item) => (isRead(item) ? { ...item, read: true } : item)),
      unreadByCategory,
      unreadTotal: unreadByCategory.reduce((total, entry) => total + entry.unread, 0),
    };
  });
  for (const [key] of client.getQueriesData<HistoryData>({
    queryKey: [...queryKeys.notifications.all, 'history'],
  })) {
    const onlyUnread = (key[2] as { state?: ReadStateFilter } | undefined)?.state === 'unread';
    client.setQueryData<HistoryData>(key, (data) =>
      data === undefined
        ? data
        : {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              items: page.items
                .filter((item) => !(onlyUnread && isRead(item)))
                .map((item) => (isRead(item) ? { ...item, read: true } : item)),
            })),
          }
    );
  }
};

/** Marks the given notifications read for you, showing it at once. */
export const useMarkNotificationsRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (keys: string[]) => markNotificationsRead(keys),
    onMutate: async (keys: string[]) => {
      await client.cancelQueries({ queryKey: queryKeys.notifications.all });
      const saved = snapshot(client);
      const marked = new Set(keys);
      applyRead(client, (item) => marked.has(item.key));
      return saved;
    },
    onError: (_error, _keys, saved) => {
      if (saved !== undefined) restore(client, saved);
    },
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
};

const isEmptyFilter = (filter: NotificationFilter): boolean =>
  filter.categories.length === 0 &&
  filter.severities.length === 0 &&
  filter.from === undefined &&
  filter.to === undefined &&
  filter.q === undefined;

/** Marks everything matching `filter` read for you (shown at once when nothing is filtered). */
export const useMarkAllNotificationsRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (filter: NotificationFilter) => markAllNotificationsRead(filter),
    onMutate: async (filter: NotificationFilter) => {
      if (!isEmptyFilter(filter)) return undefined;
      await client.cancelQueries({ queryKey: queryKeys.notifications.all });
      const saved = snapshot(client);
      applyRead(client, () => true);
      return saved;
    },
    onError: (_error, _filter, saved) => {
      if (saved !== undefined) restore(client, saved);
    },
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });
};
