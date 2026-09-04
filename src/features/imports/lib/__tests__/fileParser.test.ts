import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseSpreadsheetFile } from '../fileParser';
import type { ImportConfig } from '../../types';

interface TestProductRow {
  name: string;
  category: string;
  sellingPrice: number;
  barcode?: string;
}

const testConfig: ImportConfig = {
  target: 'inventory',
  title: 'Test Products',
  description: 'Import test items',
  templateFileName: 'test_template.xlsx',
  sampleRows: [],
  columns: [
    {
      key: 'name',
      label: 'Product Name',
      required: true,
      aliases: ['name', 'product name', 'item name'],
    },
    {
      key: 'category',
      label: 'Category',
      required: true,
      aliases: ['category', 'cat'],
    },
    {
      key: 'sellingPrice',
      label: 'Selling Price',
      required: true,
      aliases: ['price', 'selling price', 'retail price'],
      validate: (val: unknown) => {
        const num = Number(val);
        if (isNaN(num) || num <= 0) return 'Price must be greater than 0';
        return null;
      },
      transform: (val: unknown) => Number(val),
    },
    {
      key: 'barcode',
      label: 'Barcode',
      required: false,
      aliases: ['barcode', 'code'],
      transform: (val: unknown) => String(val),
    },
  ],
};

function createMockFile(content: ArrayBuffer | Uint8Array, name: string, type: string): File {
  return new File([content as unknown as BlobPart], name, { type });
}

describe('fileParser - parseSpreadsheetFile', () => {
  it('parses a valid CSV file with exact and aliased headers', async () => {
    const csvContent = [
      'Item Name,Category,Price,Barcode',
      'USB-C Cable,Accessories,15.50,1234567890123',
      'Wireless Mouse,Accessories,25.00,',
    ].join('\n');

    const encoder = new TextEncoder();
    const file = createMockFile(encoder.encode(csvContent), 'products.csv', 'text/csv');

    const result = await parseSpreadsheetFile<TestProductRow>(file, testConfig);

    expect(result.fileName).toBe('products.csv');
    expect(result.fileType).toBe('csv');
    expect(result.totalRows).toBe(2);
    expect(result.validRowCount).toBe(2);
    expect(result.invalidRowCount).toBe(0);

    const row1 = result.rows[0];
    expect(row1._rowNumber).toBe(1);
    expect(row1._isValid).toBe(true);
    expect(row1.data.name).toBe('USB-C Cable');
    expect(row1.data.category).toBe('Accessories');
    expect(row1.data.sellingPrice).toBe(15.5);
    expect(row1.data.barcode).toBe('1234567890123');

    const row2 = result.rows[1];
    expect(row2._isValid).toBe(true);
    expect(row2.data.name).toBe('Wireless Mouse');
    expect(row2.data.barcode).toBeUndefined();
  });

  it('detects invalid rows when required fields are missing or validation fails', async () => {
    const csvContent = [
      'Product Name,Category,Selling Price',
      ',Electronics,20.00', // Missing name
      'Keyboard,Electronics,-5.00', // Price <= 0 fails custom validation
      'Headphones,,15.00', // Missing category
    ].join('\n');

    const encoder = new TextEncoder();
    const file = createMockFile(encoder.encode(csvContent), 'invalid.csv', 'text/csv');

    const result = await parseSpreadsheetFile(file, testConfig);

    expect(result.totalRows).toBe(3);
    expect(result.validRowCount).toBe(0);
    expect(result.invalidRowCount).toBe(3);

    // Row 1 error
    expect(result.rows[0]._isValid).toBe(false);
    expect(result.rows[0]._errors['name']).toBe('Product Name is required');

    // Row 2 error
    expect(result.rows[1]._isValid).toBe(false);
    expect(result.rows[1]._errors['sellingPrice']).toBe('Price must be greater than 0');

    // Row 3 error
    expect(result.rows[2]._isValid).toBe(false);
    expect(result.rows[2]._errors['category']).toBe('Category is required');
  });

  it('skips completely blank rows in spreadsheet', async () => {
    const csvContent = [
      'Product Name,Category,Selling Price',
      'Monitor,Displays,150.00',
      ',,,',
      'Webcam,Cameras,45.00',
      '   ,   ,   ',
    ].join('\n');

    const encoder = new TextEncoder();
    const file = createMockFile(encoder.encode(csvContent), 'sparse.csv', 'text/csv');

    const result = await parseSpreadsheetFile(file, testConfig);

    expect(result.totalRows).toBe(2);
    expect(result.rows[0].data.name).toBe('Monitor');
    expect(result.rows[1].data.name).toBe('Webcam');
  });

  it('parses Excel (.xlsx) files generated via SheetJS', async () => {
    const wsData = [
      ['Product Name', 'Category', 'Selling Price', 'Barcode'],
      ['RAM 16GB', 'Components', 65, '8901234567890'],
      ['SSD 1TB', 'Storage', 89.99, '8901234567891'],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
    const file = createMockFile(
      wbout,
      'inventory.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    const result = await parseSpreadsheetFile<TestProductRow>(file, testConfig);

    expect(result.fileType).toBe('xlsx');
    expect(result.totalRows).toBe(2);
    expect(result.validRowCount).toBe(2);
    expect(result.rows[0].data.name).toBe('RAM 16GB');
    expect(result.rows[1].data.sellingPrice).toBe(89.99);
  });

  it('throws an error if the file has no valid sheet or is empty', async () => {
    const encoder = new TextEncoder();
    const emptyFile = createMockFile(encoder.encode(''), 'empty.csv', 'text/csv');

    await expect(parseSpreadsheetFile(emptyFile, testConfig)).rejects.toThrow();
  });
});
