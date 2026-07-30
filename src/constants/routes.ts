export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  BILLING: '/billing',
  REPAIRS: '/repairs',
  PRINT_JOBS: '/print-jobs',
  INVENTORY: '/inventory',
  CUSTOMERS: '/customers',
  SUPPLIERS: '/suppliers',
  REPORTS: '/reports',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// Relative route paths (without leading slashes) for nested React Router path definitions
export const ROUTE_PATHS = {
  BILLING: 'billing',
  REPAIRS: 'repairs',
  PRINT_JOBS: 'print-jobs',
  INVENTORY: 'inventory',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  REPORTS: 'reports',
} as const;
