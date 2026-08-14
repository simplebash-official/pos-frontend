import { describe, it, expect } from 'vitest';
import notificationReducer, {
  markAsRead,
  markAllAsRead,
  addNotification,
  removeNotification,
  clearAll,
  selectAllNotifications,
  selectUnreadNotifications,
  selectUnreadNotificationCount,
} from '@/store/slices/notificationSlice';
import type { RootState } from '@/store';

describe('notificationSlice', () => {
  it('should mark an individual notification as read', () => {
    const initialState = {
      items: [
        {
          id: 'test-1',
          title: 'Test Alert',
          message: 'Message 1',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'repair' as const,
        },
      ],
    };

    const nextState = notificationReducer(initialState, markAsRead('test-1'));
    expect(nextState.items[0].read).toBe(true);
  });

  it('should mark all notifications as read', () => {
    const initialState = {
      items: [
        {
          id: 'test-1',
          title: 'Test 1',
          message: 'Message 1',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'repair' as const,
        },
        {
          id: 'test-2',
          title: 'Test 2',
          message: 'Message 2',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'inventory' as const,
        },
      ],
    };

    const nextState = notificationReducer(initialState, markAllAsRead());
    expect(nextState.items.every((n) => n.read)).toBe(true);
  });

  it('should add a new notification to the beginning of the list', () => {
    const initialState = {
      items: [],
    };

    const nextState = notificationReducer(
      initialState,
      addNotification({
        title: 'New Job Alert',
        message: 'New phone repair intake registered',
        category: 'repair',
      })
    );

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0].title).toBe('New Job Alert');
    expect(nextState.items[0].read).toBe(false);
  });

  it('should use a caller-supplied id for addNotification when given one', () => {
    const initialState = {
      items: [],
    };

    const nextState = notificationReducer(
      initialState,
      addNotification({
        id: 'low-stock-product-1',
        title: 'Low Stock Alert',
        message: 'Widget is low on stock',
        category: 'inventory',
      })
    );

    expect(nextState.items[0].id).toBe('low-stock-product-1');
  });

  it('should remove a notification by id', () => {
    const initialState = {
      items: [
        {
          id: 'test-1',
          title: 'Test 1',
          message: 'Message 1',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'billing' as const,
        },
      ],
    };

    const nextState = notificationReducer(initialState, removeNotification('test-1'));
    expect(nextState.items).toHaveLength(0);
  });

  it('should clear all notifications', () => {
    const initialState = {
      items: [
        {
          id: 'test-1',
          title: 'Test 1',
          message: 'Message 1',
          timestamp: new Date().toISOString(),
          read: false,
          category: 'billing' as const,
        },
      ],
    };

    const nextState = notificationReducer(initialState, clearAll());
    expect(nextState.items).toHaveLength(0);
  });

  it('should correctly select unread count', () => {
    const mockRootState = {
      notifications: {
        items: [
          {
            id: 'test-1',
            title: 'Test 1',
            message: 'Msg',
            timestamp: new Date().toISOString(),
            read: false,
            category: 'repair' as const,
          },
          {
            id: 'test-2',
            title: 'Test 2',
            message: 'Msg',
            timestamp: new Date().toISOString(),
            read: true,
            category: 'repair' as const,
          },
        ],
      },
    } as unknown as RootState;

    expect(selectAllNotifications(mockRootState)).toHaveLength(2);
    expect(selectUnreadNotifications(mockRootState)).toHaveLength(1);
    expect(selectUnreadNotificationCount(mockRootState)).toBe(1);
  });
});
