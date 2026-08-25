import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { CreateUserInput, UpdateUserInput, UserAccount } from '../types';

/**
 * Login/account management — deliberately calls `apiClient` directly rather
 * than going through `src/offline/resources/`. `users` is confirmed absent
 * from the backend's `SYNCABLE` list and is permanently unsynced (see
 * `frontend/CLAUDE.md`'s Offline & sync section): provisioning a login is an
 * intentionally rare, always-online, Admin/Manager-only action, and a
 * `local_` provisional id for a credential has real security downside with
 * no offline-use upside. This is one of the few features (alongside `auth`
 * and `reports`) allowed to call `apiClient` for a non-synced resource.
 */

export interface UserListParams {
  [key: string]: string | undefined;
  search?: string;
  role?: string;
}

export const fetchUsers = async (params: UserListParams = {}): Promise<UserAccount[]> => {
  const response = await apiClient.get<ApiResponse<{ users: UserAccount[] }>>('/users', {
    params,
  });
  return response.data.users;
};

export const fetchUserById = async (id: string): Promise<UserAccount> => {
  const response = await apiClient.get<ApiResponse<UserAccount>>(`/users/${id}`);
  return response.data;
};

export const createUser = async (input: CreateUserInput): Promise<UserAccount> => {
  const response = await apiClient.post<ApiResponse<UserAccount>>('/users', input);
  return response.data;
};

export const updateUser = async (id: string, input: UpdateUserInput): Promise<UserAccount> => {
  const response = await apiClient.patch<ApiResponse<UserAccount>>(`/users/${id}`, input);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};
