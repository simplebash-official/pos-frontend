import type { JobStatus } from '@/constants';

export interface RepairJob {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  serialNumber?: string;
  issueDescription: string;
  status: JobStatus;
  estimatedCostCents: number;
  createdAt: string;
}
