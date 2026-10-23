import { describe, expect, it } from 'vitest';
import type { CashCategory } from '@/features/billing/types';
import { byShopOrder, moveCategory, validateCategoryName } from '../categoryAdmin';

const cat = (key: string, sortOrder: number): CashCategory =>
  ({ key, name: key, sortOrder }) as unknown as CashCategory;

describe('moveCategory', () => {
  const list = [cat('a', 1), cat('b', 2), cat('c', 3)];

  it('swaps two neighbours', () => {
    expect(moveCategory(list, 'b', 'up')).toEqual([
      { key: 'b', sortOrder: 1 },
      { key: 'a', sortOrder: 2 },
    ]);
    expect(moveCategory(list, 'b', 'down')).toEqual([
      { key: 'b', sortOrder: 3 },
      { key: 'c', sortOrder: 2 },
    ]);
  });

  it('does nothing at either end or for an unknown key', () => {
    expect(moveCategory(list, 'a', 'up')).toBeNull();
    expect(moveCategory(list, 'c', 'down')).toBeNull();
    expect(moveCategory(list, 'zzz', 'up')).toBeNull();
  });

  it('nudges past a neighbour that shares its position', () => {
    const tied = [cat('a', 5), cat('b', 5)];
    expect(moveCategory(tied, 'b', 'up')).toEqual([{ key: 'b', sortOrder: 4 }]);
  });

  it('works from any input order', () => {
    expect(
      [...list]
        .reverse()
        .sort(byShopOrder)
        .map((c) => c.key)
    ).toEqual(['a', 'b', 'c']);
  });
});

describe('validateCategoryName', () => {
  it('needs 2 to 40 letters', () => {
    expect(validateCategoryName('Tea')).toBeNull();
    expect(validateCategoryName(' a ')).toMatch(/2 to 40/);
    expect(validateCategoryName('x'.repeat(41))).toMatch(/2 to 40/);
  });
});
