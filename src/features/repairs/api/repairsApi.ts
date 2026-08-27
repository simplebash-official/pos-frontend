import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { RepairJob, RepairJobInput } from '../types';

export const calculateRepairEarnings = (input: {
  estimatedCostCents?: number;
  materialCostCents?: number;
  splitType?: 'percentage' | 'fixed';
  splitValue?: number;
}): number => {
  if (!input.splitType || !input.splitValue || input.estimatedCostCents === undefined) return 0;
  const revenue = input.estimatedCostCents;
  const cost = input.materialCostCents || 0;
  const profit = Math.max(0, revenue - cost);

  if (input.splitType === 'percentage') {
    return Math.round((profit * input.splitValue) / 100);
  } else {
    return Math.min(profit, input.splitValue);
  }
};

// Shape returned by the backend's `Repair` domain type — no
// `employeeEarningsCents` (that's a client-side-only computed value, see
// `calculateRepairEarnings`; no `employees` backend module exists yet, so
// no commission math happens server-side — TODO(employees-backend)).
export interface BackendRepair {
  id: string;
  key: string;
  ticketNumber: string;
  customerKey?: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  serialNumber?: string;
  issueDescription: string;
  status: RepairJob['status'];
  estimatedCostCents?: number;
  materialCostCents?: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: 'percentage' | 'fixed';
  splitValue?: number;
  createdAt: string;
}

interface RepairListResponseData {
  repairs: BackendRepair[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// `id` is set to the backend's prefixed `key` (e.g. `rep_...`), not the
// Mongo ObjectId hex — the backend's GET/PATCH/DELETE routes accept either
// interchangeably, and every other module (billing's `sourceTicketKey`)
// needs the key, not the ObjectId, so standardizing on it here means every
// existing call site that already does `repair.id` keeps working.
export const toRepairJob = (repair: BackendRepair): RepairJob => ({
  id: repair.key,
  ticketNumber: repair.ticketNumber,
  customerName: repair.customerName,
  customerPhone: repair.customerPhone,
  deviceModel: repair.deviceModel,
  serialNumber: repair.serialNumber,
  issueDescription: repair.issueDescription,
  status: repair.status,
  estimatedCostCents: repair.estimatedCostCents,
  materialCostCents: repair.materialCostCents,
  assignedEmployeeId: repair.assignedEmployeeId,
  assignedEmployeeName: repair.assignedEmployeeName,
  splitType: repair.splitType,
  splitValue: repair.splitValue,
  employeeEarningsCents: calculateRepairEarnings({
    estimatedCostCents: repair.estimatedCostCents,
    materialCostCents: repair.materialCostCents,
    splitType: repair.splitType,
    splitValue: repair.splitValue,
  }),
  createdAt: repair.createdAt,
});

export interface FetchRepairsParams {
  /** Free-text match against ticket number / customer name / phone / device model. */
  search?: string;
  /** Exact status match: received | diagnosing | in_repair | ready | delivered | cancelled. */
  status?: string;
  /** Only `"today"` is meaningful; omit for all time. */
  datePreset?: 'today';
}

// One page (backend's 200 max), used for a filtered/searched request —
// called by `useBackendFilteredList` (`RepairJobList.tsx`) with `search`/
// `status`/`datePreset`, where the top-200 matches are what's wanted, not
// every ticket.
export const fetchRepairs = async (params?: FetchRepairsParams): Promise<RepairJob[]> => {
  const response = await apiClient.get<ApiResponse<RepairListResponseData>>('/repairs', {
    params: {
      limit: 200,
      search: params?.search,
      status: params?.status,
      datePreset: params?.datePreset,
    },
  });
  return response.data.repairs.map(toRepairJob);
};

/**
 * Every repair ticket, looping past the backend's 200-per-page cap — for the
 * unfiltered `RepairJobList` default view, which must not silently truncate
 * a shop's ticket history once it grows past one page.
 */
export const fetchAllRepairs = async (): Promise<RepairJob[]> => {
  const fetchPage = async (page: number) => {
    const response = await apiClient.get<ApiResponse<RepairListResponseData>>('/repairs', {
      params: { page, limit: 200 },
    });
    return response.data;
  };

  const firstPage = await fetchPage(1);
  const repairs = [...firstPage.repairs];
  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const next = await fetchPage(page);
    repairs.push(...next.repairs);
  }
  return repairs.map(toRepairJob);
};

export const createRepairJobRaw = async (input: RepairJobInput): Promise<RepairJob> => {
  const response = await apiClient.post<ApiResponse<BackendRepair>>('/repairs', input);
  return toRepairJob(response.data);
};

export const updateRepairJobRaw = async (
  id: string,
  input: Partial<RepairJobInput>
): Promise<RepairJob> => {
  const response = await apiClient.patch<ApiResponse<BackendRepair>>(`/repairs/${id}`, input);
  return toRepairJob(response.data);
};

/**
 * There is no `/repairs/batch` route, so a bulk delete is N separate
 * requests — each gets its own auto-generated `Idempotency-Key` from
 * `apiClient`'s request interceptor, so a retry of one never replays another.
 */
export const deleteRepairsRaw = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => apiClient.delete(`/repairs/${id}`)));
};
