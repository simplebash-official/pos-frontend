import { describe, expect, it } from 'vitest';
import type { Warranty } from '../../types';
import {
  batchHasProblem,
  batchItemFields,
  batchItemProblem,
  emptyBatchItem,
  needsApproval,
  sharingWarranties,
  storySummary,
} from '../batchClaim';
import { emptyIntake, emptyStory } from '../claimIntake';

const warranty = (overrides: Partial<Warranty>): Warranty => ({
  id: '1',
  key: 'wty_1',
  warrantyNumber: 'WTY-000001',
  sourceType: 'product_sale',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000001',
  lineIndex: 0,
  itemName: 'Phone',
  quantity: 1,
  coverage: { kind: 'limited', value: 12, unit: 'months' },
  warrantyType: 'shop',
  unitPriceCents: 100,
  startsOn: '2026-01-01',
  status: 'active',
  claimCount: 0,
  state: 'active',
  version: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const shared = { ...emptyIntake(null), issue: 'Stops charging', damage: 'undamaged' as const };

describe('batch claim items', () => {
  it('starts sharing the story of the whole batch, with the serial the warranty names', () => {
    expect(emptyBatchItem(warranty({ serialNumber: 'SN-1' }))).toEqual({
      quantity: 1,
      serialNumber: 'SN-1',
      photos: [],
      own: null,
    });
    expect(emptyBatchItem(warranty({})).serialNumber).toBe('');
  });

  it('sends every item complete: the shared story, or its own', () => {
    const phone = warranty({ key: 'wty_1' });
    const charger = warranty({ key: 'wty_2', itemName: 'Charger' });
    expect(batchItemFields(phone, emptyBatchItem(phone), shared)).toMatchObject({
      warrantyKey: 'wty_1',
      issueDescription: 'Stops charging',
    });
    const own = {
      ...emptyIntake(charger),
      issue: 'Gets hot',
      damage: 'damaged' as const,
      conditions: ['Liquid damage'],
    };
    expect(batchItemFields(charger, { ...emptyBatchItem(charger), own }, shared)).toMatchObject({
      warrantyKey: 'wty_2',
      issueDescription: 'Gets hot',
      conditions: ['Liquid damage'],
    });
  });

  it('takes the units and a typed serial from the item, not from the story', () => {
    const bulk = warranty({ key: 'wty_3', quantity: 4 });
    const item = { ...emptyBatchItem(bulk), quantity: 2, serialNumber: ' SN-9 ' };
    expect(batchItemFields(bulk, item, shared)).toMatchObject({
      quantity: 2,
      serialNumber: 'SN-9',
    });
    // A single unit sends neither.
    const single = warranty({});
    expect(
      batchItemFields(single, { ...emptyBatchItem(single), quantity: 5 }, shared)
    ).toMatchObject({
      quantity: undefined,
      serialNumber: undefined,
    });
  });

  it('needs what is wrong from the shared story, or from the item that has its own', () => {
    const blank = emptyIntake(null);
    const a = warranty({ key: 'a' });
    const b = warranty({ key: 'b' });
    const items = { a: emptyBatchItem(a), b: emptyBatchItem(b) };

    expect(batchItemProblem(items.a, blank)).toBe('Please say what is wrong with it.');
    expect(batchHasProblem([a, b], items, blank)).toBe(true);
    expect(batchHasProblem([a, b], items, shared)).toBe(false);

    // Every item with its own note no longer needs the shared one...
    const own = { ...emptyIntake(null), issue: 'Own', damage: 'undamaged' as const };
    const allOwn = { a: { ...items.a, own }, b: { ...items.b, own } };
    expect(batchHasProblem([a, b], allOwn, blank)).toBe(false);
    // ...but an own note left blank is still missing.
    expect(batchHasProblem([a, b], { ...allOwn, b: { ...items.b, own: blank } }, shared)).toBe(
      true
    );
  });

  it('asks for a manager only for a warranty that has ended', () => {
    expect(needsApproval({ state: 'expired' })).toBe(true);
    for (const state of ['active', 'expiring_soon', 'under_claim', 'void'] as const) {
      expect(needsApproval({ state })).toBe(false);
    }
  });

  it('knows which warranties tell the shared story', () => {
    const a = warranty({ key: 'a' });
    const b = warranty({ key: 'b' });
    const items = { a: emptyBatchItem(a), b: emptyBatchItem(b) };
    expect(sharingWarranties([a, b], items)).toEqual([a, b]);
    const own = { ...emptyStory(), issue: 'Own', damage: 'undamaged' as const };
    expect(sharingWarranties([a, b], { ...items, b: { ...items.b, own } })).toEqual([a]);
    expect(sharingWarranties([a, b], { a: { ...items.a, own }, b: { ...items.b, own } })).toEqual(
      []
    );
  });

  it('sums a story up in one line only once it is complete', () => {
    expect(storySummary(emptyStory())).toBeNull();
    const story = { ...emptyStory(), issue: ' Stops charging ' };
    expect(storySummary(story)).toBeNull();
    expect(storySummary({ ...story, damage: 'undamaged' })).toBe('“Stops charging” · Undamaged');
    expect(
      storySummary({ ...story, damage: 'damaged', conditions: ['Scratched', 'Liquid damage'] })
    ).toBe('“Stops charging” · Scratched, Liquid damage');
  });
});
