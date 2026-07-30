import { RepairJob } from '../types';

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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
];

let repairsStore: RepairJob[] = [...SAMPLE_REPAIRS];

export const fetchRepairs = async (): Promise<RepairJob[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...repairsStore]), 300));
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
