import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createRecurringExpense,
  listRecurringBills,
  updateRecurringExpense,
} from '../api/recurringApi';
import type { CreateRecurringExpenseInput, UpdateRecurringExpenseInput } from '../types';

/** The regular bills and where each stands; `enabled` lets a caller wait for permission or sign-in. */
export const useRecurringBills = (
  includeInactive: boolean,
  enabled: boolean,
  refetchIntervalMs: number | false
) =>
  useQuery({
    queryKey: queryKeys.expenses.recurring(includeInactive),
    queryFn: () => listRecurringBills(includeInactive),
    enabled,
    refetchInterval: refetchIntervalMs,
  });

export const useCreateRecurringExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRecurringExpenseInput) => createRecurringExpense(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
};

export const useUpdateRecurringExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: UpdateRecurringExpenseInput }) =>
      updateRecurringExpense(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    },
  });
};
