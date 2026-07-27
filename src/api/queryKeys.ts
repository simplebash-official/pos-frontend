export const queryKeys = {
  billing: {
    all: ['billing'] as const,
    invoices: (filters?: Record<string, unknown>) => ['billing', 'invoices', filters] as const,
    invoiceDetail: (id: string) => ['billing', 'invoices', id] as const,
  },
  repairs: {
    all: ['repairs'] as const,
    list: (filters?: Record<string, unknown>) => ['repairs', 'list', filters] as const,
    detail: (id: string) => ['repairs', 'detail', id] as const,
  },
  printJobs: {
    all: ['printJobs'] as const,
    list: (filters?: Record<string, unknown>) => ['printJobs', 'list', filters] as const,
    detail: (id: string) => ['printJobs', 'detail', id] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    products: (filters?: Record<string, unknown>) => ['inventory', 'products', filters] as const,
    productDetail: (id: string) => ['inventory', 'products', id] as const,
    lowStock: () => ['inventory', 'lowStock'] as const,
    movements: (productId?: string) => ['inventory', 'movements', productId] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: (filters?: Record<string, unknown>) => ['customers', 'list', filters] as const,
    detail: (id: string) => ['customers', 'detail', id] as const,
  },
  reports: {
    dailySales: (date: string) => ['reports', 'dailySales', date] as const,
    outstanding: () => ['reports', 'outstanding'] as const,
    monthlyProfit: (yearMonth: string) => ['reports', 'monthlyProfit', yearMonth] as const,
  },
};
