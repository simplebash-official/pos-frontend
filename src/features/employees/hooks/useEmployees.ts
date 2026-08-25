import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type {
  DeleteEmployeePayload,
  DeleteEmployeesPayload,
  UpdateEmployeePayload,
} from '@/offline/resources/employees.resource';
import { Employee, EmployeeInput } from '../types';

const NO_EMPLOYEES: MirroredRow<Employee>[] = [];

export const useAllEmployees = () => {
  return useSyncedQuery(
    'employees',
    () => db.employees.where('_isDeleted').equals(0).sortBy('name'),
    NO_EMPLOYEES,
    []
  );
};

export const useCreateEmployee = () => {
  return useSyncedMutation<EmployeeInput, Employee>('employees', 'create');
};

export const useUpdateEmployee = () => {
  return useSyncedMutation<UpdateEmployeePayload, Employee>('employees', 'update');
};

export const useDeleteEmployee = () => {
  return useSyncedMutation<DeleteEmployeePayload, void>('employees', 'delete');
};

export const useDeleteEmployees = () => {
  return useSyncedMutation<DeleteEmployeesPayload, void>('employees', 'deleteMany');
};
