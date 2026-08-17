import { apiClient } from '@/api/client';
import { ApiResponse } from '@/shared/types/common';
import { PrintJob, PrintJobInput, PrintJobType } from '../types';
import {
  addEarningRecord,
  updateEarningRecordForWork,
  deleteEarningRecordsForWork,
} from '@/features/employees/api/mockEmployees';

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

export const fetchPrintJobs = async (): Promise<PrintJob[]> => {
  const response = await apiClient.get<ApiResponse<PrintJobListResponseData>>('/print-jobs', {
    params: { limit: 200 },
  });
  return response.data.printJobs.map(toPrintJob);
};

export const createPrintJob = async (input: PrintJobInput): Promise<PrintJob> => {
  const response = await apiClient.post<ApiResponse<BackendPrintJob>>('/print-jobs', input);
  const newJob = toPrintJob(response.data);

  // TODO(employees-backend): see `repairsApi.ts::createRepairJob`'s comment.
  if (newJob.assignedEmployeeId && newJob.assignedEmployeeName && newJob.employeeEarningsCents) {
    const profit = Math.max(0, newJob.estimatedCostCents - (newJob.materialCostCents || 0));
    await addEarningRecord({
      employeeId: newJob.assignedEmployeeId,
      employeeName: newJob.assignedEmployeeName,
      workId: newJob.id,
      ticketOrInvoiceNumber: newJob.ticketNumber,
      workType: 'print',
      description: `${newJob.jobType.toUpperCase()} Printing (${newJob.quantity} units)`,
      customerName: newJob.customerName,
      totalAmountCents: newJob.estimatedCostCents,
      costCents: newJob.materialCostCents,
      profitCents: profit,
      splitType: newJob.splitType || 'fixed',
      splitValue: newJob.splitValue || 0,
      earnedAmountCents: newJob.employeeEarningsCents,
      status: newJob.status === 'delivered' ? 'completed' : 'pending',
    });
  }

  return newJob;
};

export const updatePrintJob = async (
  id: string,
  input: Partial<PrintJobInput>
): Promise<PrintJob> => {
  const response = await apiClient.patch<ApiResponse<BackendPrintJob>>(`/print-jobs/${id}`, input);
  const updatedJob = toPrintJob(response.data);

  // TODO(employees-backend): see `repairsApi.ts::updateRepairJob`'s comment.
  if (updatedJob.assignedEmployeeId && updatedJob.assignedEmployeeName) {
    const profit = Math.max(0, updatedJob.estimatedCostCents - (updatedJob.materialCostCents || 0));
    await updateEarningRecordForWork(updatedJob.id, 'print', {
      employeeId: updatedJob.assignedEmployeeId,
      employeeName: updatedJob.assignedEmployeeName,
      workId: updatedJob.id,
      ticketOrInvoiceNumber: updatedJob.ticketNumber,
      workType: 'print',
      description: `${updatedJob.jobType.toUpperCase()} Printing (${updatedJob.quantity} units)`,
      customerName: updatedJob.customerName,
      totalAmountCents: updatedJob.estimatedCostCents,
      costCents: updatedJob.materialCostCents,
      profitCents: profit,
      splitType: updatedJob.splitType || 'fixed',
      splitValue: updatedJob.splitValue || 0,
      earnedAmountCents: updatedJob.employeeEarningsCents || 0,
      status: updatedJob.status === 'delivered' ? 'completed' : 'pending',
    });
  } else {
    await deleteEarningRecordsForWork([updatedJob.id], 'print');
  }

  return updatedJob;
};

export const deletePrintJobs = async (ids: string[]): Promise<void> => {
  await Promise.all(ids.map((id) => apiClient.delete(`/print-jobs/${id}`)));
  await deleteEarningRecordsForWork(ids, 'print');
};
