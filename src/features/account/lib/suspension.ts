// The shop was suspended by SimpleBash: what the 403 `ACCOUNT_SUSPENDED` answer carries, kept for
// the suspended page, and the hook the API client uses to send the user there. No defaults: an
// answer with missing or mistyped fields is not treated as a suspension page at all.

import { STORAGE_KEYS } from '@/constants';
import type { ApiError } from '@/shared/types/common';

export interface Retained {
  bills: number;
  products: number;
  customers: number;
  staff: number;
  /** RFC 3339 time of the newest bill, null when the shop has none. */
  lastBillAt: string | null;
}

export interface Suspension {
  shopName: string;
  /** RFC 3339. */
  suspendedAt: string;
  reason: string;
  retained: Retained;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

/** The suspension described by `details`, or null when it is not complete and well-typed. */
export const parseSuspension = (details: unknown): Suspension | null => {
  if (!isRecord(details) || !isRecord(details.retained)) return null;
  const { shopName, suspendedAt, reason, retained } = details;
  const { bills, products, customers, staff, lastBillAt } = retained;
  if (
    !isText(shopName) ||
    !isText(suspendedAt) ||
    Number.isNaN(Date.parse(suspendedAt)) ||
    !isText(reason) ||
    !isCount(bills) ||
    !isCount(products) ||
    !isCount(customers) ||
    !isCount(staff) ||
    !(lastBillAt === null || (isText(lastBillAt) && !Number.isNaN(Date.parse(lastBillAt))))
  ) {
    return null;
  }
  return {
    shopName,
    suspendedAt,
    reason,
    retained: { bills, products, customers, staff, lastBillAt },
  };
};

// sessionStorage, so a reload of the page keeps it but a new tab does not inherit it.
export const saveSuspension = (suspension: Suspension): void => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.SUSPENSION, JSON.stringify(suspension));
  } catch {
    // Blocked storage: the page still shows for this visit, just not after a reload.
  }
};

export const readSuspension = (): Suspension | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.SUSPENSION);
    return raw === null ? null : parseSuspension(JSON.parse(raw));
  } catch {
    return null;
  }
};

export const clearSuspension = (): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SUSPENSION);
  } catch {
    // ignore
  }
};

type SuspensionHandler = (suspension: Suspension) => void;
let handler: SuspensionHandler | null = null;

/** Registered once at boot (App) so the API client can open the page without importing the router. */
export const setSuspensionHandler = (next: SuspensionHandler | null): void => {
  handler = next;
};

/** Called by the API client for every failed request; acts only on a complete suspension answer. */
export const notifyIfSuspended = (error: ApiError): void => {
  if (error.statusCode !== 403 || error.code !== 'ACCOUNT_SUSPENDED') return;
  const suspension = parseSuspension(error.details);
  if (suspension) handler?.(suspension);
};
