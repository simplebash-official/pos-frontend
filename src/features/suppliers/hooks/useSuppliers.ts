import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type {
  DeleteSupplierPayload,
  DeleteSuppliersPayload,
  UpdateSupplierPayload,
} from '@/offline/resources/suppliers.resource';
import { Supplier, SupplierInput } from '../types';

/**
 * Local-first supplier access.
 *
 * Suppliers previously had no hook at all — five components each ran their own
 * inline `useQuery`. Consolidating them here is what let the whole feature
 * move to the mirror in one change.
 */

const NO_SUPPLIERS: MirroredRow<Supplier>[] = [];

export const useAllSuppliers = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;

  return useSyncedQuery(
    'suppliers',
    async () => {
      if (!enabled) {
        return NO_SUPPLIERS;
      }
      return db.suppliers.where('_isDeleted').equals(0).sortBy('name');
    },
    NO_SUPPLIERS,
    [enabled]
  );
};

/** Distinct categories across every mirrored supplier, for the filter chips. */
export const useSupplierCategories = () => {
  const { data: suppliers } = useAllSuppliers();
  return [...new Set(suppliers.flatMap((supplier) => supplier.suppliedCategories))].sort();
};

export const useCreateSupplier = () => {
  return useSyncedMutation<SupplierInput, Supplier>('suppliers', 'create');
};

export const useUpdateSupplier = () => {
  return useSyncedMutation<UpdateSupplierPayload, Supplier>('suppliers', 'update');
};

export const useDeleteSupplier = () => {
  return useSyncedMutation<DeleteSupplierPayload, void>('suppliers', 'delete');
};

export const useDeleteSuppliers = () => {
  return useSyncedMutation<DeleteSuppliersPayload, void>('suppliers', 'deleteMany');
};
