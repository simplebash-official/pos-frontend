import { t } from '@/shared/i18n/t';
import type { PrintJobType } from '../types';

/** The shop's words for each kind of print order. */
export const printJobTypeLabel = (type: PrintJobType): string => {
  switch (type) {
    case 'mug':
      return t('Custom Mug Sublimation');
    case 't-shirt':
      return t('T-Shirt Printing');
    case 'handbill':
      return t('Handbill / Flyer Printing');
    case 'banner':
      return t('Flex Banner / Outdoor Display');
    case 'custom':
      return t('Custom Artwork & Merchandise');
  }
};
