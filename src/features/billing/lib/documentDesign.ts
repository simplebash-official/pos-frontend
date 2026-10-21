import type { DocumentDesignFamily, DocumentKindSettings } from '@/features/settings/types';
import type { DocumentDesign, DocumentDesignStatus } from '../api/documentsApi';

export type PreviewDocumentKind = 'invoice' | 'receipt' | 'credit-note' | 'quotation' | 'z-report';

// The document kind (as the Settings → Document Designs screen and the backend know it) behind
// each document the print preview can show.
const DESIGN_KIND: Record<PreviewDocumentKind, string> = {
  invoice: 'a4-invoice',
  receipt: 'thermal-receipt',
  'credit-note': 'credit-note',
  quotation: 'quotation',
  'z-report': 'z-report',
};

export const designKindFor = (documentKind: PreviewDocumentKind): string =>
  DESIGN_KIND[documentKind];

/**
 * Only worth showing a "Design" dropdown when there is more than one design to pick from — or when
 * the shop's own choice is gone and the dropdown is the way to print at all.
 */
export const hasDesignChoice = (
  kind: DocumentKindSettings | undefined
): kind is DocumentKindSettings =>
  kind !== undefined && (kind.families.length > 1 || kind.effective === null);

/**
 * What picking `family` in the preview means: the design prints already use is not an override at
 * all, so it clears the pick instead of asking the backend for it by id.
 */
export const nextDesignPick = (kind: DocumentKindSettings, family: string): string | null =>
  family === kind.effective ? null : family;

/**
 * The design to fetch, or `null` while the screen must first ask the user. A document that was
 * printed with another design than would print now needs the user's answer; anything else is just
 * printed with the current design. If the status could not be read, the document request itself
 * reports why (it resolves the same design), so it goes ahead with `current`.
 */
export const designToFetch = (
  choice: DocumentDesign | null,
  status: { data?: DocumentDesignStatus; isError: boolean }
): DocumentDesign | null => {
  if (choice !== null) return choice;
  if (status.isError) return 'current';
  if (!status.data) return null;
  return status.data.differs ? null : 'current';
};

/** Whether the user must be asked "original or current?" before anything is shown. */
export const needsDesignChoice = (
  choice: DocumentDesign | null,
  status: { data?: DocumentDesignStatus }
): boolean => choice === null && status.data?.differs === true;

/** The backend refused because the design to use is not available. */
export const isDesignUnavailable = (errorCode: string | null): boolean =>
  errorCode === 'TEMPLATE_UNAVAILABLE' || errorCode === 'TEMPLATE_OPTIONS_INVALID';

/** A design's version as shown next to its name ("v2"). */
export const versionLabel = (design: Pick<DocumentDesignFamily, 'version'>): string =>
  `v${design.version}`;
