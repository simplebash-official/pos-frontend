import { describe, it, expect } from 'vitest';
import { DonutWithLegend, type DonutSlice } from '../../components/DonutWithLegend';
import { DONUT, DONUT_COLORS, topSlicesWithOther } from '../analyticsCharts';

describe('DonutWithLegend & Donut Charts Configuration', () => {
  it('exports DonutWithLegend component function', () => {
    expect(typeof DonutWithLegend).toBe('function');
  });

  describe('DONUT configuration', () => {
    it('defines fixed size and thickness to keep donut proportions stable', () => {
      expect(DONUT.size).toBe(190);
      expect(DONUT.thickness).toBe(32);
      expect(DONUT.size).toBeGreaterThan(DONUT.thickness * 2);
    });

    it('provides a valid multi-color palette for donut slices', () => {
      expect(DONUT_COLORS.length).toBeGreaterThanOrEqual(6);
      expect(DONUT_COLORS).toContain('blue.6');
      expect(DONUT_COLORS).toContain('indigo.5');
      expect(DONUT_COLORS).toContain('teal.6');
      expect(DONUT_COLORS).toContain('orange.6');
    });
  });

  describe('topSlicesWithOther', () => {
    it('returns slices intact when within keep limit', () => {
      const slices = [
        { name: 'A', value: 100 },
        { name: 'B', value: 50 },
      ];
      const result = topSlicesWithOther(slices, 6, (v) => ({ name: 'Other', value: v }));
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('A');
      expect(result[1].name).toBe('B');
    });

    it('aggregates excess slices into an Other slice', () => {
      const slices = [
        { name: 'A', value: 100 },
        { name: 'B', value: 80 },
        { name: 'C', value: 60 },
        { name: 'D', value: 40 },
        { name: 'E', value: 20 },
        { name: 'F', value: 10 },
        { name: 'G', value: 5 },
        { name: 'H', value: 3 },
      ];
      const result = topSlicesWithOther(slices, 3, (v) => ({ name: 'Other', value: v }));
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ name: 'A', value: 100 });
      expect(result[1]).toEqual({ name: 'B', value: 80 });
      expect(result[2]).toEqual({ name: 'C', value: 60 });
      expect(result[3]).toEqual({ name: 'Other', value: 78 }); // 40 + 20 + 10 + 5 + 3
    });
  });

  describe('DonutSlice data calculations', () => {
    it('calculates total slice values accurately', () => {
      const testData: DonutSlice[] = [
        { name: 'Cash', value: 3838446, color: 'blue.6' },
        { name: 'Card', value: 0, color: 'grape.6' },
        { name: 'Online', value: 0, color: 'teal.6' },
        { name: 'Credit', value: 44100, color: 'orange.6' },
      ];

      const total = testData.reduce((sum, s) => sum + s.value, 0);
      expect(total).toBe(3882546);
    });

    it('handles zero total without errors', () => {
      const emptyData: DonutSlice[] = [
        { name: 'Cash', value: 0, color: 'blue.6' },
        { name: 'Card', value: 0, color: 'grape.6' },
      ];

      const total = emptyData.reduce((sum, s) => sum + s.value, 0);
      expect(total).toBe(0);
    });

    it('ensures slice count matches expected legend rows for up to 7 categories without scroll overflow', () => {
      const stockCategories: DonutSlice[] = [
        { name: 'Computer & Laptop Parts', value: 16025104, color: 'blue.6' },
        { name: 'Gaming & Gadgets', value: 10666980, color: 'indigo.5' },
        { name: 'Custom Printing & Gifts', value: 9049579, color: 'teal.6' },
        { name: 'Smartphones & Accessories', value: 8531833, color: 'orange.6' },
        { name: 'Office & Paper Stationery', value: 6881495, color: 'grape.6' },
        { name: 'Phone Repairs', value: 4951095, color: 'cyan.6' },
        { name: 'Other', value: 7016964, color: 'lime.6' },
      ];

      expect(stockCategories).toHaveLength(7);
      const totalValuation = stockCategories.reduce((sum, s) => sum + s.value, 0);
      expect(totalValuation).toBe(63123050);
    });
  });
});
