import { JOB_STATUS, JOB_STATUS_LABELS, PRINT_JOB_STATUS_LABELS } from '@/constants';
import { printCartLine, printJobTitle } from '@/features/billing/lib/printCartLine';
import { repairCartLine } from '@/features/billing/lib/repairCartLine';
import type { PrintJob } from '@/features/print-jobs/types';
import type { RepairJob } from '@/features/repairs/types';
import { billBlocker } from '@/shared/lib/billBlocker';
import { t } from '@/shared/i18n/t';
import type { CustomerJob } from '../types';

type Ticket = RepairJob | PrintJob;

const common = (job: Ticket) => {
  const isRework = job.kind.kind === 'warranty_rework';
  return {
    id: job.id,
    ticketNumber: job.ticketNumber,
    status: job.status,
    isOpen: job.status !== JOB_STATUS.DELIVERED && job.status !== JOB_STATUS.CANCELLED,
    priceCents: isRework || job.items.length === 0 ? undefined : job.priceCents,
    isRework,
    billedInvoiceNumber: job.billedInvoiceNumber,
    blocker: billBlocker(job),
    createdAt: job.createdAt,
  };
};

export const repairAsCustomerJob = (job: RepairJob): CustomerJob => ({
  ...common(job),
  kind: 'repair',
  title: job.deviceModel,
  statusLabel: t(JOB_STATUS_LABELS[job.status]),
  line: repairCartLine(job),
});

export const printAsCustomerJob = (job: PrintJob): CustomerJob => ({
  ...common(job),
  kind: 'print',
  title: printJobTitle(job),
  statusLabel: t(PRINT_JOB_STATUS_LABELS[job.status]),
  line: printCartLine(job),
});

/** Both kinds in one list, the newest first. */
export const customerJobs = (
  repairs: readonly RepairJob[],
  printJobs: readonly PrintJob[]
): CustomerJob[] =>
  [...repairs.map(repairAsCustomerJob), ...printJobs.map(printAsCustomerJob)].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
