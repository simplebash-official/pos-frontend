import { describe, expect, it } from 'vitest';
import type { PrintJob, PrintJobItem, PrintJobKind } from '../../types';
import { printBillBlockerNotice } from '../billable';
import {
  draftsFromSaved,
  itemsProblem,
  lineQuantity,
  outsideDraft,
  printTotals,
  rowProblem,
  serviceDraft,
  toItemInputs,
  type PrintDraft,
  type StockDraft,
} from '../printItems';
import { printStepBlock } from '../statusStep';

const NONE = { coverage: { kind: 'none' as const }, warrantyType: 'shop' as const };
const STANDARD: PrintJobKind = { kind: 'standard' };
const REWORK: PrintJobKind = {
  kind: 'warranty_rework',
  claimKey: 'wcl_1',
  claimNumber: 'WCL-000001',
  originalPrintJobKey: 'prn_0',
  originalTicketNumber: 'PRN-000001',
};

const SAVED: PrintJobItem[] = [
  {
    key: 'pit_1',
    description: 'Mug printing',
    quantity: 50,
    source: { type: 'service' },
    unitPriceCents: 95_000,
    costCents: 0,
    discount: { type: 'fixed', cents: 50_000, amountCents: 50_000 },
    warranty: NONE,
  },
  {
    key: 'pit_2',
    description: 'Blank mug',
    quantity: 50,
    source: {
      type: 'stock',
      productKey: 'prod_1',
      productName: 'Blank mug',
      sellingPriceCents: 20_000,
    },
    unitPriceCents: 20_000,
    costCents: 600_000,
    warranty: NONE,
  },
  {
    key: 'pit_3',
    description: 'Gift box',
    quantity: 50,
    source: { type: 'outside', name: 'Gift box', unitCostCents: 3_000 },
    unitPriceCents: 5_000,
    costCents: 150_000,
    warranty: NONE,
  },
];

