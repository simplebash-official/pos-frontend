import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { Employee, EmployeeInput } from '../types';

export interface EmployeeListParams {
  [key: string]: string | undefined;
  search?: string;
  role?: string;
  status?: string;
}

export const fetchEmployees = async (params: EmployeeListParams = {}): Promise<Employee[]> => {
  const response = await apiClient.get<ApiResponse<{ employees: Employee[] }>>('/employees', {
    params,
  });
  return response.data.employees;
};

export const fetchEmployeeById = async (id: string): Promise<Employee> => {
  const response = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);
  return response.data;
};

export const createEmployee = async (
  input: EmployeeInput,
  options?: MutationRequestOptions
): Promise<Employee> => {
  const response = await apiClient.post<ApiResponse<Employee>>('/employees', input, options);
  return response.data;
};

/** Partial update — omitted fields keep their existing value server-side. */
export const updateEmployee = async (
  id: string,
  input: Partial<EmployeeInput>,
  options?: MutationRequestOptions
): Promise<Employee> => {
  const response = await apiClient.patch<ApiResponse<Employee>>(`/employees/${id}`, input, options);
  return response.data;
};

export const deleteEmployee = async (
  id: string,
  options?: MutationRequestOptions
): Promise<void> => {
  await apiClient.delete(`/employees/${id}`, options);
};

export const deleteEmployees = async (
  ids: string[],
  options?: MutationRequestOptions
): Promise<void> => {
  await apiClient.delete('/employees/batch', { ...options, data: { ids } });
};
