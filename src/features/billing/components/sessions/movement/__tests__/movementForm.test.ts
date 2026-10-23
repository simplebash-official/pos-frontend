import { describe, expect, it } from 'vitest';
import type { CashCategory } from '../../../../types';
import {
  drawerDelta,
  emptyForm,
  isOverDrawer,
  needsPin,
  periodRange,
  switchType,
  toInput,
  validateForm,
} from '../movementForm';

const category = (over: Partial<CashCategory> = {}): CashCategory => ({
  id: 'c1',
  key: 'ccat_petty_expense_1',
  movementType: 'petty_expense',
  name: 'Tea and refreshments',
  reportGroup: 'operating_expense',
  isSystem: true,
  reviewStatus: 'approved',
  pinned: false,
  sortOrder: 0,
  active: true,
  requiresReceipt: false,
  usageCount: 0,
  version: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...over,
});

const where = { terminalId: 'term_1', sessionKey: 'ses_1' };

describe('periodRange', () => {
  it('gives the first and last day of a month, leap years included', () => {
    expect(periodRange('2026-10')).toEqual({ start: '2026-10-01', end: '2026-10-31' });
    expect(periodRange('2026-02')).toEqual({ start: '2026-02-01', end: '2026-02-28' });
    expect(periodRange('2028-02')).toEqual({ start: '2028-02-01', end: '2028-02-29' });
  });
});

describe('needsPin', () => {
  it('is always needed for owner withdrawals and staff payments', () => {
    expect(needsPin('owner_withdrawal', undefined, 100, false)).toBe(true);
    expect(needsPin('staff_payment', undefined, 100, false)).toBe(true);
  });

  it('is needed above a category limit only', () => {
    const limited = category({ requiresApprovalOverCents: 500_000 });
    expect(needsPin('petty_expense', limited, 500_000, false)).toBe(false);
    expect(needsPin('petty_expense', limited, 500_001, false)).toBe(true);
    expect(needsPin('petty_expense', category(), 9_999_999, false)).toBe(false);
  });
});

describe('the drawer', () => {
  it('moves the cash the way each kind of payment does', () => {
    expect(drawerDelta('add_cash', 500)).toBe(500);
    for (const type of [
      'petty_expense',
      'rent_and_bills',
      'staff_payment',
      'supplier_payment',
      'owner_withdrawal',
      'cash_drop',
    ] as const) {
      expect(drawerDelta(type, 500)).toBe(-500);
    }
    expect(drawerDelta('no_sale', 0)).toBe(0);
  });

  it('is over the drawer only for a payout bigger than what it holds, once the figure is known', () => {
    expect(isOverDrawer('petty_expense', 1001, 1000)).toBe(true);
    expect(isOverDrawer('petty_expense', 1000, 1000)).toBe(false);
    expect(isOverDrawer('cash_drop', 5000, 1000)).toBe(true);
    expect(isOverDrawer('add_cash', 5000, 1000)).toBe(false);
    expect(isOverDrawer('petty_expense', 5000, undefined)).toBe(false);
  });

  it('needs a PIN and a reason to go over it', () => {
    const form = { ...emptyForm('petty_expense'), amountCents: 5000, categoryKey: 'k' };
    expect(needsPin('petty_expense', undefined, 5000, true)).toBe(true);
    expect(
      validateForm(form, undefined, {
        pinVerified: false,
        overDrawer: true,
        periodAlreadyPaid: false,
      })
    ).toContain('PIN');
    const pinned = { ...form, managerPin: '5555' };
    expect(
      validateForm(pinned, undefined, {
        pinVerified: true,
        overDrawer: true,
        periodAlreadyPaid: false,
      })
    ).toContain('why');
    expect(
      validateForm({ ...pinned, overrideReason: 'Supplier waiting' }, undefined, {
        pinVerified: true,
        overDrawer: true,
        periodAlreadyPaid: false,
      })
    ).toBeNull();
  });

  it('sends the reason only when it was needed', () => {
    const form = {
      ...emptyForm('petty_expense'),
      amountCents: 5000,
      categoryKey: 'k',
      managerPin: '5555',
      overrideReason: ' Supplier waiting ',
    };
    const where = { terminalId: 't', sessionKey: 's' };
    expect(toInput(form, where, true, true).overrideReason).toBe('Supplier waiting');
    expect(toInput(form, where, false, false).overrideReason).toBeUndefined();
  });
});

describe('a month that is already paid', () => {
  const rent = {
    ...emptyForm('rent_and_bills'),
    amountCents: 100,
    categoryKey: 'k',
    payeeKey: 'pye_1',
    period: '2026-10',
  };
  const context = { pinVerified: false, overDrawer: false, periodAlreadyPaid: true };

  it('asks to confirm another rent payment for the month, and only for rent', () => {
    expect(validateForm(rent, undefined, context)).toContain('already paid');
    expect(validateForm({ ...rent, confirmDuplicate: true }, undefined, context)).toBeNull();
    expect(
      validateForm({ ...rent, confirmDuplicate: false }, undefined, {
        ...context,
        periodAlreadyPaid: false,
      })
    ).toBeNull();
  });

  it('sends the confirmation only on rent', () => {
    const where = { terminalId: 't' };
    expect(toInput({ ...rent, confirmDuplicate: true }, where, false, false).confirmDuplicate).toBe(
      true
    );
    const petty = {
      ...emptyForm('petty_expense'),
      categoryKey: 'k',
      amountCents: 1,
      confirmDuplicate: true,
    };
    expect(toInput(petty, where, false, false).confirmDuplicate).toBeUndefined();
  });
});

