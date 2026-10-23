import { describe, expect, it } from 'vitest';
import { emptyIncomeForm, toIncomeInput, validateIncome } from '../incomeForm';

const filled = () => ({
  ...emptyIncomeForm('2026-10-23'),
  categoryKey: 'ccat_add_cash_scrap',
  amountCents: 150000,
  receivedInto: 'bank' as const,
});

describe('validateIncome', () => {
  it('accepts a complete entry', () => {
    expect(validateIncome(filled())).toBeNull();
  });

  it('says what is missing, one thing at a time', () => {
    expect(validateIncome({ ...filled(), date: '2026-02-30' })).toMatch(/date/);
    expect(validateIncome({ ...filled(), categoryKey: null })).toMatch(/what this money is for/);
    expect(validateIncome({ ...filled(), amountCents: 0 })).toMatch(/amount/);
    expect(validateIncome({ ...filled(), receivedInto: null })).toMatch(/where the money went/);
  });
});

describe('toIncomeInput', () => {
  it('leaves empty optional fields out', () => {
    expect(toIncomeInput(filled())).toEqual({
      incomeDate: '2026-10-23',
      categoryKey: 'ccat_add_cash_scrap',
      payeeKey: undefined,
      payeeName: undefined,
      amountCents: 150000,
      receivedInto: 'bank',
      referenceNo: undefined,
      note: undefined,
    });
  });

  it('sends a saved payer by key and a typed one by name, never both', () => {
    const saved = toIncomeInput({ ...filled(), payeeKey: 'pye_1', payeeName: 'Dialog' });
    expect(saved.payeeKey).toBe('pye_1');
    expect(saved.payeeName).toBeUndefined();
    const typed = toIncomeInput({ ...filled(), payeeName: '  Dialog ' });
    expect(typed.payeeKey).toBeUndefined();
    expect(typed.payeeName).toBe('Dialog');
  });
});
