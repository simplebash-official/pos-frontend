import { PrintJob, PrintJobInput } from '../types';
import { addEarningRecord } from '@/features/employees/api/mockEmployees';

export const calculatePrintEarnings = (input: {
  estimatedCostCents: number;
  materialCostCents?: number;
  splitType?: 'percentage' | 'fixed';
  splitValue?: number;
}): number => {
  if (!input.splitType || !input.splitValue) return 0;
  const revenue = input.estimatedCostCents;
  const cost = input.materialCostCents || 0;
  const profit = Math.max(0, revenue - cost);

  if (input.splitType === 'percentage') {
    return Math.round((profit * input.splitValue) / 100);
  } else {
    return Math.min(profit, input.splitValue);
  }
};

export const SAMPLE_PRINT_JOBS: PrintJob[] = [
  {
    id: '1',
    ticketNumber: 'PRT-2001',
    customerName: 'Dhanushka Fernando',
    customerPhone: '0712345678',
    jobType: 'mug',
    quantity: 50,
    status: 'ready',
    estimatedCostCents: 2500000,
    materialCostCents: 1300000,
    assignedEmployeeId: 'emp-2',
    assignedEmployeeName: 'Suneth Silva',
    splitType: 'fixed',
    splitValue: 300000, // LKR 3,000 fixed
    employeeEarningsCents: 300000,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    ticketNumber: 'PRT-2002',
    customerName: 'ABC Enterprises',
    customerPhone: '0112345678',
    jobType: 'handbill',
    quantity: 1000,
    status: 'in_repair',
    estimatedCostCents: 1500000,
    materialCostCents: 700000,
    assignedEmployeeId: 'emp-2',
    assignedEmployeeName: 'Suneth Silva',
    splitType: 'percentage',
    splitValue: 20, // 20% of profit
    employeeEarningsCents: 160000,
    createdAt: new Date().toISOString(),
  },
];

let printJobsStore: PrintJob[] = [...SAMPLE_PRINT_JOBS];

export const fetchPrintJobs = async (): Promise<PrintJob[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...printJobsStore]), 200));
};

export const createPrintJob = async (input: PrintJobInput): Promise<PrintJob> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const ticketNumber = `PRT-${2000 + printJobsStore.length + 1}`;
      const earnings = calculatePrintEarnings({
        estimatedCostCents: input.estimatedCostCents,
        materialCostCents: input.materialCostCents,
        splitType: input.splitType,
        splitValue: input.splitValue,
      });

      const newJob: PrintJob = {
        ...input,
        id: `prt-${Date.now()}`,
        ticketNumber,
        employeeEarningsCents: earnings,
        createdAt: new Date().toISOString(),
      };

      printJobsStore = [newJob, ...printJobsStore];

      if (newJob.assignedEmployeeId && newJob.assignedEmployeeName && earnings > 0) {
        const profit = Math.max(0, newJob.estimatedCostCents - (newJob.materialCostCents || 0));
        await addEarningRecord({
          employeeId: newJob.assignedEmployeeId,
          employeeName: newJob.assignedEmployeeName,
          workId: newJob.id,
          ticketOrInvoiceNumber: newJob.ticketNumber,
          workType: 'print',
          description: `${newJob.jobType.toUpperCase()} Printing (${newJob.quantity} units)`,
          customerName: newJob.customerName,
          totalAmountCents: newJob.estimatedCostCents,
          costCents: newJob.materialCostCents,
          profitCents: profit,
          splitType: newJob.splitType || 'fixed',
          splitValue: newJob.splitValue || 0,
          earnedAmountCents: earnings,
          status: newJob.status === 'delivered' ? 'completed' : 'pending',
        });
      }

      resolve(newJob);
    }, 300);
  });
};

export const updatePrintJob = async (
  id: string,
  input: Partial<PrintJobInput>
): Promise<PrintJob> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = printJobsStore.findIndex((p) => p.id === id);
      if (index === -1) {
        reject(new Error('Print job not found'));
        return;
      }
      const existing = printJobsStore[index];
      const mergedInput = { ...existing, ...input };
      const earnings = calculatePrintEarnings({
        estimatedCostCents: mergedInput.estimatedCostCents,
        materialCostCents: mergedInput.materialCostCents,
        splitType: mergedInput.splitType,
        splitValue: mergedInput.splitValue,
      });

      const updatedJob: PrintJob = {
        ...mergedInput,
        employeeEarningsCents: earnings,
      };

      printJobsStore[index] = updatedJob;
      resolve(updatedJob);
    }, 300);
  });
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
