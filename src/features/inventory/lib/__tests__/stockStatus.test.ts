import { describe, expect, it } from 'vitest';
import { isAtOrBelowAlert, stockStatus } from '../stockStatus';

describe('stockStatus', () => {
  it('is out at zero, low at or below the minimum, ok above it', () => {
    expect(stockStatus(0, 8)).toBe('out');
    expect(stockStatus(0, 0)).toBe('out');
    expect(stockStatus(1, 8)).toBe('low');
    expect(stockStatus(8, 8)).toBe('low');
    expect(stockStatus(9, 8)).toBe('ok');
  });

  it('never calls an item with no alert level low, but still reports it out of stock', () => {
    expect(stockStatus(0, null)).toBe('out');
    expect(stockStatus(1, null)).toBe('ok');
    expect(stockStatus(500, null)).toBe('ok');
  });
});

describe('isAtOrBelowAlert', () => {
  it('is true at or below the level, false above it', () => {
    expect(isAtOrBelowAlert(5, 5)).toBe(true);
    expect(isAtOrBelowAlert(0, 5)).toBe(true);
    expect(isAtOrBelowAlert(6, 5)).toBe(false);
  });

  it('counts an empty shelf as at the level when the level is 0', () => {
    expect(isAtOrBelowAlert(0, 0)).toBe(true);
    expect(isAtOrBelowAlert(1, 0)).toBe(false);
  });

  it('is always false for an item with no alert level', () => {
    expect(isAtOrBelowAlert(0, null)).toBe(false);
    expect(isAtOrBelowAlert(3, null)).toBe(false);
  });
});
