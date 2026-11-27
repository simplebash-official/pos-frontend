import type { BillBlocker } from '@/shared/lib/billBlocker';
import { t } from '@/shared/i18n/t';
import type { PrintJob } from '../types';

/** What to tell the person when a print job cannot be billed. */
export const printBillBlockerNotice = (
  blocker: BillBlocker,
  job: Pick<PrintJob, 'ticketNumber' | 'billedInvoiceNumber'>
): { title: string; message: string } => {
  const ticketNumber = job.ticketNumber;
  switch (blocker) {
    case 'warranty_rework':
      return {
        title: t('Warranty rework'),
        message: `${ticketNumber}: ${t('free under warranty. Hand it back from the print job screen.')}`,
      };
    case 'already_billed':
      return {
        title: t('Already billed'),
        message: `${ticketNumber}: ${t('this print job was already billed on')} ${job.billedInvoiceNumber}.`,
      };
    case 'already_handed_back':
      return {
        title: t('Already handed back'),
        message: `${ticketNumber}: ${t('this print job was already handed back.')}`,
      };
    case 'cancelled':
      return {
        title: t('Print job cancelled'),
        message: `${ticketNumber}: ${t('a cancelled print job cannot be billed.')}`,
      };
    case 'no_work':
      return {
        title: t('No items added yet'),
        message: `${ticketNumber}: ${t('add the items before billing it.')}`,
      };
  }
};
