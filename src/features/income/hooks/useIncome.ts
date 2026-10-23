import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useModuleStats } from '@/shared/hooks/useModuleStats';
import { createIncome, fetchIncomeStats, listIncome } from '../api/incomeApi';
import type { CreateIncomeInput, IncomeListQuery } from '../types';

export const useIncome = (query: IncomeListQuery) =>
  useQuery({
    queryKey: queryKeys.income.list(query as Record<string, unknown>),
    queryFn: () => listIncome(query),
  });

/** The Income page's headline figures, from the server, with the last answer kept for offline. */
export const useIncomeStats = () =>
  useModuleStats('income', queryKeys.income.stats(), fetchIncomeStats);

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIncomeInput) => createIncome(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.income.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
};
