import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type {
  DeleteCustomerPayload,
  DeleteCustomersPayload,
  UpdateCustomerPayload,
} from '@/offline/resources/customers.resource';
import { PRESET_CUSTOMER_TAGS } from '../constants';
import { Customer, CustomerInput } from '../types';

const NO_CUSTOMERS: MirroredRow<Customer>[] = [];

/**
 * Local-first customer access.
 *
 * Reads from Dexie's local mirror for instant zero-latency loading and offline
 * availability across billing counter, service tickets, and directory management.
 */
export const useAllCustomers = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;

  return useSyncedQuery(
    'customers',
    async () => {
      if (!enabled) {
        return NO_CUSTOMERS;
      }
      return db.customers.where('_isDeleted').equals(0).sortBy('name');
    },
    NO_CUSTOMERS,
    [enabled]
  );
};

/** Distinct customer tags derived from live mirror rows + preset suggestions. */
export const useCustomerTags = () => {
  const { data: customers } = useAllCustomers();
  const tagsFromDb = customers.flatMap((c) => c.tags || []);
  return [...new Set([...PRESET_CUSTOMER_TAGS, ...tagsFromDb])].filter(Boolean).sort();
};

export const useCreateCustomer = () => {
  return useSyncedMutation<CustomerInput, Customer>('customers', 'create');
};

export const useUpdateCustomer = () => {
  return useSyncedMutation<UpdateCustomerPayload, Customer>('customers', 'update');
};

export const useDeleteCustomer = () => {
  return useSyncedMutation<DeleteCustomerPayload, void>('customers', 'delete');
};

export const useDeleteCustomers = () => {
  return useSyncedMutation<DeleteCustomersPayload, void>('customers', 'deleteMany');
};
