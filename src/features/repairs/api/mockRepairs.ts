import { RepairJob, RepairJobInput } from '../types';
import { addEarningRecord } from '@/features/employees/api/mockEmployees';

export const calculateRepairEarnings = (input: {
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

export const SAMPLE_REPAIRS: RepairJob[] = [
  {
    id: '1',
    ticketNumber: 'REP-1001',
    customerName: 'Saman Perera',
    customerPhone: '0771234567',
    deviceModel: 'iPhone 13 Pro',
    issueDescription: 'Screen replacement & battery test',
    status: 'in_repair',
    estimatedCostCents: 4500000,
    materialCostCents: 2500000,
    assignedEmployeeId: 'emp-1',
    assignedEmployeeName: 'Nimal Perera',
    splitType: 'percentage',
    splitValue: 30,
    employeeEarningsCents: 600000,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    ticketNumber: 'REP-1002',
    customerName: 'Kamal Silva',
    customerPhone: '0719876543',
    deviceModel: 'Samsung S22',
    issueDescription: 'Charging port replacement',
    status: 'ready',
    estimatedCostCents: 1800000,
    materialCostCents: 800000,
    assignedEmployeeId: 'emp-1',
    assignedEmployeeName: 'Nimal Perera',
    splitType: 'percentage',
    splitValue: 30,
    employeeEarningsCents: 300000,
    createdAt: new Date().toISOString(),
  },
];

let repairsStore: RepairJob[] = [...SAMPLE_REPAIRS];

export const fetchRepairs = async (): Promise<RepairJob[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...repairsStore]), 200));
};

export const createRepairJob = async (input: RepairJobInput): Promise<RepairJob> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const ticketNumber = `REP-${1000 + repairsStore.length + 1}`;
      const earnings = calculateRepairEarnings({
        estimatedCostCents: input.estimatedCostCents,
        materialCostCents: input.materialCostCents,
        splitType: input.splitType,
        splitValue: input.splitValue,
      });

      const newJob: RepairJob = {
        ...input,
        id: `rep-${Date.now()}`,
        ticketNumber,
        employeeEarningsCents: earnings,
        createdAt: new Date().toISOString(),
      };

      repairsStore = [newJob, ...repairsStore];

      if (newJob.assignedEmployeeId && newJob.assignedEmployeeName && earnings > 0) {
        const profit = Math.max(0, newJob.estimatedCostCents - (newJob.materialCostCents || 0));
        await addEarningRecord({
          employeeId: newJob.assignedEmployeeId,
          employeeName: newJob.assignedEmployeeName,
          workId: newJob.id,
          ticketOrInvoiceNumber: newJob.ticketNumber,
          workType: 'repair',
          description: `${newJob.deviceModel} - ${newJob.issueDescription}`,
          customerName: newJob.customerName,
          totalAmountCents: newJob.estimatedCostCents,
          costCents: newJob.materialCostCents,
          profitCents: profit,
          splitType: newJob.splitType || 'percentage',
          splitValue: newJob.splitValue || 0,
          earnedAmountCents: earnings,
          status: newJob.status === 'delivered' ? 'completed' : 'pending',
        });
      }

      resolve(newJob);
    }, 300);
  });
};

export const updateRepairJob = async (
  id: string,
  input: Partial<RepairJobInput>
): Promise<RepairJob> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = repairsStore.findIndex((r) => r.id === id);
      if (index === -1) {
        reject(new Error('Repair job not found'));
        return;
      }
      const existing = repairsStore[index];
      const mergedInput = { ...existing, ...input };
      const earnings = calculateRepairEarnings({
        estimatedCostCents: mergedInput.estimatedCostCents,
        materialCostCents: mergedInput.materialCostCents,
        splitType: mergedInput.splitType,
        splitValue: mergedInput.splitValue,
      });

      const updatedJob: RepairJob = {
        ...mergedInput,
        employeeEarningsCents: earnings,
      };

      repairsStore[index] = updatedJob;
      resolve(updatedJob);
    }, 300);
  });
};

export const deleteRepairs = async (ids: string[]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idSet = new Set(ids);
      repairsStore = repairsStore.filter((r) => !idSet.has(r.id));
      resolve();
    }, 300);
  });
};
