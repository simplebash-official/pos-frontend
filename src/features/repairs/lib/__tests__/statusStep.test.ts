import { describe, expect, it } from 'vitest';
import { JOB_STATUS } from '@/constants';
import type { RepairItem, RepairJob } from '../../types';
import { repairStepBlock } from '../statusStep';

const item = (part?: RepairItem['part']): RepairItem =>
  ({ key: 'rit_1', description: 'Screen', laborCents: 1000, part }) as RepairItem;

const job = (
  items: RepairItem[],
  kind: RepairJob['kind'] = { kind: 'standard' },
  billedInvoiceKey?: string
) => ({
  kind,
  items,
  billedInvoiceKey,
});

describe('repairStepBlock', () => {
  it('lets a job with no work be diagnosed and repaired', () => {
    expect(repairStepBlock(job([]), JOB_STATUS.DIAGNOSING)).toBeNull();
    expect(repairStepBlock(job([]), JOB_STATUS.IN_REPAIR)).toBeNull();
  });

  it('asks for the work before ready or handed back', () => {
    expect(repairStepBlock(job([]), JOB_STATUS.READY)?.reason).toBe('needs_work');
    expect(repairStepBlock(job([]), JOB_STATUS.DELIVERED)?.reason).toBe('needs_work');
  });

  it('sends a job with a stock part to billing to be handed back', () => {
    const stock = item({ source: 'stock', productKey: 'p', productName: 'Screen' });
    expect(repairStepBlock(job([stock]), JOB_STATUS.DELIVERED)?.reason).toBe('bill_first');
    expect(repairStepBlock(job([stock]), JOB_STATUS.READY)).toBeNull();
  });

  it('lets a billed job with a stock part be handed back by hand', () => {
    const stock = item({ source: 'stock', productKey: 'p', productName: 'Screen' });
    expect(
      repairStepBlock(job([stock], { kind: 'standard' }, 'inv_1'), JOB_STATUS.DELIVERED)
    ).toBeNull();
  });

  it('hands back a job whose part was bought in', () => {
    const outside = item({ source: 'outside', name: 'Glass' });
    expect(repairStepBlock(job([outside]), JOB_STATUS.DELIVERED)).toBeNull();
  });

  it('never blocks a warranty rework', () => {
    const rework: RepairJob['kind'] = {
      kind: 'warranty_rework',
      claimKey: 'c',
      claimNumber: 'WCL-1',
      originalRepairKey: 'r',
      originalTicketNumber: 'REP-1',
    };
    const stock = item({ source: 'stock', productKey: 'p', productName: 'Screen' });
    expect(repairStepBlock(job([], rework), JOB_STATUS.READY)).toBeNull();
    expect(repairStepBlock(job([stock], rework), JOB_STATUS.DELIVERED)).toBeNull();
  });
});
