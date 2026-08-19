import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type { RecordPaymentPayload } from '@/offline/resources/payments.resource';
import type { PaymentRecord } from '../api/paymentsApi';

const NO_PAYMENTS: MirroredRow<PaymentRecord>[] = [];

/** Local-first payment history for one invoice — reads Dexie's mirror. */
export const useInvoicePayments = (invoiceId: string | undefined) => {
  return useSyncedQuery(
    'payments',
    async () => {
      if (!invoiceId) {
        return NO_PAYMENTS;
      }
      return db.payments.where('invoiceId').equals(invoiceId).sortBy('recordedAt');
    },
    NO_PAYMENTS,
    [invoiceId]
  );
};

export const useRecordPayment = () => {
  return useSyncedMutation<RecordPaymentPayload, PaymentRecord>('payments', 'create');
};
