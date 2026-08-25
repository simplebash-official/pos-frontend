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
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  CUSTOMERS_WRITE: 'customers:write',
  BILLING_WRITE: 'billing:write',
  REPAIRS_WRITE: 'repairs:write',
  PRINT_JOBS_WRITE: 'print_jobs:write',
  REPORTS_VIEW: 'reports:view',
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_WRITE: 'employees:write',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
