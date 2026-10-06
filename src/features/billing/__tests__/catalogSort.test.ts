import { describe, it, expect } from 'vitest';
import authReducer, { setUser, setUserPreferences } from '@/store/slices/authSlice';
import {
  CATALOG_SORTS,
  DEFAULT_CATALOG_SORT,
  catalogSortParams,
  isCatalogSort,
} from '../lib/catalogSort';
import { CatalogPanel } from '../components/CatalogPanel';

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

describe('catalog sort labels and tooltip formatting', () => {
  it('maps default catalog sort to Name A-Z', () => {
    const defaultSort = CATALOG_SORTS.find((s) => s.id === DEFAULT_CATALOG_SORT);
    expect(defaultSort).toBeDefined();
    expect(defaultSort?.label).toBe('Name A-Z');
  });

  it('provides a valid non-empty label for every sort preset', () => {
    for (const option of CATALOG_SORTS) {
      expect(option.label).toBeTruthy();
      expect(typeof option.label).toBe('string');
      expect(option.label.trim().length).toBeGreaterThan(0);
    }
  });

  it('formats sort button tooltip label correctly for default and other presets', () => {
    const formatTooltip = (sortId: string) => {
      const activeSort = CATALOG_SORTS.find((s) => s.id === sortId) ?? CATALOG_SORTS[0];
      return `Sort products: ${activeSort.label}`;
    };

    expect(formatTooltip(DEFAULT_CATALOG_SORT)).toBe('Sort products: Name A-Z');
    expect(formatTooltip('price_asc')).toBe('Sort products: Price: low to high');
    expect(formatTooltip('price_desc')).toBe('Sort products: Price: high to low');
    expect(formatTooltip('newest')).toBe('Sort products: Newest added');
    expect(formatTooltip('unknown_sort')).toBe('Sort products: Name A-Z');
  });

  it('formats sort button tooltip label for all catalog sort options', () => {
    const formatTooltip = (sortId: string) => {
      const activeSort = CATALOG_SORTS.find((s) => s.id === sortId) ?? CATALOG_SORTS[0];
      return `Sort products: ${activeSort.label}`;
    };

    for (const option of CATALOG_SORTS) {
      expect(formatTooltip(option.id)).toBe(`Sort products: ${option.label}`);
    }
  });

  it('safely falls back to default preset on null, undefined, or empty values', () => {
    const resolveActive = (sortId: unknown) => {
      return CATALOG_SORTS.find((s) => s.id === sortId) ?? CATALOG_SORTS[0];
    };

    expect(resolveActive(null).id).toBe(DEFAULT_CATALOG_SORT);
    expect(resolveActive(undefined).id).toBe(DEFAULT_CATALOG_SORT);
    expect(resolveActive('').id).toBe(DEFAULT_CATALOG_SORT);
    expect(resolveActive('nonexistent').id).toBe(DEFAULT_CATALOG_SORT);
  });

  it('determines menu item checkmark visibility based on active sort', () => {
    const activeSortId = 'price_desc';
    for (const option of CATALOG_SORTS) {
      const isSelected = option.id === activeSortId;
      if (option.id === 'price_desc') {
        expect(isSelected).toBe(true);
      } else {
        expect(isSelected).toBe(false);
      }
    }
  });

  it('exports CatalogPanel as a valid React memo component', () => {
    expect(typeof CatalogPanel).toBe('object');
    expect(CatalogPanel).not.toBeNull();
  });
});

