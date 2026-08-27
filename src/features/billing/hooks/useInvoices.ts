import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import {
  closeInvoice,
  completeSale,
  fetchAllInvoices,
  voidInvoice,
  type CompleteSaleInput,
  type CompleteSaleResult,
} from '../api/invoicesApi';
import type { Invoice } from '../types';

export interface VoidInvoicePayload {
  invoiceKey: string;
  reason: string;
}

export interface CloseInvoicePayload {
  invoiceKey: string;
}

const NO_INVOICES: Invoice[] = [];

export const useAllInvoices = () => {
  const query = useQuery({
    queryKey: queryKeys.billing.invoices(),
    queryFn: fetchAllInvoices,
  });
  return { ...query, data: query.data ?? NO_INVOICES };
};

const invalidateAfterSale = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.repairs.all });
  void queryClient.invalidateQueries({ queryKey: queryKeys.printJobs.all });
};

/**
 * Checkout. Resolves to `{ invoice, warnings }` — `warnings` covers a
 * partial side-effect failure in the backend's compound sale write (e.g. a
 * ticket that couldn't be marked delivered); the caller is responsible for
 * surfacing them since they arrive with the response now, not via a
 * deferred sync notification.
 */
export const useCompleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation<CompleteSaleResult, unknown, CompleteSaleInput>({
    mutationFn: (input) => completeSale(input),
    onSuccess: () => invalidateAfterSale(queryClient),
  });
};

/** Reverses an invoice's stock/payment effects — admin-gated in the UI, mandatory reason. */
export const useVoidInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceKey, reason }: VoidInvoicePayload) => voidInvoice(invoiceKey, reason),
    onSuccess: () => invalidateAfterSale(queryClient),
  });
};

/** Manual terminal action — only valid from Paid with zero open credit notes. */
export const useCloseInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceKey }: CloseInvoicePayload) => closeInvoice(invoiceKey),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
    },
  });
};
