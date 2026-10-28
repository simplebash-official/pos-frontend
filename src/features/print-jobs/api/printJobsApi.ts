import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { calc_earnings } from '@/wasm';
import { PrintJob, PrintJobInput, PrintJobType } from '../types';

// Client-side computed employee earnings via `calc_earnings` from WASM.
export interface BackendPrintJob {
  id: string;
  key: string;
  ticketNumber: string;
  customerKey?: string;
  customerName: string;
  customerPhone?: string;
  jobType: PrintJobType;
  quantity: number;
  promisedReadyAt?: string;
  isOverdue?: boolean;
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
export const toPrintJob = (job: BackendPrintJob): PrintJob => ({
  id: job.key,
  ticketNumber: job.ticketNumber,
  customerName: job.customerName,
  customerPhone: job.customerPhone,
  jobType: job.jobType,
  quantity: job.quantity,
  promisedReadyAt: job.promisedReadyAt,
  isOverdue: job.isOverdue,
  status: job.status,
  estimatedCostCents: job.estimatedCostCents,
  materialCostCents: job.materialCostCents,
  assignedEmployeeId: job.assignedEmployeeId,
  assignedEmployeeName: job.assignedEmployeeName,
  splitType: job.splitType,
  splitValue: job.splitValue,
  employeeEarningsCents: calc_earnings({
    priceCents: job.estimatedCostCents,
    materialCostCents: job.materialCostCents ?? 0,
    splitType: job.splitType,
    splitValue: job.splitValue ?? 0,
  }).commissionCents,
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

// One page (backend's 200 max), used for a filtered/searched request —
// called by `useBackendFilteredList` (`PrintJobList.tsx`) with `search`/
// `status`/`datePreset`, where the top-200 matches are what's wanted, not
// every job.
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

/**
 * Every print job, looping past the backend's 200-per-page cap — for the
 * unfiltered `PrintJobList` default view, which must not silently truncate
 * a shop's job history once it grows past one page.
 */
export const fetchAllPrintJobs = async (): Promise<PrintJob[]> => {
  const fetchPage = async (page: number) => {
    const response = await apiClient.get<ApiResponse<PrintJobListResponseData>>('/print-jobs', {
      params: { page, limit: 200 },
    });
    return response.data;
  };

  const firstPage = await fetchPage(1);
  const printJobs = [...firstPage.printJobs];
  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const next = await fetchPage(page);
    printJobs.push(...next.printJobs);
  }
  return printJobs.map(toPrintJob);
};

export const createPrintJobRaw = async (input: PrintJobInput): Promise<PrintJob> => {
  const response = await apiClient.post<ApiResponse<BackendPrintJob>>('/print-jobs', input);
  return toPrintJob(response.data);
};

export const updatePrintJobRaw = async (
  id: string,
  input: Partial<PrintJobInput>
): Promise<PrintJob> => {
  const response = await apiClient.patch<ApiResponse<BackendPrintJob>>(`/print-jobs/${id}`, input);
  return toPrintJob(response.data);
};

/**
 * There is no `/print-jobs/batch` route, so a bulk delete is N separate
 * requests — each gets its own auto-generated `Idempotency-Key` from
 * `apiClient`'s request interceptor, so a retry of one never replays another.
 */
export const deletePrintJobsRaw = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => apiClient.delete(`/print-jobs/${id}`)));
};
