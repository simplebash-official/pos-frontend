import { describe, expect, it } from 'vitest';
import type { CashMovement } from '../../../../types';
import { filterMovements, kindsPresent } from '../movementLog';

const move = (over: Partial<CashMovement>): CashMovement =>
  ({
    key: 'm',
    movementNumber: 'CSH-000001',
    movementType: 'petty_expense',
    categoryName: 'Tea and refreshments',
    recordedByNameSnapshot: 'Nimal',
    ...over,
  }) as CashMovement;

const list = [
  move({ key: 'a', movementNumber: 'CSH-000001' }),
  move({
    key: 'b',
    movementNumber: 'CSH-000002',
    movementType: 'rent_and_bills',
    categoryName: 'Shop rent',
    payeeName: 'Mr Perera',
  }),
  move({ key: 'c', movementNumber: 'CSH-000003', movementType: 'add_cash', note: 'Change float' }),
];

describe('filterMovements', () => {
  it('keeps everything for "all" and no words', () => {
    expect(filterMovements(list, { kind: 'all', search: '' })).toHaveLength(3);
  });
  it('narrows by kind', () => {
    expect(filterMovements(list, { kind: 'rent_and_bills', search: '' }).map((m) => m.key)).toEqual(
      ['b']
    );
  });
  it('searches the voucher number, category, payee, note and who recorded it, ignoring case and spaces', () => {
    expect(filterMovements(list, { kind: 'all', search: 'CSH-000002' }).map((m) => m.key)).toEqual([
      'b',
    ]);
    expect(filterMovements(list, { kind: 'all', search: 'mr perera' }).map((m) => m.key)).toEqual([
      'b',
    ]);
    expect(
      filterMovements(list, { kind: 'all', search: 'CHANGE FLOAT' }).map((m) => m.key)
    ).toEqual(['c']);
    expect(filterMovements(list, { kind: 'all', search: 'nimal' })).toHaveLength(3);
  });
  it('combines kind and words', () => {
    expect(filterMovements(list, { kind: 'add_cash', search: 'rent' })).toHaveLength(0);
  });
});

describe('kindsPresent', () => {
  it('lists each kind once, in the order first seen', () => {
    expect(kindsPresent([...list, move({ key: 'd' })])).toEqual([
      'petty_expense',
      'rent_and_bills',
      'add_cash',
    ]);
  });
});
