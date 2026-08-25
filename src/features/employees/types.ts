import type { SyncedEntityFields } from '@/shared/types/common';

export type SplitType = 'percentage' | 'fixed';

export type EmployeeRole = 'technician' | 'printer' | 'sales' | 'general';

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  technician: 'Repair Technician',
  printer: 'Print Designer / Machine Operator',
  sales: 'Sales & Billing Staff',
  general: 'General Employee',
};

/** Summary of this employee's linked login account, resolved live by the backend. Absent when no login exists. */
export interface EmployeeLogin {
  userId: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface Employee extends SyncedEntityFields {
  id: string;
  key: string; // server-generated e.g. "emp_xxx" — used by repairs/print-jobs assignment and reports
  name: string;
  phone: string;
  nicOrId?: string;
  role: EmployeeRole;
  defaultSplitType: SplitType;
  defaultSplitValue: number; // e.g. 20 (for 20%) or 100000 (cents for LKR 1,000)
  status: 'active' | 'inactive';
  notes?: string;
  /** Present once an Admin/Manager creates a login for this employee. */
  login?: EmployeeLogin;
  createdAt: string;
  updatedAt: string;
}

/** Server-owned bookkeeping (and the resolved `login` summary) is excluded — a client never submits any of it. */
export type EmployeeInput = Omit<
  Employee,
  'id' | 'key' | 'login' | 'createdAt' | 'updatedAt' | keyof SyncedEntityFields
>;

/** One itemized commission line item, computed server-side — see `useEmployeeEarnings`. */
export interface EmployeeEarningRecord {
  workId: string;
  ticketOrInvoiceNumber: string;
  workType: 'repair' | 'print';
  description: string;
  customerName: string;
  totalAmountCents: number;
  costCents: number;
  profitCents: number;
  splitType: string;
  splitValue: number;
  earnedAmountCents: number;
  status: 'pending' | 'completed';
  createdAt: string;
}
