export const CURRENCY = {
  symbol: 'Rs.',
  code: 'LKR',
  decimals: 2,
};

export const TAX_RATE = 0.08; // 8% default tax rate

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

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  SPLIT: 'split',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const DEFAULT_PAGINATION = {
  pageIndex: 0,
  pageSize: 10,
};
