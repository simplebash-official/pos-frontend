/**
 * Permission strings mirroring the backend's `core::constants::permissions`
 * 1:1 — checked against `AuthUser.permissions`, the JWT-embedded permission
 * list the backend derives once at login from the caller's fixed role
 * (Admin/Manager/Staff). There are no custom per-user permissions; a
 * permission string here always means "does the current role grant this."
 * `inventory:admin` is omitted — the backend documents it as
 * reserved/unenforced, with no frontend consumer needed.
 */
export const PERMISSIONS = {
  USERS_MANAGE: 'users:manage',
  USERS_MANAGE_STAFF: 'users:manage:staff',
  SESSIONS_VIEW: 'sessions:view',
  REGISTER_SESSIONS_VIEW: 'register_sessions:view',
  REGISTER_SESSIONS_MANAGE: 'register_sessions:manage',
  CASH_MOVEMENTS_CREATE: 'cash_movements:create',
  CASH_MOVEMENTS_CREATE_MANAGED: 'cash_movements:create:managed',
  CASH_MOVEMENTS_REVERSE: 'cash_movements:reverse',
  CASH_CATEGORIES_CREATE: 'cash_categories:create',
  CASH_CATEGORIES_MANAGE: 'cash_categories:manage',
  PAYEES_MANAGE: 'payees:manage',
  EXPENSES_VIEW: 'expenses:view',
  EXPENSES_MANAGE: 'expenses:manage',
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  CUSTOMERS_WRITE: 'customers:write',
  BILLING_WRITE: 'billing:write',
  REPAIRS_WRITE: 'repairs:write',
  PRINT_JOBS_WRITE: 'print_jobs:write',
  QUOTATIONS_MANAGE: 'quotations:manage',
  REPORTS_VIEW: 'reports:view',
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_WRITE: 'employees:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
