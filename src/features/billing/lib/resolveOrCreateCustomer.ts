import type { Customer, CustomerInput } from '@/features/customers/types';
import { db } from '@/offline/db/schema';
import { stripMirrorMeta } from '@/offline/db/mirror';

/**
 * Finds an existing customer by exact phone match, or creates one — used
 * wherever billing auto-attaches a customer inferred from a scanned/picked
 * repair or print-job ticket (`ServiceJobPickerModal`, `CatalogPanel`'s
 * barcode-scan match). Returns `null` (no attempt to create) when there's
 * no phone number, since `primaryPhone` is required to create a customer
 * record — the caller should fall back to attaching a walk-in snapshot
 * (name/phone only, no `customerKey`) in that case.
 *
 * Customers is a synced resource (see CLAUDE.md's offline/sync rules): the
 * lookup reads Dexie's local mirror directly rather than calling
 * `customersApi` (a live network round trip that also can't see rows still
 * sitting in the outbox), and creation goes through `useCreateCustomer`'s
 * `mutateAsync` — passed in rather than imported here since hooks can't be
 * called from a plain async function — so a newly-created customer lands in
 * the mirror immediately instead of waiting for the next periodic pull.
 */
export const resolveOrCreateCustomer = async (
  name: string,
  phone: string | undefined,
  createCustomerAsync: (input: CustomerInput) => Promise<Customer>
): Promise<Customer | null> => {
  if (!phone) {
    return null;
  }
  const existingRow = await db.customers.where('primaryPhone').equals(phone).first();
  if (existingRow && existingRow._isDeleted === 0) {
    return stripMirrorMeta(existingRow);
  }
  return createCustomerAsync({ name, primaryPhone: phone });
};
