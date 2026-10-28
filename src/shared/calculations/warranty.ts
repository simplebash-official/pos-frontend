/** Standard billing month duration in milliseconds (30 days of 24 hours). */
export const BILLING_MONTH_MS = 30 * 86_400_000;

/**
 * Calculates the exact expiration timestamp in milliseconds for a given warranty duration.
 * Uses the standard retail billing rule of 30 days per month (2,592,000,000 ms).
 *
 * @param createdAt ISO date string or Date object representing purchase/invoice creation
 * @param warrantyMonths Number of months under warranty
 * @returns Expiration timestamp in milliseconds since Unix epoch
 * @throws Error if createdAt cannot be parsed into a valid timestamp
 */
export const getWarrantyExpirationTimestamp = (
  createdAt: string | Date,
  warrantyMonths: number
): number => {
  const createdMs =
    typeof createdAt === 'string' ? new Date(createdAt).getTime() : createdAt.getTime();
  if (Number.isNaN(createdMs)) {
    throw new Error(
      `Invalid createdAt date provided for warranty calculation: ${String(createdAt)}`
    );
  }
  if (!Number.isFinite(warrantyMonths) || warrantyMonths <= 0) {
    return createdMs;
  }
  return createdMs + warrantyMonths * BILLING_MONTH_MS;
};

/**
 * Checks whether a purchase is still within its active warranty period.
 * If warrantyMonths is undefined, null, non-finite, or <= 0, returns false.
 * If createdAt is invalid or unparseable, returns false.
 *
 * @param createdAt ISO date string or Date object
 * @param warrantyMonths Warranty duration in months (optional)
 * @param currentTimestampMs Current timestamp in ms (e.g. Date.now())
 * @returns true if currentTimestampMs < expirationTimestamp
 */
export const isWithinWarranty = (
  createdAt: string | Date,
  warrantyMonths: number | undefined | null,
  currentTimestampMs: number
): boolean => {
  if (
    warrantyMonths === undefined ||
    warrantyMonths === null ||
    !Number.isFinite(warrantyMonths) ||
    warrantyMonths <= 0
  ) {
    return false;
  }
  try {
    const expirationMs = getWarrantyExpirationTimestamp(createdAt, warrantyMonths);
    return currentTimestampMs < expirationMs;
  } catch {
    return false;
  }
};
