import type { JobStatus } from '@/constants';

export interface PrintJob {
  id: string;
  ticketNumber: string;
  customerName: string;
  jobType: 'mug' | 't-shirt' | 'handbill' | 'banner' | 'custom';
  quantity: number;
  status: JobStatus;
  estimatedCostCents: number;
  createdAt: string;
}
