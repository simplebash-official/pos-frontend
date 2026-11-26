import { t } from '@/shared/i18n/t';
import type { BillBlocker } from '@/shared/lib/billBlocker';
import type { RepairJob } from '../types';

export { billBlocker, type BillBlocker } from '@/shared/lib/billBlocker';

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
