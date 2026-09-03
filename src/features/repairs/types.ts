import type { JobStatus } from '@/constants';
import type { SplitType } from '@/features/employees/types';
import type { CustomerRef, AssignmentInfo } from '@/shared/types/ticketInput';

export interface RepairJob {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  serialNumber?: string;
  issueDescription: string;
  promisedReadyAt?: string; // "YYYY-MM-DD" — date promised to the customer
  isOverdue?: boolean; // server-computed: promised date passed and job still open
  status: JobStatus;
  estimatedCostCents?: number; // Customer total price — unset until diagnosis/quote
  materialCostCents?: number; // Cost of repair parts/materials
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: SplitType;
  splitValue?: number; // % or cents fixed
  employeeEarningsCents?: number; // calculated split
  createdAt: string;
}

export interface RepairJobInput {
  customer: CustomerRef;
  assignment?: AssignmentInfo;
  deviceModel: string;
  serialNumber?: string;
  issueDescription: string;
  promisedReadyAt?: string;
  status: JobStatus;
  estimatedCostCents?: number;
  materialCostCents?: number;
}
