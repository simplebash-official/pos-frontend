import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { calc_earnings } from '@/wasm';
import { PrintJob, PrintJobInput, PrintJobItem, PrintJobKind, PrintJobType } from '../types';

// Client-side computed employee earnings via `calc_earnings` from WASM.
export interface BackendPrintJob {
  id: string;
  key: string;
  ticketNumber: string;
  customerKey: string;
  customerName: string;
  customerPhone: string;
  jobType: PrintJobType;
  quantity: number;
  promisedReadyAt?: string;
  isOverdue?: boolean;
  status: PrintJob['status'];
  note?: string;
  kind: PrintJobKind;
  items: PrintJobItem[];
  priceCents: number;
  costCents: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: 'percentage' | 'fixed';
  splitValue?: number;
  billedInvoiceKey?: string;
  billedInvoiceNumber?: string;
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
  customerKey: job.customerKey,
  customerName: job.customerName,
  customerPhone: job.customerPhone,
  jobType: job.jobType,
  quantity: job.quantity,
  promisedReadyAt: job.promisedReadyAt,
  isOverdue: job.isOverdue,
  status: job.status,
  note: job.note,
  kind: job.kind,
  items: job.items,
  priceCents: job.priceCents,
  costCents: job.costCents,
  assignedEmployeeId: job.assignedEmployeeId,
  assignedEmployeeName: job.assignedEmployeeName,
  splitType: job.splitType,
  splitValue: job.splitValue,
  billedInvoiceKey: job.billedInvoiceKey,
  billedInvoiceNumber: job.billedInvoiceNumber,
  employeeEarningsCents: calc_earnings({
    // A job with no items has no price yet, so no commission either.
    priceCents: job.items.length === 0 ? undefined : job.priceCents,
    materialCostCents: job.costCents,
    splitType: job.splitType,
    splitValue: job.splitValue ?? 0,
  }).commissionCents,
  createdAt: job.createdAt,
});

export interface FetchPrintJobsParams {
  /** Free-text match against ticket number / customer name / phone / job type. */
  search?: string;
  /** Exact status match: received | in_repair (in production) | ready | delivered | cancelled. */
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

/** Every matching job, looping past the backend's 200-per-page cap. */
const fetchEveryPage = async (filter: { customerKey?: string }): Promise<PrintJob[]> => {
  const fetchPage = async (page: number) => {
    const response = await apiClient.get<ApiResponse<PrintJobListResponseData>>('/print-jobs', {
      params: { page, limit: 200, ...filter },
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

/**
 * Every print job — for the unfiltered `PrintJobList` default view, which must not silently
 * truncate a shop's job history once it grows past one page.
 */
export const fetchAllPrintJobs = (): Promise<PrintJob[]> => fetchEveryPage({});

/** Every print job of one customer. */
export const fetchCustomerPrintJobs = (customerKey: string): Promise<PrintJob[]> =>
  fetchEveryPage({ customerKey });

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

/** One job by its key. */
export const fetchPrintJob = async (id: string): Promise<PrintJob> => {
  const response = await apiClient.get<ApiResponse<BackendPrintJob>>(`/print-jobs/${id}`);
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
