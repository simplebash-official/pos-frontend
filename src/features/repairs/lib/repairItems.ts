import { useMemo } from 'react';
import { profileProblem, type ProductWarranty } from '@/features/warranties';
import type { JobStatus } from '@/constants';
import { t } from '@/shared/i18n/t';
import { formatMoney, fromCents, toCents } from '@/shared/lib/money';
import { calc_repair, type RepairTotals } from '@/wasm';
import type { RepairItem, RepairItemInput, RepairKind, RepairService } from '../types';

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
      sellingPriceCents?: number;
      priceCents: number;
      costCents: number | null;
    }
  | { source: 'outside'; name: string; priceRupees: number | string; costRupees: number | string };

/** A physical part used in the repair (from inventory or outside). Has no fee/labour field. */
export interface PartItemDraft {
  uid: string;
  key?: string;
  kind: 'part';
  description: string;
  part: PartDraft;
  warranty: ProductWarranty;
}

/** A service, diagnostic charge, or other fee on the repair. Has no part attached. */
export interface FeeItemDraft {
  uid: string;
  key?: string;
  kind: 'fee';
  description: string;
  feeRupees: number | string;
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
  warranty: rework ? NO_COVER : service.warranty,
});

/** A row created directly from an inventory or outside part. */
export const itemFromPart = (
  part: PartDraft,
  warranty: ProductWarranty = NO_COVER,
  rework = false
): PartItemDraft => ({
  uid: uid(),
  kind: 'part',
  description: part.source === 'stock' ? part.productName : part.name,
  part,
  warranty: rework ? NO_COVER : warranty,
});

/** Convert a saved item into an editable draft (either Part or Fee). */
export const itemFromSaved = (item: RepairItem): ItemDraft => {
  if (item.part !== undefined) {
    return {
      uid: uid(),
      key: item.key,
      kind: 'part',
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
      warranty: item.warranty,
    };
  }
  return {
    uid: uid(),
    key: item.key,
    kind: 'fee',
    description: item.description,
    feeRupees: fromSavedCents(item.laborCents),
    warranty: item.warranty,
  };
};

/** Convert a list of saved items into editable drafts, splitting legacy dual-cost items if needed. */
export const itemsFromSaved = (items: RepairItem[]): ItemDraft[] => {
  const drafts: ItemDraft[] = [];
  for (const item of items) {
    if (item.part !== undefined) {
      drafts.push({
        uid: uid(),
        key: item.key,
        kind: 'part',
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
        warranty: item.warranty,
      });
      // If a legacy item had both a part and labor charges, preserve the service fee:
      if (item.laborCents > 0) {
        drafts.push({
          uid: uid(),
          kind: 'fee',
          description: `${item.description} (${t('Service fee')})`,
          feeRupees: fromSavedCents(item.laborCents),
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
  const price = rework || part.priceRupees === '' ? '' : ` · ${formatMoney(rupees(part.priceRupees))}`;
  return `${part.name}${price}`;
};

/** The rows as the server wants them; it prices stock parts itself. */
export const toItemInputs = (drafts: ItemDraft[], rework: boolean): RepairItemInput[] =>
  drafts.map((draft) => {
    if (draft.kind === 'part') {
      const fallbackDesc = draft.part.source === 'stock' ? draft.part.productName : draft.part.name;
      const description = (draft.description.trim() || fallbackDesc).trim();
      return {
        key: draft.key,
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
        warranty: rework ? NO_COVER : draft.warranty,
      };
    }

    return {
      key: draft.key,
      description: draft.description.trim(),
      laborCents: rework ? 0 : rupees(draft.feeRupees),
      part: undefined,
      warranty: rework ? NO_COVER : draft.warranty,
    };
  });

const STATUSES_NEEDING_WORK: JobStatus[] = ['ready', 'delivered'];

const negative = (value: number | string): boolean => value !== '' && Number(value) < 0;

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
    }
    const fallbackDesc = draft.part.source === 'stock' ? draft.part.productName : draft.part.name;
    if ((draft.description.trim() || fallbackDesc).trim() === '') {
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
  if (!rework) {
    const message = profileProblem(draft.warranty);
    return message === null ? null : { field: 'warranty', message };
  }
  return null;
};

/** The first problem with the whole list, or `null`. A rework may be handed back with none. */
export const itemsProblem = (
  drafts: ItemDraft[],
  kind: RepairKind,
  status: JobStatus
): string | null => {
  const rework = isRework(kind);
  if (drafts.length === 0 && !rework && STATUSES_NEEDING_WORK.includes(status)) {
    return t('Add the parts or fees before marking this job ready or delivered.');
  }
  for (const draft of drafts) {
    const problem = rowProblem(draft, rework);
    if (problem !== null) return problem.message;
  }
  return null;
};

export interface LiveRepairTotals {
  totals: RepairTotals;
  /** False while a newly chosen stock part has no cost yet, so profit cannot be shown. */
  costKnown: boolean;
}

/** The job's totals for what is typed so far, from the shared calculation (WASM). */
export const repairTotals = (drafts: ItemDraft[], rework: boolean): LiveRepairTotals => {
  let costKnown = true;
  const items = drafts.map((draft) => {
    if (draft.kind === 'part') {
      const cost = partCostCents(draft.part);
      if (cost === null) costKnown = false;
      return {
        laborCents: undefined,
        partCents: partPriceCents(draft.part, rework),
        partCostCents: cost === null ? undefined : cost,
      };
    }
    return {
      laborCents: rework || draft.feeRupees === '' ? undefined : rupees(draft.feeRupees),
      partCents: undefined,
      partCostCents: undefined,
    };
  });
  return { totals: calc_repair({ items }), costKnown };
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
