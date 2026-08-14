import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { AppNotification } from '@/features/notifications/types';
import type { RootState } from '@/store';
import { STORAGE_KEYS } from '@/constants/storage';

export interface NotificationState {
  items: AppNotification[];
}

const loadNotificationsFromStorage = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const initialState: NotificationState = {
  items: loadNotificationsFromStorage(),
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) {
        item.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { id?: string }>
    ) => {
      const { id, ...rest } = action.payload;
      const newNotif: AppNotification = {
        ...rest,
        id: id ?? `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      state.items.unshift(newNotif);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    clearAll: (state) => {
      state.items = [];
    },
  },
});

export const { markAsRead, markAllAsRead, addNotification, removeNotification, clearAll } =
  notificationSlice.actions;

// Selectors
export const selectAllNotifications = (state: RootState) => state.notifications.items;

export const selectUnreadNotifications = createSelector([selectAllNotifications], (items) =>
  items.filter((n) => !n.read)
);

export const selectUnreadNotificationCount = createSelector(
  [selectUnreadNotifications],
  (unreadItems) => unreadItems.length
);

export const selectNotificationsByCategory = (category: string) =>
  createSelector([selectAllNotifications], (items) =>
    category === 'all' ? items : items.filter((n) => n.category === category)
  );

export default notificationSlice.reducer;
