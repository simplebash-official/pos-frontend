import type { JobSlipJob, JobSlipTarget } from '../types';

/** The most jobs one slip lists; the server enforces the same. */
export const MAX_SLIP_JOBS = 20;

/** What a job needs to say about itself to go on a slip. */
export interface SlipSource {
  id: string;
  ticketNumber: string;
  customerKey: string;
  customerName: string;
}

const slipJob = ({ id, ticketNumber }: SlipSource): JobSlipJob => ({ id, ticketNumber });

/** The slip of one job. */
export const slipTarget = (job: SlipSource): JobSlipTarget => ({
  customerKey: job.customerKey,
  customerName: job.customerName,
  jobs: [slipJob(job)],
});

/**
 * Adds a saved job to the slips owed for one intake: it joins its customer's slip, or starts a
 * new one for another customer or once a slip is full.
 */
export const addToSlips = (slips: readonly JobSlipTarget[], job: SlipSource): JobSlipTarget[] => {
  const index = slips.findIndex(
    (slip) => slip.customerKey === job.customerKey && slip.jobs.length < MAX_SLIP_JOBS
  );
  if (index === -1) return [...slips, slipTarget(job)];
  return slips.map((slip, at) =>
    at === index ? { ...slip, jobs: [...slip.jobs, slipJob(job)] } : slip
  );
};

/** What the slip is called: its ticket, or how many tickets it lists. */
export const slipName = (jobs: readonly JobSlipJob[], jobsWord: string): string =>
  jobs.length === 1 ? jobs[0].ticketNumber : `${jobs.length} ${jobsWord}`;
