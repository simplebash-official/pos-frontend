import { describe, expect, it } from 'vitest';
import { toSplit } from '../useJobEarnings';

describe('toSplit', () => {
  it('keeps a percentage as typed', () => {
    expect(
      toSplit({
        assignedEmployeeId: 'emp_1',
        splitType: 'percentage',
        splitValueRupeesOrPercent: 30,
      })
    ).toEqual({ splitType: 'percentage', splitValue: 30 });
  });

  it('sends a fixed split in cents', () => {
    expect(
      toSplit({
        assignedEmployeeId: 'emp_1',
        splitType: 'fixed',
        splitValueRupeesOrPercent: '500',
      }).splitValue
    ).toBe(50_000);
  });

  it('sends no split without an employee', () => {
    const split = toSplit({
      assignedEmployeeId: '',
      splitType: 'percentage',
      splitValueRupeesOrPercent: 30,
    });
    expect(split.splitType).toBeNull();
  });
});
