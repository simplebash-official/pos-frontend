import { t } from '@/shared/i18n/t';
import type { ReceivedInto } from '../types';

/** Plain words for where the money went. */
export const receivedIntoLabel = (receivedInto: ReceivedInto): string => {
  switch (receivedInto) {
    case 'drawer':
      return t('Cash drawer');
    case 'bank':
      return t('Bank');
    case 'card':
      return t('Card');
    case 'online':
      return t('Online');
  }
};
