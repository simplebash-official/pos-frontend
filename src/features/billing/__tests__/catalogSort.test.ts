import { describe, it, expect } from 'vitest';
import authReducer, { setUser, setUserPreferences } from '@/store/slices/authSlice';
import {
  CATALOG_SORTS,
  DEFAULT_CATALOG_SORT,
  catalogSortParams,
  isCatalogSort,
} from '../lib/catalogSort';

describe('catalog sort presets', () => {
  it('defaults to name A-Z', () => {
    expect(DEFAULT_CATALOG_SORT).toBe('name_asc');
  });

  it('has unique ids and a backend sort for every preset', () => {
    const ids = CATALOG_SORTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of CATALOG_SORTS) {
      expect(s.sortBy).toBeTruthy();
      expect(['asc', 'desc']).toContain(s.sortOrder);
    }
  });

  it('guards unknown values', () => {
    expect(isCatalogSort('price_asc')).toBe(true);
    expect(isCatalogSort('bogus')).toBe(false);
    expect(isCatalogSort(undefined)).toBe(false);
    expect(isCatalogSort(null)).toBe(false);
  });

  it('sends nothing for the default so it shares the plain products cache', () => {
    expect(catalogSortParams('name_asc')).toEqual({});
  });

  it('maps presets to the backend sortBy/sortOrder', () => {
    expect(catalogSortParams('price_asc')).toEqual({
      sortBy: 'sellingPriceCents',
      sortOrder: 'asc',
    });
    expect(catalogSortParams('price_desc')).toEqual({
      sortBy: 'sellingPriceCents',
      sortOrder: 'desc',
    });
    expect(catalogSortParams('name_desc')).toEqual({ sortBy: 'name', sortOrder: 'desc' });
    expect(catalogSortParams('newest')).toEqual({ sortBy: 'createdAt', sortOrder: 'desc' });
  });
});

describe('auth preferences', () => {
  const user = { id: 'u1', name: 'A', email: 'a@x.test', role: 'staff' };

  it('merges a preference into the signed-in user', () => {
    let state = authReducer(undefined, setUser(user));
    state = authReducer(state, setUserPreferences({ billingCatalogSort: 'price_desc' }));
    expect(state.user?.preferences?.billingCatalogSort).toBe('price_desc');
  });

  it('ignores a preference when nobody is signed in', () => {
    const state = authReducer(undefined, setUserPreferences({ billingCatalogSort: 'price_desc' }));
    expect(state.user).toBeNull();
  });
});
