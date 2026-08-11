import type { MutationRequestOptions } from '@/api/client';
import type { PushContext } from '../types';

/**
 * Builds the request options for a pushed mutation.
 *
 * `baseVersion` is omitted rather than sent as null when the operation is a
 * create or when the backend has not yet shipped row versions — an absent
 * `If-Match` means "no precondition", which is exactly right, whereas a null
 * one would be a malformed header.
 */
export const pushOptions = (ctx: PushContext): MutationRequestOptions => {
  if (ctx.baseVersion === null) {
    return { idempotencyKey: ctx.idempotencyKey };
  }
  return { idempotencyKey: ctx.idempotencyKey, baseVersion: ctx.baseVersion };
};
