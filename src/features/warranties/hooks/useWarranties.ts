import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { feedbackMeta } from '@/api/mutationFeedback';
import { t } from '@/shared/i18n/t';
import {
  extendWarranty,
  fetchWarranties,
  fetchWarrantyPage,
  fetchWarranty,
  fetchWarrantyStats,
  getWarrantyCard,
  lookupWarranties,
  voidWarranty,
  type WarrantyCardPaper,
  type WarrantyListFilter,
} from '../api/warrantiesApi';
import { useModuleStats } from '@/shared/hooks/useModuleStats';
import type { ManagerApproval, WarrantyCoverage, WarrantyDetail, WarrantyStats } from '../types';

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

/** How many warranties the browse list loads at a time. */
export const BROWSE_PAGE_SIZE = 24;

/** Every warranty, newest first, a page at a time, for the list shown before anyone searches. */
export const useAllWarranties = () =>
  useInfiniteQuery({
    queryKey: queryKeys.warranties.list({ browse: true }),
    queryFn: ({ pageParam }) => fetchWarrantyPage(pageParam, BROWSE_PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page * last.limit < last.total ? last.page + 1 : undefined),
  });

/** One customer's or one invoice's warranties. Pass `null` to wait. */
export const useWarranties = (filter: WarrantyListFilter | null) =>
  useQuery({
    queryKey: queryKeys.warranties.list(filter ?? {}),
    queryFn: () => fetchWarranties(filter as WarrantyListFilter),
    enabled: filter !== null,
  });

/** The warranty desk's headline numbers, kept for offline as the other KPI strips are. */
export const useWarrantyStats = () =>
  useModuleStats<WarrantyStats>('warranties', queryKeys.warranties.stats(), fetchWarrantyStats);

/** Warranties in force that end within the week, soonest first. */
export const useEndingSoonWarranties = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.warranties.list({ state: 'expiring_soon' }),
    queryFn: () => fetchWarranties({ state: 'expiring_soon' }),
    enabled,
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
  approval?: ManagerApproval;
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
  approval?: ManagerApproval;
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

/**
 * The warranty's printed card. Keyed by the warranty's `version`, so a card asked for after an
 * extension or a cancellation is fetched again. Pass `null` to wait.
 */
export const useWarrantyCard = (
  warranty: { key: string; version: number } | null,
  paper: WarrantyCardPaper,
  templateName: string | undefined
) => {
  const query = useQuery({
    queryKey: queryKeys.warranties.card(
      warranty?.key ?? '',
      paper,
      templateName,
      warranty?.version ?? 0
    ),
    queryFn: () => getWarrantyCard((warranty as { key: string }).key, paper, templateName),
    enabled: warranty !== null,
  });
  const enabled = warranty !== null;
  return {
    blob: query.data ?? null,
    loading: enabled && query.isLoading,
    error: enabled && query.isError,
    errorCode:
      enabled && query.isError ? ((query.error as { code?: string } | null)?.code ?? null) : null,
    isPaused: enabled && query.fetchStatus === 'paused',
  };
};
