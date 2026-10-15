import { describe, it, expect } from 'vitest';
import { columnsForWidth } from '../catalogColumns';

describe('columnsForWidth', () => {
  it.each([
    [0, 1],
    [299, 1],
    [300, 2],
    [649, 2],
    [650, 3],
    [2000, 3],
  ])('gives %ipx %i column(s)', (width, columns) => {
    expect(columnsForWidth(width)).toBe(columns);
  });
});
