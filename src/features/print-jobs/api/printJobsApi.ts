import { apiClient } from '@/api/client';
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
export interface BackendPrintJob {
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
export const toPrintJob = (job: BackendPrintJob): PrintJob => ({
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
