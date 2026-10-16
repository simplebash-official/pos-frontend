import type { LabelPrintOffer } from './printJob';

// Offers to print labels right after stock comes in. The screens that receive
// stock close as soon as they save, so they hand the offer to the one listener
// mounted in the app shell (`LabelPrintOfferHost`) instead of opening a window.

type Listener = (offer: LabelPrintOffer) => void;

let listener: Listener | null = null;

/** Offers labels for stock that just arrived. Does nothing when no host is mounted. */
export const offerLabelPrint = (offer: LabelPrintOffer): void => {
  listener?.(offer);
};

/** Registers the host; returns the function that unregisters it. */
export const listenForLabelPrintOffers = (next: Listener): (() => void) => {
  listener = next;
  return () => {
    if (listener === next) listener = null;
  };
};
