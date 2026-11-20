import type { SplitType } from '@/features/employees/types';

/**
 * Shared shape for the `customer{}` object nested in repair/print-job create & update
 * requests: the registered customer the ticket is for. The server reads the name and phone
 * from that customer's record.
 */
export interface CustomerRef {
  customerKey: string;
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
