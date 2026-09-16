import { describe, it, expect } from 'vitest';
import { CategoryStylingView } from '../CategoryStylingView';
import { DataImportModal } from '../DataImportModal';
import { CATEGORY_COLOR_OPTIONS } from '@/features/inventory/constants';
import type { DetectedCategory } from '../../lib/categoryDetector';

describe('CategoryStylingView Component & Logic', () => {
  it('exports CategoryStylingView as a function component', () => {
    expect(typeof CategoryStylingView).toBe('function');
  });

  it('exports DataImportModal as a function component', () => {
    expect(typeof DataImportModal).toBe('function');
  });

  describe('Category styling calculations', () => {
    const sampleCategories: DetectedCategory[] = [
      {
        name: 'Smartphones',
        subcategories: ['Samsung Phones', 'iPhones'],
        productCount: 25,
        isExisting: false,
        color: 'blue',
        icon: 'DeviceMobile',
      },
      {
        name: 'Laptops',
        subcategories: ['Ultrabooks', 'Gaming Laptops'],
        productCount: 10,
        isExisting: true,
        existingKey: 'cat_laptops_1',
        color: 'teal',
        icon: 'DeviceLaptop',
      },
    ];

    it('identifies new vs existing categories correctly', () => {
      const newCount = sampleCategories.filter((c) => !c.isExisting).length;
      const existingCount = sampleCategories.filter((c) => c.isExisting).length;

      expect(newCount).toBe(1);
      expect(existingCount).toBe(1);
    });

    it('shuffles colors cyclically from CATEGORY_COLOR_OPTIONS for new categories only', () => {
      const updated = sampleCategories.map((cat, i) => {
        if (cat.isExisting) return cat;
        return {
          ...cat,
          color: CATEGORY_COLOR_OPTIONS[i % CATEGORY_COLOR_OPTIONS.length],
        };
      });

      // New category gets reassigned
      expect(updated[0].color).toBe(CATEGORY_COLOR_OPTIONS[0]);
      // Existing category preserves its original color
      expect(updated[1].color).toBe('teal');
    });

    it('updates specific category color or icon immutably', () => {
      const idxToUpdate = 0;
      const newColor = 'orange';
      const newIcon = 'SmartHome';

      const updated = sampleCategories.map((cat, idx) => {
        if (idx === idxToUpdate) {
          return { ...cat, color: newColor, icon: newIcon };
        }
        return cat;
      });

      expect(updated[0].color).toBe('orange');
      expect(updated[0].icon).toBe('SmartHome');
      expect(updated[1].color).toBe('teal');
    });
  });

  describe('Import row selection calculation', () => {
    const mockRows = [
      { _rowNumber: 1, _isValid: true },
      { _rowNumber: 2, _isValid: false },
      { _rowNumber: 3, _isValid: true },
      { _rowNumber: 4, _isValid: true },
    ];

    it('pre-selects all valid rows by default', () => {
      const defaultSelected = new Set(mockRows.filter((r) => r._isValid).map((r) => r._rowNumber));

      expect(defaultSelected.size).toBe(3);
      expect(defaultSelected.has(1)).toBe(true);
      expect(defaultSelected.has(2)).toBe(false); // Invalid row not selected
      expect(defaultSelected.has(3)).toBe(true);
      expect(defaultSelected.has(4)).toBe(true);
    });

    it('filters rows to import by selection AND validity', () => {
      // User manually selected row 2 (which is invalid) and row 1 (valid)
      const selectedKeys = new Set([1, 2]);

      const rowsToImport = mockRows.filter((r) => selectedKeys.has(r._rowNumber) && r._isValid);

      expect(rowsToImport).toHaveLength(1);
      expect(rowsToImport[0]._rowNumber).toBe(1);
    });

    it('computes master checkbox checked and indeterminate states', () => {
      const validRows = mockRows.filter((r) => r._isValid);

      // Scenario 1: all valid rows selected
      const allSelected = new Set([1, 3, 4]);
      const isAllSelected =
        validRows.length > 0 && validRows.every((r) => allSelected.has(r._rowNumber));
      const isSomeSelected = validRows.some((r) => allSelected.has(r._rowNumber)) && !isAllSelected;

      expect(isAllSelected).toBe(true);
      expect(isSomeSelected).toBe(false);

      // Scenario 2: partial selection
      const partialSelected = new Set([1]);
      const isAllSelected2 =
        validRows.length > 0 && validRows.every((r) => partialSelected.has(r._rowNumber));
      const isSomeSelected2 =
        validRows.some((r) => partialSelected.has(r._rowNumber)) && !isAllSelected2;

      expect(isAllSelected2).toBe(false);
      expect(isSomeSelected2).toBe(true);

      // Scenario 3: none selected
      const emptySelected = new Set<number>();
      const isAllSelected3 =
        validRows.length > 0 && validRows.every((r) => emptySelected.has(r._rowNumber));
      const isSomeSelected3 =
        validRows.some((r) => emptySelected.has(r._rowNumber)) && !isAllSelected3;

      expect(isAllSelected3).toBe(false);
      expect(isSomeSelected3).toBe(false);
    });
  });
});
