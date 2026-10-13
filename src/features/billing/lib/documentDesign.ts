import type { DocumentKindSettings } from '@/features/settings/types';

export type PreviewDocumentKind = 'invoice' | 'receipt' | 'credit-note' | 'quotation';

// The document kind (as the Settings → Document Designs screen and the backend know it) behind
// each document the print preview can show.
const DESIGN_KIND: Record<PreviewDocumentKind, string> = {
  invoice: 'a4-invoice',
  receipt: 'thermal-receipt',
  'credit-note': 'credit-note',
  quotation: 'quotation',
};

export const designKindFor = (documentKind: PreviewDocumentKind): string =>
  DESIGN_KIND[documentKind];

/** Only worth showing a "Design" dropdown when there is more than one design to pick from. */
export const hasDesignChoice = (
  kind: DocumentKindSettings | undefined
): kind is DocumentKindSettings => kind !== undefined && kind.templates.length > 1;

/**
 * What picking `name` in the preview means: the design prints already use is not an override at
 * all, so it clears the pick instead of asking the backend for it by name.
 */
export const nextDesignPick = (kind: DocumentKindSettings, name: string): string | null =>
  name === kind.effective ? null : name;
