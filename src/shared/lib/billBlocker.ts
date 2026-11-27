/** Why a repair or print job cannot be put on a bill; the same rules the server enforces. */
export type BillBlocker =
  'warranty_rework' | 'already_billed' | 'already_handed_back' | 'cancelled' | 'no_work';

/** What decides whether a job can be billed; a saved job, or a job as it is typed in the form. */
export interface BillableTicket {
  kind: { kind: 'standard' | 'warranty_rework' };
  status: string;
  billedInvoiceNumber?: string;
  items: readonly unknown[];
}

/** `null` means the job can be billed. */
export const billBlocker = (job: BillableTicket): BillBlocker | null => {
  if (job.kind.kind === 'warranty_rework') return 'warranty_rework';
  if (job.billedInvoiceNumber !== undefined) return 'already_billed';
  if (job.status === 'delivered') return 'already_handed_back';
  if (job.status === 'cancelled') return 'cancelled';
  if (job.items.length === 0) return 'no_work';
  return null;
};
