/** The paper a job slip is printed on. */
export type JobReceiptPaper = 'a5' | 'thermal-58' | 'thermal-80';

/** One job on a slip. */
export interface JobSlipJob {
  /** The job's key. */
  id: string;
  ticketNumber: string;
}

/** What a slip is printed for: one or more jobs of one customer. */
export interface JobSlipTarget {
  customerKey: string;
  customerName: string;
  jobs: JobSlipJob[];
}
