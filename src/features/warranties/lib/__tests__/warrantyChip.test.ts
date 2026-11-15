import { describe, expect, it } from 'vitest';
import { warrantyChipLabel } from '../warrantyView';

describe('warrantyChipLabel', () => {
  it('words each state for an invoice line', () => {
    expect(warrantyChipLabel({ state: 'active', endsOn: '2026-12-13' })).toBe(
      'Warranty until 13 Dec 2026'
    );
    expect(warrantyChipLabel({ state: 'expiring_soon', endsOn: '2026-12-13' })).toBe(
      'Warranty until 13 Dec 2026'
    );
    expect(warrantyChipLabel({ state: 'expired', endsOn: '2026-12-13' })).toBe(
      'Expired 13 Dec 2026'
    );
    expect(warrantyChipLabel({ state: 'void', endsOn: '2026-12-13' })).toBe('Cancelled');
    expect(warrantyChipLabel({ state: 'under_claim', endsOn: '2026-12-13' })).toBe('Under claim');
    expect(warrantyChipLabel({ state: 'active' })).toBe('Covered for life');
  });
});
