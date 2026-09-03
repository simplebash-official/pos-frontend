import type { JobStatus } from '@/constants';
import type { SplitType } from '@/features/employees/types';
import type { CustomerRef, AssignmentInfo } from '@/shared/types/ticketInput';

export type PrintJobType = 'mug' | 't-shirt' | 'handbill' | 'banner' | 'custom';

export interface PrintJob {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone?: string;
  jobType: PrintJobType;
  quantity: number;
  promisedReadyAt?: string; // "YYYY-MM-DD" — date promised to the customer
  isOverdue?: boolean; // server-computed: promised date passed and job still open
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
  customer: CustomerRef;
  assignment?: AssignmentInfo;
  jobType: PrintJobType;
  quantity: number;
  promisedReadyAt?: string;
  status: JobStatus;
  estimatedCostCents: number;
  materialCostCents?: number;
}
