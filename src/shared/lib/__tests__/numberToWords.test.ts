import { describe, it, expect } from 'vitest';
import { numberToWordsRupees } from '../numberToWords';

describe('numberToWordsRupees converter', () => {
  it('converts 0 and negative amounts to zero sentence', () => {
    expect(numberToWordsRupees(0)).toBe('Sri Lankan Rupees Zero Only');
    expect(numberToWordsRupees(-500)).toBe('Sri Lankan Rupees Zero Only');
  });

  it('converts single digit and teen amounts in whole rupees', () => {
    expect(numberToWordsRupees(100)).toBe('Sri Lankan Rupees One Only');
    expect(numberToWordsRupees(500)).toBe('Sri Lankan Rupees Five Only');
    expect(numberToWordsRupees(1200)).toBe('Sri Lankan Rupees Twelve Only');
    expect(numberToWordsRupees(1900)).toBe('Sri Lankan Rupees Nineteen Only');
  });

  it('converts double digit and hundred amounts', () => {
    expect(numberToWordsRupees(2000)).toBe('Sri Lankan Rupees Twenty Only');
    expect(numberToWordsRupees(4500)).toBe('Sri Lankan Rupees Forty Five Only');
    expect(numberToWordsRupees(10000)).toBe('Sri Lankan Rupees One Hundred Only');
    expect(numberToWordsRupees(35000)).toBe('Sri Lankan Rupees Three Hundred Fifty Only');
  });

  it('converts thousand and lakh amounts', () => {
    expect(numberToWordsRupees(100000)).toBe('Sri Lankan Rupees One Thousand Only');
    expect(numberToWordsRupees(8000000)).toBe('Sri Lankan Rupees Eighty Thousand Only');
    expect(numberToWordsRupees(10000000)).toBe('Sri Lankan Rupees One Lakh Only');
    expect(numberToWordsRupees(25000000)).toBe('Sri Lankan Rupees Two Lakh Fifty Thousand Only');
  });

  it('converts amounts with cents fraction', () => {
    expect(numberToWordsRupees(50)).toBe('Sri Lankan Rupees Zero and Cents Fifty Only');
    expect(numberToWordsRupees(1140)).toBe('Sri Lankan Rupees Eleven and Cents Forty Only');
    expect(numberToWordsRupees(8000050)).toBe(
      'Sri Lankan Rupees Eighty Thousand and Cents Fifty Only'
    );
    expect(numberToWordsRupees(105)).toBe('Sri Lankan Rupees One and Cents Five Only');
  });
});
