import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createEmployee,
  deleteEmployee,
  deleteEmployees,
  fetchEmployees,
  updateEmployee,
} from '../api/employeesApi';
import { Employee, EmployeeInput } from '../types';

export interface UpdateEmployeePayload {
  employeeKey: string;
  input: Partial<EmployeeInput>;
}
export interface DeleteEmployeePayload {
  employeeKey: string;
}
export interface DeleteEmployeesPayload {
  employeeKeys: string[];
}

const NO_EMPLOYEES: Employee[] = [];

export const useAllEmployees = () => {
  const query = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: () => fetchEmployees(),
  });
  return { ...query, data: query.data ?? NO_EMPLOYEES };
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeeInput) => createEmployee(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeKey, input }: UpdateEmployeePayload) =>
      updateEmployee(employeeKey, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeKey }: DeleteEmployeePayload) => deleteEmployee(employeeKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};

export const useDeleteEmployees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ employeeKeys }: DeleteEmployeesPayload) => deleteEmployees(employeeKeys),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
    },
  });
};
