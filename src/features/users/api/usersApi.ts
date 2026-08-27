import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { CreateUserInput, UpdateUserInput, UserAccount } from '../types';

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
