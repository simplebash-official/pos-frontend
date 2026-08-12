import { Customer, CustomerInput } from '../types';
import { LocalStorageStore } from '@/shared/lib/localStorageStore';

export const normalizeCustomer = (rawInput: unknown): Customer => {
  const raw = (rawInput && typeof rawInput === 'object' ? rawInput : {}) as Record<string, unknown>;
  const id = typeof raw.id === 'string' ? raw.id : `cust-${Date.now()}`;
  return {
    id,
    key: typeof raw.key === 'string' ? raw.key : id,
    name: String(raw.name || raw.customerName || 'Unnamed Customer'),
    contactPerson: String(raw.contactPerson || raw.name || raw.customerName || 'N/A'),
    primaryPhone: String(raw.primaryPhone || raw.phone || raw.contactPhone || ''),
    secondaryPhone: String(raw.secondaryPhone || raw.backupPhone || ''),
    email: String(raw.email || ''),
    address: String(raw.address || ''),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    notes: String(raw.notes || ''),
    outstandingBalanceCents: Number(raw.outstandingBalanceCents ?? raw.balanceDueCents ?? 0),
    totalPurchasesCents: Number(raw.totalPurchasesCents ?? raw.totalSpentCents ?? 0),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
  };
};

export const customersStore = new LocalStorageStore<Customer>(
  'pos_customers',
  [],
  normalizeCustomer
);

export const fetchCustomers = async (): Promise<Customer[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(customersStore.getAll()), 200));
};

export const createCustomer = async (input: CustomerInput): Promise<Customer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newCustomer: Customer = normalizeCustomer({
        ...input,
        id: `cust-${Date.now()}`,
        outstandingBalanceCents: 0,
        totalPurchasesCents: 0,
        createdAt: now,
        updatedAt: now,
      });
      customersStore.add(newCustomer);
      resolve(newCustomer);
    }, 200);
  });
};

export const updateCustomer = async (id: string, input: CustomerInput): Promise<Customer> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const updated = customersStore.update(id, {
        ...input,
        updatedAt: new Date().toISOString(),
      });
      if (!updated) return reject(new Error('Customer not found'));
      resolve(updated);
    }, 200);
  });
};

export const deleteCustomer = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      customersStore.remove(id);
      resolve();
    }, 200);
  });
};

export const deleteCustomers = async (ids: string[]): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      ids.forEach((id) => customersStore.remove(id));
      resolve();
    }, 200);
  });
};
