import type { SplitType } from '@/features/employees/types';

/**
 * Shared shape for the `customer{}` object nested in repair/print-job
 * create & update requests — see the repairs/print-jobs API migration notes.
 */
export interface CustomerRef {
  customerKey?: string;
  customerName?: string;
  customerPhone?: string;
}

/**
 * Shared shape for the `assignment{}` object nested in repair/print-job
 * create & update requests.
 */
export interface AssignmentInfo {
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  splitType?: SplitType;
  splitValue?: number;
}
