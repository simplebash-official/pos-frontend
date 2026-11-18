import { useMemo } from 'react';
import { profileProblem, type ProductWarranty } from '@/features/warranties';
import type { JobStatus } from '@/constants';
import { t } from '@/shared/i18n/t';
import { formatMoney, fromCents, toCents } from '@/shared/lib/money';
import {
  calc_repair,
  type ItemDiscount,
  type RepairBlocker,
  type RepairBlockerCode,
  type RepairTotals,
} from '@/wasm';
import type { RepairItem, RepairItemInput, RepairKind, RepairService } from '../types';
import { typedDiscount } from './repairDiscount';

/**
 * The repair form's items while they are being typed. Money boxes hold rupees as typed; a stock
 * part carries the price of the unit or tier chosen (shown to the person) and, only for a part
 * already saved on the job, what it cost the shop (`costCents`; a newly chosen stock part's cost
 * is worked out by the server when the job is saved).
 */
export type PartDraft =
  | {
      source: 'stock';
      productKey: string;
      productName: string;
      serialNumber?: string;
      stockQuantity?: number;
      sku?: string;
      sellingPriceCents?: number;
      priceCents: number;
      costCents: number | null;
    }
  | { source: 'outside'; name: string; priceRupees: number | string; costRupees: number | string };

export const DEFAULT_QUICK_FEES = ['Diagnostic fee', 'Software', 'Cleaning'] as const;

/** A physical part used in the repair (from inventory or outside). Has no fee/labour field. */
export interface PartItemDraft {
  uid: string;
  key?: string;
  keys?: string[];
  kind: 'part';
  quantity: number;
  description: string;
  part: PartDraft;
  /** The discount typed on this item; `null` for none. */
  discount: ItemDiscount | null;
  warranty: ProductWarranty;
}

/** A service, diagnostic charge, or other fee on the repair. Has no part attached. */
export interface FeeItemDraft {
  uid: string;
  key?: string;
  kind: 'fee';
  description: string;
  feeRupees: number | string;
  /** The discount typed on this item; `null` for none. */
  discount: ItemDiscount | null;
  warranty: ProductWarranty;
}

/** A repair item is either a physical Part or an Other Fee. */
export type ItemDraft = PartItemDraft | FeeItemDraft;

const NO_COVER: ProductWarranty = { coverage: { kind: 'none' } };

let nextUid = 0;
const uid = (): string => {
  nextUid += 1;
  return `item-${nextUid}`;
};

const rupees = (value: number | string): number => (value === '' ? 0 : toCents(Number(value)));

const fromSavedCents = (cents: number): number | string => (cents === 0 ? '' : fromCents(cents));

export const isRework = (kind: RepairKind): boolean => kind.kind === 'warranty_rework';

/** A blank fee / service row. */
export const blankFee = (): FeeItemDraft => ({
  uid: uid(),
  kind: 'fee',
  description: '',
  feeRupees: '',
  discount: null,
  warranty: NO_COVER,
});

/** An empty row (defaults to a fee line). */
export const blankItem = (): FeeItemDraft => blankFee();

/** A row filled from one of the shop's ready-made services (a rework keeps it free and uncovered). */
export const itemFromService = (service: RepairService, rework: boolean): FeeItemDraft => ({
  uid: uid(),
  kind: 'fee',
  description: service.name,
  feeRupees: rework ? '' : fromSavedCents(service.laborCents),
  discount: null,
  warranty: rework ? NO_COVER : service.warranty,
});

/** A row created directly from an inventory or outside part. */
export const itemFromPart = (
  part: PartDraft,
  warranty: ProductWarranty = NO_COVER,
  rework = false,
  quantity = 1
): PartItemDraft => ({
  uid: uid(),
  kind: 'part',
  quantity,
  description: part.source === 'stock' ? part.productName : part.name,
  part,
  discount: null,
  warranty: rework ? NO_COVER : warranty,
});

/** Convert a saved item into an editable draft (either Part or Fee). */
export const itemFromSaved = (item: RepairItem): ItemDraft => {
  if (item.part !== undefined) {
    return {
      uid: uid(),
      key: item.key,
      keys: [item.key],
      kind: 'part',
      quantity: 1,
      description: item.description,
      part:
        item.part.source === 'stock'
          ? {
              source: 'stock',
              productKey: item.part.productKey,
              productName: item.part.productName,
              serialNumber: item.part.serialNumber,
              sellingPriceCents: item.part.sellingPriceCents,
              priceCents: item.partCents,
              costCents: item.partCostCents,
            }
          : {
              source: 'outside',
              name: item.part.name,
              priceRupees: fromSavedCents(item.partCents),
              costRupees: fromSavedCents(item.partCostCents),
            },
      discount: item.discount === undefined ? null : typedDiscount(item.discount),
      warranty: item.warranty,
    };
  }
  return {
    uid: uid(),
    key: item.key,
    kind: 'fee',
    description: item.description,
    feeRupees: fromSavedCents(item.laborCents),
    discount: item.discount === undefined ? null : typedDiscount(item.discount),
    warranty: item.warranty,
  };
};

