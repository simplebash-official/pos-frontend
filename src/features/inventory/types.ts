export type MainCategory =
  'Phone Repairs' | 'Mug, T-Shirt & Print Customization' | 'General Printing';

export type SubCategory =
  // Phone Repairs
  | 'Phone Covers'
  | 'Screens'
  | 'Batteries'
  | 'Charging Ports'
  | 'Other internal repair parts'
  // Mug, T-Shirt & Print Customization
  | 'Blank Mugs'
  | 'T-Shirts'
  | 'Sheets (for custom transfers)'
  | 'Ink'
  // General Printing
  | 'Paper (documents, photocopies, handbills, and flyers)'
  | 'Ink';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: MainCategory | string;
  subcategory: SubCategory | string;
  costPriceCents: number;
  sellingPriceCents: number;
  stockQuantity: number;
  minStockThreshold: number;
  updatedAt?: string;
}
