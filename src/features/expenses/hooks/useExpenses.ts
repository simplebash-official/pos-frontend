import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useModuleStats } from '@/shared/hooks/useModuleStats';
import {
  addExpensePayment,
  createExpense,
  fetchExpenseStats,
  getExpense,
  listExpenses,
} from '../api/expensesApi';
import type { CreateExpenseInput, CreateExpensePaymentInput, ExpenseListQuery } from '../types';

export const useExpenses = (query: ExpenseListQuery) =>
  useQuery({
    queryKey: queryKeys.expenses.list(query as Record<string, unknown>),
    queryFn: () => listExpenses(query),
  });

/** The Expenses page's headline figures, from the server, with the last answer kept for offline. */
export const useExpenseStats = () =>
  useModuleStats('expenses', queryKeys.expenses.stats(), fetchExpenseStats);

/** One ledger expense with its payments; waits until a key is given. */
export const useExpenseDetail = (key: string | null) =>
  useQuery({
    queryKey: queryKeys.expenses.detail(key),
    queryFn: () => getExpense(key as string),
    enabled: key !== null,
  });

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExpenseInput) => createExpense(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
};

export const useAddExpensePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, input }: { key: string; input: CreateExpensePaymentInput }) =>
      addExpensePayment(key, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
};
