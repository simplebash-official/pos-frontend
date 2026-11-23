import { t } from '@/shared/i18n/t';
import type { RepairJob } from '../types';

/** Why a repair cannot be put on a bill; the same rules the server enforces when the sale is saved. */
export type BillBlocker =
  'warranty_rework' | 'already_billed' | 'already_handed_back' | 'cancelled' | 'no_work';

/** What decides whether a job can be billed; a saved job, or a job as it is typed in the form. */
export type BillableJob = Pick<RepairJob, 'kind' | 'status' | 'billedInvoiceNumber'> & {
  items: readonly unknown[];
};

/** `null` means the job can be billed. */
export const billBlocker = (job: BillableJob): BillBlocker | null => {
  if (job.kind.kind === 'warranty_rework') return 'warranty_rework';
  if (job.billedInvoiceNumber !== undefined) return 'already_billed';
  if (job.status === 'delivered') return 'already_handed_back';
  if (job.status === 'cancelled') return 'cancelled';
  if (job.items.length === 0) return 'no_work';
  return null;
};

/** What to tell the person when a job cannot be billed. */
export const billBlockerNotice = (
  blocker: BillBlocker,
  job: Pick<RepairJob, 'ticketNumber' | 'billedInvoiceNumber'>
): { title: string; message: string } => {
  const ticketNumber = job.ticketNumber;
  switch (blocker) {
    case 'warranty_rework':
      return {
        title: t('Warranty rework'),
        message: `${ticketNumber}: ${t('free under warranty. Hand it back from the repair screen.')}`,
      };
    case 'already_billed':
      return {
        title: t('Already billed'),
        message: `${ticketNumber}: ${t('this repair was already billed on')} ${job.billedInvoiceNumber}.`,
      };
    case 'already_handed_back':
      return {
        title: t('Already handed back'),
        message: `${ticketNumber}: ${t('this repair was already handed back.')}`,
      };
    case 'cancelled':
      return {
        title: t('Repair cancelled'),
        message: `${ticketNumber}: ${t('a cancelled repair cannot be billed.')}`,
      };
    case 'no_work':
      return {
        title: t('No work added yet'),
        message: `${ticketNumber}: ${t('add the work done before billing it.')}`,
      };
  }
};
