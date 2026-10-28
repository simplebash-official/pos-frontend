/** Summary of units and return status for an invoice's items. */
export interface InvoiceUnitSummary {
  totalReturnedUnits: number;
  totalOriginalUnits: number;
  isFullyReturned: boolean;
  isPartiallyReturned: boolean;
}

/** Minimal item shape needed to compute unit return statuses. */
export interface InvoiceUnitItemLike {
  quantity: number;
  returnedQuantity?: number | null;
}

/**
 * Computes aggregated unit totals and return completeness states across invoice line items.
 *
 * @param items List of invoice items containing original and returned unit counts
 * @returns InvoiceUnitSummary describing original units, returned units, and return flags
 */
export const describeInvoiceUnits = (
  items: ReadonlyArray<InvoiceUnitItemLike>
): InvoiceUnitSummary => {
  let totalReturnedUnits = 0;
  let totalOriginalUnits = 0;

  for (const item of items) {
    if (typeof item.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity > 0) {
      totalOriginalUnits += item.quantity;
    }
    if (
      typeof item.returnedQuantity === 'number' &&
      Number.isFinite(item.returnedQuantity) &&
      item.returnedQuantity > 0
    ) {
      totalReturnedUnits += item.returnedQuantity;
    }
  }

  const isFullyReturned = totalOriginalUnits > 0 && totalReturnedUnits >= totalOriginalUnits;
  const isPartiallyReturned = totalReturnedUnits > 0 && !isFullyReturned;

  return {
    totalReturnedUnits,
    totalOriginalUnits,
    isFullyReturned,
    isPartiallyReturned,
  };
};

/**
 * Calculates how many units of an invoice item have been returned.
 * Strictly guarantees a non-negative integer without NaN or negative values.
 */
export const calcItemReturnedUnits = (item: InvoiceUnitItemLike): number => {
  if (
    typeof item.returnedQuantity === 'number' &&
    Number.isFinite(item.returnedQuantity) &&
    item.returnedQuantity > 0
  ) {
    return item.returnedQuantity;
  }
  return 0;
};

/**
 * Calculates remaining (unreturned) units for an invoice item available for credit notes or returns.
 * Strictly guarantees non-negative integer without implicit fallback operators.
 */
export const calcItemRemainingUnits = (item: InvoiceUnitItemLike): number => {
  const quantity =
    typeof item.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity > 0
      ? item.quantity
      : 0;
  const returned = calcItemReturnedUnits(item);
  return Math.max(0, quantity - returned);
};

/**
 * Checks whether an individual invoice item is fully returned.
 */
export const isItemFullyReturned = (item: InvoiceUnitItemLike): boolean => {
  const quantity =
    typeof item.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity > 0
      ? item.quantity
      : 0;
  return quantity > 0 && calcItemReturnedUnits(item) >= quantity;
};

/** Minimal credit note shape for counting returned items. */
export interface CreditNoteRollupInput {
  items: ReadonlyArray<unknown>;
}

/**
 * Sums the total count of returned line items across credit notes.
 */
export const sumCreditNoteItemsCount = (
  creditNotes: ReadonlyArray<CreditNoteRollupInput>
): number => {
  let count = 0;
  for (const cn of creditNotes) {
    if (Array.isArray(cn.items)) {
      count += cn.items.length;
    }
  }
  return count;
};
