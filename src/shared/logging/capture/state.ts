/**
 * Redux capture: a middleware that records every dispatched action (type and
 * redacted, capped payload) and keeps the logger's `session_user` in step
 * with the auth slice, so every entry after login names who was signed in.
 */

import type { Middleware } from '@reduxjs/toolkit';
import { logger } from '@/shared/logging/logger';

const MAX_ACTION_PAYLOAD_BYTES = 8 * 1024;

interface AuthSliceLike {
  auth?: { user?: { id?: string } | null };
}

interface ActionLike {
  type: string;
  payload?: unknown;
  meta?: unknown;
  error?: unknown;
}

const isAction = (value: unknown): value is ActionLike =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as { type?: unknown }).type === 'string';

export const loggingMiddleware: Middleware = (api) => (next) => (action) => {
  const result = next(action);
  if (!logger.enabled || !isAction(action)) {
    return result;
  }

  const state = api.getState() as AuthSliceLike;
  const userId = state.auth?.user?.id;
  if (userId !== logger.sessionUserId) {
    const previous = logger.sessionUserId;
    logger.setSessionUser(userId);
    logger.info(
      'app',
      userId === undefined ? 'session.signed_out' : 'session.signed_in',
      { previousUser: previous, user: userId },
      userId === undefined ? 'User signed out' : 'User signed in'
    );
  }

  const payload = action.payload === undefined ? undefined : truncatedPayload(action.payload);
  logger.event(
    'state',
    'action',
    { type: action.type, payload, error: action.error },
    { level: action.error === undefined ? 'info' : 'warn', msg: action.type }
  );
  return result;
};

const truncatedPayload = (payload: unknown): unknown => {
  try {
    const serialized = JSON.stringify(payload);
    if (serialized !== undefined && serialized.length > MAX_ACTION_PAYLOAD_BYTES) {
      return {
        truncated: true,
        bytes: serialized.length,
        preview: serialized.slice(0, MAX_ACTION_PAYLOAD_BYTES),
      };
    }
  } catch {
    return '[unserializable]';
  }
  return payload;
};
