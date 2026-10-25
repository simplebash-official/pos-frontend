// How a bill's state is worded and coloured for people. Pure, so it can be tested apart from React.

import { t } from '@/shared/i18n/t';
import type { ReceiptStatus } from '../types';

export interface ReceiptStatusLook {
  /** Mantine colour of the dot. */
  color: 'red' | 'orange' | 'green';
  label: string;
}

/** A coloured dot and a word, as the drawers show a status (never a badge). */
export const receiptStatusLook = (status: ReceiptStatus): ReceiptStatusLook => {
  switch (status) {
    case 'unpaid':
      return { color: 'red', label: t('Not paid') };
    case 'partly_paid':
      return { color: 'orange', label: t('Part paid') };
    case 'paid':
      return { color: 'green', label: t('Paid') };
  }
};
