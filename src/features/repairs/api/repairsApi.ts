import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { RepairJob, RepairJobInput } from '../types';
import {
  addEarningRecord,
  updateEarningRecordForWork,
  deleteEarningRecordsForWork,
} from '@/features/employees/api/mockEmployees';

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

export const createRepairJob = async (input: RepairJobInput): Promise<RepairJob> => {
  const response = await apiClient.post<ApiResponse<BackendRepair>>('/repairs', input);
  const newJob = toRepairJob(response.data);

  // TODO(employees-backend): commission bookkeeping still lives entirely
  // client-side against the mocked employees store — this is the seam
  // where a real `employees` backend module would take over.
  if (newJob.assignedEmployeeId && newJob.assignedEmployeeName && newJob.employeeEarningsCents) {
    const profit = Math.max(0, newJob.estimatedCostCents - (newJob.materialCostCents || 0));
    await addEarningRecord({
      employeeId: newJob.assignedEmployeeId,
      employeeName: newJob.assignedEmployeeName,
      workId: newJob.id,
      ticketOrInvoiceNumber: newJob.ticketNumber,
      workType: 'repair',
      description: `${newJob.deviceModel} - ${newJob.issueDescription}`,
      customerName: newJob.customerName,
      totalAmountCents: newJob.estimatedCostCents,
      costCents: newJob.materialCostCents,
      profitCents: profit,
      splitType: newJob.splitType || 'percentage',
      splitValue: newJob.splitValue || 0,
      earnedAmountCents: newJob.employeeEarningsCents,
      status: newJob.status === 'delivered' ? 'completed' : 'pending',
    });
  }

  return newJob;
};

export const updateRepairJob = async (
  id: string,
  input: Partial<RepairJobInput>
): Promise<RepairJob> => {
  const response = await apiClient.patch<ApiResponse<BackendRepair>>(`/repairs/${id}`, input);
  const updatedJob = toRepairJob(response.data);

  // TODO(employees-backend): same seam as `createRepairJob` above.
  if (updatedJob.assignedEmployeeId && updatedJob.assignedEmployeeName) {
    const profit = Math.max(0, updatedJob.estimatedCostCents - (updatedJob.materialCostCents || 0));
    await updateEarningRecordForWork(updatedJob.id, 'repair', {
      employeeId: updatedJob.assignedEmployeeId,
      employeeName: updatedJob.assignedEmployeeName,
      workId: updatedJob.id,
      ticketOrInvoiceNumber: updatedJob.ticketNumber,
      workType: 'repair',
      description: `${updatedJob.deviceModel} - ${updatedJob.issueDescription}`,
      customerName: updatedJob.customerName,
      totalAmountCents: updatedJob.estimatedCostCents,
      costCents: updatedJob.materialCostCents,
      profitCents: profit,
      splitType: updatedJob.splitType || 'percentage',
      splitValue: updatedJob.splitValue || 0,
      earnedAmountCents: updatedJob.employeeEarningsCents || 0,
      status: updatedJob.status === 'delivered' ? 'completed' : 'pending',
    });
  } else {
    await deleteEarningRecordsForWork([updatedJob.id], 'repair');
  }

  return updatedJob;
};

export const deleteRepairs = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => apiClient.delete(`/repairs/${id}`)));
  await deleteEarningRecordsForWork(ids, 'repair');
};
