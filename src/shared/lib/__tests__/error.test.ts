import { describe, it, expect } from 'vitest';
import { sanitizeErrorMessage, getErrorMessage } from '../error';
import { ApiError } from '@/shared/types/common';

describe('error sanitization and extraction', () => {
  it('passes through clean, human-readable error messages', () => {
    expect(sanitizeErrorMessage('Invalid email or password.')).toBe('Invalid email or password.');
    expect(sanitizeErrorMessage('Customer not found.')).toBe('Customer not found.');
    expect(sanitizeErrorMessage('Category name already exists')).toBe(
      'Category name already exists'
    );
  });

  it('sanitizes SQLite constraint failure and driver errors', () => {
    const rawSqliteError =
      'error returned from database: (code: 1299) NOT NULL constraint failed: login_sessions.user_id';
    expect(sanitizeErrorMessage(rawSqliteError)).toBe(
      'An unexpected server error occurred. Please try again later or contact support.'
    );
  });

  it('sanitizes MongoDB, SQL, and internal server jargon', () => {
    expect(sanitizeErrorMessage('MongoDB error: duplicate key E11000')).toBe(
      'An unexpected server error occurred. Please try again later or contact support.'
    );
    expect(sanitizeErrorMessage('sqlx: syntax error at or near "SELECT"')).toBe(
      'An unexpected server error occurred. Please try again later or contact support.'
    );
    expect(sanitizeErrorMessage('connection refused')).toBe(
      'An unexpected server error occurred. Please try again later or contact support.'
    );
  });

  it('handles empty or missing messages with status-appropriate fallbacks', () => {
    expect(sanitizeErrorMessage('', 401)).toBe('Your session has expired. Please log in again.');
    expect(sanitizeErrorMessage('', 403)).toBe(
      'You do not have permission to perform this action.'
    );
    expect(sanitizeErrorMessage('', 404)).toBe('The requested resource was not found.');
    expect(sanitizeErrorMessage('', 500)).toBe(
      'An unexpected server error occurred. Please try again later.'
    );
  });

  it('resolves getErrorMessage correctly across different error shapes', () => {
    const apiError: ApiError = {
      message:
        'error returned from database: (code: 1299) NOT NULL constraint failed: login_sessions.user_id',
      statusCode: 500,
    };
    expect(getErrorMessage(apiError)).toBe(
      'An unexpected server error occurred. Please try again later or contact support.'
    );

    const normalApiError: ApiError = {
      message: 'Product out of stock',
      statusCode: 400,
    };
    expect(getErrorMessage(normalApiError)).toBe('Product out of stock');

    const standardError = new Error('Network error');
    expect(getErrorMessage(standardError)).toBe('Network error');

    expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});
