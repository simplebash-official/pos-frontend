/** Control-flow errors the engine raises and handles internally. */

/**
 * Extracts a readable message from anything thrown.
 *
 * `ApiError` is a plain object, not an `Error` instance (see the response
 * interceptor in `src/api/client.ts`), so the usual
 * `error instanceof Error ? error.message : String(error)` renders it as
 * "[object Object]" and throws away the only useful information.
 */
export const describeError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      const statusCode = (error as { statusCode?: unknown }).statusCode;
      return typeof statusCode === 'number' && statusCode > 0
        ? `${message} (HTTP ${statusCode})`
        : message;
    }
  }
  return String(error);
};

/**
 * A push referenced an entity that has not reached the server yet.
 *
 * Not a failure: the flush loop requeues the operation without incrementing
 * its attempt count, and retries once the referenced entity has been pushed.
 */
export class UnresolvedReferenceError extends Error {
  readonly localId: string;
  readonly resource: string;

  constructor(localId: string, resource: string) {
    super(`Reference ${localId} (${resource}) has not been synced yet`);
    this.name = 'UnresolvedReferenceError';
    this.localId = localId;
    this.resource = resource;
  }
}

/**
 * A push referenced an entity whose local create was permanently abandoned, so
 * the reference can never resolve. The dependent operation is dead too.
 */
export class AbandonedReferenceError extends Error {
  readonly localId: string;
  readonly resource: string;

  constructor(localId: string, resource: string) {
    super(`Reference ${localId} (${resource}) was abandoned and can never resolve`);
    this.name = 'AbandonedReferenceError';
    this.localId = localId;
    this.resource = resource;
  }
}

/**
 * The server rejected our delta cursor — it is older than the tombstone
 * retention window, or a schema change invalidated it. The puller responds by
 * clearing the cursor and doing a full refresh.
 */
export class CursorInvalidError extends Error {
  readonly resource: string;

  constructor(resource: string) {
    super(`Delta cursor for ${resource} is no longer valid; a full refresh is required`);
    this.name = 'CursorInvalidError';
    this.resource = resource;
  }
}

/** The outbox is at capacity; refuse further writes rather than grow unboundedly. */
export class OutboxFullError extends Error {
  readonly pendingCount: number;

  constructor(pendingCount: number) {
    super(
      `${pendingCount} changes are still waiting to sync. Reconnect to the internet before making more changes.`
    );
    this.name = 'OutboxFullError';
    this.pendingCount = pendingCount;
  }
}

/**
 * A barcode the local mirror already holds.
 *
 * Mirrors the server's `BARCODE_ALREADY_EXISTS` so the product form's
 * existing 409 handling fires identically whether the clash is caught
 * locally while offline or by the server. Carries `code`/`statusCode` to
 * match the `ApiError` shape that handling reads.
 */
export class BarcodeConflictError extends Error {
  readonly code = 'BARCODE_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(barcode: string) {
    super(`A product with barcode "${barcode}" already exists`);
    this.name = 'BarcodeConflictError';
  }
}
