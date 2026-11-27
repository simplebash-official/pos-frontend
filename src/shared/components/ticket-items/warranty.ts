import type { ProductWarranty } from '@/features/warranties';

/** A job line with no cover. */
export const NO_COVER: ProductWarranty = { coverage: { kind: 'none' } };

/** The warranty as it is saved: no type or terms without cover, terms trimmed. */
export const cleanWarranty = (warranty: ProductWarranty): ProductWarranty =>
  warranty.coverage.kind === 'none'
    ? { coverage: warranty.coverage }
    : { ...warranty, terms: warranty.terms?.trim() };
