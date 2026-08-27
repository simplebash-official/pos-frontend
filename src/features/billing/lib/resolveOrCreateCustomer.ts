import type { Customer, CustomerInput } from '@/features/customers/types';
import { fetchCustomers } from '@/features/customers/api/customersApi';

/**
 * Finds an existing customer by exact phone match, or creates one — used
 * wherever billing auto-attaches a customer inferred from a scanned/picked
 * repair or print-job ticket (`CatalogPanel`'s Jobs mode and its
 * barcode-scan match). Returns `null` (no attempt to create) when there's
 * no phone number, since `primaryPhone` is required to create a customer
 * record — the caller should fall back to attaching a walk-in snapshot
 * (name/phone only, no `customerKey`) in that case.
 *
 * Creation goes through `useCreateCustomer`'s `mutateAsync` — passed in
 * rather than imported here since hooks can't be called from a plain async
 * function.
 */
export const resolveOrCreateCustomer = async (
  name: string,
  phone: string | undefined,
  createCustomerAsync: (input: CustomerInput) => Promise<Customer>
): Promise<Customer | null> => {
  if (!phone) {
    return null;
  }
  const { customers } = await fetchCustomers({ search: phone, limit: 5 });
  const existing = customers.find((customer) => customer.primaryPhone === phone);
  if (existing) {
    return existing;
  }
  return createCustomerAsync({ name, primaryPhone: phone });
};
