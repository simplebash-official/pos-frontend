import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { queryKeys } from '@/api/queryKeys';
import { feedbackMeta } from '@/api/mutationFeedback';
import { t } from '@/shared/i18n/t';
import {
  convertClaimToPaidRepair,
  createCondition,
  deleteCondition,
  fetchConditions,
  openClaimRework,
  decideClaim,
  fetchClaim,
  fetchClaims,
  inspectClaim,
  openClaim,
  openClaimsBatch,
  quickReplaceClaim,
  recordSupplierReturn,
  resolveClaim,
  returnClaimToCustomer,
  sendClaimToSupplier,
  type SendToSupplierInput,
} from '../api/claimsApi';
import type {
  ClaimDecision,
  ClaimListFilter,
  ManagerApproval,
  OpenClaimInput,
  OpenClaimsBatchInput,
  OpenClaimsBatchResponse,
  QuickReplaceInput,
  ReplacementInput,
  SupplierOutcome,
  WarrantyClaim,
} from '../types';

/** The claims queue. Pass `null` to wait. */
export const useClaims = (filter: ClaimListFilter | null) =>
  useQuery({
    queryKey: queryKeys.warrantyClaims.list({ ...filter }),
    queryFn: () => fetchClaims(filter as ClaimListFilter),
    enabled: filter !== null,
    staleTime: 0,
  });

/** One claim. Pass `null` to wait. */
export const useClaim = (key: string | null) =>
  useQuery({
    queryKey: queryKeys.warrantyClaims.detail(key ?? ''),
    queryFn: () => fetchClaim(key as string),
    enabled: key !== null,
  });

/** A claim step changes the claim, its warranty and the dashboard's reminders, so all refresh. */
const useRefreshClaims = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.warrantyClaims.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.warranties.all }),
      // A paid repair or a rework step opens a repair job.
      queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all }),
      // Late claims are listed on the dashboard's reminders.
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all }),
      // A replacement takes a unit out of stock and sends the faulty one back.
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all }),
    ]);
};

const claimNumber = (claim: WarrantyClaim) => claim.claimNumber;

export const useOpenClaim = () => {
  const refresh = useRefreshClaims();
  return useMutation({
    mutationFn: (input: OpenClaimInput) => openClaim(input),
    onSuccess: () => refresh(),
    meta: feedbackMeta<WarrantyClaim>({
      successTitle: t('Claim started'),
      successMessage: claimNumber,
      failureTitle: t('The claim was not started'),
    }),
  });
};

/**
 * Opens a claim on each warranty of one invoice. Every warranty answers on its own, so the
 * window that sent the batch shows what failed; the green notification here only names the claims
 * that did start (and is left out when none did).
 */
export const useOpenClaimsBatch = () => {
  const refresh = useRefreshClaims();
  return useMutation({
    mutationFn: (input: OpenClaimsBatchInput) => openClaimsBatch(input),
    onSuccess: async (response: OpenClaimsBatchResponse) => {
      await refresh();
      const numbers = response.results.flatMap((result) =>
        result.outcome === 'opened' ? [result.claim.claimNumber] : []
      );
      if (numbers.length > 0) {
        notifications.show({
          title: t('Claims started'),
          message: numbers.join(', '),
          color: 'teal',
        });
      }
    },
  });
};

export const useQuickReplace = () => {
  const refresh = useRefreshClaims();
  return useMutation({
    mutationFn: (input: QuickReplaceInput) => quickReplaceClaim(input),
    onSuccess: () => refresh(),
    meta: feedbackMeta<WarrantyClaim>({
      successTitle: t('Unit replaced'),
      successMessage: claimNumber,
      failureTitle: t('The unit was not replaced'),
    }),
  });
};

/** Every step after opening: one hook, one mutation per step kind. */
export type ClaimStepInput =
  | { kind: 'inspect'; key: string; inspectionNotes: string }
  | { kind: 'decide'; key: string; decision: ClaimDecision; approval?: ManagerApproval }
  | { kind: 'send'; key: string; input: SendToSupplierInput }
  | { kind: 'supplierReturn'; key: string; outcome: SupplierOutcome; note?: string }
  | { kind: 'resolve'; key: string; resolutionNote?: string; replacement?: ReplacementInput }
  | { kind: 'return'; key: string }
  | { kind: 'paidRepair'; key: string }
  | { kind: 'rework'; key: string };

const runStep = (step: ClaimStepInput): Promise<WarrantyClaim> => {
  switch (step.kind) {
    case 'inspect':
      return inspectClaim(step.key, step.inspectionNotes);
    case 'decide':
      return decideClaim(step.key, step.decision, step.approval);
    case 'send':
      return sendClaimToSupplier(step.key, step.input);
    case 'supplierReturn':
      return recordSupplierReturn(step.key, step.outcome, step.note);
    case 'resolve':
      return resolveClaim(step.key, step.resolutionNote, step.replacement);
    case 'return':
      return returnClaimToCustomer(step.key);
    case 'paidRepair':
      return convertClaimToPaidRepair(step.key);
    case 'rework':
      return openClaimRework(step.key);
  }
};

export const useClaimStep = () => {
  const refresh = useRefreshClaims();
  return useMutation({
    mutationFn: runStep,
    onSuccess: () => refresh(),
    meta: feedbackMeta<WarrantyClaim>({
      successTitle: t('Claim updated'),
      successMessage: claimNumber,
      failureTitle: t('The claim was not updated'),
    }),
  });
};

/** Active condition checklist options for the shop. */
export const useWarrantyConditions = () =>
  useQuery({
    queryKey: queryKeys.warrantyClaims.conditions(),
    queryFn: fetchConditions,
    staleTime: 60_000,
  });

export const useCreateWarrantyCondition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createCondition(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warrantyClaims.conditions() });
    },
  });
};

export const useDeleteWarrantyCondition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => deleteCondition(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warrantyClaims.conditions() });
    },
  });
};
