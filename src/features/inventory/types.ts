export const SUBCATEGORIES_BY_CATEGORY = {
  'Phone Repairs': [
    'Phone Covers',
    'Screens',
    'Batteries',
    'Charging Ports',
    'Other internal repair parts',
  ],
  'Mug, T-Shirt & Print Customization': [
    'Blank Mugs',
    'T-Shirts',
    'Sheets (for custom transfers)',
    'Sublimation Ink',
  ],
  'General Printing': [
    'Paper (documents, photocopies, handbills, and flyers)',
    'Printer Ink',
  ],
} as const;

export type MainCategory = keyof typeof SUBCATEGORIES_BY_CATEGORY;
export type SubCategory = (typeof SUBCATEGORIES_BY_CATEGORY)[MainCategory][number];

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: MainCategory;
  subcategory: SubCategory;
  costPriceCents: number;
  sellingPriceCents: number;
  stockQuantity: number;
  minStockThreshold: number;
  updatedAt?: string;
}
