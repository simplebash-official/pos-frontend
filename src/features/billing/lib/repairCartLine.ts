import type { RepairJob } from '@/features/repairs';
import type { CartItem } from '@/store/slices/cartSlice';
import { randomUuid } from '@/shared/lib/id';

/** The bill line for a repair: one line for the whole job, priced by the server's total for it. */
export const repairCartLine = (job: RepairJob): CartItem => ({
  id: `svc-repair-${job.id}-${randomUuid()}`,
  productId: job.id,
  name: `${job.ticketNumber}: ${job.deviceModel} repair`,
  sku: job.ticketNumber,
  unitPriceCents: job.priceCents,
  quantity: 1,
  discount: null,
  sourceType: 'repair',
  sourceTicketNumber: job.ticketNumber,
  assignedEmployeeId: job.assignedEmployeeId,
  assignedEmployeeName: job.assignedEmployeeName,
});
