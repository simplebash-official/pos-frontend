import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  ClaimDecision,
  ClaimListFilter,
  ClaimListResult,
  ManagerApproval,
  OpenClaimInput,
  OpenClaimsBatchInput,
  OpenClaimsBatchResponse,
  ProcessClaimInput,
  ReplacementInput,
  SupplierOutcome,
  WarrantyClaim,
  WarrantyCondition,
  WarrantyConditionsResponse,
} from '../types';

const base = '/warranty-claims';

/** The claims queue, oldest first (one page of 200). */
export const fetchClaims = async (filter: ClaimListFilter): Promise<ClaimListResult> => {
  const response = await apiClient.get<ApiResponse<ClaimListResult>>(base, {
    params: { ...filter, limit: 200 },
  });
  return response.data;
};

export const fetchClaim = async (key: string): Promise<WarrantyClaim> => {
  const response = await apiClient.get<ApiResponse<WarrantyClaim>>(`${base}/${key}`);
  return response.data;
};

const step = async (key: string, path: string, body: object): Promise<WarrantyClaim> => {
  const response = await apiClient.post<ApiResponse<WarrantyClaim>>(`${base}/${key}/${path}`, body);
  return response.data;
};

export const openClaim = async (input: OpenClaimInput): Promise<WarrantyClaim> => {
  const response = await apiClient.post<ApiResponse<WarrantyClaim>>(base, input);
  return response.data;
};

/** Opens a claim on each warranty of one invoice; every warranty answers on its own. */
export const openClaimsBatch = async (
  input: OpenClaimsBatchInput
): Promise<OpenClaimsBatchResponse> => {
  const response = await apiClient.post<ApiResponse<OpenClaimsBatchResponse>>(
    `${base}/batch`,
    input
  );
  return response.data;
};

/** Takes a claim to its decision and as far on as the outcome goes in a single request. */
export const processClaim = async (input: ProcessClaimInput): Promise<WarrantyClaim> => {
  const response = await apiClient.post<ApiResponse<WarrantyClaim>>(`${base}/process`, input);
  return response.data;
};

export const inspectClaim = (key: string, inspectionNotes: string) =>
  step(key, 'inspect', { inspectionNotes });

export const decideClaim = (key: string, decision: ClaimDecision, approval?: ManagerApproval) =>
  step(key, 'decide', { decision, approval });

export interface SendToSupplierInput {
  supplierKey: string;
  reference?: string;
  expectedBackOn?: string;
}

export const sendClaimToSupplier = (key: string, input: SendToSupplierInput) =>
  step(key, 'supplier/send', input);

export const recordSupplierReturn = (key: string, outcome: SupplierOutcome, note?: string) =>
  step(key, 'supplier/return', { outcome, note });

export const resolveClaim = (
  key: string,
  resolutionNote: string | undefined,
  replacement: ReplacementInput | undefined
) => step(key, 'resolve', { resolutionNote, replacement });

export const returnClaimToCustomer = (key: string) => step(key, 'return', {});

export const convertClaimToPaidRepair = (key: string) => step(key, 'paid-repair', {});

/** Opens the free rework job for a claim on repair work decided as a repair. */
export const openClaimRework = (key: string) => step(key, 'rework', {});

export const fetchConditions = async (): Promise<WarrantyCondition[]> => {
  const response = await apiClient.get<ApiResponse<WarrantyConditionsResponse>>(
    `${base}/conditions`
  );
  return response.data.conditions;
};

export const createCondition = async (name: string): Promise<WarrantyCondition> => {
  const response = await apiClient.post<ApiResponse<WarrantyCondition>>(`${base}/conditions`, {
    name,
  });
  return response.data;
};

export const deleteCondition = async (key: string): Promise<void> => {
  await apiClient.delete<ApiResponse<WarrantyCondition>>(`${base}/conditions/${key}`);
};
