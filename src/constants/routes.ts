export const ROUTES = {
  HOME: '/',
  WELCOME: '/welcome',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  BILLING: '/billing',
  INVOICES: '/invoices',
  REPAIRS: '/repairs',
  PRINT_JOBS: '/print-jobs',
  INVENTORY: '/inventory',
  CUSTOMERS: '/customers',
  SUPPLIERS: '/suppliers',
  EMPLOYEES: '/employees',
  ACCOUNTS: '/accounts',
  REPORTS: '/reports',
  SETTINGS: '/settings',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

// Relative route paths (without leading slashes) for nested React Router path definitions
export const ROUTE_PATHS = {
  WELCOME: 'welcome',
  DASHBOARD: 'dashboard',
  BILLING: 'billing',
  INVOICES: 'invoices',
  REPAIRS: 'repairs',
  PRINT_JOBS: 'print-jobs',
  INVENTORY: 'inventory',
  CUSTOMERS: 'customers',
  SUPPLIERS: 'suppliers',
  EMPLOYEES: 'employees',
  ACCOUNTS: 'accounts',
  REPORTS: 'reports',
  SETTINGS: 'settings',
} as const;
