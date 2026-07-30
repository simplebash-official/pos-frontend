import type { JobStatus } from '@/constants';
import type { SplitType } from '@/features/employees/types';

export type PrintJobType = 'mug' | 't-shirt' | 'handbill' | 'banner' | 'custom';

export interface PrintJob {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone?: string;
  jobType: PrintJobType;
  quantity: number;
  status: JobStatus;
  estimatedCostCents: number; // Customer total cost
  materialCostCents?: number; // Raw materials cost (t-shirts, mug blanks, ink)
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: SplitType;
  splitValue?: number; // % or cents fixed
  employeeEarningsCents?: number;
  createdAt: string;
}

export interface PrintJobInput {
  customerName: string;
  customerPhone?: string;
  jobType: PrintJobType;
  quantity: number;
  status: JobStatus;
  estimatedCostCents: number;
  materialCostCents?: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: SplitType;
  splitValue?: number;
}