/** Convert a list of saved items into editable drafts, grouping identical items and splitting legacy dual-cost items if needed. */
export const itemsFromSaved = (items: RepairItem[]): ItemDraft[] => {
  const drafts: ItemDraft[] = [];
  for (const item of items) {
    if (item.part !== undefined) {
      if (item.part.source === 'stock' && !item.part.serialNumber && item.discount === undefined) {
        const stockPart = item.part;
        const existingIndex = drafts.findIndex(
          (d) =>
            d.kind === 'part' &&
            d.part.source === 'stock' &&
            !d.part.serialNumber &&
            d.part.productKey === stockPart.productKey &&
            d.part.sellingPriceCents === stockPart.sellingPriceCents &&
            d.discount === null &&
            JSON.stringify(d.warranty) === JSON.stringify(item.warranty)
        );
        if (existingIndex >= 0) {
          const existing = drafts[existingIndex] as PartItemDraft;
          existing.quantity += 1;
          if (existing.keys !== undefined) {
            existing.keys.push(item.key);
          } else {
            existing.keys = existing.key !== undefined ? [existing.key, item.key] : [item.key];
          }
          continue;
        }
      }

      drafts.push({
        uid: uid(),
        key: item.key,
        keys: [item.key],
        kind: 'part',
        quantity: 1,
        description: item.description,
        part:
          item.part.source === 'stock'
            ? {
                source: 'stock',
                productKey: item.part.productKey,
                productName: item.part.productName,
                serialNumber: item.part.serialNumber,
                sellingPriceCents: item.part.sellingPriceCents,
                priceCents: item.partCents,
                costCents: item.partCostCents,
              }
            : {
                source: 'outside',
                name: item.part.name,
                priceRupees: fromSavedCents(item.partCents),
                costRupees: fromSavedCents(item.partCostCents),
              },
        discount: item.discount === undefined ? null : typedDiscount(item.discount),
        warranty: item.warranty,
      });
      // If a legacy item had both a part and labor charges, preserve the service fee:
      if (item.laborCents > 0) {
        drafts.push({
          uid: uid(),
          kind: 'fee',
          description: `${item.description} (${t('Service fee')})`,
          feeRupees: fromSavedCents(item.laborCents),
          discount: null,
          warranty: NO_COVER,
        });
      }
    } else {
      drafts.push({
        uid: uid(),
        key: item.key,
        kind: 'fee',
        description: item.description,
        feeRupees: fromSavedCents(item.laborCents),
        discount: item.discount === undefined ? null : typedDiscount(item.discount),
        warranty: item.warranty,
      });
    }
  }
  return drafts;
};

/** The warranty as it is saved: no type or terms without cover, terms trimmed. */
export const cleanWarranty = (warranty: ProductWarranty): ProductWarranty =>
  warranty.coverage.kind === 'none'
    ? { coverage: warranty.coverage }
    : { ...warranty, terms: warranty.terms?.trim() };

/** What a fee row charges, in cents. */
export const feePriceCents = (draft: FeeItemDraft): number => rupees(draft.feeRupees);

/** What the customer pays for a part; a rework charges nothing. */
export const partPriceCents = (part: PartDraft, rework: boolean): number => {
  if (rework) return 0;
  return part.source === 'stock' ? part.priceCents : rupees(part.priceRupees);
};

/** What the part cost the shop, or `null` while the server has yet to work it out. */
export const partCostCents = (part: PartDraft): number | null => {
  return part.source === 'stock' ? part.costCents : rupees(part.costRupees);
};

/** Formatted display label for a part. */
export const partLabel = (part: PartDraft, rework: boolean): string => {
  if (part.source === 'stock') {
    const unit = part.serialNumber ? ` · ${part.serialNumber}` : '';
    const price = rework ? '' : ` · ${formatMoney(part.priceCents)}`;
    return `${part.productName}${unit}${price}`;
  }
  const price =
    rework || part.priceRupees === '' ? '' : ` · ${formatMoney(rupees(part.priceRupees))}`;
  return `${part.name}${price}`;
};

