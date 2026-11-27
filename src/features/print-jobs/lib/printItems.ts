import { useMemo } from 'react';
import { PRINT_JOB_STATUS, type PrintJobStatus } from '@/constants';
import { profileProblem, type ProductWarranty } from '@/features/warranties';
import { costBoxValue, typedCostCents } from '@/shared/components/ticket-items/costToShop';
import { typedDiscount } from '@/shared/components/ticket-items/itemDiscount';
import { cleanWarranty, NO_COVER } from '@/shared/components/ticket-items/warranty';
import { t } from '@/shared/i18n/t';
import { randomUuid } from '@/shared/lib/id';
import { fromCents, toCents } from '@/shared/lib/money';
import { calc_print_job, type ItemDiscount, type PrintJobPreview } from '@/wasm';
import type { PrintJobItem, PrintJobItemInput, PrintJobKind } from '../types';

/** The server's limits, so the form can say them before a save. */
export const MAX_PRINT_ITEMS = 50;
export const MAX_LINE_QUANTITY = 1_000_000;

interface DraftBase {
  uid: string;
  /** The key of a line already saved on the job. */
  key?: string;
  description: string;
  /** As typed; empty while the box is being retyped. */
  quantity: number | '';
  /** The discount typed on this line; `null` for none. */
  discount: ItemDiscount | null;
  warranty: ProductWarranty;
}

/** Work the shop charges for, priced per unit in rupees as typed. */
export interface ServiceDraft extends DraftBase {
  kind: 'service';
  unitPriceRupees: number | string;
  /** What one costs the shop, as typed; empty when none is recorded. */
  unitCostRupees: number | string;
}

/** A part bought in for this job, with what one is charged and what one costs. */
export interface OutsideDraft extends DraftBase {
  kind: 'outside';
  unitPriceRupees: number | string;
  unitCostRupees: number | string;
}

/** Units taken from stock. The server prices and costs them when the job is saved. */
export interface StockDraft extends DraftBase {
  kind: 'stock';
  productKey: string;
  /** The exact unit, for a product with serial numbers. */
  serialNumber?: string;
  /** The price tier the units come from, for a product without serial numbers. */
  sellingPriceCents?: number;
  /** What one is charged, to show it. */
  unitPriceCents: number;
  /** What the saved line cost, which stands only while its quantity and price are unchanged. */
  saved?: { quantity: number; sellingPriceCents?: number; costCents: number };
}

export type PrintDraft = ServiceDraft | OutsideDraft | StockDraft;

const rupees = (value: number | string): number => (value === '' ? 0 : toCents(Number(value)));

export const isRework = (kind: PrintJobKind): boolean => kind.kind === 'warranty_rework';

/** The typed quantity as a whole number in range, or `null` while it is not one. */
export const lineQuantity = (quantity: number | ''): number | null =>
  quantity !== '' && Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_LINE_QUANTITY
    ? quantity
    : null;

/** A new service line, from typed text or one of the shop's ready-made services. */
export const serviceDraft = (
  description: string,
  unitPriceCents: number | null,
  unitCostCents: number | undefined,
  warranty: ProductWarranty,
  rework: boolean
): ServiceDraft => ({
  uid: randomUuid(),
  kind: 'service',
  description,
  quantity: 1,
  unitPriceRupees:
    rework || unitPriceCents === null || unitPriceCents === 0 ? '' : fromCents(unitPriceCents),
  // A rework charges nothing, but the work still costs the shop.
  unitCostRupees: costBoxValue(unitCostCents),
  discount: null,
  warranty: rework ? NO_COVER : warranty,
});

/** A new line for something bought in. */
export const outsideDraft = (name: string): OutsideDraft => ({
  uid: randomUuid(),
  kind: 'outside',
  description: name,
  quantity: 1,
  unitPriceRupees: '',
  unitCostRupees: '',
  discount: null,
  warranty: NO_COVER,
});

