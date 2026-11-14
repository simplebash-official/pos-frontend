import { describe, it, expect } from 'vitest';
import {
  buildCreateInput,
  marginOf,
  seedFromTerm,
  validateDraft,
  UNCATEGORIZED_CATEGORY_KEY,
  UNCATEGORIZED_SUBCATEGORY_KEY,
  type QuickAddDraft,
} from '../quickAddItem';

const draft = (over: Partial<QuickAddDraft> = {}): QuickAddDraft => ({
  name: 'Phone case',
  barcodeMode: 'generate',
  barcode: '',
  category: { kind: 'existing', key: UNCATEGORIZED_CATEGORY_KEY },
  subcategory: { kind: 'existing', key: UNCATEGORIZED_SUBCATEGORY_KEY },
  quantity: 4,
  costPrice: 250,
  sellingPrice: 400,
  warranty: { coverage: { kind: 'none' } },
  ...over,
});

describe('seedFromTerm', () => {
  it('uses a barcode-shaped term as the barcode and leaves the name empty', () => {
    expect(seedFromTerm(' 890 1234 5678 90 ')).toEqual({
      name: '',
      barcodeMode: 'enter',
      barcode: '8901234567890',
    });
  });

  it('uses any other term as the name and lets the shop number the barcode', () => {
    expect(seedFromTerm('phone case blue')).toEqual({
      name: 'phone case blue',
      barcodeMode: 'generate',
      barcode: '',
    });
  });

  it('seeds nothing for an empty term', () => {
    expect(seedFromTerm('   ')).toEqual({ name: '', barcodeMode: 'generate', barcode: '' });
  });
});

describe('marginOf', () => {
  it('is null until both prices are positive', () => {
    expect(marginOf('', 400)).toBeNull();
    expect(marginOf(250, '')).toBeNull();
    expect(marginOf(0, 400)).toBeNull();
  });

  it('works out profit and margin as a share of the selling price', () => {
    expect(marginOf(300, 400)).toEqual({ profit: 100, marginPct: 25 });
  });

  it('keeps a loss negative', () => {
    expect(marginOf(500, 400)).toEqual({ profit: -100, marginPct: -25 });
  });
});

describe('validateDraft', () => {
  it('accepts a complete draft', () => {
    expect(validateDraft(draft())).toEqual({});
  });

  it('asks for every missing required field', () => {
    const errors = validateDraft(
      draft({
        name: '  ',
        category: null,
        subcategory: null,
        quantity: '',
        costPrice: '',
        sellingPrice: '',
      })
    );
    expect(Object.keys(errors).sort()).toEqual([
      'category',
      'costPrice',
      'name',
      'quantity',
      'sellingPrice',
      'subcategory',
    ]);
  });

  it('rejects a fractional or zero quantity and a zero selling price', () => {
    expect(validateDraft(draft({ quantity: 1.5 })).quantity).toBeDefined();
    expect(validateDraft(draft({ quantity: 0 })).quantity).toBeDefined();
    expect(validateDraft(draft({ sellingPrice: 0 })).sellingPrice).toBeDefined();
  });

  it('allows a cost of zero', () => {
    expect(validateDraft(draft({ costPrice: 0 })).costPrice).toBeUndefined();
  });

  it('checks a typed barcode but not a generated one', () => {
    expect(validateDraft(draft({ barcodeMode: 'enter', barcode: '12ab' })).barcode).toBeDefined();
    expect(validateDraft(draft({ barcodeMode: 'enter', barcode: '8901234567890' }))).toEqual({});
    expect(validateDraft(draft({ barcodeMode: 'generate', barcode: 'junk' }))).toEqual({});
  });

  it('needs a name for a new category and a new subcategory', () => {
    const errors = validateDraft(
      draft({
        category: { kind: 'new', name: ' ', icon: 'Box', color: 'blue' },
        subcategory: { kind: 'new', name: '' },
      })
    );
    expect(errors.category).toBeDefined();
    expect(errors.subcategory).toBeDefined();
  });

  it('reports a warranty that has no period', () => {
    const errors = validateDraft(
      draft({
        warranty: { coverage: { kind: 'limited', value: 0, unit: 'months' }, warrantyType: 'shop' },
      })
    );
    expect(errors.warranty).toBeDefined();
  });
});

describe('buildCreateInput', () => {
  it('sends the opening stock in cents, one non-serialized item, no low-stock alert', () => {
    const input = buildCreateInput(draft({ name: '  Phone case ' }), 'cat_a', 'sub_a');
    expect(input).toEqual({
      name: 'Phone case',
      categoryKey: 'cat_a',
      subcategoryKey: 'sub_a',
      openingStock: { quantity: 4, unitCostCents: 25000, sellingPriceCents: 40000 },
      minStockThreshold: 0,
      isSerialized: false,
      warranty: { coverage: { kind: 'none' } },
      autoGenerateBarcode: true,
    });
  });

  it('sends a typed barcode instead of asking the shop to number one', () => {
    const input = buildCreateInput(
      draft({ barcodeMode: 'enter', barcode: ' 8901234567890 ' }),
      'cat_a',
      'sub_a'
    );
    expect(input.autoGenerateBarcode).toBe(false);
    expect(input.barcode).toBe('8901234567890');
  });

  it('refuses a draft that was not validated', () => {
    expect(() => buildCreateInput(draft({ quantity: '' }), 'cat_a', 'sub_a')).toThrow();
  });
});
