export interface DocumentConnectivityStatus {
  /** `fetchStatus === 'paused'` — the query never ran because we're offline. */
  isPaused: boolean;
  isError: boolean;
  /** The sale hasn't reached the server yet, so there's nothing to fetch. */
  isPending?: boolean;
}

/**
 * Picks the right message for a one-shot document fetch (an invoice/receipt
 * PDF) that never returns "nothing to show" the way a list does — just
 * loaded, or not-loaded-and-a-reason-why. Every list screen that used to
 * have an equivalent `getListEmptyText` helper here has since migrated onto
 * the offline sync engine, whose reads no longer touch the network at all,
 * so that helper no longer has a reason to exist.
 */
export const getDocumentUnavailableText = (status: DocumentConnectivityStatus): string => {
  if (status.isPending) {
    return 'Finishing this sale — the document will be ready in a moment.';
  }
  if (status.isPaused) {
    return "You're offline right now. This document will be ready as soon as you're back online.";
  }
  if (status.isError) {
    return "Couldn't load this document. Check your connection and try again.";
  }
  return 'Could not load the document.';
};
