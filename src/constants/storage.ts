export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  // keep in sync with the inline color-scheme script in index.html
  COLOR_SCHEME: 'pos-color-scheme',
  CUSTOMERS: 'pos_customers_data',
  HELD_CARTS: 'pos_held_carts_data',
  INVOICES: 'pos_invoices_data',
  INVOICE_COUNTER: 'pos_invoice_counter',
  SETTINGS: 'pos_settings_data',
  /** Per-install device identity, minted once and never rotated. See src/offline/ids/deviceId.ts */
  DEVICE_ID: 'pos_device_id',
  /** Dev-only offline simulator override. See src/offline/connectivity/ConnectivityMonitor.ts */
  OFFLINE_SIMULATION: 'pos_offline_simulation',
} as const;
