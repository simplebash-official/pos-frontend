import { describe, expect, it } from 'vitest';
import type { WarrantyClaim } from '../../types';
import { claimActions, claimStages, needsAttention, tickedChecks } from '../claimView';

const CLAIM: WarrantyClaim = {
  id: '1',
  key: 'wcl_1',
  claimNumber: 'WCL-000001',
  warrantyKey: 'wty_1',
  warrantyNumber: 'WTY-000001',
  itemName: 'Galaxy A55',
  serialNumber: '356789012345678',
  productKey: 'prod_1',
  invoiceKey: 'inv_1',
  invoiceNumber: 'INV-000042',
  issueDescription: 'Turns off',
  voidChecks: { screenCracked: false, liquidDamage: false, sealBroken: false, tampered: false },
  status: 'received',
  receivedOn: '2026-11-01',
  ageDays: 2,
  supplierOverdue: false,
  version: 1,
  createdAt: '2026-11-01T05:00:00Z',
  updatedAt: '2026-11-01T05:00:00Z',
};

const states = (claim: WarrantyClaim) =>
  claimStages(claim).map((stage) => `${stage.key}:${stage.state}`);

describe('claimActions', () => {
  it('offers only the steps the server allows from each status', () => {
    expect(claimActions(CLAIM, false)).toEqual(['inspect']);
    expect(claimActions({ ...CLAIM, status: 'inspected' }, false)).toEqual([
      'decide',
      'sendToSupplier',
    ]);
    expect(claimActions({ ...CLAIM, status: 'decided', decision: 'replace' }, false)).toEqual([
      'resolve',
      'sendToSupplier',
    ]);
    expect(claimActions({ ...CLAIM, status: 'decided', decision: 'refund' }, false)).toEqual([
      'refund',
    ]);
    expect(claimActions({ ...CLAIM, status: 'at_supplier' }, false)).toEqual(['supplierReturn']);
    expect(claimActions({ ...CLAIM, status: 'resolved', decision: 'refund' }, false)).toEqual([]);
    expect(claimActions({ ...CLAIM, status: 'resolved', decision: 'repair' }, false)).toEqual([
      'return',
    ]);
  });

  it('turns a rejected claim into a paid repair only once', () => {
    const rejected = { ...CLAIM, status: 'resolved' as const, decision: 'reject' as const };
    expect(claimActions(rejected, false)).toEqual(['return', 'paidRepair']);
    expect(claimActions({ ...rejected, paidRepairKey: 'rep_1' }, false)).toEqual(['return']);
    expect(claimActions({ ...rejected, status: 'returned' }, false)).toEqual(['paidRepair']);
  });

  it('offers one free rework job for repair work decided as a repair', () => {
    const decided = { ...CLAIM, status: 'decided' as const, decision: 'repair' as const };
    expect(claimActions(decided, true)).toEqual(['rework', 'resolve', 'sendToSupplier']);
    expect(claimActions({ ...decided, reworkRepairKey: 'rep_9' }, true)).toEqual([
      'resolve',
      'sendToSupplier',
    ]);
    // A warranty that came with a product, or one not loaded yet, has no job to redo.
    expect(claimActions(decided, false)).toEqual(['resolve', 'sendToSupplier']);
    expect(claimActions({ ...decided, decision: 'replace' }, true)).toEqual([
      'resolve',
      'sendToSupplier',
    ]);
  });
});

describe('claimStages', () => {
  it('marks the step it waits on as current', () => {
    expect(states(CLAIM)).toEqual([
      'received:done',
      'inspected:current',
      'decided:todo',
      'resolved:todo',
      'returned:todo',
    ]);
  });

  it('adds the supplier step while the item is away', () => {
    const away: WarrantyClaim = {
      ...CLAIM,
      status: 'at_supplier',
      supplier: { supplierKey: 'sup_1', supplierName: 'Acme', sentOn: '2026-11-02' },
    };
    expect(states(away)).toEqual([
      'received:done',
      'inspected:done',
      'decided:todo',
      'at_supplier:current',
      'resolved:todo',
      'returned:todo',
    ]);
  });

  it('has no hand-back step for a refund', () => {
    const refunded: WarrantyClaim = { ...CLAIM, status: 'resolved', decision: 'refund' };
    expect(states(refunded)).toEqual([
      'received:done',
      'inspected:done',
      'decided:done',
      'resolved:done',
    ]);
  });
});

describe('needsAttention', () => {
  it('flags a claim open for more than a week or a late supplier, never a finished one', () => {
    expect(needsAttention(CLAIM)).toBe(false);
    expect(needsAttention({ ...CLAIM, ageDays: 8 })).toBe(true);
    expect(needsAttention({ ...CLAIM, ageDays: 30, status: 'returned' })).toBe(false);
    expect(needsAttention({ ...CLAIM, status: 'at_supplier', supplierOverdue: true })).toBe(true);
  });
});

describe('tickedChecks', () => {
  it('lists what staff saw, in words', () => {
    expect(tickedChecks(CLAIM.voidChecks)).toEqual([]);
    expect(tickedChecks({ ...CLAIM.voidChecks, liquidDamage: true, tampered: true })).toEqual([
      'Liquid damage',
      'Opened or tampered with',
    ]);
  });
});
