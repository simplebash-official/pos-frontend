export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  // keep in sync with the inline color-scheme script in index.html
  COLOR_SCHEME: 'pos-color-scheme',
  SUPPLIERS: 'pos_suppliers_data',
  CUSTOMERS: 'pos_customers_data',
  SUPPLIER_PRODUCTS: 'pos_supplier_products_data',
  PURCHASES: 'pos_stock_purchases_data',
  HELD_CARTS: 'pos_held_carts_data',
  INVOICES: 'pos_invoices_data',
  INVOICE_COUNTER: 'pos_invoice_counter',
  SETTINGS: 'pos_settings_data',
} as const;
