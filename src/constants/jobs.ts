export const JOB_STATUS = {
  RECEIVED: 'received',
  DIAGNOSING: 'diagnosing',
  IN_REPAIR: 'in_repair',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JOB_STATUS.RECEIVED]: 'Received',
  [JOB_STATUS.DIAGNOSING]: 'Diagnosing',
  [JOB_STATUS.IN_REPAIR]: 'In Repair',
  [JOB_STATUS.READY]: 'Ready for Pickup',
  [JOB_STATUS.DELIVERED]: 'Delivered',
  [JOB_STATUS.CANCELLED]: 'Cancelled',
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  [JOB_STATUS.RECEIVED]: 'blue',
  [JOB_STATUS.DIAGNOSING]: 'yellow',
  [JOB_STATUS.IN_REPAIR]: 'orange',
  [JOB_STATUS.READY]: 'teal',
  [JOB_STATUS.DELIVERED]: 'green',
  [JOB_STATUS.CANCELLED]: 'gray',
};

/**
 * The steps of a print job: no diagnosing. "In production" is stored as `in_repair`, the value
 * the backend validates and the dashboard counts, so it is the repair value under a print name.
 */
export const PRINT_JOB_STATUS = {
  RECEIVED: JOB_STATUS.RECEIVED,
  IN_PRODUCTION: JOB_STATUS.IN_REPAIR,
  READY: JOB_STATUS.READY,
  DELIVERED: JOB_STATUS.DELIVERED,
  CANCELLED: JOB_STATUS.CANCELLED,
} as const;

export type PrintJobStatus = (typeof PRINT_JOB_STATUS)[keyof typeof PRINT_JOB_STATUS];

/** A print job's status in words. Colours come from `JOB_STATUS_COLORS`: they are the same. */
export const PRINT_JOB_STATUS_LABELS: Record<PrintJobStatus, string> = {
  [PRINT_JOB_STATUS.RECEIVED]: 'Received',
  [PRINT_JOB_STATUS.IN_PRODUCTION]: 'In Production',
  [PRINT_JOB_STATUS.READY]: 'Ready for Pickup',
  [PRINT_JOB_STATUS.DELIVERED]: 'Delivered',
  [PRINT_JOB_STATUS.CANCELLED]: 'Cancelled',
};
