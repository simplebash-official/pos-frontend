import type { ReactNode } from 'react';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconCircleX,
  IconInfoCircle,
} from '@tabler/icons-react';

/** What a toast is telling the person; decides its colour and icon everywhere in the app. */
export type ToastTone = 'success' | 'error' | 'warning' | 'info';

/** A brief pop-up. Never stored: alerts worth keeping go to the notification history instead. */
export interface Toast {
  title?: string;
  message: ReactNode;
  /** Milliseconds on screen, or `false` to stay until closed. Mantine's own timing when absent. */
  autoClose?: number | false;
  /** Lets a later `notify.update` or `notify.hide` reach this toast. */
  id?: string;
  /** Shows a spinner instead of the icon while something is still running. */
  loading?: boolean;
}

const TONES: Record<ToastTone, { color: string; icon: ReactNode }> = {
  success: { color: 'teal', icon: <IconCircleCheck size={18} stroke={1.8} /> },
  error: { color: 'red', icon: <IconCircleX size={18} stroke={1.8} /> },
  warning: { color: 'orange', icon: <IconAlertTriangle size={18} stroke={1.8} /> },
  info: { color: 'blue', icon: <IconInfoCircle size={18} stroke={1.8} /> },
};

const payload = (tone: ToastTone, toast: Toast) => ({
  ...toast,
  color: TONES[tone].color,
  icon: TONES[tone].icon,
});

/**
 * The app's one toast engine. Every pop-up goes through here (direct `@mantine/notifications`
 * use is refused by lint), so all of them share the same colours, icons and wording rules.
 */
export const notify = {
  success: (toast: Toast) => notifications.show(payload('success', toast)),
  error: (toast: Toast) => notifications.show(payload('error', toast)),
  warning: (toast: Toast) => notifications.show(payload('warning', toast)),
  info: (toast: Toast) => notifications.show(payload('info', toast)),
  /** Replaces the toast shown with `toast.id`. */
  update: (tone: ToastTone, toast: Toast & { id: string }) =>
    notifications.update(payload(tone, toast)),
  hide: (id: string) => notifications.hide(id),
};