describe('print item rows', () => {
  it('sends a saved list back unchanged, keeping every key, without stock prices', () => {
    const inputs = toItemInputs(draftsFromSaved(SAVED), false);
    expect(inputs.map((input) => input.key)).toEqual(['pit_1', 'pit_2', 'pit_3']);
    expect(inputs.map((input) => input.quantity)).toEqual([50, 50, 50]);
    expect(inputs[0].source).toEqual({ type: 'service', unitPriceCents: 95_000 });
    expect(inputs[0].discount).toEqual({ type: 'fixed', cents: 50_000 });
    // The server prices a part from stock itself.
    expect(inputs[1].source).toEqual({
      type: 'stock',
      productKey: 'prod_1',
      serialNumber: undefined,
      sellingPriceCents: 20_000,
    });
    expect(inputs[2].source).toEqual({
      type: 'outside',
      name: 'Gift box',
      unitPriceCents: 5_000,
      unitCostCents: 3_000,
    });
  });

  it('adds up quantity times price, the discount, the cost and the profit', () => {
    const totals = printTotals(draftsFromSaved(SAVED), false);
    // 50 x 950 + 50 x 200 + 50 x 50 = 60,000.00, less the 500.00 discount.
    expect(totals.totals.priceCents).toBe(5_950_000);
    expect(totals.totals.discountCents).toBe(50_000);
    expect(totals.totals.costCents).toBe(750_000);
    expect(totals.costKnown).toBe(true);
    expect(totals.lines[2].profitCents).toBe(100_000);
    expect(totals.blockers).toEqual([]);
  });

  it('cannot show the profit once a stock row differs from what was saved', () => {
    const drafts = draftsFromSaved(SAVED);
    drafts[1] = { ...(drafts[1] as StockDraft), quantity: 40 };
    expect(printTotals(drafts, false).costKnown).toBe(false);
  });

  it('refuses a discount bigger than its line', () => {
    const drafts = draftsFromSaved(SAVED);
    drafts[2] = { ...drafts[2], discount: { type: 'fixed', cents: 300_000 } };
    const totals = printTotals(drafts, false);
    expect(totals.blockers.map((blocker) => blocker.itemIndex)).toEqual([2]);
    expect(itemsProblem(drafts, STANDARD, 'received', totals)).toBe(
      'The discount is more than this line costs.'
    );
  });

  it('charges nothing and gives no warranty or discount on a rework', () => {
    const inputs = toItemInputs(draftsFromSaved(SAVED), true);
    expect(inputs[0].source).toEqual({ type: 'service', unitPriceCents: 0 });
    expect(inputs[0].discount).toBeUndefined();
    expect(inputs[0].warranty).toEqual({ coverage: { kind: 'none' } });
    expect(inputs[2].source).toMatchObject({ unitPriceCents: 0, unitCostCents: 3_000 });
    expect(printTotals(draftsFromSaved(SAVED), true).totals.priceCents).toBe(0);
  });

  it('accepts only whole quantities from 1 to a million', () => {
    expect(lineQuantity(1)).toBe(1);
    expect(lineQuantity(1_000_000)).toBe(1_000_000);
    for (const bad of [0, -1, 1.5, 1_000_001, '' as const]) {
      expect(lineQuantity(bad)).toBeNull();
    }
  });

  it('names the first thing missing on a row', () => {
    const service = serviceDraft('Design', null, NONE, false);
    expect(rowProblem({ ...service, description: ' ' }, false)?.field).toBe('description');
    expect(rowProblem({ ...service, quantity: '' }, false)?.field).toBe('quantity');
    expect(rowProblem(service, false)?.field).toBe('price');
    expect(rowProblem({ ...service, unitPriceRupees: 100 }, false)).toBeNull();
    // Free work needs no fee.
    expect(rowProblem(service, true)).toBeNull();

    const part = outsideDraft('Box');
    expect(rowProblem(part, false)?.field).toBe('price');
    expect(rowProblem({ ...part, unitPriceRupees: 0 }, false)?.field).toBe('cost');
    expect(rowProblem({ ...part, unitPriceRupees: 0, unitCostRupees: 30 }, false)).toBeNull();
  });

  it('needs items before ready or delivered, except on a rework, and at most 50', () => {
    const empty = printTotals([], false);
    expect(itemsProblem([], STANDARD, 'received', empty)).toBeNull();
    expect(itemsProblem([], STANDARD, 'ready', empty)).toBe(
      'Add the items before marking this job ready or delivered.'
    );
    expect(itemsProblem([], REWORK, 'delivered', empty)).toBeNull();
    const many: PrintDraft[] = Array.from({ length: 51 }, () =>
      serviceDraft('Design', 100, NONE, false)
    );
    expect(itemsProblem(many, STANDARD, 'received', empty)).toBe(
      'A print job can have at most 50 items.'
    );
    expect(itemsProblem(many.slice(0, 1), STANDARD, 'received', null)).toBe(
      'One of the amounts is too large.'
    );
  });
});

describe('print job steps and billing words', () => {
  const job = { kind: STANDARD, items: SAVED, billedInvoiceKey: undefined };

  it('holds back ready without items and hand-back before the bill', () => {
    expect(printStepBlock({ ...job, items: [] }, 'ready')?.reason).toBe('needs_work');
    expect(printStepBlock(job, 'ready')).toBeNull();
    expect(printStepBlock(job, 'delivered')?.reason).toBe('bill_first');
    expect(printStepBlock({ ...job, billedInvoiceKey: 'inv_1' }, 'delivered')).toBeNull();
    expect(printStepBlock({ ...job, items: [SAVED[0]] }, 'delivered')).toBeNull();
    expect(printStepBlock({ ...job, kind: REWORK, items: [] }, 'delivered')).toBeNull();
  });

  it('says why a job cannot be billed', () => {
    const ticket: Pick<PrintJob, 'ticketNumber' | 'billedInvoiceNumber'> = {
      ticketNumber: 'PRN-000001',
    };
    expect(printBillBlockerNotice('no_work', ticket)).toEqual({
      title: 'No items added yet',
      message: 'PRN-000001: add the items before billing it.',
    });
  });
});
