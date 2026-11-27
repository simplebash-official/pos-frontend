import { useCallback, useState } from 'react';
import { addToSlips, slipTarget, type SlipSource } from '../lib/jobSlip';
import type { JobSlipTarget } from '../types';

/**
 * The slip window of a job screen. A slip asked for opens at once; the jobs saved during an intake
 * are held until the new-job form is left, then printed together, one slip per customer.
 *
 * `creating`: the new-job form is open. `canPrint`: this person may print job slips.
 */
export const useJobSlips = (creating: boolean, canPrint: boolean) => {
  const [asked, setAsked] = useState<JobSlipTarget | null>(null);
  const [owed, setOwed] = useState<JobSlipTarget[]>([]);
  const waiting = creating || owed.length === 0 ? null : owed[0];

  return {
    /** The slip to show now; `null` for none. */
    target: asked ?? waiting,
    /** Tickets saved while the form has stayed open. */
    savedTickets: owed.flatMap((slip) => slip.jobs.map((job) => job.ticketNumber)),
    print: useCallback((job: SlipSource) => setAsked(slipTarget(job)), []),
    saved: useCallback(
      (job: SlipSource) => {
        if (canPrint) setOwed((slips) => addToSlips(slips, job));
      },
      [canPrint]
    ),
    close: () => {
      if (asked !== null) setAsked(null);
      else setOwed((slips) => slips.slice(1));
    },
  };
};
