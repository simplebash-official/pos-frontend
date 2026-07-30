import { PrintJob } from '../types';

export const SAMPLE_PRINT_JOBS: PrintJob[] = [
  {
    id: '1',
    ticketNumber: 'PRT-2001',
    customerName: 'Nimali Fernanado',
    jobType: 'mug',
    quantity: 50,
    status: 'diagnosing',
    estimatedCostCents: 3750000,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    ticketNumber: 'PRT-2002',
    customerName: 'ABC Enterprises',
    jobType: 'handbill',
    quantity: 1000,
    status: 'in_repair',
    estimatedCostCents: 1500000,
    createdAt: new Date().toISOString(),
  },
];

let printJobsStore: PrintJob[] = [...SAMPLE_PRINT_JOBS];

export const fetchPrintJobs = async (): Promise<PrintJob[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...printJobsStore]), 300));
};

export const deletePrintJobs = async (ids: string[]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idSet = new Set(ids);
      printJobsStore = printJobsStore.filter((p) => !idSet.has(p.id));
      resolve();
    }, 300);
  });
};
