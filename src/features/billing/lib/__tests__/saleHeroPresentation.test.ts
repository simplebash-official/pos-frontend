import { describe, it, expect } from 'vitest';
import { getSaleHeroPresentation } from '../saleHeroPresentation';
import type { Invoice } from '../../types';

const baseInvoice = (overrides: Partial<Invoice>): Invoice =>
  ({
    id: 'inv_1',
    invoiceNumber: 'INV-0001',
    subtotalCents: 150000,
    discountCents: 0,
    totalCents: 150000,
    paymentMethod: 'credit',
    status: 'partially_paid',
    isOverdue: false,
    creditNoteCount: 0,
    hasCreditNotes: false,
    refundedCents: 0,
    createdAt: '2026-09-03T10:00:00Z',
    items: [{ quantity: 1 } as Invoice['items'][number]],
    ...overrides,
  }) as Invoice;

describe('getSaleHeroPresentation', () => {
  it('marks a partial-credit sale and shows the balance as the hero amount', () => {
    const invoice = baseInvoice({
      isCredit: true,
      amountReceivedCents: 50000,
      status: 'partially_paid',
      dueDate: '2026-12-31',
    });

    const hero = getSaleHeroPresentation(invoice, 0);

    expect(hero.isPartialCredit).toBe(true);
    expect(hero.paidNowCents).toBe(50000);
    expect(hero.balanceDueCents).toBe(100000);
    expect(hero.heroAmountCents).toBe(100000);
    expect(hero.heroCaption).toContain('PAID');
    expect(hero.heroColor).toBe('amber');
  });

  it('a plain credit sale (no deposit) is not partial and shows the full total', () => {
    const invoice = baseInvoice({
      isCredit: true,
      amountReceivedCents: 0,
      status: 'pending',
    });

    const hero = getSaleHeroPresentation(invoice, 0);

    expect(hero.isCreditCompleted).toBe(true);
    expect(hero.isPartialCredit).toBe(false);
    expect(hero.heroAmountCents).toBe(150000);
    expect(hero.heroCaption).toBe('BALANCE DUE · ON ACCOUNT');
  });

  it('a fully paid cash sale is unaffected', () => {
    const invoice = baseInvoice({
      isCredit: false,
      paymentMethod: 'cash',
      status: 'paid',
      amountReceivedCents: 150000,
    });

    const hero = getSaleHeroPresentation(invoice, 0);

    expect(hero.isPartialCredit).toBe(false);
    expect(hero.isCreditCompleted).toBe(false);
    expect(hero.heroAmountCents).toBe(150000);
  });
});
