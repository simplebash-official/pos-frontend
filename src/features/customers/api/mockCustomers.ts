import { Customer, CustomerInput } from '../types';
import { INITIAL_CUSTOMERS } from './data';

export { INITIAL_CUSTOMERS };

let customersStore: Customer[] = [...INITIAL_CUSTOMERS];

export const fetchCustomers = async (): Promise<Customer[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...customersStore]), 200);
  });
};

export const createCustomer = async (input: CustomerInput): Promise<Customer> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newCustomer: Customer = {
        ...input,
        id: `cust-${Date.now()}`,
        outstandingBalanceCents: 0,
        totalPurchasesCents: 0,
        createdAt: now,
        updatedAt: now,
      };
      customersStore = [newCustomer, ...customersStore];
      resolve(newCustomer);
    }, 300);
  });
};

export const updateCustomer = async (
  id: string,
  input: CustomerInput
): Promise<Customer> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = customersStore.findIndex((c) => c.id === id);
      if (index === -1) {
        reject(new Error('Customer not found'));
        return;
      }
      const updated: Customer = {
        ...customersStore[index],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      customersStore[index] = updated;
      resolve(updated);
    }, 300);
  });
};

export const deleteCustomer = async (id: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      customersStore = customersStore.filter((c) => c.id !== id);
      resolve();
    }, 300);
  });
};
