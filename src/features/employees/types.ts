export type SplitType = 'percentage' | 'fixed';

export type EmployeeRole = 'technician' | 'printer' | 'sales' | 'general';

export const EMPLOYEE_ROLE_LABELS: Record<EmployeeRole, string> = {
  technician: 'Repair Technician',
  printer: 'Print Designer / Machine Operator',
  sales: 'Sales & Billing Staff',
  general: 'General Employee',
};

export interface Employee {
  id: string;
  name: string;
  phone: string;
  nicOrId?: string;
  role: EmployeeRole;
  defaultSplitType: SplitType;
  defaultSplitValue: number; // e.g. 20 (for 20%) or 100000 (cents for LKR 1,000)
  status: 'active' | 'inactive';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeInput {
  name: string;
  phone: string;
  nicOrId?: string;
  role: EmployeeRole;
  defaultSplitType: SplitType;
  defaultSplitValue: number;
  status: 'active' | 'inactive';
  notes?: string;
}

export interface EmployeeEarningRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  workId: string; // Repair Job ID, Print Job ID, or Invoice ID
  ticketOrInvoiceNumber: string;
  workType: 'repair' | 'print' | 'billing';
  description: string;
  customerName: string;
  totalAmountCents: number;
  costCents?: number;
  profitCents: number;
  splitType: SplitType;
  splitValue: number; // e.g. 25 (%) or 150000 (cents LKR 1500)
  earnedAmountCents: number;
  status: 'pending' | 'completed';
  createdAt: string;
}
