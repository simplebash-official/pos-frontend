import { useMemo } from 'react';
import { profileProblem, type ProductWarranty } from '@/features/warranties';
import type { JobStatus } from '@/constants';
import { t } from '@/shared/i18n/t';
import { fromCents, toCents } from '@/shared/lib/money';
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

export interface ItemDraft {
  /** Stable row id for React and animations; never sent. */
  uid: string;
  /** The saved item's key, so an edit keeps it. */
  key?: string;
  description: string;
  laborRupees: number | string;
  part: PartDraft | null;
  warranty: ProductWarranty;
}

const NO_COVER: ProductWarranty = { coverage: { kind: 'none' } };

let nextUid = 0;
const uid = (): string => {
  nextUid += 1;
  return `item-${nextUid}`;
};

const rupees = (value: number | string): number => (value === '' ? 0 : toCents(Number(value)));

const fromSavedCents = (cents: number): number | string => (cents === 0 ? '' : fromCents(cents));

export const isRework = (kind: RepairKind): boolean => kind.kind === 'warranty_rework';

/** An empty row. */
export const blankItem = (): ItemDraft => ({
  uid: uid(),
  description: '',
  laborRupees: '',
  part: null,
  warranty: NO_COVER,
});

/** A row filled from one of the shop's ready-made services (a rework keeps it free and uncovered). */
export const itemFromService = (service: RepairService, rework: boolean): ItemDraft => ({
  uid: uid(),
  description: service.name,
  laborRupees: rework ? '' : fromSavedCents(service.laborCents),
  part: null,
  warranty: rework ? NO_COVER : service.warranty,
});

/** A saved item as an editable row. */
export const itemFromSaved = (item: RepairItem): ItemDraft => ({
  uid: uid(),
  key: item.key,
  description: item.description,
  laborRupees: fromSavedCents(item.laborCents),
  part:
    item.part === undefined
      ? null
      : item.part.source === 'stock'
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

/** The warranty as it is saved: no type or terms without cover, terms trimmed. */
export const cleanWarranty = (warranty: ProductWarranty): ProductWarranty =>
  warranty.coverage.kind === 'none'
    ? { coverage: warranty.coverage }
    : { ...warranty, terms: warranty.terms?.trim() };

/** What the customer pays for the row's part; a rework charges nothing. */
export const partPriceCents = (part: PartDraft | null, rework: boolean): number => {
  if (part === null || rework) return 0;
  return part.source === 'stock' ? part.priceCents : rupees(part.priceRupees);
};

/** What the row's part cost the shop, or `null` while the server has yet to work it out. */
export const partCostCents = (part: PartDraft | null): number | null => {
  if (part === null) return 0;
  return part.source === 'stock' ? part.costCents : rupees(part.costRupees);
};

/** The rows as the server wants them; it prices stock parts itself. */
export const toItemInputs = (drafts: ItemDraft[], rework: boolean): RepairItemInput[] =>
  drafts.map((draft) => ({
    key: draft.key,
    description: draft.description.trim(),
    laborCents: rework ? 0 : rupees(draft.laborRupees),
    part:
      draft.part === null
        ? undefined
        : draft.part.source === 'stock'
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
  }));

const STATUSES_NEEDING_WORK: JobStatus[] = ['ready', 'delivered'];

const negative = (value: number | string): boolean => value !== '' && Number(value) < 0;

/** What stops one row being saved, in plain words (`null` when nothing). */
export const rowProblem = (draft: ItemDraft, rework: boolean): string | null => {
  if (draft.description.trim() === '') return t('Say what work is done.');
  if (negative(draft.laborRupees)) return t('Labour cannot be below zero.');
  const part = draft.part;
  if (part !== null && part.source === 'outside') {
    if (part.name.trim() === '') return t('Say what the part is.');
    if (negative(part.priceRupees) || negative(part.costRupees)) {
      return t('A part price or cost cannot be below zero.');
    }
  }
  if (!rework) return profileProblem(draft.warranty);
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
    return t('Add the work done before marking this job ready or delivered.');
  }
  for (const draft of drafts) {
    const problem = rowProblem(draft, rework);
    if (problem !== null) return problem;
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
    const cost = partCostCents(draft.part);
    if (cost === null) costKnown = false;
    return {
      laborCents: rework || draft.laborRupees === '' ? undefined : rupees(draft.laborRupees),
      partCents: partPriceCents(draft.part, rework),
      partCostCents: cost === null ? undefined : cost,
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
