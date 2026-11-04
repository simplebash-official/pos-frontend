import { apiClient } from '@/api/client';
import type { ApiResponse } from '@/shared/types/common';
import type {
  ClaimDecision,
  ClaimListFilter,
  ClaimListResult,
  ManagerApproval,
  OpenClaimInput,
  ReplacementInput,
  SupplierOutcome,
  WarrantyClaim,
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

export const inspectClaim = (key: string, inspectionNotes: string) =>
  step(key, 'inspect', { inspectionNotes });

export const decideClaim = (key: string, decision: ClaimDecision, approval: ManagerApproval) =>
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
