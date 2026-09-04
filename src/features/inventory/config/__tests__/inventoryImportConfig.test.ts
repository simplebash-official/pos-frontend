import { describe, it, expect } from 'vitest';
import { inventoryImportConfig } from '../inventoryImportConfig';

describe('inventoryImportConfig', () => {
  it('has target set to inventory and valid metadata', () => {
    expect(inventoryImportConfig.target).toBe('inventory');
    expect(inventoryImportConfig.title).toBe('Import Inventory Products');
    expect(inventoryImportConfig.templateFileName).toBe('inventory_products_template');
    expect(inventoryImportConfig.columns.length).toBeGreaterThanOrEqual(8);
  });

  it('validates and transforms product name', () => {
    const col = inventoryImportConfig.columns.find((c) => c.key === 'name');
    expect(col).toBeDefined();
    expect(col?.required).toBe(true);
  });

  it('validates and transforms selling price', () => {
    const col = inventoryImportConfig.columns.find((c) => c.key === 'sellingPrice');
    expect(col).toBeDefined();
    expect(col?.required).toBe(true);

    // Validator
    expect(col?.validate?.('25.50')).toBeNull();
    expect(col?.validate?.(0)).toBe('Selling price must be greater than 0');
    expect(col?.validate?.('-10')).toBe('Selling price must be greater than 0');
    expect(col?.validate?.('abc')).toBe('Selling price must be greater than 0');

    // Transform
    expect(col?.transform?.('25.50')).toBe(25.5);
    expect(col?.transform?.(10)).toBe(10);
    expect(col?.transform?.('$15.75')).toBe(15.75);
  });

  it('validates and transforms cost price', () => {
    const col = inventoryImportConfig.columns.find((c) => c.key === 'costPrice');
    expect(col).toBeDefined();
    expect(col?.required).toBe(false);

    expect(col?.validate?.('0')).toBeNull();
    expect(col?.validate?.('-5')).toBe('Cost price cannot be negative');
    expect(col?.validate?.('invalid')).toBe('Cost price cannot be negative');

    expect(col?.transform?.('12.50')).toBe(12.5);
  });

  it('validates and transforms stock quantity', () => {
    const col = inventoryImportConfig.columns.find((c) => c.key === 'stockQuantity');
    expect(col).toBeDefined();
    expect(col?.required).toBe(false);

    expect(col?.validate?.(5)).toBeNull();
    expect(col?.validate?.(-1)).toBe('Stock quantity cannot be negative');

    expect(col?.transform?.('10')).toBe(10);
    expect(col?.transform?.('')).toBe(0);
  });

  it('validates and transforms serialized flag', () => {
    const col = inventoryImportConfig.columns.find((c) => c.key === 'isSerialized');
    expect(col).toBeDefined();

    expect(col?.transform?.('yes')).toBe(true);
    expect(col?.transform?.('TRUE')).toBe(true);
    expect(col?.transform?.('1')).toBe(true);
    expect(col?.transform?.('no')).toBe(false);
    expect(col?.transform?.('0')).toBe(false);
  });

  it('provides default options for barcode auto-generation and category auto-creation', () => {
    const opts = inventoryImportConfig.supportedOptions;
    expect(opts).toBeDefined();
    expect(opts?.some((o) => o.key === 'autoGenerateBarcodes' && o.defaultValue === true)).toBe(
      true
    );
    expect(opts?.some((o) => o.key === 'autoCreateCategories' && o.defaultValue === true)).toBe(
      true
    );
  });
});
