export type NotificationCategory =
  'repair' | 'inventory' | 'billing' | 'print' | 'system' | 'general';

export type NotificationPriority = 'normal' | 'urgent' | 'info';

export interface NotificationActor {
  name: string;
  avatarUrl?: string;
  initials?: string;
  role?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  category: NotificationCategory;
  priority?: NotificationPriority;
  actor?: NotificationActor;
  actionIconType?: 'check' | 'tool' | 'box' | 'alert' | 'user' | 'cart' | 'printer';
  link?: string; // Route path to navigate on click (e.g. /repairs, /inventory)
  actionLabel?: string;
}
