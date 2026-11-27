import type { BillBlocker } from '@/shared/lib/billBlocker';
import type { JobStatus } from '@/constants';
import type { CartItem } from '@/store/slices/cartSlice';

/** Which kind of ticket a job is. */
export type JobKind = 'repair' | 'print';

/** A repair or print job of one customer, in the one shape their screens list it in. */
export interface CustomerJob {
  kind: JobKind;
  /** The job's key. */
  id: string;
  ticketNumber: string;
  /** Repair: the device. Print job: the order. */
  title: string;
  status: JobStatus;
  statusLabel: string;
  /** Neither handed back nor cancelled. */
  isOpen: boolean;
  /** What the customer pays; absent while nothing is priced and on a free warranty rework. */
  priceCents?: number;
  isRework: boolean;
  billedInvoiceNumber?: string;
  /** Why the job cannot go on a bill; `null` when it can. */
  blocker: BillBlocker | null;
  /** The line that puts the job on a bill. */
  line: CartItem;
  createdAt: string;
}
