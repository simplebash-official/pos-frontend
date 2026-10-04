import { queryKeys } from '@/api/queryKeys';

/**
 * Which cached screens a change to each synced record type can affect. When
 * another device or the website changes data, sync only says *which kind* of
 * record changed (never the record itself); every query under these roots is
 * then marked stale, so open screens reload and closed ones load fresh.
 *
 * Wider than strictly needed on purpose: a sale changes a customer's balance,
 * stock and today's report figures, and a missed reload is worse than an
 * extra one.
 */
export const RESOURCE_QUERY_ROOTS: Record<string, ReadonlyArray<readonly unknown[]>> = {
  categories: [queryKeys.categories.all, queryKeys.inventory.all],
  suppliers: [queryKeys.suppliers.all, queryKeys.supplierProducts.all, queryKeys.purchases.all],
  products: [queryKeys.inventory.all, queryKeys.supplierProducts.all, queryKeys.reports.all],
  supplierProducts: [queryKeys.supplierProducts.all],
  employees: [queryKeys.employees.all, queryKeys.reports.all],
  customers: [queryKeys.customers.all, queryKeys.reports.all],
  purchases: [queryKeys.purchases.all, queryKeys.inventory.all],
  stockMovements: [queryKeys.inventory.all, queryKeys.reports.all],
  productSerials: [queryKeys.inventory.all],
  repairs: [queryKeys.repairs.all, queryKeys.employees.all, queryKeys.reports.all],
  printJobs: [queryKeys.printJobs.all, queryKeys.employees.all, queryKeys.reports.all],
  invoices: [
    queryKeys.billing.all,
    queryKeys.customers.all,
    queryKeys.inventory.all,
    queryKeys.employees.all,
    queryKeys.reports.all,
  ],
  payments: [queryKeys.billing.all, queryKeys.customers.all, queryKeys.reports.all],
  creditNotes: [
    queryKeys.billing.all,
    queryKeys.customers.all,
    queryKeys.inventory.all,
    queryKeys.reports.all,
  ],
  users: [queryKeys.users.all],
};

/** `"*"` (everything was replaced, e.g. a full re-download) or an unknown type. */
export const EVERYTHING = '*';

/**
 * The query roots to mark stale for these changed record types, de-duplicated.
 * `null` means "everything": a full re-download, or a record type this build
 * does not know (a newer cloud), where guessing would risk a stale screen.
 */
export const queryRootsFor = (resources: readonly string[]): unknown[][] | null => {
  const seen = new Map<string, unknown[]>();
  for (const resource of resources) {
    const roots = RESOURCE_QUERY_ROOTS[resource];
    if (resource === EVERYTHING || !roots) return null;
    for (const root of roots) seen.set(JSON.stringify(root), [...root]);
  }
  return [...seen.values()];
};