/** Calculates the profit margin for an outside part in rupees, after its item's discount. */
export const calculateOutsideProfit = (
  priceRupees: number | string,
  costRupees: number | string,
  discountCents: number | null,
  quantity = 1
): number | null => {
  if (priceRupees === '' || costRupees === '' || discountCents === null) return null;
  const p = Number(priceRupees);
  const c = Number(costRupees);
  if (isNaN(p) || isNaN(c)) return null;
  return (p - c) * quantity - fromCents(discountCents);
};

/**
 * Calculates the total net profit on all parts (in cents), after each item's discount (the
 * server's figures, in the rows' order), or null if any stock part cost is unknown.
 */
export const calculatePartsProfitCents = (
  drafts: ItemDraft[],
  itemDiscountsCents: number[]
): number | null => {
  let totalProfit = 0;
  for (const [index, draft] of drafts.entries()) {
    if (draft.kind === 'part') {
      const qty = Math.max(1, draft.quantity);
      if (draft.part.source === 'stock') {
        if (draft.part.costCents === null) return null;
        totalProfit += (draft.part.priceCents - draft.part.costCents) * qty;
      } else {
        const p = rupees(draft.part.priceRupees);
        const c = rupees(draft.part.costRupees);
        totalProfit += (p - c) * qty;
      }
      totalProfit -= itemDiscountsCents[index];
    }
  }
  return totalProfit;
};

/** The rows as the server wants them; it prices stock parts itself. */
export const toItemInputs = (drafts: ItemDraft[], rework: boolean): RepairItemInput[] => {
  const inputs: RepairItemInput[] = [];
  for (const draft of drafts) {
    if (draft.kind === 'part') {
      const rawDesc = draft.description.trim();
      const partDesc = draft.part.source === 'stock' ? draft.part.productName : draft.part.name;
      const description = rawDesc.length > 0 ? rawDesc : partDesc.trim();
      const qty = Math.max(1, draft.quantity);
      const keys =
        draft.keys !== undefined ? draft.keys : draft.key !== undefined ? [draft.key] : [];

      let remainingFixedDiscount =
        !rework && draft.discount !== null && draft.discount.type === 'fixed'
          ? draft.discount.cents
          : 0;

      const unitPriceCents = partPriceCents(draft.part, rework);

      for (let i = 0; i < qty; i++) {
        const itemKey = i < keys.length ? keys[i] : undefined;
        let unitDiscount: ItemDiscount | undefined = undefined;

        if (!rework && draft.discount !== null) {
          if (draft.discount.type === 'percentage') {
            unitDiscount = draft.discount;
          } else if (remainingFixedDiscount > 0) {
            const alloc = Math.min(remainingFixedDiscount, unitPriceCents);
            unitDiscount = { type: 'fixed', cents: alloc };
            remainingFixedDiscount -= alloc;
          }
        }

        inputs.push({
          key: itemKey,
          description,
          laborCents: 0,
          part:
            draft.part.source === 'stock'
              ? {
                  source: 'stock',
                  productKey: draft.part.productKey,
                  serialNumber: draft.part.serialNumber,
                  sellingPriceCents: draft.part.sellingPriceCents,
                }
              : {
                  source: 'outside',
                  name: draft.part.name.trim(),
                  priceCents: rework ? 0 : rupees(draft.part.priceRupees),
                  costCents: rupees(draft.part.costRupees),
                },
          discount: unitDiscount,
          warranty: rework ? NO_COVER : draft.warranty,
        });
      }
    } else {
      inputs.push({
        key: draft.key,
        description: draft.description.trim(),
        laborCents: rework ? 0 : rupees(draft.feeRupees),
        part: undefined,
        discount: draft.discount === null ? undefined : draft.discount,
        warranty: rework ? NO_COVER : draft.warranty,
      });
    }
  }
  return inputs;
};

const STATUSES_NEEDING_WORK: JobStatus[] = ['ready', 'delivered'];

export const negative = (value: number | string): boolean => value !== '' && Number(value) < 0;

/** Which box of a row a problem is about, so the message can sit right under it. */
export type RowProblemField = 'description' | 'fee' | 'part' | 'warranty';

export interface RowProblem {
  field: RowProblemField;
  message: string;
}