describe('switchType', () => {
  it('starts the type-specific fields over but keeps the amount and note', () => {
    const form = {
      ...emptyForm('petty_expense'),
      amountCents: 1500,
      note: 'Biscuits',
      categoryKey: 'ccat_x',
      payeeName: 'Corner shop',
    };
    const next = switchType(form, 'supplier_payment');
    expect(next.type).toBe('supplier_payment');
    expect(next.amountCents).toBe(1500);
    expect(next.note).toBe('Biscuits');
    expect(next.categoryKey).toBeNull();
    expect(next.payeeName).toBe('');
  });
});

describe('validateForm', () => {
  const ready = { ...emptyForm('petty_expense'), amountCents: 1500, categoryKey: 'ccat_x' };

  it('accepts a complete small expense', () => {
    expect(
      validateForm(ready, category(), {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toBeNull();
  });

  it('asks for an amount, except for a no-sale open', () => {
    expect(
      validateForm({ ...ready, amountCents: 0 }, category(), {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toContain('amount');
    const noSale = { ...emptyForm('no_sale'), categoryKey: 'ccat_x' };
    expect(
      validateForm(noSale, category(), {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toBeNull();
  });

  it('asks for a category', () => {
    expect(
      validateForm({ ...ready, categoryKey: null }, undefined, {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toContain('for');
  });

  it('asks for what each kind of payment needs', () => {
    const rent = { ...emptyForm('rent_and_bills'), amountCents: 100, categoryKey: 'k' };
    expect(
      validateForm(rent, undefined, {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toContain('who');
    expect(
      validateForm({ ...rent, payeeKey: 'pye_1' }, undefined, {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toContain('month');
    expect(
      validateForm({ ...rent, payeeKey: 'pye_1', period: '2026-10' }, undefined, {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toBeNull();

    const supplier = { ...emptyForm('supplier_payment'), amountCents: 100, categoryKey: 'k' };
    expect(
      validateForm(supplier, undefined, {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toContain('supplier');

    const owner = { ...emptyForm('owner_withdrawal'), amountCents: 100, categoryKey: 'k' };
    expect(
      validateForm(owner, undefined, {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toContain('took the cash');
  });

  it('wants a PIN that has been checked when one is needed', () => {
    const owner = {
      ...emptyForm('owner_withdrawal'),
      amountCents: 100,
      categoryKey: 'k',
      payeeName: 'Mr. Silva',
    };
    expect(
      validateForm(owner, undefined, {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toContain('PIN');
    expect(
      validateForm({ ...owner, managerPin: '1234' }, undefined, {
        pinVerified: false,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toContain('Verify');
    expect(
      validateForm({ ...owner, managerPin: '1234' }, undefined, {
        pinVerified: true,
        overDrawer: false,
        periodAlreadyPaid: false,
      })
    ).toBeNull();
  });
});

describe('toInput', () => {
  it('sends a small expense with a typed name and reference only', () => {
    const form = {
      ...emptyForm('petty_expense'),
      amountCents: 1500,
      categoryKey: 'ccat_x',
      payeeName: ' Corner shop ',
      referenceNo: 'B-12',
      note: '',
      period: '2026-10',
    };
    expect(toInput(form, where, false, false)).toEqual({
      movementType: 'petty_expense',
      amountCents: 1500,
      sessionKey: 'ses_1',
      terminalId: 'term_1',
      categoryKey: 'ccat_x',
      customLabel: undefined,
      note: undefined,
      managerPin: undefined,
      payeeKey: undefined,
      payeeName: 'Corner shop',
      referenceNo: 'B-12',
    });
  });

  it('sends a saved payee by key, never also by name', () => {
    const form = {
      ...emptyForm('petty_expense'),
      amountCents: 100,
      categoryKey: 'k',
      payeeKey: 'pye_1',
      payeeName: 'stale',
    };
    const input = toInput(form, where, false, false);
    expect(input.payeeKey).toBe('pye_1');
    expect(input.payeeName).toBeUndefined();
  });

  it('turns the rent month into a period and keeps the PIN only when approval is needed', () => {
    const form = {
      ...emptyForm('rent_and_bills'),
      amountCents: 5_000_000,
      categoryKey: 'k',
      payeeKey: 'pye_1',
      period: '2026-10',
      managerPin: '1234',
    };
    const input = toInput(form, where, false, false);
    expect(input.periodStart).toBe('2026-10-01');
    expect(input.periodEnd).toBe('2026-10-31');
    expect(input.managerPin).toBeUndefined();
    expect(toInput(form, where, true, false).managerPin).toBe('1234');
  });

  it('sends no amount for a no-sale open', () => {
    const form = { ...emptyForm('no_sale'), amountCents: 999, categoryKey: 'k' };
    expect(toInput(form, where, false, false).amountCents).toBe(0);
  });

  it('sends a between-shifts movement without a session', () => {
    const form = { ...emptyForm('cash_drop'), amountCents: 100, categoryKey: 'k' };
    expect(toInput(form, { terminalId: 't' }, false, false).sessionKey).toBeUndefined();
  });
});
