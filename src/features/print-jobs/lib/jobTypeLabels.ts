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
    case 'photo-framing':
      return t('Photo & Framing');
    case 'custom':
      return t('Custom Artwork & Merchandise');
  }
};

/** The short name in the job list and on the bill. */
export const printJobTypeName = (type: PrintJobType): string =>
  type === 'photo-framing' ? 'Photo & Framing' : `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
