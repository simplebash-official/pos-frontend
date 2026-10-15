import { describe, expect, it } from 'vitest';
import { stockStatus } from '../stockStatus';

describe('stockStatus', () => {
  it('is out at zero, low at or below the minimum, ok above it', () => {
    expect(stockStatus(0, 8)).toBe('out');
    expect(stockStatus(0, 0)).toBe('out');
    expect(stockStatus(1, 8)).toBe('low');
    expect(stockStatus(8, 8)).toBe('low');
    expect(stockStatus(9, 8)).toBe('ok');
  });
});
