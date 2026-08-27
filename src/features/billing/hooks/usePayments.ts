import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchInvoicePayments, recordPayment } from '../api/paymentsApi';
import type { PaymentRecord } from '../api/paymentsApi';
import type { RecordPaymentInput } from '../api/paymentsApi';

export interface RecordPaymentPayload {
  invoiceKey: string;
  input: RecordPaymentInput;
}

const NO_PAYMENTS: PaymentRecord[] = [];

export const useInvoicePayments = (invoiceId: string | undefined) => {
  const query = useQuery({
    queryKey: queryKeys.billing.payments(invoiceId ?? ''),
    queryFn: () => fetchInvoicePayments(invoiceId as string),
    enabled: Boolean(invoiceId),
  });
  return { ...query, data: query.data ?? NO_PAYMENTS };
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceKey, input }: RecordPaymentPayload) => recordPayment(invoiceKey, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.billing.payments(variables.invoiceKey),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.billing.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};
