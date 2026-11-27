import type { BillToConfirmation } from '@/store/slices/cartSlice';

/** Whose job a ticket is. */
export interface TicketOwner {
  customerKey: string;
  customerName: string;
  customerPhone: string;
  ticketNumber: string;
}

/** A customer who owns one or more of the jobs on the bill. */
export interface JobOwner {
  key: string;
  name: string;
  phone: string;
  ticketNumbers: string[];
}

/**
 * How a job owner stands against the customer being billed: the `same` person, someone else the
 * cashier has `confirmed`, or someone else nobody has answered for yet.
 */
export type OwnerState = 'same' | 'confirmed' | 'unanswered';

/** The owners of `tickets`, in the order their first job appears. */
export const jobOwners = (tickets: readonly TicketOwner[]): JobOwner[] => {
  const owners = new Map<string, JobOwner>();
  for (const ticket of tickets) {
    const owner = owners.get(ticket.customerKey);
    if (owner === undefined) {
      owners.set(ticket.customerKey, {
        key: ticket.customerKey,
        name: ticket.customerName,
        phone: ticket.customerPhone,
        ticketNumbers: [ticket.ticketNumber],
      });
    } else {
      owner.ticketNumbers.push(ticket.ticketNumber);
    }
  }
  return [...owners.values()];
};

export const ownerState = (
  ownerKey: string,
  billCustomerKey: string | null,
  confirmation: BillToConfirmation | undefined
): OwnerState => {
  if (ownerKey === billCustomerKey) return 'same';
  const answered =
    confirmation !== undefined &&
    confirmation.billCustomerKey === billCustomerKey &&
    confirmation.jobCustomerKeys.includes(ownerKey);
  return answered ? 'confirmed' : 'unanswered';
};
