import type { JobStatus } from '@/constants';
import type { SplitType } from '@/features/employees/types';

export interface RepairJob {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  serialNumber?: string;
  issueDescription: string;
  status: JobStatus;
  estimatedCostCents: number; // Customer total price
  materialCostCents?: number; // Cost of repair parts/materials
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: SplitType;
  splitValue?: number; // % or cents fixed
  employeeEarningsCents?: number; // calculated split
  createdAt: string;
}

export interface RepairJobInput {
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  serialNumber?: string;
  issueDescription: string;
  status: JobStatus;
  estimatedCostCents: number;
  materialCostCents?: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: SplitType;
  splitValue?: number;
}
