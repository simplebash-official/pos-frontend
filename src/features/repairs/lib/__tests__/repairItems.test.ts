import { describe, expect, it } from 'vitest';
import type { RepairItem, RepairService } from '../../types';
import {
  blankFee,
  countItems,
  calculateOutsideProfit,
  calculatePartsProfitCents,
  feePriceCents,
  itemFromPart,
  itemFromSaved,
  itemsFromSaved,
  itemFromService,
  itemsProblem,
  repairTotals,
  rowDiscountProblem,
  rowProblem,
  toItemInputs,
  type FeeItemDraft,
  type ItemDraft,
  type PartItemDraft,
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
  laborCents: 0,
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

const SAVED_SERVICE: RepairItem = {
  key: 'rit_diag',
  description: 'Diagnostic & Testing',
  laborCents: 150_000,
  part: undefined,
  partCents: 0,
  partCostCents: 0,
  warranty: THREE_MONTHS,
};

const feeDraft = (overrides: Partial<FeeItemDraft>): FeeItemDraft => ({
  ...blankFee(),
  ...overrides,
});

describe('repair parts and other fees', () => {
  it('turns a saved part item into a PartItemDraft and back without losing details', () => {
    const row = itemFromSaved(SAVED_SCREEN) as PartItemDraft;
    expect(row.kind).toBe('part');
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
        laborCents: 0,
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

  it('turns a saved service/fee item into a FeeItemDraft and back without losing details', () => {
    const row = itemFromSaved(SAVED_SERVICE) as FeeItemDraft;
    expect(row.kind).toBe('fee');
    expect(row.description).toBe('Diagnostic & Testing');
    expect(row.feeRupees).toBe(1500);
    expect(toItemInputs([row], false)).toEqual([
      {
        key: 'rit_diag',
        description: 'Diagnostic & Testing',
        laborCents: 150_000,
        part: undefined,
        warranty: THREE_MONTHS,
      },
    ]);
  });

  it('splits legacy items that have both a part and labor charges so no charges are lost', () => {
    const legacyItem: RepairItem = {
      key: 'rit_legacy',
      description: 'Screen replacement',
      laborCents: 200_000,
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
    const drafts = itemsFromSaved([legacyItem]);
    expect(drafts).toHaveLength(2);
    expect(drafts[0].kind).toBe('part');
    expect(drafts[1].kind).toBe('fee');
    expect((drafts[1] as FeeItemDraft).feeRupees).toBe(2000);
  });

  it('fills a fee row from a ready-made service, free and uncovered on a rework', () => {
    const service: RepairService = {
      id: '1',
      key: 'rst_1',
      name: 'Software flashing',
      laborCents: 150_000,
      warranty: THREE_MONTHS,
      active: true,
      version: 1,
      createdAt: '2026-11-03T00:00:00Z',
      updatedAt: '2026-11-03T00:00:00Z',
    };
    const paid = itemFromService(service, false);
    expect(paid.kind).toBe('fee');
    expect(paid.description).toBe('Software flashing');
    expect(paid.feeRupees).toBe(1500);
    expect(paid.warranty).toEqual(THREE_MONTHS);

    const free = itemFromService(service, true);
    expect(free.feeRupees).toBe('');
    expect(free.warranty).toEqual({ coverage: { kind: 'none' } });
  });

  it('fills a row directly from a stock or outside part with zero fee', () => {
    const partDraft = {
      source: 'stock' as const,
      productKey: 'prod_bat',
      productName: 'iPhone 13 Battery',
      priceCents: 500_000,
      costCents: 300_000,
    };
    const row = itemFromPart(partDraft, THREE_MONTHS, false);
    expect(row.kind).toBe('part');
    expect(row.description).toBe('iPhone 13 Battery');
    expect(row.part).toEqual(partDraft);
    expect(row.warranty).toEqual(THREE_MONTHS);

    // Converts cleanly to item inputs with 0 laborCents
    const [input] = toItemInputs([row], false);
    expect(input.description).toBe('iPhone 13 Battery');
    expect(input.laborCents).toBe(0);
  });

  it('says plainly what stops a row or the job being saved', () => {
    expect(rowProblem(feeDraft({ description: ' ' }), false)).toEqual({
      field: 'description',
      message: 'Say what fee or service this is.',
    });
    expect(rowProblem(feeDraft({ description: 'Inspection', feeRupees: -1 }), false)).toEqual({
      field: 'fee',
      message: 'Fee cannot be below zero.',
    });
    expect(rowProblem(feeDraft({ description: 'Inspection', feeRupees: '' }), false)).toEqual({
      field: 'fee',
      message: 'Enter the fee amount.',
    });
    expect(rowProblem(feeDraft({ description: 'Inspection', feeRupees: 0 }), false)).toEqual({
      field: 'fee',
      message: 'Enter the fee amount.',
    });

    const outsidePartNoCost = itemFromPart({
      source: 'outside',
      name: 'Glass protector',
      priceRupees: 500,
      costRupees: '',
    });
    expect(rowProblem(outsidePartNoCost, false)).toEqual({
      field: 'part',
      message: 'Enter the cost of the part to the shop.',
    });

    const outsidePartNoPrice = itemFromPart({
      source: 'outside',
      name: 'Glass protector',
      priceRupees: '',
      costRupees: 200,
    });
    expect(rowProblem(outsidePartNoPrice, false)).toEqual({
      field: 'part',
      message: 'Enter what the customer pays for the part.',
    });

    const outsidePart = itemFromPart({
      source: 'outside',
      name: '',
      priceRupees: '',
      costRupees: '',
    });
    expect(rowProblem(outsidePart, false)).toEqual({
      field: 'part',
      message: 'Say what the part is.',
    });

    expect(itemsProblem([], STANDARD, 'ready', null)).toBe(
      'Add the parts or fees before marking this job ready or delivered.'
    );
    expect(itemsProblem([], STANDARD, 'received', null)).toBeNull();
    expect(itemsProblem([], REWORK, 'delivered', null)).toBeNull();
  });
});

describe('repair totals calculation', () => {
  it('adds other fees and part prices through the shared calculation', () => {
    const rows: ItemDraft[] = [
      itemFromSaved(SAVED_SCREEN),
      feeDraft({
        description: 'Clean & Diagnostic',
        feeRupees: 500,
      }),
    ];
    const live = repairTotals(rows, false);
    expect(live.totals.laborCents).toBe(50_000); // 500 rupees
    expect(live.totals.partsCents).toBe(1_200_000);
    expect(live.totals.priceCents).toBe(1_250_000);
    expect(live.totals.costCents).toBe(850_000);
    expect(live.costKnown).toBe(true);
  });

  it('computes parts-only repairs where final amount is display + battery and profit is parts profit', () => {
    const display = itemFromPart({
      source: 'stock',
      productKey: 'prod_screen',
      productName: 'iPhone 13 Display',
      sellingPriceCents: 1_500_000,
      priceCents: 1_500_000,
      costCents: 1_000_000,
    });
    const battery = itemFromPart({
      source: 'stock',
      productKey: 'prod_battery',
      productName: 'iPhone 13 Battery',
      sellingPriceCents: 500_000,
      priceCents: 500_000,
      costCents: 300_000,
    });

    const live = repairTotals([display, battery], false);
    expect(live.totals.laborCents).toBe(0);
    expect(live.totals.partsCents).toBe(2_000_000);
    expect(live.totals.priceCents).toBe(2_000_000);
    expect(live.totals.costCents).toBe(1_300_000);
    expect(live.costKnown).toBe(true);

    // Net profit for this job is exactly Display Profit (500,000) + Battery Profit (200,000) = 700,000
    const profitCents = live.totals.priceCents - live.totals.costCents;
    expect(profitCents).toBe(700_000);
  });

  it('charges nothing on a rework', () => {
    const live = repairTotals([itemFromSaved(SAVED_SCREEN)], true);
    expect(live.totals.priceCents).toBe(0);
    expect(live.totals.costCents).toBe(850_000);
  });
});

describe('item discounts', () => {
  const SAVED_DISCOUNTED: RepairItem = {
    ...SAVED_SERVICE,
    discount: { type: 'percentage', basisPoints: 1_250, amountCents: 18_750 },
  };

  it('keeps a saved discount as typed (without the amount) and sends it back', () => {
    const row = itemFromSaved(SAVED_DISCOUNTED) as FeeItemDraft;
    expect(row.discount).toEqual({ type: 'percentage', basisPoints: 1_250 });
    expect(toItemInputs([row], false)[0].discount).toEqual({
      type: 'percentage',
      basisPoints: 1_250,
    });
    expect(itemsFromSaved([SAVED_DISCOUNTED])[0]).toMatchObject({
      discount: { type: 'percentage', basisPoints: 1_250 },
    });
    expect(toItemInputs([itemFromSaved(SAVED_SERVICE)], false)[0].discount).toBeUndefined();
  });

  it('starts every new row with no discount', () => {
    expect(blankFee().discount).toBeNull();
    expect(
      itemFromPart({ source: 'outside', name: 'Glue', priceRupees: '', costRupees: '' }).discount
    ).toBeNull();
  });

  it('takes the discount off the price through the shared calculation', () => {
    const rows: ItemDraft[] = [
      feeDraft({ feeRupees: 1000, discount: { type: 'fixed', cents: 20_000 } }),
      itemFromSaved({
        ...SAVED_SCREEN,
        discount: { type: 'percentage', basisPoints: 1_000, amountCents: 120_000 },
      }),
    ];
    const live = repairTotals(rows, false);
    expect(live.itemDiscountsCents).toEqual([20_000, 120_000]);
    expect(live.totals.discountCents).toBe(140_000);
    expect(live.totals.laborCents).toBe(100_000);
    expect(live.totals.partsCents).toBe(1_200_000);
    expect(live.totals.priceCents).toBe(1_300_000 - 140_000);
    expect(live.blockers).toEqual([]);
  });

  it('blocks Save with a plain message when a discount is more than the item', () => {
    const rows: ItemDraft[] = [
      feeDraft({
        description: 'Cleaning',
        feeRupees: 100,
        discount: { type: 'fixed', cents: 20_000 },
      }),
    ];
    const live = repairTotals(rows, false);
    expect(live.blockers).toEqual([{ itemIndex: 0, code: 'discount_more_than_item' }]);
    expect(live.totals.priceCents).toBe(10_000);
    expect(itemsProblem(rows, STANDARD, 'received', live)).toBe(
      'The discount is more than this item costs.'
    );
    expect(rowDiscountProblem(0, live.blockers)).toBe('The discount is more than this item costs.');
    expect(rowDiscountProblem(1, live.blockers)).toBeNull();
  });

  it('shows part profit after each item discount', () => {
    const screen = itemFromSaved(SAVED_SCREEN);
    expect(calculatePartsProfitCents([screen], [0])).toBe(350_000);
    expect(calculatePartsProfitCents([screen], [120_000])).toBe(230_000);
    expect(calculateOutsideProfit(100, 40, 1_000)).toBe(50);
    expect(calculateOutsideProfit(100, 40, null)).toBeNull();
    expect(feePriceCents(feeDraft({ feeRupees: 12.5 }))).toBe(1_250);
  });

  it('groups identical non-serialized stock parts in itemsFromSaved and expands them in toItemInputs', () => {
    const mug1: RepairItem = {
      key: 'rit_mug1',
      description: '11oz White Ceramic Sublimation Mug',
      laborCents: 0,
      part: {
        source: 'stock',
        productKey: 'prod_mug',
        productName: '11oz White Ceramic Sublimation Mug',
        sellingPriceCents: 500,
      },
      partCents: 500,
      partCostCents: 120,
      warranty: { coverage: { kind: 'none' } },
    };
    const mug2: RepairItem = {
      key: 'rit_mug2',
      description: '11oz White Ceramic Sublimation Mug',
      laborCents: 0,
      part: {
        source: 'stock',
        productKey: 'prod_mug',
        productName: '11oz White Ceramic Sublimation Mug',
        sellingPriceCents: 500,
      },
      partCents: 500,
      partCostCents: 120,
      warranty: { coverage: { kind: 'none' } },
    };

    const drafts = itemsFromSaved([mug1, mug2]);
    expect(drafts).toHaveLength(1);
    const draft = drafts[0] as PartItemDraft;
    expect(draft.quantity).toBe(2);
    expect(draft.keys).toEqual(['rit_mug1', 'rit_mug2']);

    const inputs = toItemInputs(drafts, false);
    expect(inputs).toHaveLength(2);
    expect(inputs[0].key).toBe('rit_mug1');
    expect(inputs[1].key).toBe('rit_mug2');
    expect(inputs[0].part).toMatchObject({ source: 'stock', sellingPriceCents: 500 });
    expect(inputs[1].part).toMatchObject({ source: 'stock', sellingPriceCents: 500 });
  });

  it('multiplies parts totals and profit for multi-quantity items', () => {
    const partDraft = {
      source: 'stock' as const,
      productKey: 'prod_mug',
      productName: '11oz White Ceramic Sublimation Mug',
      sellingPriceCents: 500,
      priceCents: 500,
      costCents: 120,
    };
    const row = itemFromPart(partDraft, { coverage: { kind: 'none' } }, false, 3);
    expect(row.quantity).toBe(3);

    const live = repairTotals([row], false);
    expect(live.totals.partsCents).toBe(1_500); // 3 * 500
    expect(live.totals.costCents).toBe(360); // 3 * 120
    expect(live.totals.priceCents).toBe(1_500);

    const profit = calculatePartsProfitCents([row], [0]);
    expect(profit).toBe(1_140); // 3 * (500 - 120)

    const outsideProfit = calculateOutsideProfit(100, 40, 0, 3);
    expect(outsideProfit).toBe(180); // 3 * (100 - 40)
  });
});

describe('countItems', () => {
  it('counts a part by its quantity and a fee as one', () => {
    const fee = blankFee();
    const part = itemFromPart(
      {
        source: 'outside' as const,
        name: 'Glue',
        priceRupees: 1,
        costRupees: 0.5,
      },
      undefined,
      false,
      3
    );
    expect(countItems([])).toBe(0);
    expect(countItems([fee])).toBe(1);
    expect(countItems([fee, part])).toBe(4);
  });
});
