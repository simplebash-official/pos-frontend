import { describe, expect, it } from 'vitest';
import { addToSlips, MAX_SLIP_JOBS, slipName, slipTarget, type SlipSource } from '../jobSlip';

const job = (n: number, customerKey = 'cus_a'): SlipSource => ({
  id: `rep_${n}`,
  ticketNumber: `REP-${n}`,
  customerKey,
  customerName: customerKey === 'cus_a' ? 'Nimal' : 'Kamal',
});

describe('job slips', () => {
  it('collects one customer’s jobs on one slip, in the order saved', () => {
    const slips = addToSlips(addToSlips([], job(1)), job(2));
    expect(slips).toEqual([
      {
        customerKey: 'cus_a',
        customerName: 'Nimal',
        jobs: [
          { id: 'rep_1', ticketNumber: 'REP-1' },
          { id: 'rep_2', ticketNumber: 'REP-2' },
        ],
      },
    ]);
  });

  it('gives another customer their own slip', () => {
    const slips = addToSlips(addToSlips(addToSlips([], job(1)), job(2, 'cus_b')), job(3));
    expect(slips.map((slip) => slip.jobs.map((j) => j.ticketNumber))).toEqual([
      ['REP-1', 'REP-3'],
      ['REP-2'],
    ]);
  });

  it('starts a new slip once one is full', () => {
    let slips = [slipTarget(job(0))];
    for (let n = 1; n <= MAX_SLIP_JOBS; n += 1) slips = addToSlips(slips, job(n));
    expect(slips.map((slip) => slip.jobs.length)).toEqual([MAX_SLIP_JOBS, 1]);
  });

  it('is named after its one ticket, or counts them', () => {
    expect(slipName([{ id: 'rep_1', ticketNumber: 'REP-1' }], 'jobs')).toBe('REP-1');
    expect(slipName(addToSlips(addToSlips([], job(1)), job(2))[0].jobs, 'jobs')).toBe('2 jobs');
  });
});
