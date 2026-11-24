import { describe, expect, it } from 'vitest';
import type { CartItem } from '@/store/slices/cartSlice';
import { effectiveHandover, handoverBlockers, isTicketLine } from '../handover';

const line = (overrides: Partial<CartItem>): CartItem => ({
  id: 'line',
  productId: 'rep_1',
  name: 'Repair',
  unitPriceCents: 1000,
  quantity: 1,
  discount: null,
  ...overrides,
});

describe('isTicketLine', () => {
  it('is true for a repair or print job and false for everything else', () => {
    expect(isTicketLine(line({ sourceType: 'repair' }))).toBe(true);
    expect(isTicketLine(line({ sourceType: 'print' }))).toBe(true);
    expect(isTicketLine(line({ sourceType: 'retail' }))).toBe(false);
    expect(isTicketLine(line({ sourceType: 'charge' }))).toBe(false);
    expect(isTicketLine(line({}))).toBe(false);
  });
});

describe('effectiveHandover', () => {
  it('hands over now on a paid sale when nothing was chosen', () => {
    expect(effectiveHandover(line({ sourceType: 'repair' }), false)).toBe('now');
  });

  it('asks on a credit sale: nothing is assumed', () => {
    expect(effectiveHandover(line({ sourceType: 'repair' }), true)).toBeNull();
  });

  it('keeps what the cashier chose, whatever the kind of sale', () => {
    expect(effectiveHandover(line({ handover: 'later' }), false)).toBe('later');
    expect(effectiveHandover(line({ handover: 'later' }), true)).toBe('later');
    expect(effectiveHandover(line({ handover: 'now' }), true)).toBe('now');
  });
});

describe('handoverBlockers', () => {
  const repair = line({ id: 'a', sourceType: 'repair' });
  const print = line({ id: 'b', sourceType: 'print', handover: 'later' });
  const retail = line({ id: 'c', sourceType: 'retail' });

  it('lists nothing on a paid sale', () => {
    expect(handoverBlockers([repair, print, retail], false)).toEqual([]);
  });

  it('lists the ticket lines on a credit sale that are still unchosen', () => {
    expect(handoverBlockers([repair, print, retail], true)).toEqual([repair]);
  });

  it('lists nothing once every ticket line is chosen', () => {
    expect(handoverBlockers([{ ...repair, handover: 'now' }, print, retail], true)).toEqual([]);
  });
});
