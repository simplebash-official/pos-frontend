import type { ImportConfig } from '@/features/imports';

export interface InventoryImportRowData {
  name: string;
  category: string;
  subcategory: string;
  sellingPrice: number;
  costPrice?: number;
  stockQuantity?: number;
  minStockThreshold?: number;
  barcode?: string;
  warrantyMonths?: number;
  isSerialized?: boolean;
}

export const inventoryImportConfig: ImportConfig = {
  target: 'inventory',
  title: 'Import Inventory Products',
  description:
    'Quickly add products, categories, and initial stock quantities to your inventory catalog using an Excel spreadsheet or CSV file.',
  templateFileName: 'inventory_products_template',
  columns: [
    {
      key: 'name',
      label: 'Product Name',
      required: true,
      aliases: ['name', 'item_name', 'product_name', 'title'],
      description: 'The display name or title of the inventory item',
      example: 'USB-C Fast Charger 30W',
      validate: (val) =>
        !val || String(val).trim() === '' ? 'Product name cannot be empty' : null,
    },
    {
      key: 'category',
      label: 'Category',
      required: true,
      aliases: ['category', 'category_name', 'category_key', 'cat'],
      description: 'Parent category (e.g. Accessories, Screens)',
      example: 'Accessories',
      validate: (val) => (!val || String(val).trim() === '' ? 'Category is required' : null),
    },
    {
      key: 'subcategory',
      label: 'Subcategory',
      required: true,
      aliases: ['subcategory', 'sub_category', 'subcategory_name', 'subcategory_key', 'subcat'],
      description: 'Child subcategory (e.g. Chargers, Adapters)',
      example: 'Chargers & Cables',
      validate: (val) => (!val || String(val).trim() === '' ? 'Subcategory is required' : null),
    },
    {
      key: 'sellingPrice',
      label: 'Selling Price',
      required: true,
      aliases: ['selling_price', 'price', 'retail_price', 'unit_price'],
      description: 'Retail selling price (greater than 0)',
      example: 1500,
      transform: (val) => {
        if (typeof val === 'number') return val;
        const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
        return isNaN(num) ? val : num;
      },
      validate: (val) => {
        const num = Number(val);
        if (isNaN(num) || num <= 0) return 'Selling price must be greater than 0';
        return null;
      },
    },
    {
      key: 'costPrice',
      label: 'Cost Price',
      required: false,
      aliases: ['cost_price', 'cost', 'wholesale_price', 'buy_price'],
      description: 'Purchase or wholesale cost price',
      example: 850,
      transform: (val) => {
        if (val === undefined || val === null || val === '') return 0;
        if (typeof val === 'number') return val;
        const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
        return isNaN(num) ? 0 : num;
      },
      validate: (val) => {
        if (val === undefined || val === null || val === '') return null;
        const num = Number(val);
        if (isNaN(num) || num < 0) return 'Cost price cannot be negative';
        return null;
      },
    },
    {
      key: 'stockQuantity',
      label: 'Initial Stock',
      required: false,
      aliases: ['stock_quantity', 'stock', 'quantity', 'qty', 'initial_stock'],
      description: 'Current physical quantity on hand (default 0)',
      example: 25,
      transform: (val) => {
        if (val === undefined || val === null || val === '') return 0;
        const num = parseInt(String(val), 10);
        return isNaN(num) ? 0 : num;
      },
      validate: (val) => {
        if (val === undefined || val === null || val === '') return null;
        const num = Number(val);
        if (isNaN(num) || num < 0) return 'Stock quantity cannot be negative';
        return null;
      },
    },
    {
      key: 'minStockThreshold',
      label: 'Low Stock Alert',
      required: false,
      aliases: ['min_stock_threshold', 'min_stock', 'alert_threshold', 'min_stock_alert'],
      description: 'Quantity threshold to trigger low stock warnings',
      example: 5,
      transform: (val) => {
        if (val === undefined || val === null || val === '') return 0;
        const num = parseInt(String(val), 10);
        return isNaN(num) ? 0 : num;
      },
      validate: (val) => {
        if (val === undefined || val === null || val === '') return null;
        const num = Number(val);
        if (isNaN(num) || num < 0) return 'Alert threshold cannot be negative';
        return null;
      },
    },
    {
      key: 'barcode',
      label: 'Barcode',
      required: false,
      aliases: ['barcode', 'barcode_number', 'ean', 'upc'],
      description: 'Manufacturer barcode (8–14 digits; leave blank to auto-generate)',
      example: '8901234567890',
      validate: (val) => {
        if (!val || String(val).trim() === '') return null;
        const str = String(val).trim();
        if (!/^\d{8,14}$/.test(str)) {
          return 'Barcode must be 8 to 14 numeric digits with no letters or symbols';
        }
        return null;
      },
    },
    {
      key: 'warrantyMonths',
      label: 'Warranty (Months)',
      required: false,
      aliases: ['warranty_months', 'warranty'],
      description: 'Warranty length in months (leave empty for none)',
      example: 6,
      transform: (val) => {
        if (val === undefined || val === null || val === '') return undefined;
        const num = parseInt(String(val), 10);
        return isNaN(num) ? undefined : num;
      },
      validate: (val) => {
        if (val === undefined || val === null || val === '') return null;
        const num = Number(val);
        if (isNaN(num) || num < 0) return 'Warranty months cannot be negative';
        return null;
      },
    },
    {
      key: 'isSerialized',
      label: 'Track Serials',
      required: false,
      aliases: ['is_serialized', 'serialized', 'track_serials'],
      description: 'Whether units are tracked by serial numbers (Yes/No)',
      example: 'No',
      transform: (val) => {
        const str = String(val).trim().toLowerCase();
        return str === 'yes' || str === 'true' || str === '1';
      },
    },
  ],
  supportedOptions: [
    {
      key: 'autoGenerateBarcodes',
      label: 'Auto-generate barcodes for items without barcodes',
      description: 'Assigns scannable shop barcodes automatically when missing',
      defaultValue: true,
    },
    {
      key: 'autoCreateCategories',
      label: 'Automatically create missing categories and subcategories',
      description: 'Creates new category entries in your catalog if they do not already exist',
      defaultValue: true,
    },
  ],
  sampleRows: [
    {
      name: 'USB-C Fast Charger 30W',
      category: 'Accessories',
      subcategory: 'Chargers & Cables',
      sellingPrice: 1500,
      costPrice: 850,
      stockQuantity: 25,
      minStockThreshold: 5,
      barcode: '8901234567890',
      warrantyMonths: 6,
      isSerialized: 'No',
    },
    {
      name: 'iPhone 13 OLED Display Screen',
      category: 'Screens & Parts',
      subcategory: 'iPhone Displays',
      sellingPrice: 14500,
      costPrice: 9200,
      stockQuantity: 12,
      minStockThreshold: 3,
      barcode: '',
      warrantyMonths: 3,
      isSerialized: 'No',
    },
    {
      name: 'Tempered Glass Screen Protector 9H',
      category: 'Accessories',
      subcategory: 'Screen Protectors',
      sellingPrice: 450,
      costPrice: 150,
      stockQuantity: 100,
      minStockThreshold: 20,
      barcode: '',
      warrantyMonths: '',
      isSerialized: 'No',
    },
  ],
};
