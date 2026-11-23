/** Which part of the shop a notification is about; the history filters on it. */
export type NotificationCategory =
  | 'sales'
  | 'repairs'
  | 'print_jobs'
  | 'inventory'
  | 'expenses'
  | 'warranties'
  | 'cash'
  | 'system'
  | 'announcements';

/** How much a notification matters; drives its colour and whether it pops up on arrival. */
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

/** Who a notification is for. Read state is kept per user either way. */
export type NotificationAudience =
  | { type: 'everyone' }
  | { type: 'permission'; permission: string }
  | { type: 'user'; userKey: string };

/** `shop`: raised by the POS itself. `service`: sent to the shop by SimpleBash. */
export type NotificationSource = 'shop' | 'service';

/** A button that opens a screen of the app. */
export interface NotificationLink {
  /** App route, starting with `/`. */
  path: string;
  label: string;
}

/** One notification as the signed-in user sees it. */
export interface AppNotification {
  key: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  link?: NotificationLink;
  audience: NotificationAudience;
  source: NotificationSource;
  /** Whether this user has read it. */
  read: boolean;
  /** ISO time it was raised. */
  createdAt: string;
}

export interface CategoryUnread {
  category: NotificationCategory;
  unread: number;
}

/** What the header bell shows. */
export interface NotificationSummary {
  unreadTotal: number;
  /** Only categories with something unread. */
  unreadByCategory: CategoryUnread[];
  /** The newest 30, read or not. */
  latest: AppNotification[];
}

export type ReadStateFilter = 'all' | 'unread' | 'read';

/** The history filter, also used by "mark these as read". */
export interface NotificationFilter {
  categories: NotificationCategory[];
  severities: NotificationSeverity[];
  /** ISO start (inclusive). */
  from?: string;
  /** ISO end (exclusive). */
  to?: string;
  /** Text in the title or message. */
  q?: string;
}

export interface NotificationPage {
  items: AppNotification[];
  /** Absent on the last page. */
  nextCursor?: string;
}

/** Who an alert raised by the app is for: everyone, a permission you hold, or only you. */
export type AlertAudience =
  { type: 'everyone' } | { type: 'permission'; permission: string } | { type: 'me' };

/** An alert the app raises into the shop's history. */
export interface NewAlert {
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  link?: NotificationLink;
  audience: AlertAudience;
  /** Same value, same notification: raised once per shop however many tabs raise it. */
  dedupeKey?: string;
}
