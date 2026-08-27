export interface DocumentConnectivityStatus {
  /** `fetchStatus === 'paused'` — the query never ran because we're offline. */
  isPaused: boolean;
  isError: boolean;
}

/**
 * Picks the right message for a one-shot document fetch (an invoice/receipt
 * PDF) that never returns "nothing to show" the way a list does — just
 * loaded, or not-loaded-and-a-reason-why.
 */
export const getDocumentUnavailableText = (status: DocumentConnectivityStatus): string => {
  if (status.isPaused) {
    return "You're offline right now. This document will be ready as soon as you're back online.";
  }
  if (status.isError) {
    return "Couldn't load this document. Check your connection and try again.";
  }
  return 'Could not load the document.';
};
