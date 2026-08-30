import { describe, it, expect } from 'vitest';
import { OverviewSection } from '../sections/OverviewSection';
import { SalesSection } from '../sections/SalesSection';
import { ProfitSection } from '../sections/ProfitSection';
import { CustomersSection } from '../sections/CustomersSection';
import { InventorySection } from '../sections/InventorySection';
import { StaffSection } from '../sections/StaffSection';

describe('Reports Section Components Export and Structure', () => {
  it('exports OverviewSection component function', () => {
    expect(typeof OverviewSection).toBe('function');
  });

  it('exports SalesSection component function', () => {
    expect(typeof SalesSection).toBe('function');
  });

  it('exports ProfitSection component function', () => {
    expect(typeof ProfitSection).toBe('function');
  });

  it('exports CustomersSection component function', () => {
    expect(typeof CustomersSection).toBe('function');
  });

  it('exports InventorySection component function', () => {
    expect(typeof InventorySection).toBe('function');
  });

  it('exports StaffSection component function', () => {
    expect(typeof StaffSection).toBe('function');
  });
});
