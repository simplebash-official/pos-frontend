/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import type { RepairItem, RepairJob } from '../../types';
import { billBlocker, billBlockerNotice } from '../billable';

const ITEM: RepairItem = {
  key: 'rit_1',
  description: 'Replace screen',
  laborCents: 250_000,
  partCents: 0,
  partCostCents: 0,
  warranty: { coverage: { kind: 'none' }, warrantyType: 'shop' },
};

const JOB: RepairJob = {
  id: 'rep_1',
  ticketNumber: 'REP-000001',
  customerKey: 'cus_nimal',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  deviceModel: 'Galaxy A55',
  issueDescription: 'Cracked screen',
  status: 'ready',
  kind: { kind: 'standard' },
  items: [ITEM],
  priceCents: 250_000,
  costCents: 0,
  createdAt: '2026-11-03T05:00:00Z',
};

const REWORK_KIND = {
  kind: 'warranty_rework',
  claimKey: 'wcl_1',
  claimNumber: 'WCL-000001',
  originalRepairKey: 'rep_0',
  originalTicketNumber: 'REP-000000',
} as const;

describe('billBlocker', () => {
  it('lets a job with work on it be billed at any open status', () => {
    for (const status of ['received', 'diagnosing', 'in_repair', 'ready'] as const) {
      expect(billBlocker({ ...JOB, status })).toBeNull();
    }
  });

  it('blocks a warranty rework, a handed-back job, a cancelled job and a job with no work', () => {
    expect(billBlocker({ ...JOB, kind: REWORK_KIND })).toBe('warranty_rework');
    expect(billBlocker({ ...JOB, status: 'delivered' })).toBe('already_handed_back');
    expect(billBlocker({ ...JOB, status: 'cancelled' })).toBe('cancelled');
    expect(billBlocker({ ...JOB, items: [] })).toBe('no_work');
  });

  it('names the first reason when several apply', () => {
    expect(billBlocker({ ...JOB, kind: REWORK_KIND, status: 'delivered', items: [] })).toBe(
      'warranty_rework'
    );
    expect(billBlocker({ ...JOB, status: 'delivered', items: [] })).toBe('already_handed_back');
    expect(
      billBlocker({ ...JOB, status: 'ready', billedInvoiceNumber: 'INV-000034', items: [{}] })
    ).toBe('already_billed');
    expect(
      billBlocker({ ...JOB, status: 'delivered', billedInvoiceNumber: 'INV-000034', items: [{}] })
    ).toBe('already_billed');
    expect(billBlocker({ ...JOB, status: 'cancelled', items: [] })).toBe('cancelled');
  });

  it('judges a job as typed in the form: a status and a list of work', () => {
    expect(billBlocker({ kind: JOB.kind, status: 'ready', items: [{}] })).toBeNull();
    expect(billBlocker({ kind: JOB.kind, status: 'ready', items: [] })).toBe('no_work');
  });
});

describe('billBlockerNotice', () => {
  it('says which ticket and why, for every reason', () => {
    for (const blocker of [
      'warranty_rework',
      'already_billed',
      'already_handed_back',
      'cancelled',
      'no_work',
    ] as const) {
      const notice = billBlockerNotice(blocker, {
        ticketNumber: 'REP-000001',
        billedInvoiceNumber: 'INV-000034',
      });
      expect(notice.title.length).toBeGreaterThan(0);
      expect(notice.message.startsWith('REP-000001: ')).toBe(true);
    }
    expect(billBlockerNotice('no_work', { ticketNumber: 'REP-000001' }).message).toBe(
      'REP-000001: add the work done before billing it.'
    );
    expect(
      billBlockerNotice('already_billed', {
        ticketNumber: 'REP-000001',
        billedInvoiceNumber: 'INV-000034',
      }).message
    ).toBe('REP-000001: this repair was already billed on INV-000034.');
  });
});