/** A saved line as an editable row; one saved line is one row. */
export const draftFromSaved = (item: PrintJobItem): PrintDraft => {
  const base = {
    uid: randomUuid(),
    key: item.key,
    description: item.description,
    quantity: item.quantity,
    discount: item.discount === undefined ? null : typedDiscount(item.discount),
    warranty: item.warranty,
  };
  switch (item.source.type) {
    case 'service':
      return {
        ...base,
        kind: 'service',
        unitPriceRupees: fromCents(item.unitPriceCents),
        unitCostRupees: costBoxValue(item.source.unitCostCents),
      };
    case 'outside':
      return {
        ...base,
        kind: 'outside',
        unitPriceRupees: fromCents(item.unitPriceCents),
        unitCostRupees: fromCents(item.source.unitCostCents),
      };
    case 'stock':
      return {
        ...base,
        kind: 'stock',
        productKey: item.source.productKey,
        serialNumber: item.source.serialNumber,
        sellingPriceCents: item.source.sellingPriceCents,
        unitPriceCents: item.unitPriceCents,
        saved: {
          quantity: item.quantity,
          sellingPriceCents: item.source.sellingPriceCents,
          costCents: item.costCents,
        },
      };
  }
};

export const draftsFromSaved = (items: PrintJobItem[]): PrintDraft[] => items.map(draftFromSaved);

/** What the customer pays for one unit of a row; a rework charges nothing. */
export const draftUnitPriceCents = (draft: PrintDraft, rework: boolean): number => {
  if (rework) return 0;
  return draft.kind === 'stock' ? draft.unitPriceCents : rupees(draft.unitPriceRupees);
};

/** The saved cost of a stock row, while it still describes the row. */
const savedCostCents = (draft: StockDraft): number | null =>
  draft.saved !== undefined &&
  draft.saved.quantity === lineQuantity(draft.quantity) &&
  draft.saved.sellingPriceCents === draft.sellingPriceCents
    ? draft.saved.costCents
    : null;

/** The rows as the server wants them. Call it only once `itemsProblem` is `null`. */
export const toItemInputs = (drafts: PrintDraft[], rework: boolean): PrintJobItemInput[] =>
  drafts.map((draft) => {
    const quantity = lineQuantity(draft.quantity);
    if (quantity === null) throw new Error(`Line "${draft.description}" has no quantity`);
    const shared = {
      key: draft.key,
      description: draft.description.trim(),
      quantity,
      discount: rework || draft.discount === null ? undefined : draft.discount,
      warranty: rework ? NO_COVER : cleanWarranty(draft.warranty),
    };
    switch (draft.kind) {
      case 'service':
        return {
          ...shared,
          source: {
            type: 'service',
            unitPriceCents: draftUnitPriceCents(draft, rework),
            unitCostCents: typedCostCents(draft.unitCostRupees),
          },
        };
      case 'outside':
        return {
          ...shared,
          source: {
            type: 'outside',
            name: draft.description.trim(),
            unitPriceCents: draftUnitPriceCents(draft, rework),
            unitCostCents: rupees(draft.unitCostRupees),
          },
        };
      case 'stock':
        return {
          ...shared,
          source: {
            type: 'stock',
            productKey: draft.productKey,
            serialNumber: draft.serialNumber,
            sellingPriceCents: draft.sellingPriceCents,
          },
        };
    }
  });

/** Which box of a row a problem is about, so the box can be marked. */
export type RowProblemField = 'description' | 'quantity' | 'price' | 'cost' | 'warranty';

export interface RowProblem {
  field: RowProblemField;
  message: string;
}

const negative = (value: number | string): boolean => value !== '' && Number(value) < 0;

