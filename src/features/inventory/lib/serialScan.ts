import type { ApiError } from '@/shared/types/common';
import type { SerialLookup } from '../types';

export type SerialScanResult =
  | { kind: 'found'; lookup: SerialLookup }
  /** The number belongs to a unit that is not in stock any more. */
  | { kind: 'sold' }
  | { kind: 'unknown' };

/**
 * Resolves a scanned/typed serial number (from a serial label) to its in-stock
 * unit, product and price. A 409 means the unit exists but is not in stock; any
 * other failure (an unknown number, or a transient error) is "not a serial
 * number" so the caller falls through to its normal "scan failed" feedback.
 */
export const resolveSerialScan = async (
  term: string,
  fetchSerial: (serialNumber: string) => Promise<SerialLookup>
): Promise<SerialScanResult> => {
  const serialNumber = term.trim();
  if (serialNumber === '') return { kind: 'unknown' };
  try {
    return { kind: 'found', lookup: await fetchSerial(serialNumber) };
  } catch (error) {
    return (error as Partial<ApiError>).statusCode === 409 ? { kind: 'sold' } : { kind: 'unknown' };
  }
};
