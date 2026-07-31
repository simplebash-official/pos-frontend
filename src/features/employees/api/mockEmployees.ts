import { Employee, EmployeeInput, EmployeeEarningRecord } from '../types';
import { LocalStorageStore } from '@/shared/lib/localStorageStore';

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Nimal Perera',
    phone: '0771234567',
    nicOrId: '921839120V',
    role: 'technician',
    defaultSplitType: 'percentage',
    defaultSplitValue: 30, // 30% of profit on repairs
    status: 'active',
    notes: 'Senior Mobile & Laptop Hardware Repair Specialist',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'emp-2',
    name: 'Suneth Silva',
    phone: '0719876543',
    nicOrId: '958291032V',
    role: 'printer',
    defaultSplitType: 'fixed',
    defaultSplitValue: 50000, // LKR 500 fixed commission per mug/t-shirt print order
    status: 'active',
    notes: 'Graphic Designer & Sublimation Printing Operator',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'emp-3',
    name: 'Kasun Jayasinghe',
    phone: '0755551234',
    nicOrId: '982736412V',
    role: 'sales',
    defaultSplitType: 'percentage',
    defaultSplitValue: 10, // 10% commission on sales
    status: 'active',
    notes: 'Counter Sales & Customer Relation Officer',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_EARNINGS: EmployeeEarningRecord[] = [
  {
    id: 'earn-1',
    employeeId: 'emp-1',
    employeeName: 'Nimal Perera',
    workId: '1',
    ticketOrInvoiceNumber: 'REP-1001',
    workType: 'repair',
    description: 'iPhone 13 Pro Screen replacement',
    customerName: 'Saman Perera',
    totalAmountCents: 4500000,
    profitCents: 2000000,
    splitType: 'percentage',
    splitValue: 30,
    earnedAmountCents: 600000,
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'earn-2',
    employeeId: 'emp-2',
    employeeName: 'Suneth Silva',
    workId: '101',
    ticketOrInvoiceNumber: 'PRN-2001',
    workType: 'print',
    description: 'Custom Mug Printing (50 units)',
    customerName: 'Dhanushka Fernado',
    totalAmountCents: 2500000,
    profitCents: 1200000,
    splitType: 'fixed',
    splitValue: 300000,
    earnedAmountCents: 300000,
    status: 'completed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function normalizeEmployee(rawInput: unknown): Employee {
  const raw = (rawInput && typeof rawInput === 'object' ? rawInput : {}) as Record<string, unknown>;
  return {
    id: typeof raw.id === 'string' ? raw.id : `emp-${Date.now()}`,
    name: String(raw.name || raw.employeeName || 'Unnamed Employee'),
    phone: String(raw.phone || raw.primaryPhone || raw.contactPhone || ''),
    nicOrId: String(raw.nicOrId || raw.nic || ''),
    role: (raw.role as Employee['role']) || 'technician',
    defaultSplitType: (raw.defaultSplitType as Employee['defaultSplitType']) || 'percentage',
    defaultSplitValue: Number(raw.defaultSplitValue ?? 30),
    status: (raw.status as Employee['status']) || 'active',
    notes: String(raw.notes || ''),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  };
}

export const employeesStore = new LocalStorageStore<Employee>(
  'pos_employees',
  INITIAL_EMPLOYEES,
  normalizeEmployee
);

export const earningsStore = new LocalStorageStore<EmployeeEarningRecord>(
  'pos_earnings',
  INITIAL_EARNINGS
);

export const fetchEmployees = async (): Promise<Employee[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(employeesStore.getAll()), 200));
};

export const createEmployee = async (input: EmployeeInput): Promise<Employee> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newEmp: Employee = normalizeEmployee({
        ...input,
        id: `emp-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      });
      employeesStore.add(newEmp);
      resolve(newEmp);
    }, 200);
  });
};

export const updateEmployee = async (
  id: string,
  input: Partial<EmployeeInput>
): Promise<Employee> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const updated = employeesStore.update(id, {
        ...input,
        updatedAt: new Date().toISOString(),
      });
      if (!updated) return reject(new Error('Employee not found'));
      resolve(updated);
    }, 200);
  });
};

export const deleteEmployee = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      employeesStore.remove(id);
      const toRemove = earningsStore.filter((earn) => earn.employeeId === id);
      toRemove.forEach((e) => earningsStore.remove(e.id));
      resolve();
    }, 200);
  });
};

export const deleteEmployees = async (ids: string[]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idSet = new Set(ids);
      ids.forEach((id) => employeesStore.remove(id));
      const toRemove = earningsStore.filter((earn) => idSet.has(earn.employeeId));
      toRemove.forEach((e) => earningsStore.remove(e.id));
      resolve();
    }, 200);
  });
};

export const fetchEmployeeEarnings = async (
  employeeId?: string
): Promise<EmployeeEarningRecord[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (employeeId) {
        resolve(earningsStore.filter((earn) => earn.employeeId === employeeId));
      } else {
        resolve(earningsStore.getAll());
      }
    }, 200);
  });
};

export const fetchAllEmployeeEarnings = fetchEmployeeEarnings;

export const addEarningRecord = async (
  record: Omit<EmployeeEarningRecord, 'id' | 'createdAt'>
): Promise<EmployeeEarningRecord> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRecord: EmployeeEarningRecord = {
        ...record,
        id: `earn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: new Date().toISOString(),
      };
      earningsStore.add(newRecord);
      resolve(newRecord);
    }, 200);
  });
};

export const updateEarningRecordForWork = async (
  workId: string,
  workType: 'repair' | 'print' | 'sale',
  record: Omit<EmployeeEarningRecord, 'id' | 'createdAt'>
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existing = earningsStore.filter((e) => e.workId === workId && e.workType === workType);
      if (existing.length > 0) {
        existing.forEach((e) => {
          earningsStore.update(e.id, record);
        });
      } else {
        addEarningRecord(record);
      }
      resolve();
    }, 200);
  });
};

export const deleteEarningRecordsForWork = async (
  workIds: string[],
  workType: 'repair' | 'print' | 'sale'
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const workIdSet = new Set(workIds);
      const toRemove = earningsStore.filter(
        (e) => e.workType === workType && workIdSet.has(e.workId)
      );
      toRemove.forEach((e) => earningsStore.remove(e.id));
      resolve();
    }, 200);
  });
};
