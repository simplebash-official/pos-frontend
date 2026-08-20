import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { PrintJob, PrintJobInput, PrintJobType } from '../types';

export const calculatePrintEarnings = (input: {
  estimatedCostCents: number;
  materialCostCents?: number;
  splitType?: 'percentage' | 'fixed';
  splitValue?: number;
}): number => {
  if (!input.splitType || !input.splitValue) return 0;
  const revenue = input.estimatedCostCents;
  const cost = input.materialCostCents || 0;
  const profit = Math.max(0, revenue - cost);

  if (input.splitType === 'percentage') {
    return Math.round((profit * input.splitValue) / 100);
  } else {
    return Math.min(profit, input.splitValue);
  }
};

// Mirrors `repairsApi.ts`'s `BackendRepair` — see that file's comment for
// why there's no `employeeEarningsCents` here either.
interface BackendPrintJob {
  id: string;
  key: string;
  ticketNumber: string;
  customerKey?: string;
  customerName: string;
  customerPhone?: string;
  jobType: PrintJobType;
  quantity: number;
  status: PrintJob['status'];
  estimatedCostCents: number;
  materialCostCents?: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: 'percentage' | 'fixed';
  splitValue?: number;
  createdAt: string;
}

interface PrintJobListResponseData {
  printJobs: BackendPrintJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// `id` set to the backend's prefixed `key` — see `repairsApi.ts::toRepairJob`.
const toPrintJob = (job: BackendPrintJob): PrintJob => ({
  id: job.key,
  ticketNumber: job.ticketNumber,
  customerName: job.customerName,
  customerPhone: job.customerPhone,
  jobType: job.jobType,
  quantity: job.quantity,
  status: job.status,
  estimatedCostCents: job.estimatedCostCents,
  materialCostCents: job.materialCostCents,
  assignedEmployeeId: job.assignedEmployeeId,
  assignedEmployeeName: job.assignedEmployeeName,
  splitType: job.splitType,
  splitValue: job.splitValue,
  employeeEarningsCents: calculatePrintEarnings({
    estimatedCostCents: job.estimatedCostCents,
    materialCostCents: job.materialCostCents,
    splitType: job.splitType,
    splitValue: job.splitValue,
  }),
  createdAt: job.createdAt,
});

export interface FetchPrintJobsParams {
  /** Free-text match against ticket number / customer name / phone / job type. */
  search?: string;
  /** Exact status match: received | diagnosing | in_repair | ready | delivered | cancelled. */
  status?: string;
  /** Only `"today"` is meaningful; omit for all time. */
  datePreset?: 'today';
}

// These params are only passed by `useBackendFilteredList`
// (`PrintJobList.tsx`) — the sync engine's `pull.full`
// (`printJobs.resource.ts`) and `CatalogPanel.tsx` always call this with no
// params, so a filter never scopes what gets mirrored offline.
export const fetchPrintJobs = async (params?: FetchPrintJobsParams): Promise<PrintJob[]> => {
  const response = await apiClient.get<ApiResponse<PrintJobListResponseData>>('/print-jobs', {
    params: {
      limit: 200,
      search: params?.search,
      status: params?.status,
      datePreset: params?.datePreset,
    },
  });
  return response.data.printJobs.map(toPrintJob);
};

// REST-only — no `mockEmployees` commission side effect here. Per the
// offline-sync rule that only `src/offline/resources/` may import a synced
// resource's `api/` module, `printJobs.resource.ts` is the only caller of
// these three; it runs the commission bookkeeping itself, inside `push`,
// after the server call below succeeds.
export const createPrintJobRaw = async (
  input: PrintJobInput,
  options?: MutationRequestOptions
): Promise<PrintJob> => {
  const response = await apiClient.post<ApiResponse<BackendPrintJob>>(
    '/print-jobs',
    input,
    options
  );
  return toPrintJob(response.data);
};

export const updatePrintJobRaw = async (
  id: string,
  input: Partial<PrintJobInput>,
  options?: MutationRequestOptions
): Promise<PrintJob> => {
  const response = await apiClient.patch<ApiResponse<BackendPrintJob>>(
    `/print-jobs/${id}`,
    input,
    options
  );
  return toPrintJob(response.data);
};

/**
 * There is no `/print-jobs/batch` route, so a bulk delete is N separate
 * requests. The idempotency store's uniqueness is `(key, user_id)` only —
 * not scoped per request — so every request here MUST get its own derived
 * key; reusing `options.idempotencyKey` verbatim across all N calls would
 * make requests 2..N replay request 1's cached response instead of
 * actually deleting anything.
 */
export const deletePrintJobsRaw = async (
  ids: string[],
  options?: MutationRequestOptions
): Promise<void> => {
  await Promise.all(
    ids.map((id) =>
      apiClient.delete(`/print-jobs/${id}`, {
        ...options,
        idempotencyKey: options?.idempotencyKey ? `${options.idempotencyKey}:${id}` : undefined,
      })
    )
  );
};
