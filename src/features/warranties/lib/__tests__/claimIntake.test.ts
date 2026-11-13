import { describe, expect, it } from 'vitest';
import type { Warranty } from '../../types';
import {
  emptyIntake,
  intakeClaimFields,
  intakeProblem,
  unclaimedUnits,
  withConditions,
} from '../claimIntake';

const warranty = (overrides: Partial<Warranty>): Warranty => ({
  id: '1',
  key: 'wty_1',
  warrantyNumber: 'WTY-000001',
  sourceType: 'product_sale',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000001',
  lineIndex: 0,
  itemName: 'Phone',
  quantity: 1,
  coverage: { kind: 'limited', value: 12, unit: 'months' },
  warrantyType: 'shop',
  unitPriceCents: 100,
  startsOn: '2026-01-01',
  status: 'active',
  claimCount: 0,
  state: 'active',
  version: 1,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('claim intake', () => {
  it('starts empty, with the serial number the warranty already names', () => {
    expect(emptyIntake(null).serialNumber).toBe('');
    expect(emptyIntake(warranty({ serialNumber: 'SN-1' })).serialNumber).toBe('SN-1');
    expect(emptyIntake(null)).toMatchObject({ quantity: 1, issue: '', conditions: [], photos: [] });
  });

  it('needs the customer to say what is wrong', () => {
    const state = emptyIntake(null);
    expect(intakeProblem(state)).toBe('Please say what is wrong with it.');
    expect(intakeProblem({ ...state, issue: '   ' })).toBe('Please say what is wrong with it.');
    expect(intakeProblem({ ...state, issue: 'Will not charge' })).toBeNull();
  });

  it('describes the claim to open from what was typed', () => {
    const state = { ...emptyIntake(null), issue: '  Cracked  ', conditions: ['Liquid damage'] };
    expect(intakeClaimFields(warranty({}), state)).toEqual({
      warrantyKey: 'wty_1',
      quantity: undefined,
      serialNumber: undefined,
      issueDescription: 'Cracked',
      voidChecks: state.checks,
      conditions: ['Liquid damage'],
    });
  });

  it('sends the units and a typed serial only where they can differ', () => {
    const state = { ...emptyIntake(null), issue: 'Broken', quantity: 2, serialNumber: ' SN-9 ' };
    // Several units, no serial on the warranty: the quantity and the typed serial go along.
    expect(intakeClaimFields(warranty({ quantity: 4 }), state)).toMatchObject({
      quantity: 2,
      serialNumber: 'SN-9',
    });
    // The warranty names its own serial, so a typed one is ignored.
    expect(
      intakeClaimFields(warranty({ quantity: 4, serialNumber: 'SN-1' }), state).serialNumber
    ).toBeUndefined();
  });
  it('works out the void checks from the ticked conditions in one place', () => {
    const state = emptyIntake(null);
    const ticked = withConditions(state, ['Physical damage / cracks', 'Opened or tampered with']);
    expect(ticked.conditions).toEqual(['Physical damage / cracks', 'Opened or tampered with']);
    expect(ticked.checks).toMatchObject({
      physicalDamage: true,
      liquidDamage: false,
      sealBroken: false,
      tampered: true,
    });
    // Untick everything and the checks clear again; the rest of the intake is untouched.
    const cleared = withConditions({ ...ticked, issue: 'Cracked' }, []);
    expect(cleared.checks).toMatchObject({ physicalDamage: false, tampered: false });
    expect(cleared.issue).toBe('Cracked');
  });

  it('counts the units nobody has claimed yet, never below one', () => {
    expect(unclaimedUnits(warranty({ quantity: 4 }))).toBe(4);
    expect(unclaimedUnits(warranty({ quantity: 4, claimedQuantity: 3 }))).toBe(1);
    expect(unclaimedUnits(warranty({ quantity: 2, claimedQuantity: 2 }))).toBe(1);
  });
});
