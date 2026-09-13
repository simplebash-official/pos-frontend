export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  // keep in sync with the inline color-scheme script in index.html
  COLOR_SCHEME: 'pos-color-scheme',
  CUSTOMERS: 'pos_customers_data',
  HELD_CARTS: 'pos_held_carts_data',
  SETTINGS: 'pos_settings_data',
  NOTIFICATIONS: 'pos_notifications_data',
  /** Per-install device identity, minted once and never rotated. See src/offline/ids/deviceId.ts */
  DEVICE_ID: 'pos_device_id',
  /** Dev-only offline simulator override. See src/offline/connectivity/ConnectivityMonitor.ts */
  OFFLINE_SIMULATION: 'pos_offline_simulation',
  /** Local search history records partitioned by namespace */
  SEARCH_HISTORY: 'pos_search_history',
  /** Last used print document selection for cash/card sales */
  PRINT_SELECTION_PAY_NOW: 'pos_print_selection_pay_now',
  /** Last used print document selection for credit sales */
  PRINT_SELECTION_CREDIT: 'pos_print_selection_credit',
  /** Latest hardware and POS system benchmark test result */
  BENCHMARK_RESULT: 'pos_benchmark_result',
} as const;
