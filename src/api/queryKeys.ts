export const queryKeys = {
  billing: {
    all: ['billing'] as const,
    invoices: (filters?: Record<string, unknown>) => ['billing', 'invoices', filters] as const,
    invoiceDetail: (id: string) => ['billing', 'invoices', id] as const,
    payments: (invoiceId: string) => ['billing', 'invoices', invoiceId, 'payments'] as const,
    stats: () => ['billing', 'stats'] as const,
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
    lowStock: () => ['inventory', 'lowStock'] as const,
    movements: (productId?: string) => ['inventory', 'movements', productId] as const,
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
  },
  suppliers: {
    all: ['suppliers'] as const,
    list: (filters?: Record<string, unknown>) => ['suppliers', 'list', filters] as const,
    detail: (id: string) => ['suppliers', 'detail', id] as const,
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
    dailySales: (date: string) => ['reports', 'dailySales', date] as const,
    outstanding: () => ['reports', 'outstanding'] as const,
    monthlyProfit: (yearMonth: string) => ['reports', 'monthlyProfit', yearMonth] as const,
  },
};