/** What stops one row being saved, in plain words (`null` when nothing). */
export const rowProblem = (draft: ItemDraft, rework: boolean): RowProblem | null => {
  if (draft.kind === 'part') {
    const part = draft.part;
    if (part.source === 'outside') {
      if (part.name.trim() === '') return { field: 'part', message: t('Say what the part is.') };
      if (negative(part.priceRupees) || negative(part.costRupees)) {
        return { field: 'part', message: t('A part price or cost cannot be below zero.') };
      }
      if (part.costRupees === '') {
        return { field: 'part', message: t('Enter the cost of the part to the shop.') };
      }
      if (!rework && (part.priceRupees === '' || Number(part.priceRupees) <= 0)) {
        return { field: 'part', message: t('Enter what the customer pays for the part.') };
      }
    }
    const rawDesc = draft.description.trim();
    const partDesc = draft.part.source === 'stock' ? draft.part.productName : draft.part.name;
    const finalDesc = rawDesc.length > 0 ? rawDesc : partDesc.trim();
    if (finalDesc === '') {
      return { field: 'description', message: t('Say what the part is.') };
    }
    if (!rework) {
      const message = profileProblem(draft.warranty);
      return message === null ? null : { field: 'warranty', message };
    }
    return null;
  }

  // draft.kind === 'fee'
  if (draft.description.trim() === '') {
    return { field: 'description', message: t('Say what fee or service this is.') };
  }
  if (negative(draft.feeRupees)) {
    return { field: 'fee', message: t('Fee cannot be below zero.') };
  }
  if (!rework && (draft.feeRupees === '' || Number(draft.feeRupees) <= 0)) {
    return { field: 'fee', message: t('Enter the fee amount.') };
  }
  if (!rework) {
    const message = profileProblem(draft.warranty);
    return message === null ? null : { field: 'warranty', message };
  }
  return null;
};

/** What a discount problem the server named means, in plain words. */
export const discountBlockerMessage = (code: RepairBlockerCode): string => {
  switch (code) {
    case 'discount_more_than_item':
      return t('The discount is more than this item costs.');
    case 'discount_on_mixed_item':
      return t('Give the discount to the fee or the part, not to one item with both.');
  }
};

/** What is wrong with one row's discount, in plain words (`null` when nothing). */
export const rowDiscountProblem = (index: number, blockers: RepairBlocker[]): string | null => {
  const blocker = blockers.find((candidate) => candidate.itemIndex === index);
  return blocker === undefined ? null : discountBlockerMessage(blocker.code);
};

/**
 * The first problem with the whole list, or `null`. A rework may be handed back with none.
 * `totals` is the live answer for these rows (`null` while an amount is refused).
 */
export const itemsProblem = (
  drafts: ItemDraft[],
  kind: RepairKind,
  status: JobStatus,
  totals: LiveRepairTotals | null
): string | null => {
  const rework = isRework(kind);
  if (drafts.length === 0 && !rework && STATUSES_NEEDING_WORK.includes(status)) {
    return t('Add the parts or fees before marking this job ready or delivered.');
  }
  for (const draft of drafts) {
    const problem = rowProblem(draft, rework);
    if (problem !== null) return problem.message;
  }
  if (totals !== null && totals.blockers.length > 0) {
    return discountBlockerMessage(totals.blockers[0].code);
  }
  return null;
};

export interface LiveRepairTotals {
  totals: RepairTotals;
  /** What each row's discount comes to, in the rows' order; 0 for none. */
  itemDiscountsCents: number[];
  /** What stops the job being saved (a discount that cannot stand). */
  blockers: RepairBlocker[];
  /** False while a newly chosen stock part has no cost yet, so profit cannot be shown. */
  costKnown: boolean;
}

/** The job's totals for what is typed so far, from the shared calculation (WASM). */
export const repairTotals = (drafts: ItemDraft[], rework: boolean): LiveRepairTotals => {
  let costKnown = true;
  const items = drafts.map((draft) => {
    if (draft.kind === 'part') {
      const qty = Math.max(1, draft.quantity);
      const unitPrice = partPriceCents(draft.part, rework);
      const unitCost = partCostCents(draft.part);
      if (unitCost === null) costKnown = false;
      return {
        laborCents: undefined,
        partCents: unitPrice * qty,
        partCostCents: unitCost === null ? undefined : unitCost * qty,
        discount: draft.discount === null ? undefined : draft.discount,
      };
    }
    return {
      laborCents: rework || draft.feeRupees === '' ? undefined : rupees(draft.feeRupees),
      partCents: undefined,
      partCostCents: undefined,
      discount: draft.discount === null ? undefined : draft.discount,
    };
  });
  const preview = calc_repair({ items });
  return {
    totals: preview.totals,
    itemDiscountsCents: preview.itemDiscountsCents,
    blockers: preview.blockers,
    costKnown,
  };
};

/** `repairTotals`, recomputed only when the rows change. A refused amount gives `null`. */
export const useRepairTotals = (drafts: ItemDraft[], rework: boolean): LiveRepairTotals | null =>
  useMemo(() => {
    try {
      return repairTotals(drafts, rework);
    } catch {
      return null;
    }
  }, [drafts, rework]);
