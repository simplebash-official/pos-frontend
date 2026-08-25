import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
  type UserListParams,
} from '../api/usersApi';
import type { CreateUserInput, UpdateUserInput } from '../types';

/**
 * Plain TanStack Query, not `useSyncedQuery`/`useSyncedMutation` — `users`
 * is not a synced resource (see `usersApi.ts`'s doc comment), so
 * `invalidateQueries` here is the one deliberate exception to the "never
 * reintroduce `invalidateQueries` for synced data" rule.
 */
export const useUsers = (params?: UserListParams) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => fetchUsers(params),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) => updateUser(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};
