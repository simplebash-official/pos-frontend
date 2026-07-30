import { Employee, EmployeeInput, EmployeeEarningRecord } from '../types';

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
    totalAmountCents: 4500000, // LKR 45,000
    profitCents: 2000000, // LKR 20,000 net profit
    splitType: 'percentage',
    splitValue: 30, // 30%
    earnedAmountCents: 600000, // LKR 6,000
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
    totalAmountCents: 2500000, // LKR 25,000
    profitCents: 1200000, // LKR 12,000 profit
    splitType: 'fixed',
    splitValue: 300000, // LKR 3,000 fixed split
    earnedAmountCents: 300000, // LKR 3,000
    status: 'completed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'earn-3',
    employeeId: 'emp-1',
    employeeName: 'Nimal Perera',
    workId: '2',
    ticketOrInvoiceNumber: 'REP-1002',
    workType: 'repair',
    description: 'Samsung S22 Charging port replacement',
    customerName: 'Kamal Silva',
    totalAmountCents: 1800000, // LKR 18,000
    profitCents: 1000000, // LKR 10,000 profit
    splitType: 'percentage',
    splitValue: 30, // 30%
    earnedAmountCents: 300000, // LKR 3,000
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
];

let employeesStore: Employee[] = [...INITIAL_EMPLOYEES];
let earningsStore: EmployeeEarningRecord[] = [...INITIAL_EARNINGS];

export const fetchEmployees = async (): Promise<Employee[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...employeesStore]), 200);
  });
};

export const createEmployee = async (input: EmployeeInput): Promise<Employee> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newEmp: Employee = {
        ...input,
        id: `emp-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      employeesStore = [newEmp, ...employeesStore];
      resolve(newEmp);
    }, 300);
  });
};

export const updateEmployee = async (
  id: string,
  input: Partial<EmployeeInput>
): Promise<Employee> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = employeesStore.findIndex((e) => e.id === id);
      if (index === -1) {
        reject(new Error('Employee not found'));
        return;
      }
      const updated: Employee = {
        ...employeesStore[index],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      employeesStore[index] = updated;
      resolve(updated);
    }, 300);
  });
};

export const deleteEmployee = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      employeesStore = employeesStore.filter((e) => e.id !== id);
      earningsStore = earningsStore.filter((earn) => earn.employeeId !== id);
      resolve();
    }, 300);
  });
};

export const deleteEmployees = async (ids: string[]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const idSet = new Set(ids);
      employeesStore = employeesStore.filter((e) => !idSet.has(e.id));
      earningsStore = earningsStore.filter((earn) => !idSet.has(earn.employeeId));
      resolve();
    }, 300);
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
        resolve([...earningsStore]);
      }
    }, 200);
  });
};

export const addEarningRecord = async (
  record: Omit<EmployeeEarningRecord, 'id' | 'createdAt'>
): Promise<EmployeeEarningRecord> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRecord: EmployeeEarningRecord = {
        ...record,
        id: `earn-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      earningsStore = [newRecord, ...earningsStore];
      resolve(newRecord);
    }, 200);
  });
};
