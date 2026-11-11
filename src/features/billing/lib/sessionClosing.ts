import type { QueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys } from '@/api/queryKeys';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import type { ApiError } from '@/shared/types/common';

export const SESSION_CLOSING_ERROR_CODE = 'SESSION_CLOSING';

export function isSessionClosingError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as Partial<ApiError>).code === SESSION_CLOSING_ERROR_CODE
  );
}

/** Formats a drawer-closing notice, naming the counting cashier when known. */
export function formatSessionClosingMessage(
  closingCashierName: string | null | undefined,
  actionNotice: string
): string {
  const name = closingCashierName?.trim();
  return name ? `${name} ${t('is counting the drawer.')} ${actionNotice}` : actionNotice;
}

export interface HandleSessionClosingOptions {
  /** Fallback text when the error carries no server message. */
  fallbackMessage: string;
  /** Whether to show the standard orange `Cash Count In Progress` notification (default: true). */
  notify?: boolean;
}

/**
 * Shared handler for `409 SESSION_CLOSING` mutation failures:
 * invalidates all register-session queries, resolves the user-facing pause message,
 * optionally raises the orange notification toast, and returns that message.
 * Returns `null` when `err` is not a `SESSION_CLOSING` error.
 */
export function handleSessionClosingError(
  err: unknown,
  queryClient: QueryClient,
  options: HandleSessionClosingOptions
): string | null {
  if (!isSessionClosingError(err)) {
    return null;
  }

  void queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all });
  const message = getErrorMessage(err, options.fallbackMessage);

  if (options.notify !== false) {
    notifications.show({
      title: t('Cash Count In Progress'),
      message,
      color: 'orange',
    });
  }

  return message;
}
