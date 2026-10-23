export const queryKeys = {
  settings: {
    documentTemplates: () => ['settings', 'documentTemplates'] as const,
    documentTemplatePreview: (family: string, version: number) =>
      ['settings', 'documentTemplatePreview', family, version] as const,
  },
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
    sessions: {
      all: ['billing', 'sessions'] as const,
      current: (terminalId?: string) => ['billing', 'sessions', 'current', terminalId] as const,
      detail: (key: string) => ['billing', 'sessions', 'detail', key] as const,
      list: (filters?: Record<string, unknown>) =>
        ['billing', 'sessions', 'list', filters] as const,
      zReport: (key: string) => ['billing', 'sessions', 'zReport', key] as const,
      zReportDocument: (
        key: string,
        design?: string | null,
        template?: string,
        version?: number | string
      ) => ['billing', 'sessions', 'zReportDocument', key, design, template, version] as const,
      zReportDocumentDesign: (key: string, template?: string, version?: number | string) =>
        ['billing', 'sessions', 'zReportDocumentDesign', key, template, version] as const,
      drawerState: (terminalId: string) =>
        ['billing', 'sessions', 'drawerState', terminalId] as const,
      movements: (filters?: Record<string, unknown>) =>
        ['billing', 'sessions', 'movements', filters] as const,
    },
    cash: {
      all: ['billing', 'cash'] as const,
      categories: (filters?: Record<string, unknown>) =>
        ['billing', 'cash', 'categories', filters] as const,
      similarCategories: (movementType: string, name: string) =>
        ['billing', 'cash', 'similarCategories', movementType, name] as const,
      payees: (filters?: Record<string, unknown>) =>
        ['billing', 'cash', 'payees', filters] as const,
      periodStatus: (categoryKey: string | null, payeeKey: string | null, period: string | null) =>
        ['billing', 'cash', 'periodStatus', categoryKey, payeeKey, period] as const,
    },
  },
  balances: {
    all: ['balances'] as const,
    suppliers: () => ['balances', 'suppliers'] as const,
    staff: () => ['balances', 'staff'] as const,
    staffDetail: (key: string | null) => ['balances', 'staff', key] as const,
  },
  attachments: {
    all: ['attachments'] as const,
    list: (kind: string, key: string) => ['attachments', 'list', kind, key] as const,
    image: (key: string) => ['attachments', 'image', key] as const,
  },
  accounts: {
    all: ['accounts'] as const,
    list: () => ['accounts', 'list'] as const,
  },
  income: {
    all: ['income'] as const,
    list: (filters?: Record<string, unknown>) => ['income', 'list', filters] as const,
    stats: () => ['income', 'stats'] as const,
  },
  expenses: {
    all: ['expenses'] as const,
    list: (filters?: Record<string, unknown>) => ['expenses', 'list', filters] as const,
    detail: (key: string | null) => ['expenses', 'detail', key] as const,
    stats: () => ['expenses', 'stats'] as const,
    recurring: (includeInactive: boolean) => ['expenses', 'recurring', includeInactive] as const,
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
  quotations: {
    all: ['quotations'] as const,
    list: (filters?: Record<string, unknown>) => ['quotations', 'list', filters] as const,
    document: (id: string, template?: string) => ['quotations', 'document', id, template] as const,
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
    batches: (productKey: string) => ['inventory', 'products', productKey, 'batches'] as const,
  },
  labels: {
    all: ['labels'] as const,
    templates: () => ['labels', 'templates'] as const,
    render: (request: unknown) => ['labels', 'render', request] as const,
    preview: (request: unknown) => ['labels', 'preview', request] as const,
    jobs: (params: unknown) => ['labels', 'jobs', params] as const,
    coverage: (params: unknown) => ['labels', 'coverage', params] as const,
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
    profiles: () => ['cloud', 'profiles'] as const,
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
