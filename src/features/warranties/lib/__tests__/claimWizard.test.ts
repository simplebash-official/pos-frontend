import { describe, expect, it } from 'vitest';
import type { Warranty } from '../../types';
import { withConditions, withDamage } from '../claimIntake';
import {
  canReplaceFromStock,
  confirmLabel,
  emptyWizard,
  firstProblem,
  nextStep,
  previousStep,
  replacementOf,
  reviewRows,
  startedClaimOf,
  stepProblem,
  toProcessInput,
  type WizardState,
} from '../claimWizard';

const WARRANTY = {
  key: 'wty_1',
  sourceType: 'product_sale',
  productKey: 'prod_1',
  itemName: 'Galaxy A55',
  serialNumber: 'IMEI-1',
  quantity: 1,
  state: 'active',
  endsOn: '2027-11-02',
} as Warranty;

/** A wizard with the first two steps answered. */
const answered = (): WizardState => {
  const state = emptyWizard(WARRANTY);
  return {
    ...state,
    intake: withDamage({ ...state.intake, issue: '  Will not switch on ' }, 'undamaged'),
    found: ' Board is dead ',
  };
};

describe('the claim wizard rules', () => {
  it('starts with nothing chosen', () => {
    const state = emptyWizard(WARRANTY);
    expect(state.decision).toBeNull();
    expect(state.repairWhen).toBeNull();
    expect(state.handBack).toBeNull();
    expect(state.serial).toBeNull();
    expect(state.priceCents).toBeNull();
    expect(firstProblem(state, WARRANTY)?.step).toBe('item');
  });

  it('asks for each step in turn', () => {
    const empty = emptyWizard(WARRANTY);
    expect(stepProblem('item', empty, WARRANTY)).toBe('Please say what is wrong with it.');
    const damaged = {
      ...empty,
      intake: withDamage({ ...empty.intake, issue: 'Cracked' }, 'damaged'),
    };
    expect(stepProblem('item', damaged, WARRANTY)).toBe(
      'Tick what is damaged, or choose Undamaged.'
    );
    const ticked = {
      ...damaged,
      intake: withConditions(damaged.intake, ['Physical damage / cracks']),
    };
    expect(stepProblem('item', ticked, WARRANTY)).toBeNull();

    expect(stepProblem('inspection', empty, WARRANTY)).toBe('Please say what you found.');
    expect(stepProblem('inspection', { ...empty, found: '   ' }, WARRANTY)).not.toBeNull();
    expect(stepProblem('decision', empty, WARRANTY)).toBe('Choose what to do.');
    expect(stepProblem('review', empty, WARRANTY)).toBeNull();
  });

  it('refuses a replacement of repair work, which has no unit in stock', () => {
    const repairWork = { ...WARRANTY, sourceType: 'repair', productKey: undefined } as Warranty;
    expect(canReplaceFromStock(WARRANTY)).toBe(true);
    expect(canReplaceFromStock(repairWork)).toBe(false);
    expect(
      stepProblem('decision', { ...emptyWizard(repairWork), decision: 'replace' }, repairWork)
    ).toBe('This was repair work, so there is no unit in stock to swap.');
    expect(
      stepProblem('decision', { ...emptyWizard(repairWork), decision: 'repair' }, repairWork)
    ).toBeNull();
  });

  it('wants the outcome the decision needs', () => {
    const base = answered();
    const outcome = (change: Partial<WizardState>) =>
      stepProblem('outcome', { ...base, ...change }, WARRANTY);
    expect(outcome({ decision: null })).toBe('Choose what to do.');
    expect(outcome({ decision: 'replace' })).toBe('Choose the new unit.');
    expect(outcome({ decision: 'replace', serial: 'IMEI-2' })).toBeNull();
    expect(outcome({ decision: 'repair' })).toBe('Say whether the repair is finished.');
    expect(outcome({ decision: 'repair', repairWhen: 'later' })).toBeNull();
    expect(outcome({ decision: 'reject' })).toBe('Say whether the item goes back now.');
    expect(outcome({ decision: 'reject', handBack: false })).toBeNull();
    expect(outcome({ decision: 'refund' })).toBeNull();
  });

  it('picks the new unit by serial or by price, as the faulty one allows', () => {
    const serialized = { ...answered(), serial: 'IMEI-2', priceCents: '150000' };
    expect(replacementOf(WARRANTY, serialized)).toEqual({ serialNumber: 'IMEI-2' });
    const plain = { ...WARRANTY, serialNumber: undefined } as Warranty;
    const byPrice = { ...emptyWizard(plain), priceCents: '150000', serial: 'IMEI-2' };
    expect(replacementOf(plain, byPrice)).toEqual({ sellingPriceCents: 150_000 });
    expect(replacementOf(plain, { ...byPrice, priceCents: null })).toBeNull();
  });

  it('builds nothing while something is unanswered', () => {
    expect(toProcessInput(WARRANTY, emptyWizard(WARRANTY))).toBeNull();
    expect(toProcessInput(WARRANTY, answered())).toBeNull();
    expect(toProcessInput(WARRANTY, { ...answered(), decision: 'repair' })).toBeNull();
  });

  it('builds the one request for each decision', () => {
    const base = answered();
    const input = (change: Partial<WizardState>) =>
      toProcessInput(WARRANTY, { ...base, ...change });

    const replace = input({ decision: 'replace', serial: 'IMEI-2', note: '  Swapped ' });
    expect(replace).toMatchObject({
      warrantyKey: 'wty_1',
      issueDescription: 'Will not switch on',
      inspectionNotes: 'Board is dead',
      outcome: {
        decision: 'replace',
        replacement: { serialNumber: 'IMEI-2' },
        resolutionNote: 'Swapped',
      },
    });
    expect(replace).not.toHaveProperty('approval');
    expect(input({ decision: 'replace', serial: 'IMEI-2' })?.outcome).toEqual({
      decision: 'replace',
      replacement: { serialNumber: 'IMEI-2' },
      resolutionNote: undefined,
    });

    expect(input({ decision: 'repair', repairWhen: 'now', note: 'New port' })?.outcome).toEqual({
      decision: 'repair',
      finish: { when: 'now', resolutionNote: 'New port' },
    });
    expect(input({ decision: 'repair', repairWhen: 'later', note: 'ignored' })?.outcome).toEqual({
      decision: 'repair',
      finish: { when: 'later' },
    });
    expect(input({ decision: 'refund' })?.outcome).toEqual({ decision: 'refund' });
    expect(input({ decision: 'reject', handBack: true })?.outcome).toEqual({
      decision: 'reject',
      handBack: true,
    });
    expect(input({ decision: 'reject', handBack: false })?.outcome).toEqual({
      decision: 'reject',
      handBack: false,
    });
  });

  it('words the last button after what it does', () => {
    const base = answered();
    expect(confirmLabel({ ...base, decision: 'replace' })).toBe('Hand over the new unit');
    expect(confirmLabel({ ...base, decision: 'repair', repairWhen: 'now' })).toBe(
      'Mark as repaired and give back'
    );
    expect(confirmLabel({ ...base, decision: 'repair', repairWhen: 'later' })).toBe(
      'Save the claim'
    );
    expect(confirmLabel({ ...base, decision: 'refund' })).toBe('Save and open the credit note');
    expect(confirmLabel({ ...base, decision: 'reject', handBack: true })).toBe(
      'Reject and give back'
    );
    expect(confirmLabel({ ...base, decision: 'reject', handBack: false })).toBe('Reject the claim');
  });

  it('summarises every answer for the review, each pointing at the step to change it', () => {
    const rows = reviewRows(WARRANTY, {
      ...answered(),
      decision: 'replace',
      serial: 'IMEI-2',
    });
    expect(rows.map((row) => [row.step, row.label, row.value])).toEqual([
      ['item', 'Item', 'Galaxy A55 · IMEI-1'],
      ['item', 'What is wrong', 'Will not switch on'],
      ['item', 'Condition', 'Undamaged'],
      ['inspection', 'Found', 'Board is dead'],
      ['decision', 'Decision', 'Replace it'],
      ['outcome', 'Outcome', 'New unit: IMEI-2'],
    ]);
  });

  it('moves one step at a time and stops at both ends', () => {
    expect(previousStep('item')).toBeNull();
    expect(nextStep('item')).toBe('inspection');
    expect(nextStep('outcome')).toBe('review');
    expect(nextStep('review')).toBeNull();
    expect(previousStep('review')).toBe('outcome');
  });

  it('reads the claim a failed request had already opened', () => {
    expect(startedClaimOf({ details: { claimKey: 'wcl_1', claimNumber: 'WCL-000001' } })).toEqual({
      key: 'wcl_1',
      number: 'WCL-000001',
    });
    expect(startedClaimOf({ details: { claimKey: 'wcl_1' } })).toBeNull();
    expect(startedClaimOf({ details: { key: 'wcl_1' } })).toBeNull();
    expect(startedClaimOf({ message: 'No' })).toBeNull();
    expect(startedClaimOf(null)).toBeNull();
    expect(startedClaimOf('nope')).toBeNull();
  });
});
