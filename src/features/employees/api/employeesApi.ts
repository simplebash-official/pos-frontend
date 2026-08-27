import { apiClient } from '@/api/client';
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

export const createEmployee = async (input: EmployeeInput): Promise<Employee> => {
  const response = await apiClient.post<ApiResponse<Employee>>('/employees', input);
  return response.data;
};

/** Partial update — omitted fields keep their existing value server-side. */
export const updateEmployee = async (
  id: string,
  input: Partial<EmployeeInput>
): Promise<Employee> => {
  const response = await apiClient.patch<ApiResponse<Employee>>(`/employees/${id}`, input);
  return response.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  await apiClient.delete(`/employees/${id}`);
};

export const deleteEmployees = async (ids: string[]): Promise<void> => {
  await apiClient.delete('/employees/batch', { data: { ids } });
};
