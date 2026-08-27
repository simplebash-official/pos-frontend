import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createSupplier,
  deleteSupplier,
  deleteSuppliers,
  fetchSuppliers,
  updateSupplier,
} from '../api/suppliersApi';
import { Supplier, SupplierInput } from '../types';

export interface UpdateSupplierPayload {
  supplierKey: string;
  input: SupplierInput;
}
export interface DeleteSupplierPayload {
  supplierKey: string;
}
export interface DeleteSuppliersPayload {
  supplierKeys: string[];
}

const NO_SUPPLIERS: Supplier[] = [];

export const useAllSuppliers = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const query = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: () => fetchSuppliers(),
    enabled,
  });
  return { ...query, data: query.data ?? NO_SUPPLIERS };
};

/** Distinct categories across every supplier, for the filter chips. */
export const useSupplierCategories = () => {
  const { data: suppliers } = useAllSuppliers();
  return [...new Set(suppliers.flatMap((supplier) => supplier.suppliedCategories))].sort();
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SupplierInput) => createSupplier(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierKey, input }: UpdateSupplierPayload) =>
      updateSupplier(supplierKey, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierKey }: DeleteSupplierPayload) => deleteSupplier(supplierKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
  });
};

export const useDeleteSuppliers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ supplierKeys }: DeleteSuppliersPayload) => deleteSuppliers(supplierKeys),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.all });
    },
  });
};
