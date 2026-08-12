import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import {
  Customer,
  CustomerInput,
  CustomerListParams,
  CustomerListResponse,
  CustomerTagsResponse,
} from '../types';

export const fetchCustomers = async (
  params: CustomerListParams = {}
): Promise<CustomerListResponse> => {
  const response = await apiClient.get<ApiResponse<CustomerListResponse>>('/customers', {
    params,
  });
  return response.data;
};

export const fetchAllCustomers = async (): Promise<Customer[]> => {
  const collected: Customer[] = [];
  let page = 1;
  const limit = 100;
  for (;;) {
    const result = await fetchCustomers({ page, limit });
    collected.push(...result.customers);
    if (page >= result.totalPages || result.customers.length === 0) {
      break;
    }
    page += 1;
  }
  return collected;
};

export const fetchCustomerById = async (idOrKey: string): Promise<Customer> => {
  const response = await apiClient.get<ApiResponse<Customer>>(`/customers/${idOrKey}`);
  return response.data;
};

export const fetchCustomerTags = async (): Promise<string[]> => {
  const response = await apiClient.get<ApiResponse<CustomerTagsResponse>>('/customers/tags');
  return response.data.tags;
};

export const createCustomer = async (
  input: CustomerInput,
  options?: MutationRequestOptions
): Promise<Customer> => {
  const response = await apiClient.post<ApiResponse<Customer>>('/customers', input, options);
  return response.data;
};

/** Full replace — omitted optional fields are cleared server-side. */
export const updateCustomer = async (
  idOrKey: string,
  input: CustomerInput,
  options?: MutationRequestOptions
): Promise<Customer> => {
  const response = await apiClient.put<ApiResponse<Customer>>(
    `/customers/${idOrKey}`,
    input,
    options
  );
  return response.data;
};

/** Partial update — preserves fields not specified in the payload. */
export const patchCustomer = async (
  idOrKey: string,
  updates: Partial<CustomerInput>,
  options?: MutationRequestOptions
): Promise<Customer> => {
  const response = await apiClient.patch<ApiResponse<Customer>>(
    `/customers/${idOrKey}`,
    updates,
    options
  );
  return response.data;
};

export const deleteCustomer = async (
  idOrKey: string,
  options?: MutationRequestOptions
): Promise<void> => {
  await apiClient.delete(`/customers/${idOrKey}`, options);
};

export const deleteCustomers = async (
  ids: string[],
  options?: MutationRequestOptions
): Promise<{ deletedCount: number }> => {
  const response = await apiClient.delete<ApiResponse<{ deletedCount: number }>>(
    '/customers/batch',
    {
      ...options,
      data: { ids },
    }
  );
  return response.data;
};
