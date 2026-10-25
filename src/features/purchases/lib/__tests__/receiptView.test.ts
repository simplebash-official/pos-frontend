import { describe, expect, it } from 'vitest';
import { receiptStatusLook } from '../receiptView';

describe('receiptStatusLook', () => {
  it('words and colours each state', () => {
    expect(receiptStatusLook('unpaid')).toEqual({ color: 'red', label: 'Not paid' });
    expect(receiptStatusLook('partly_paid')).toEqual({ color: 'orange', label: 'Part paid' });
    expect(receiptStatusLook('paid')).toEqual({ color: 'green', label: 'Paid' });
  });
});
