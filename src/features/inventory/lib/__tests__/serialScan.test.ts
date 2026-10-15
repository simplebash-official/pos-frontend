import { describe, it, expect, vi } from 'vitest';
import { resolveSerialScan } from '../serialScan';
import type { SerialLookup } from '../../types';

const lookup = { sellingPriceCents: 80000 } as SerialLookup;

describe('resolveSerialScan', () => {
  it('finds the unit for a serial number, sending it as typed (trimmed, case kept)', async () => {
    const fetchSerial = vi.fn().mockResolvedValue(lookup);
    expect(await resolveSerialScan('  SN-ab12 ', fetchSerial)).toEqual({ kind: 'found', lookup });
    expect(fetchSerial).toHaveBeenCalledWith('SN-ab12');
  });

  it('reports a unit that is not in stock any more (409)', async () => {
    const fetchSerial = vi.fn().mockRejectedValue({ statusCode: 409, message: 'sold' });
    expect(await resolveSerialScan('356938000000011', fetchSerial)).toEqual({ kind: 'sold' });
  });

  it.each([404, 0, 500])('treats a %i as "not a serial number"', async (statusCode) => {
    const fetchSerial = vi.fn().mockRejectedValue({ statusCode, message: 'x' });
    expect(await resolveSerialScan('abc', fetchSerial)).toEqual({ kind: 'unknown' });
  });

  it('does not ask the server about blank input', async () => {
    const fetchSerial = vi.fn();
    expect(await resolveSerialScan('   ', fetchSerial)).toEqual({ kind: 'unknown' });
    expect(fetchSerial).not.toHaveBeenCalled();
  });
});
