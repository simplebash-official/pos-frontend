import { describe, expect, it } from 'vitest';
import { shortLabel } from '../shortLabel';

describe('shortLabel', () => {
  it('keeps the Sinhala part when English is in brackets', () => {
    expect(shortLabel('බඩු ලැයිස්තුව සහ තොග (Inventory & Stock)')).toBe('බඩු ලැයිස්තුව සහ තොග');
  });

  it('keeps the bracketed Sinhala when the label starts in English', () => {
    expect(shortLabel('Quotations (මිල ගණන් කොළ)')).toBe('මිල ගණන් කොළ');
  });

  it('leaves labels without brackets alone', () => {
    expect(shortLabel('බිල් කවුන්ටරය')).toBe('බිල් කවුන්ටරය');
    expect(shortLabel('Register Shifts')).toBe('Register Shifts');
  });
});
