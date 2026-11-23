import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  AppNotification,
  NewAlert,
  NotificationFilter,
  NotificationPage,
  NotificationSummary,
  ReadStateFilter,
} from '../types';

/** Page size of the history. */
export const HISTORY_PAGE_SIZE = 20;

const filterParams = (filter: NotificationFilter) => ({
  categories: filter.categories.length > 0 ? filter.categories.join(',') : undefined,
  severities: filter.severities.length > 0 ? filter.severities.join(',') : undefined,
  from: filter.from,
  to: filter.to,
  q: filter.q,
});

export const fetchNotificationSummary = async (): Promise<NotificationSummary> => {
  const response = await apiClient.get<ApiResponse<NotificationSummary>>('/notifications/summary');
  return response.data;
};

export const fetchNotificationPage = async (
  state: ReadStateFilter,
  filter: NotificationFilter,
  cursor: string | undefined
): Promise<NotificationPage> => {
  const response = await apiClient.get<ApiResponse<NotificationPage>>('/notifications', {
    params: { state, limit: HISTORY_PAGE_SIZE, cursor, ...filterParams(filter) },
  });
  return response.data;
};

export const markNotificationsRead = async (keys: string[]): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ marked: number }>>('/notifications/read', {
    keys,
  });
  return response.data.marked;
};

export const markAllNotificationsRead = async (filter: NotificationFilter): Promise<number> => {
  const response = await apiClient.post<ApiResponse<{ marked: number }>>(
    '/notifications/read-all',
    filterParams(filter)
  );
  return response.data.marked;
};

/** Raises an alert into the shop's notification history (bell, history, other terminals). */
export const raiseAlert = async (alert: NewAlert): Promise<AppNotification> => {
  const response = await apiClient.post<ApiResponse<AppNotification>>('/notifications', alert);
  return response.data;
};
