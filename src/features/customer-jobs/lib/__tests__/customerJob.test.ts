import { describe, expect, it } from 'vitest';
import type { PrintJob } from '@/features/print-jobs/types';
import type { RepairJob } from '@/features/repairs/types';
import { customerJobs, printAsCustomerJob, repairAsCustomerJob } from '../customerJob';

const REPAIR: RepairJob = {
  id: 'rep_1',
  ticketNumber: 'REP-000001',
  customerKey: 'cus_nimal',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  deviceModel: 'Galaxy A15',
  issueDescription: 'Cracked screen',
  status: 'ready',
  kind: { kind: 'standard' },
  items: [
    {
      key: 'rit_1',
      description: 'Replace screen',
      laborCents: 500_000,
      partCents: 0,
      partCostCents: 0,
      warranty: { coverage: { kind: 'none' } },
    },
  ],
  priceCents: 500_000,
  costCents: 0,
  createdAt: '2026-11-20T05:00:00Z',
};

const PRINT: PrintJob = {
  id: 'prn_1',
  ticketNumber: 'PRN-000001',
  customerKey: 'cus_nimal',
  customerName: 'Nimal Perera',
  customerPhone: '0771234567',
  jobType: 'mug',
  quantity: 5,
  status: 'received',
  kind: { kind: 'standard' },
  items: [],
  priceCents: 0,
  costCents: 0,
  createdAt: '2026-11-21T05:00:00Z',
};

describe('customer jobs', () => {
  it('lists a priced repair as open and ready to bill', () => {
    expect(repairAsCustomerJob(REPAIR)).toMatchObject({
      kind: 'repair',
      id: 'rep_1',
      title: 'Galaxy A15',
      status: 'ready',
      isOpen: true,
      priceCents: 500_000,
      blocker: null,
      line: { productId: 'rep_1', sourceType: 'repair', unitPriceCents: 500_000 },
    });
  });

  it('has no price and cannot be billed while nothing is on the job', () => {
    const job = printAsCustomerJob(PRINT);
    expect(job.title).toBe('Mug printing (5 units)');
    expect(job.priceCents).toBeUndefined();
    expect(job.blocker).toBe('no_work');
  });

  it('is closed once handed back or cancelled', () => {
    expect(repairAsCustomerJob({ ...REPAIR, status: 'delivered' }).isOpen).toBe(false);
    expect(repairAsCustomerJob({ ...REPAIR, status: 'cancelled' }).isOpen).toBe(false);
  });

  it('shows a warranty rework without a price', () => {
    const rework = repairAsCustomerJob({
      ...REPAIR,
      kind: {
        kind: 'warranty_rework',
        claimKey: 'wcl_1',
        claimNumber: 'WCL-000001',
        originalRepairKey: 'rep_0',
        originalTicketNumber: 'REP-000000',
      },
      priceCents: 0,
    });
    expect(rework).toMatchObject({ isRework: true, blocker: 'warranty_rework' });
    expect(rework.priceCents).toBeUndefined();
  });

  it('merges both kinds, the newest first', () => {
    expect(customerJobs([REPAIR], [PRINT]).map((job) => job.id)).toEqual(['prn_1', 'rep_1']);
  });
});
