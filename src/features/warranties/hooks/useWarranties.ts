import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { feedbackMeta } from '@/api/mutationFeedback';
import { t } from '@/shared/i18n/t';
import {
  extendWarranty,
  fetchWarranties,
  fetchWarranty,
  lookupWarranties,
  voidWarranty,
  type WarrantyListFilter,
} from '../api/warrantiesApi';
import type { ManagerApproval, WarrantyCoverage, WarrantyDetail } from '../types';

/** The shortest text worth asking the server about. */
export const LOOKUP_MIN_LENGTH = 3;

/** Warranties found from scanned or typed text; idle until there are at least 3 characters. */
export const useWarrantyLookup = (q: string) => {
  const text = q.trim();
  return useQuery({
    queryKey: queryKeys.warranties.lookup(text),
    queryFn: () => lookupWarranties(text),
    enabled: text.length >= LOOKUP_MIN_LENGTH,
    placeholderData: keepPreviousData,
  });
};

/** One customer's or one invoice's warranties. Pass `null` to wait. */
export const useWarranties = (filter: WarrantyListFilter | null) =>
  useQuery({
    queryKey: queryKeys.warranties.list(filter ?? {}),
    queryFn: () => fetchWarranties(filter as WarrantyListFilter),
    enabled: filter !== null,
  });

/** One warranty in full. Pass `null` to wait. */
export const useWarranty = (key: string | null) =>
  useQuery({
    queryKey: queryKeys.warranties.detail(key ?? ''),
    queryFn: () => fetchWarranty(key as string),
    enabled: key !== null,
  });

const useRefreshWarranties = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.warranties.all });
};

export interface VoidWarrantyInput {
  key: string;
  approval: ManagerApproval;
}

export const useVoidWarranty = () => {
  const refresh = useRefreshWarranties();
  return useMutation({
    mutationFn: ({ key, approval }: VoidWarrantyInput) => voidWarranty(key, approval),
    onSuccess: () => refresh(),
    meta: feedbackMeta<WarrantyDetail>({
      successTitle: t('Warranty cancelled'),
      successMessage: (detail) => detail.warranty.warrantyNumber,
      failureTitle: t('The warranty was not cancelled'),
    }),
  });
};

export interface ExtendWarrantyInput {
  key: string;
  coverage: WarrantyCoverage;
  approval: ManagerApproval;
}

export const useExtendWarranty = () => {
  const refresh = useRefreshWarranties();
  return useMutation({
    mutationFn: ({ key, coverage, approval }: ExtendWarrantyInput) =>
      extendWarranty(key, coverage, approval),
    onSuccess: () => refresh(),
    meta: feedbackMeta<WarrantyDetail>({
      successTitle: t('Warranty extended'),
      successMessage: (detail) => detail.warranty.warrantyNumber,
      failureTitle: t('The warranty was not extended'),
    }),
  });
};
