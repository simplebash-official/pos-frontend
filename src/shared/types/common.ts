export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

/**
 * Bookkeeping the backend attaches to every syncable entity.
 *
 * `version` drives optimistic concurrency: the outbox echoes it back as
 * `If-Match` so the server can reject a write based on a row that has since
 * moved. It is optional here only because a row created offline has no server
 * version yet — every row the server has seen carries one.
 *
 * `deletedAt` is present because rows are soft-deleted; a delta pull has to be
 * able to see a deletion, which a hard delete would hide.
 *
 * The keys these appear under are the field names the API returns, so listing
 * them here is what lets `readServerVersion` and the conflict machinery work
 * against real values rather than silently defaulting.
 */
export interface SyncedEntityFields {
  version?: number;
  deletedAt?: string;
  updatedByDevice?: string;
}
