import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchInvoices } from '../api/invoicesApi';
import type { Invoice } from '../types';

/**
 * The invoice that billed a repair or print-job ticket, or `null` while it is unbilled.
 *
 * A job does not carry its invoice: only the invoice line knows the ticket. A voided invoice no
 * longer bills the job, so the newest one that is not voided wins.
 */
export const pickBillingInvoice = (invoices: readonly Invoice[]): Invoice | null => {
  const live = invoices.filter((invoice) => invoice.status !== 'voided');
  if (live.length === 0) return null;
  return live.reduce((newest, invoice) =>
    new Date(invoice.createdAt) > new Date(newest.createdAt) ? invoice : newest
  );
};

export const useTicketInvoice = (ticketKey: string): Invoice | null => {
  const query = useQuery({
    queryKey: queryKeys.billing.invoices({ ticketKey }),
    queryFn: () => fetchInvoices({ ticketKey }),
    select: pickBillingInvoice,
  });
  return query.data ?? null;
};
