import { describe, expect, it } from 'vitest';
import { detectDistinctCategories, guessCategoryIcon } from '../categoryDetector';
import type { Category } from '@/features/inventory/types';

describe('categoryDetector', () => {
  describe('guessCategoryIcon', () => {
    it('returns appropriate icon for mobile and phone keywords', () => {
      expect(guessCategoryIcon('Smartphones')).toBe('DeviceMobile');
      expect(guessCategoryIcon('Mobile Phones')).toBe('DeviceMobile');
    });

    it('returns appropriate icon for laptop and computer keywords', () => {
      expect(guessCategoryIcon('Laptops')).toBe('DeviceLaptop');
      expect(guessCategoryIcon('Gaming PC')).toBe('DeviceLaptop');
    });

    it('returns appropriate icon for battery, cable, audio, screen, and tool', () => {
      expect(guessCategoryIcon('Batteries & Power')).toBe('BatteryCharging');
      expect(guessCategoryIcon('Fast Chargers & Cables')).toBe('Plug');
      expect(guessCategoryIcon('Headphones & Audio')).toBe('Headphones');
      expect(guessCategoryIcon('Display Screens')).toBe('DeviceDesktop');
      expect(guessCategoryIcon('Repair Tools')).toBe('Tool');
    });

    it('falls back to Package for unmatched category names', () => {
      expect(guessCategoryIcon('General Merchandising')).toBe('Package');
    });
  });

  describe('detectDistinctCategories', () => {
    it('extracts unique categories, subcategories, and counts from rows', () => {
      const rows = [
        { data: { category: 'Smartphones', subcategory: 'Samsung Phones' } },
        { data: { category: 'Smartphones', subcategory: 'iPhones' } },
        { data: { category: 'Smartphones', subcategory: 'Samsung Phones' } },
        { data: { category: 'Accessories', subcategory: 'Chargers' } },
      ];

      const detected = detectDistinctCategories(rows, []);

      expect(detected).toHaveLength(2);

      const phones = detected.find((c) => c.name === 'Smartphones');
      expect(phones).toBeDefined();
      expect(phones?.productCount).toBe(3);
      expect(phones?.subcategories).toEqual(expect.arrayContaining(['Samsung Phones', 'iPhones']));
      expect(phones?.isExisting).toBe(false);
      expect(phones?.icon).toBe('DeviceMobile');

      const accessories = detected.find((c) => c.name === 'Accessories');
      expect(accessories).toBeDefined();
      expect(accessories?.productCount).toBe(1);
      expect(accessories?.subcategories).toEqual(['Chargers']);
      expect(accessories?.isExisting).toBe(false);

      // Distinct colors assigned
      expect(phones?.color).not.toBe(accessories?.color);
    });

    it('cross-references with existing catalog categories', () => {
      const existingCategories: Category[] = [
        {
          key: 'cat_phones_1',
          name: 'Smartphones',
          icon: 'DeviceMobile',
          color: 'indigo',
          subcategories: [
            {
              key: 'sub_1',
              categoryKey: 'cat_phones_1',
              name: 'Samsung Phones',
              createdAt: '2026-01-01',
              updatedAt: '2026-01-01',
            },
          ],
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ];

      const rows = [
        { data: { category: 'smartphones', subcategory: 'Google Pixel' } },
        { data: { category: 'Laptops', subcategory: 'MacBook' } },
      ];

      const detected = detectDistinctCategories(rows, existingCategories);

      const smartphones = detected.find((c) => c.name === 'Smartphones');
      expect(smartphones).toBeDefined();
      expect(smartphones?.isExisting).toBe(true);
      expect(smartphones?.existingKey).toBe('cat_phones_1');
      expect(smartphones?.color).toBe('indigo');
      expect(smartphones?.icon).toBe('DeviceMobile');
      expect(smartphones?.subcategories).toEqual(['Google Pixel']);

      const laptops = detected.find((c) => c.name === 'Laptops');
      expect(laptops).toBeDefined();
      expect(laptops?.isExisting).toBe(false);
      expect(laptops?.icon).toBe('DeviceLaptop');
    });

    it('handles empty rows and rows without category gracefully', () => {
      const rows = [
        { data: {} },
        { data: { category: '', subcategory: 'test' } },
        { data: { category: '  ' } },
      ];

      const detected = detectDistinctCategories(rows, []);
      expect(detected).toHaveLength(0);
    });
  });
});
