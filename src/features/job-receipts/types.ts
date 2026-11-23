/** The paper a job receipt is printed on. */
export type JobReceiptPaper = 'a5' | 'thermal-58' | 'thermal-80';

/** Which kind of job a receipt is for. */
export type JobReceiptKind = 'repair' | 'print';

/** The job a receipt is printed for. */
export interface JobReceiptTarget {
  kind: JobReceiptKind;
  /** The job's id (the server also accepts its key). */
  id: string;
  ticketNumber: string;
  customerName: string;
}
