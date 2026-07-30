import { Customer, CustomerInput } from '../types';

export const PRESET_CUSTOMER_TAGS = [
  'Retail Client',
  'Wholesale Client',
  'Corporate Account',
  'VIP Customer',
  'Repair Client',
  'Print Job Client',
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Saman Perera',
    contactPerson: 'Saman Perera',
    primaryPhone: '077 123 4567',
    secondaryPhone: '011 234 5678',
    email: 'saman@example.com',
    address: 'No. 12, Galle Road, Colombo 03',
    tags: ['Retail Client', 'VIP Customer'],
    notes: 'Prefers SMS updates on repair status. Long-time loyal customer.',
    outstandingBalanceCents: 150000,
    totalPurchasesCents: 8500000,
    createdAt: '2025-01-15T09:30:00Z',
    updatedAt: '2025-02-10T14:15:00Z',
  },
  {
    id: 'cust-2',
    name: 'ABC Enterprises',
    contactPerson: 'Kavinda Fernando',
    primaryPhone: '011 456 7890',
    secondaryPhone: '071 987 6543',
    email: 'purchasing@abcenterprises.lk',
    address: 'Level 4, Millennium Tower, World Trade Center, Colombo 01',
    tags: ['Corporate Account', 'Wholesale Client', 'Print Job Client'],
    notes: 'Monthly bulk stationery and customized mug orders. 30-day credit period.',
    outstandingBalanceCents: 4500000,
    totalPurchasesCents: 24500000,
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2025-03-01T11:45:00Z',
  },
  {
    id: 'cust-3',
    name: 'Lanka Tech Solutions',
    contactPerson: 'Niroshan Silva',
    primaryPhone: '076 555 4321',
    email: 'info@lankatech.lk',
    address: 'No. 88, Kandy Road, Kiribathgoda',
    tags: ['Repair Client', 'Wholesale Client'],
    notes: 'Regularly sends mobile devices for screen and battery replacements.',
    outstandingBalanceCents: 0,
    totalPurchasesCents: 12000000,
    createdAt: '2025-02-01T08:20:00Z',
    updatedAt: '2025-02-25T16:00:00Z',
  },
  {
    id: 'cust-4',
    name: 'Dilhani Jayasinghe',
    contactPerson: 'Dilhani Jayasinghe',
    primaryPhone: '071 222 3333',
    secondaryPhone: '077 888 9999',
    email: 'dilhani.j@gmail.com',
    address: 'No. 45, Main Street, Nugegoda',
    tags: ['Retail Client', 'Print Job Client'],
    notes: 'Frequent buyer of photo printing and personalized gifts.',
    outstandingBalanceCents: 0,
    totalPurchasesCents: 3400000,
    createdAt: '2025-02-18T13:10:00Z',
    updatedAt: '2025-03-02T10:00:00Z',
  },
];

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
