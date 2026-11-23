import dayjs from 'dayjs';
import {
  IconCash,
  IconFileInvoice,
  IconPackage,
  IconPrinter,
  IconReceipt,
  IconSettings,
  IconShieldCheck,
  IconSpeakerphone,
  IconTool,
} from '@tabler/icons-react';
import type { AppNotification, NotificationCategory, NotificationSeverity } from '../types';

type TablerIcon = typeof IconReceipt;

/** How each category reads and looks. Labels are English keys for `t()`. */
export const CATEGORY_VIEW: Record<NotificationCategory, { label: string; icon: TablerIcon }> = {
  sales: { label: 'Sales', icon: IconReceipt },
  repairs: { label: 'Repairs', icon: IconTool },
  print_jobs: { label: 'Print jobs', icon: IconPrinter },
  inventory: { label: 'Stock', icon: IconPackage },
  expenses: { label: 'Bills & expenses', icon: IconFileInvoice },
  warranties: { label: 'Warranties', icon: IconShieldCheck },
  cash: { label: 'Cash drawer', icon: IconCash },
  system: { label: 'System', icon: IconSettings },
  announcements: { label: 'News from SimpleBash', icon: IconSpeakerphone },
};

/** Categories in the order the filters list them. */
export const CATEGORY_ORDER: NotificationCategory[] = [
  'sales',
  'repairs',
  'print_jobs',
  'inventory',
  'expenses',
  'warranties',
  'cash',
  'system',
  'announcements',
];

/** Mantine colour of each severity (its `-light` variables follow the colour scheme). */
export const SEVERITY_COLOR: Record<NotificationSeverity, string> = {
  info: 'blue',
  success: 'teal',
  warning: 'orange',
  critical: 'red',
};

/** English keys for `t()`, mildest first. */
export const SEVERITY_LABEL: Record<NotificationSeverity, string> = {
  info: 'Information',
  success: 'Good news',
  warning: 'Needs attention',
  critical: 'Urgent',
};

export const SEVERITY_ORDER: NotificationSeverity[] = ['critical', 'warning', 'success', 'info'];

/** Severities that pop up as a toast when they arrive. */
export const announcesOnArrival = (severity: NotificationSeverity): boolean =>
  severity === 'warning' || severity === 'critical';

/** `Today`, `Yesterday` (English keys for `t()`) or the date itself. */
export const dayLabel = (createdAt: string, now: Date): { key: string; text: string } => {
  const day = dayjs(createdAt).startOf('day');
  const today = dayjs(now).startOf('day');
  const diff = today.diff(day, 'day');
  if (diff === 0) return { key: 'today', text: 'Today' };
  if (diff === 1) return { key: 'yesterday', text: 'Yesterday' };
  const format = day.year() === today.year() ? 'dddd, D MMMM' : 'D MMMM YYYY';
  return { key: day.format('YYYY-MM-DD'), text: day.format(format) };
};

export interface DayGroup {
  key: string;
  /** Translate with `t()` when it is `Today` or `Yesterday`. */
  label: string;
  /** Whether `label` is a fixed phrase (translate it) rather than a date. */
  phrase: boolean;
  items: AppNotification[];
}

/** Newest-first items split into day sections, keeping their order. */
export const groupByDay = (items: AppNotification[], now: Date): DayGroup[] => {
  const groups: DayGroup[] = [];
  for (const item of items) {
    const { key, text } = dayLabel(item.createdAt, now);
    const last = groups[groups.length - 1];
    if (last !== undefined && last.key === key) {
      last.items.push(item);
    } else {
      groups.push({
        key,
        label: text,
        phrase: key === 'today' || key === 'yesterday',
        items: [item],
      });
    }
  }
  return groups;
};

/** Short time for a row: just now, minutes ago, a clock time today or yesterday, else the date. */
export type RowTime =
  { kind: 'now' } | { kind: 'minutes'; minutes: number } | { kind: 'at'; text: string };

export const rowTime = (createdAt: string, now: Date): RowTime => {
  const at = dayjs(createdAt);
  const minutes = dayjs(now).diff(at, 'minute');
  if (minutes < 1) return { kind: 'now' };
  if (minutes < 60) return { kind: 'minutes', minutes };
  if (dayjs(now).startOf('day').diff(at.startOf('day'), 'day') < 2) {
    return { kind: 'at', text: at.format('h:mm A') };
  }
  return { kind: 'at', text: at.format('D MMM') };
};

/** The bell's swing when an alert arrives: transform only. */
export const RING_KEYFRAMES = {
  rotate: [0, -18, 14, -10, 6, -2, 0],
  transition: { duration: 0.8, ease: 'easeInOut' as const },
};
