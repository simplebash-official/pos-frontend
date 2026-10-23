import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  createCashCategory,
  createPayee,
  findSimilarCashCategories,
  getPeriodStatus,
  listCashCategories,
  listPayees,
  type CashCategoryListQuery,
  type PayeeListQuery,
} from '../api/cashLookupsApi';
import type { CashMovementType, CreateCashCategoryInput, CreatePayeeInput } from '../types';

/** Categories for one kind of payment, best first. Waits until a kind is chosen. */
export const useCashCategories = (query: CashCategoryListQuery, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.billing.cash.categories(query as Record<string, unknown>),
    queryFn: () => listCashCategories(query),
    enabled,
  });

/** "Did you mean…?" matches for a name being typed; only asked once there is something to match. */
export const useSimilarCashCategories = (movementType: CashMovementType, name: string) =>
  useQuery({
    queryKey: queryKeys.billing.cash.similarCategories(movementType, name),
    queryFn: () => findSimilarCashCategories(movementType, name),
    enabled: name.trim().length >= 2,
  });

export const useCreateCashCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCashCategoryInput) => createCashCategory(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.cash.all });
    },
  });
};

export const usePayees = (query: PayeeListQuery, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.billing.cash.payees(query as Record<string, unknown>),
    queryFn: () => listPayees(query),
    enabled,
  });

export const useCreatePayee = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePayeeInput) => createPayee(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.cash.all });
    },
  });
};

/** What is already recorded for a category and payee in a month; asked once the category and month are known. */
export const usePeriodStatus = (
  categoryKey: string | null,
  payeeKey: string | null,
  period: string | null
) =>
  useQuery({
    queryKey: queryKeys.billing.cash.periodStatus(categoryKey, payeeKey, period),
    queryFn: () => getPeriodStatus(categoryKey as string, payeeKey ?? undefined, period as string),
    enabled: categoryKey !== null && period !== null,
  });
