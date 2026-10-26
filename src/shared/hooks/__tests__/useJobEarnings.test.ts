import { describe, expect, it } from 'vitest';
import { toEarningsRequest } from '../useJobEarnings';

describe('toEarningsRequest', () => {
  it('turns the rupee boxes into cents and keeps a percentage as typed', () => {
    expect(
      toEarningsRequest({
        estimatedPriceRupees: 10000,
        materialCostRupees: '4000.50',
        assignedEmployeeId: 'emp_1',
        splitType: 'percentage',
        splitValueRupeesOrPercent: 30,
      })
    ).toEqual({
      priceCents: 1_000_000,
      materialCostCents: 400_050,
      splitType: 'percentage',
      splitValue: 30,
    });
  });

  it('sends a fixed split in cents', () => {
    expect(
      toEarningsRequest({
        estimatedPriceRupees: 1000,
        materialCostRupees: 0,
        assignedEmployeeId: 'emp_1',
        splitType: 'fixed',
        splitValueRupeesOrPercent: '500',
      }).splitValue
    ).toBe(50_000);
  });

  it('sends no price while the box is empty and no split without an employee', () => {
    const request = toEarningsRequest({
      estimatedPriceRupees: '',
      materialCostRupees: '',
      assignedEmployeeId: '',
      splitType: 'percentage',
      splitValueRupeesOrPercent: 30,
    });
    expect(request.priceCents).toBeNull();
    expect(request.materialCostCents).toBe(0);
    expect(request.splitType).toBeNull();
  });
});
