import type { UserRole } from '@/constants/roles';

export interface UserAccount {
  id: string;
  key: string;
  name: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  /** Whether a register-override PIN is configured (meaningful for admin/manager accounts). */
  hasPin?: boolean;
  /** Key of the linked Employee HR/commission profile, if any. */
  employeeKey?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  username: string;
  password: string;
  role: UserRole;
  employeeKey?: string;
}

export interface UpdateUserInput {
  name?: string;
  username?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
  employeeKey?: string;
}
