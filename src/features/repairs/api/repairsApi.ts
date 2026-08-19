import { apiClient, type MutationRequestOptions } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { RepairJob, RepairJobInput } from '../types';

export const calculateRepairEarnings = (input: {
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

// Shape returned by the backend's `Repair` domain type — no
// `employeeEarningsCents` (that's a client-side-only computed value, see
// `calculateRepairEarnings`; no `employees` backend module exists yet, so
// no commission math happens server-side — TODO(employees-backend)).
interface BackendRepair {
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
  estimatedCostCents: number;
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
const toRepairJob = (repair: BackendRepair): RepairJob => ({
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

// `limit: 200` (the backend's max) rather than paginating — the mock this
// replaces always returned every ticket, and no repairs list screen has
// pagination UI today.
export const fetchRepairs = async (): Promise<RepairJob[]> => {
  const response = await apiClient.get<ApiResponse<RepairListResponseData>>('/repairs', {
    params: { limit: 200 },
  });
  return response.data.repairs.map(toRepairJob);
};

// REST-only — no `mockEmployees` commission side effect here. Per the
// offline-sync rule that only `src/offline/resources/` may import a synced
// resource's `api/` module, `repairs.resource.ts` is the only caller of
// these three; it runs the commission bookkeeping itself, inside `push`,
// after the server call below succeeds.
export const createRepairJobRaw = async (
  input: RepairJobInput,
  options?: MutationRequestOptions
): Promise<RepairJob> => {
  const response = await apiClient.post<ApiResponse<BackendRepair>>('/repairs', input, options);
  return toRepairJob(response.data);
};

export const updateRepairJobRaw = async (
  id: string,
  input: Partial<RepairJobInput>,
  options?: MutationRequestOptions
): Promise<RepairJob> => {
  const response = await apiClient.patch<ApiResponse<BackendRepair>>(
    `/repairs/${id}`,
    input,
    options
  );
  return toRepairJob(response.data);
};

/**
 * There is no `/repairs/batch` route, so a bulk delete is N separate
 * requests. The idempotency store's uniqueness is `(key, user_id)` only —
 * not scoped per request — so every request here MUST get its own derived
 * key; reusing `options.idempotencyKey` verbatim across all N calls would
 * make requests 2..N replay request 1's cached response instead of
 * actually deleting anything.
 */
export const deleteRepairsRaw = async (
  ids: string[],
  options?: MutationRequestOptions
): Promise<void> => {
  await Promise.all(
    ids.map((id) =>
      apiClient.delete(`/repairs/${id}`, {
        ...options,
        idempotencyKey: options?.idempotencyKey ? `${options.idempotencyKey}:${id}` : undefined,
      })
    )
  );
};
