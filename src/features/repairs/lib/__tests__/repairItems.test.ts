import { describe, expect, it } from 'vitest';
import type { RepairItem, RepairService } from '../../types';
import {
  blankItem,
  itemFromSaved,
  itemFromService,
  itemsProblem,
  repairTotals,
  rowProblem,
  toItemInputs,
  type ItemDraft,
} from '../repairItems';

const STANDARD = { kind: 'standard' } as const;
const REWORK = {
  kind: 'warranty_rework',
  claimKey: 'wcl_1',
  claimNumber: 'WCL-000001',
  originalRepairKey: 'rep_1',
  originalTicketNumber: 'REP-000001',
} as const;
const THREE_MONTHS = {
  coverage: { kind: 'limited', value: 3, unit: 'months' },
  warrantyType: 'shop',
} as const;

const SAVED_SCREEN: RepairItem = {
  key: 'rit_screen',
  description: 'Replace screen',
  laborCents: 250_000,
  part: {
    source: 'stock',
    productKey: 'prod_screen',
    productName: 'A55 screen',
    sellingPriceCents: 1_200_000,
  },
  partCents: 1_200_000,
  partCostCents: 850_000,
  warranty: THREE_MONTHS,
};

const draft = (overrides: Partial<ItemDraft>): ItemDraft => ({ ...blankItem(), ...overrides });

describe('repair item rows', () => {
  it('turns a saved item into a row and back without losing its key or part', () => {
    const row = itemFromSaved(SAVED_SCREEN);
    expect(row.laborRupees).toBe(2500);
    expect(row.part).toEqual({
      source: 'stock',
      productKey: 'prod_screen',
      productName: 'A55 screen',
      serialNumber: undefined,
      sellingPriceCents: 1_200_000,
      priceCents: 1_200_000,
      costCents: 850_000,
    });
    expect(toItemInputs([row], false)).toEqual([
      {
        key: 'rit_screen',
        description: 'Replace screen',
        laborCents: 250_000,
        part: {
          source: 'stock',
          productKey: 'prod_screen',
          serialNumber: undefined,
          sellingPriceCents: 1_200_000,
        },
        warranty: THREE_MONTHS,
      },
    ]);
  });

  it('fills a row from a ready-made service, free and uncovered on a rework', () => {
    const service: RepairService = {
      id: '1',
      key: 'rst_1',
      name: 'Battery swap',
      laborCents: 150_000,
      warranty: THREE_MONTHS,
      active: true,
      version: 1,
      createdAt: '2026-11-03T00:00:00Z',
      updatedAt: '2026-11-03T00:00:00Z',
    };
    const paid = itemFromService(service, false);
    expect(paid.description).toBe('Battery swap');
    expect(paid.laborRupees).toBe(1500);
    expect(paid.warranty).toEqual(THREE_MONTHS);
    const free = itemFromService(service, true);
    expect(free.laborRupees).toBe('');
    expect(free.warranty).toEqual({ coverage: { kind: 'none' } });
  });

  it('sends a rework free: no labour, no outside part price, no warranty', () => {
    const row = draft({
      description: 'Refit',
      laborRupees: 500,
      part: { source: 'outside', name: 'Glue', priceRupees: 10, costRupees: 4 },
      warranty: THREE_MONTHS,
    });
    const [input] = toItemInputs([row], true);
    expect(input.laborCents).toBe(0);
    expect(input.part).toEqual({ source: 'outside', name: 'Glue', priceCents: 0, costCents: 400 });
    expect(input.warranty).toEqual({ coverage: { kind: 'none' } });
  });

  it('says plainly what stops a row or the job being saved', () => {
    expect(rowProblem(draft({ description: ' ' }), false)).toBe('Say what work is done.');
    expect(rowProblem(draft({ description: 'Fix', laborRupees: -1 }), false)).toBe(
      'Labour cannot be below zero.'
    );
    expect(
      rowProblem(
        draft({
          description: 'Fix',
          part: { source: 'outside', name: '', priceRupees: '', costRupees: '' },
        }),
        false
      )
    ).toBe('Say what the part is.');
    expect(
      rowProblem(draft({ description: 'Fix', warranty: { coverage: { kind: 'lifetime' } } }), false)
    ).toBe('Choose who gives the warranty.');
    expect(itemsProblem([], STANDARD, 'ready')).toBe(
      'Add the work done before marking this job ready or delivered.'
    );
    expect(itemsProblem([], STANDARD, 'received')).toBeNull();
    expect(itemsProblem([], REWORK, 'delivered')).toBeNull();
  });
});

describe('repair totals', () => {
  it('adds labour and part prices through the shared calculation', () => {
    const rows = [
      itemFromSaved(SAVED_SCREEN),
      draft({
        description: 'Clean',
        laborRupees: 500,
        part: { source: 'outside', name: 'Brush', priceRupees: 2, costRupees: 0.5 },
      }),
    ];
    const live = repairTotals(rows, false);
    expect(live.totals.laborCents).toBe(300_000);
    expect(live.totals.partsCents).toBe(1_200_200);
    expect(live.totals.priceCents).toBe(1_500_200);
    expect(live.totals.costCents).toBe(850_050);
    expect(live.costKnown).toBe(true);
  });

  it('cannot show profit for a stock part chosen but not saved yet', () => {
    const row = draft({
      description: 'Screen',
      part: {
        source: 'stock',
        productKey: 'prod_screen',
        productName: 'A55 screen',
        sellingPriceCents: 1_200_000,
        priceCents: 1_200_000,
        costCents: null,
      },
    });
    const live = repairTotals([row], false);
    expect(live.totals.priceCents).toBe(1_200_000);
    expect(live.costKnown).toBe(false);
  });

  it('charges nothing on a rework', () => {
    const live = repairTotals([itemFromSaved(SAVED_SCREEN)], true);
    expect(live.totals.priceCents).toBe(0);
    expect(live.totals.costCents).toBe(850_000);
  });
});
