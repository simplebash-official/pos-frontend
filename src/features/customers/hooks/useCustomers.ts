import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createCustomer,
  deleteCustomer,
  deleteCustomers,
  fetchAllCustomers,
  updateCustomer,
} from '../api/customersApi';
import { PRESET_CUSTOMER_TAGS } from '../constants';
import { Customer, CustomerInput } from '../types';

export interface UpdateCustomerPayload {
  customerKey: string;
  input: CustomerInput;
}
export interface DeleteCustomerPayload {
  customerKey: string;
}
export interface DeleteCustomersPayload {
  customerKeys: string[];
}

const NO_CUSTOMERS: Customer[] = [];

export const useAllCustomers = (options?: { enabled?: boolean }) => {
  const enabled = options?.enabled ?? true;
  const query = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: fetchAllCustomers,
    enabled,
  });
  return { ...query, data: query.data ?? NO_CUSTOMERS };
};

/** Distinct customer tags derived from the current customer list + preset suggestions. */
export const useCustomerTags = () => {
  const { data: customers } = useAllCustomers();
  const tagsFromApi = customers.flatMap((c) => c.tags || []);
  return [...new Set([...PRESET_CUSTOMER_TAGS, ...tagsFromApi])].filter(Boolean).sort();
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerInput) => createCustomer(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerKey, input }: UpdateCustomerPayload) =>
      updateCustomer(customerKey, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerKey }: DeleteCustomerPayload) => deleteCustomer(customerKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};

export const useDeleteCustomers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ customerKeys }: DeleteCustomersPayload) => deleteCustomers(customerKeys),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};
