import { ApiError } from '@/shared/types/common';

/**
 * Sanitizes technical database/server errors into human-readable messages.
 * Prevents internal database codes, driver exceptions, and SQL constraints
 * from leaking into the UI.
 */
export function sanitizeErrorMessage(message: unknown, statusCode?: number): string {
  if (typeof message !== 'string' || !message.trim()) {
    if (statusCode === 401) return 'Your session has expired. Please log in again.';
    if (statusCode === 403) return 'You do not have permission to perform this action.';
    if (statusCode === 404) return 'The requested resource was not found.';
    if (statusCode && statusCode >= 500) {
      return 'An unexpected server error occurred. Please try again later.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();

  // Detect technical leaks from SQLite, MongoDB, SQL drivers, or server runtimes
  const isTechnicalLeak =
    lower.includes('error returned from database') ||
    lower.includes('constraint failed') ||
    lower.includes('not null') ||
    lower.includes('unique constraint') ||
    lower.includes('foreign key') ||
    lower.includes('syntax error') ||
    lower.includes('code: 1299') ||
    lower.includes('sqlx') ||
    lower.includes('sqlite') ||
    lower.includes('mongodb') ||
    lower.includes('bson') ||
    lower.includes('connection refused') ||
    lower.includes('broken pipe') ||
    lower.includes('panic') ||
    lower.includes('stack trace') ||
    lower.includes('no such table') ||
    lower.includes('no such column');

  if (isTechnicalLeak) {
    return 'An unexpected server error occurred. Please try again later or contact support.';
  }

  return trimmed;
}

/**
 * Resolves any thrown error or ApiError into a user-friendly, human-readable string.
 */
export function getErrorMessage(
  err: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
): string {
  if (!err) {
    return fallbackMessage;
  }

  if (typeof err === 'object') {
    const apiError = err as Partial<ApiError>;
    if (typeof apiError.message === 'string' && apiError.message.trim()) {
      return sanitizeErrorMessage(apiError.message, apiError.statusCode);
    }
  }

  if (err instanceof Error && err.message) {
    return sanitizeErrorMessage(err.message);
  }

  if (typeof err === 'string' && err.trim()) {
    return sanitizeErrorMessage(err);
  }

  return fallbackMessage;
}
