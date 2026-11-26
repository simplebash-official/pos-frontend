import type { PrintJob } from '@/features/print-jobs';
import type { CartItem } from '@/store/slices/cartSlice';
import { randomUuid } from '@/shared/lib/id';

/** What the job is called on the bill and in the till's job list: "Mug printing (50 units)". */
export const printJobTitle = (job: Pick<PrintJob, 'jobType' | 'quantity'>): string =>
  `${job.jobType.charAt(0).toUpperCase()}${job.jobType.slice(1)} printing (${job.quantity} units)`;

/** The bill line for a print job: one line for the whole job, priced by the server's total for it. */
export const printCartLine = (job: PrintJob): CartItem => ({
  id: `svc-print-${job.id}-${randomUuid()}`,
  productId: job.id,
  name: `${job.ticketNumber}: ${printJobTitle(job)}`,
  sku: job.ticketNumber,
  unitPriceCents: job.priceCents,
  quantity: 1,
  discount: null,
  sourceType: 'print',
  sourceTicketNumber: job.ticketNumber,
  assignedEmployeeId: job.assignedEmployeeId,
  assignedEmployeeName: job.assignedEmployeeName,
});
