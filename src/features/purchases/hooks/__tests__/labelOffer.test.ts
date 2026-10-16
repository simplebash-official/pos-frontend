import { describe, it, expect, vi } from 'vitest';

vi.mock('@/features/labels', () => ({ offerLabelPrint: vi.fn() }));

import { labelOfferFor } from '../usePurchases';

const intake = {
  supplierKey: 'sup_1',
  productKey: 'prod_cable',
  quantity: 12,
  unitCostCents: 40000,
  sellingPriceCents: 65000,
  date: '2026-10-16T09:00:00Z',
};

describe('labels offered for a stock intake', () => {
  it('offers one label per unit received, at its selling price', () => {
    expect(labelOfferFor(intake)).toEqual({
      productKey: 'prod_cable',
      copies: 12,
      priceCents: 65000,
      serialNumbers: null,
    });
  });

  it('offers one label for each serial unit received', () => {
    expect(labelOfferFor({ ...intake, quantity: 2, serialNumbers: ['A1', 'A2'] })).toEqual({
      productKey: 'prod_cable',
      copies: 1,
      priceCents: 65000,
      serialNumbers: ['A1', 'A2'],
    });
  });
});
