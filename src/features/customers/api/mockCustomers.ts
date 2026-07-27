import { Customer } from '../types';

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Saman Perera',
    phone: '0771234567',
    email: 'saman@example.com',
    outstandingBalanceCents: 150000,
    totalPurchasesCents: 8500000,
  },
  {
    id: '2',
    name: 'ABC Enterprises',
    phone: '0112345678',
    email: 'contact@abcenterprises.lk',
    outstandingBalanceCents: 0,
    totalPurchasesCents: 24500000,
  },
];

export const fetchCustomers = async (): Promise<Customer[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(SAMPLE_CUSTOMERS), 300));
};
