export const queryKeys = {
  billing: {
    all: ['billing'] as const,
    invoices: (filters?: Record<string, unknown>) => ['billing', 'invoices', filters] as const,
    invoiceDetail: (id: string) => ['billing', 'invoices', id] as const,
    payments: (invoiceId: string) => ['billing', 'invoices', invoiceId, 'payments'] as const,
    stats: () => ['billing', 'stats'] as const,
    creditNotes: {
      all: ['billing', 'creditNotes'] as const,
      list: (filters?: Record<string, unknown>) =>
        ['billing', 'creditNotes', 'list', filters] as const,
      detail: (id: string) => ['billing', 'creditNotes', 'detail', id] as const,
      byInvoice: (invoiceId: string) => ['billing', 'creditNotes', 'byInvoice', invoiceId] as const,
      stats: () => ['billing', 'creditNotes', 'stats'] as const,
    },
  },
  repairs: {
    all: ['repairs'] as const,
    list: (filters?: Record<string, unknown>) => ['repairs', 'list', filters] as const,
    detail: (id: string) => ['repairs', 'detail', id] as const,
    stats: () => ['repairs', 'stats'] as const,
  },
  printJobs: {
    all: ['printJobs'] as const,
    list: (filters?: Record<string, unknown>) => ['printJobs', 'list', filters] as const,
    detail: (id: string) => ['printJobs', 'detail', id] as const,
    stats: () => ['printJobs', 'stats'] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    products: (filters?: Record<string, unknown>) => ['inventory', 'products', filters] as const,
    productDetail: (id: string) => ['inventory', 'products', id] as const,
    productByBarcode: (barcode: string) =>
      ['inventory', 'products', 'by-barcode', barcode] as const,
    lowStock: () => ['inventory', 'lowStock'] as const,
    movements: (productId?: string) => ['inventory', 'movements', productId] as const,
    stats: () => ['inventory', 'stats'] as const,
    serials: (productKey: string, status?: string) =>
      ['inventory', 'products', productKey, 'serials', status] as const,
  },
  categories: {
    all: ['categories'] as const,
    valid: () => ['categories', 'valid'] as const,
    subcategories: (categoryKey: string) => ['categories', categoryKey, 'subcategories'] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (filters?: Record<string, unknown>) => ['customers', 'list', filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
    stats: () => ['customers', 'stats'] as const,
  },
  suppliers: {
    all: ['suppliers'] as const,
    list: (filters?: Record<string, unknown>) => ['suppliers', 'list', filters] as const,
    detail: (id: string) => ['suppliers', 'detail', id] as const,
    stats: () => ['suppliers', 'stats'] as const,
  },
  supplierProducts: {
    all: ['supplierProducts'] as const,
    bySupplier: (supplierKey: string) => ['supplierProducts', 'bySupplier', supplierKey] as const,
    byProduct: (productKey: string) => ['supplierProducts', 'byProduct', productKey] as const,
  },
  purchases: {
    all: ['purchases'] as const,
    bySupplier: (supplierKey: string) => ['purchases', 'bySupplier', supplierKey] as const,
    byProduct: (productKey: string) => ['purchases', 'byProduct', productKey] as const,
  },
  employees: {
    all: ['employees'] as const,
    list: (filters?: Record<string, unknown>) => ['employees', 'list', filters] as const,
    detail: (id: string) => ['employees', 'detail', id] as const,
    earnings: (id: string) => ['employees', 'earnings', id] as const,
    allEarnings: () => ['employees', 'all-earnings'] as const,
  },
  reports: {
    all: ['reports'] as const,
    feed: (section: string, filters: Record<string, unknown>, opts?: Record<string, unknown>) =>
      ['reports', 'engine', 'feed', section, filters, opts] as const,
    /** `scope` = summary | timeseries | paymentMethods | topCustomers | … */
    analytics: (scope: string, filters: Record<string, unknown>) =>
      ['reports', 'analytics', scope, filters] as const,
    dailySales: (filters: Record<string, unknown>) => ['reports', 'dailySales', filters] as const,
    topProducts: (filters: Record<string, unknown>) => ['reports', 'topProducts', filters] as const,
    outstanding: (filters?: Record<string, unknown>) =>
      ['reports', 'outstanding', filters] as const,
    reminders: (filters?: Record<string, unknown>) => ['reports', 'reminders', filters] as const,
    inventoryValuation: () => ['reports', 'inventoryValuation'] as const,
    receivablesAging: (asOf?: string) => ['reports', 'receivablesAging', asOf] as const,
    employeeCommissions: (filters: Record<string, unknown>) =>
      ['reports', 'employeeCommissions', filters] as const,
    reportPdf: (filters: Record<string, unknown>) => ['reports', 'reportPdf', filters] as const,
  },
  users: {
    all: ['users'] as const,
    list: (filters?: Record<string, unknown>) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  imports: {
    all: ['imports'] as const,
    batches: (target?: string) => ['imports', 'batches', target] as const,
    batchDetail: (key: string) => ['imports', 'batches', key] as const,
  },
  system: {
    all: ['system'] as const,
    /** Scoped to who is asking: a guest's answer must never stand in for a signed-in shop's. */
    setupStatus: (scope: string) => ['system', 'setup-status', scope] as const,
    installation: () => ['system', 'installation'] as const,
  },
  cloud: {
    all: ['cloud'] as const,
    state: () => ['cloud', 'state'] as const,
    devices: () => ['cloud', 'devices'] as const,
  },
  syncStatus: {
    all: ['sync-status'] as const,
    conflicts: () => ['sync-status', 'conflicts'] as const,
  },
  logs: {
    all: ['logs'] as const,
    stats: () => ['logs', 'stats'] as const,
    days: () => ['logs', 'days'] as const,
    config: () => ['logs', 'config'] as const,
    query: (filters: Record<string, unknown>) => ['logs', 'query', filters] as const,
  },
};
