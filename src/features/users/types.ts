import type { UserRole } from '@/constants/roles';

export interface UserAccount {
  id: string;
  key: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  /** Key of the linked Employee HR/commission profile, if any. */
  employeeKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  employeeKey?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
  employeeKey?: string;
}