/** What stops one row being saved, in plain words (`null` when nothing). */
export const rowProblem = (draft: PrintDraft, rework: boolean): RowProblem | null => {
  if (draft.description.trim() === '') {
    return { field: 'description', message: t('Say what this line is.') };
  }
  if (lineQuantity(draft.quantity) === null) {
    return { field: 'quantity', message: t('Enter a quantity of 1 or more.') };
  }
  if (draft.kind !== 'stock') {
    if (negative(draft.unitPriceRupees)) {
      return { field: 'price', message: t('A price cannot be below zero.') };
    }
    if (draft.kind === 'service') {
      if (!rework && (draft.unitPriceRupees === '' || Number(draft.unitPriceRupees) <= 0)) {
        return { field: 'price', message: t('Enter the fee for one.') };
      }
      if (negative(draft.unitCostRupees)) {
        return { field: 'cost', message: t('A cost cannot be below zero.') };
      }
    } else {
      if (!rework && draft.unitPriceRupees === '') {
        return { field: 'price', message: t('Enter what the customer pays for one, or 0.') };
      }
      if (draft.unitCostRupees === '' || negative(draft.unitCostRupees)) {
        return { field: 'cost', message: t('Enter what one costs the shop.') };
      }
    }
  }
  if (!rework) {
    const message = profileProblem(draft.warranty);
    if (message !== null) return { field: 'warranty', message };
  }
  return null;
};

export interface LivePrintTotals extends PrintJobPreview {
  /** False while the profit cannot be shown (a newly chosen stock part has no cost yet). */
  costKnown: boolean;
}

/** The job's totals for what is typed so far, from the shared calculation (WASM). */
export const printTotals = (drafts: PrintDraft[], rework: boolean): LivePrintTotals =>
  calc_print_job({
    items: drafts.map((draft) => {
      const quantity = lineQuantity(draft.quantity);
      const typedPrice = draft.kind !== 'stock' && draft.unitPriceRupees === '' && !rework;
      let cost: { basis: 'per_unit' | 'line'; cents: number } | undefined;
      if (draft.kind !== 'stock' && draft.unitCostRupees !== '') {
        cost = { basis: 'per_unit', cents: rupees(draft.unitCostRupees) };
      }
      if (draft.kind === 'stock') {
        const cents = savedCostCents(draft);
        if (cents !== null) cost = { basis: 'line', cents };
      }
      return {
        kind: draft.kind === 'service' ? 'service' : 'part',
        quantity: quantity === null ? undefined : quantity,
        unitPriceCents: typedPrice ? undefined : draftUnitPriceCents(draft, rework),
        cost,
        discount: draft.discount === null ? undefined : draft.discount,
      };
    }),
  });

/** `printTotals`, recomputed only when the rows change. A refused amount gives `null`. */
export const usePrintTotals = (drafts: PrintDraft[], rework: boolean): LivePrintTotals | null =>
  useMemo(() => {
    try {
      return printTotals(drafts, rework);
    } catch {
      return null;
    }
  }, [drafts, rework]);

/** What stops one row's discount, in plain words (`null` when nothing). */
export const rowDiscountProblem = (index: number, totals: LivePrintTotals): string | null =>
  totals.blockers.some((blocker) => blocker.itemIndex === index)
    ? t('The discount is more than this line costs.')
    : null;

const STATUSES_NEEDING_ITEMS: PrintJobStatus[] = [
  PRINT_JOB_STATUS.READY,
  PRINT_JOB_STATUS.DELIVERED,
];

/**
 * The first problem with the whole list, or `null`. A rework may be handed back with none.
 * `totals` is the live answer for these rows (`null` while an amount is refused).
 */
export const itemsProblem = (
  drafts: PrintDraft[],
  kind: PrintJobKind,
  status: PrintJobStatus,
  totals: LivePrintTotals | null
): string | null => {
  const rework = isRework(kind);
  if (drafts.length === 0 && !rework && STATUSES_NEEDING_ITEMS.includes(status)) {
    return t('Add the items before marking this job ready or delivered.');
  }
  if (drafts.length > MAX_PRINT_ITEMS) {
    return t('A print job can have at most 50 items.');
  }
  for (const draft of drafts) {
    const problem = rowProblem(draft, rework);
    if (problem !== null) return problem.message;
  }
  if (totals === null) return t('One of the amounts is too large.');
  if (totals.blockers.length > 0) return t('The discount is more than this line costs.');
  return null;
};
