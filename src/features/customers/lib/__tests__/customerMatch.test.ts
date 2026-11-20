/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import type { Customer } from '../../types';
import { findNameMatches, findPhoneMatch, normalizePhone } from '../customerMatch';

const customer = (overrides: Partial<Customer>): Customer => ({
  id: 'c1',
  key: 'cus_1',
  name: 'Nimal Perera',
  primaryPhone: '0771234567',
  tags: [],
  outstandingBalanceCents: 0,
  totalPurchasesCents: 0,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
  ...overrides,
});

const NIMAL = customer({});
const KAMAL = customer({ id: 'c2', key: 'cus_2', name: 'Kamal Silva', primaryPhone: '0112345678' });

describe('normalizePhone', () => {
  it('reads every way of writing a number the same', () => {
    expect(normalizePhone('0771234567')).toBe('771234567');
    expect(normalizePhone('+94 77 123 4567')).toBe('771234567');
    expect(normalizePhone('77-123-4567')).toBe('771234567');
  });

  it('keeps a short number as typed', () => {
    expect(normalizePhone('077 12')).toBe('07712');
  });
});

describe('findPhoneMatch', () => {
  it('finds the customer whatever the format typed', () => {
    expect(findPhoneMatch([KAMAL, NIMAL], '+94771234567')).toBe(NIMAL);
    expect(findPhoneMatch([KAMAL, NIMAL], '077 123 4567')).toBe(NIMAL);
  });

  it('also checks the second number', () => {
    const withBackup = customer({ secondaryPhone: '0719876543' });
    expect(findPhoneMatch([withBackup], '071-987-6543')).toBe(withBackup);
  });

  it('says nothing while the number is still short or unknown', () => {
    expect(findPhoneMatch([NIMAL], '07712')).toBeNull();
    expect(findPhoneMatch([NIMAL], '0779999999')).toBeNull();
    expect(findPhoneMatch([NIMAL], '')).toBeNull();
  });
});

describe('findNameMatches', () => {
  it('ignores case and spacing', () => {
    expect(findNameMatches([NIMAL, KAMAL], 'nimalperera', 3)).toEqual([NIMAL]);
    expect(findNameMatches([NIMAL, KAMAL], 'KAMAL', 3)).toEqual([KAMAL]);
  });

  it('waits for two letters', () => {
    expect(findNameMatches([NIMAL], 'n', 3)).toEqual([]);
    expect(findNameMatches([NIMAL], '  ', 3)).toEqual([]);
  });

  it('stops at the limit', () => {
    const many = ['a', 'b', 'c', 'd'].map((x) => customer({ id: x, key: x, name: `Nimal ${x}` }));
    expect(findNameMatches(many, 'nimal', 3)).toHaveLength(3);
  });
});
