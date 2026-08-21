import { db } from '@/offline/db/schema';
import type { MirroredRow, ReturnRecord } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type { CreateReturnPayload } from '@/offline/resources/returns.resource';

const NO_RETURNS: MirroredRow<ReturnRecord>[] = [];

/** Local-first return history for a specific invoice — reads Dexie's mirror. */
export const useInvoiceReturns = (invoiceId: string | undefined) => {
  return useSyncedQuery(
    'returns',
    async () => {
      if (!invoiceId) {
        return NO_RETURNS;
      }
      return db.returns.where('originalInvoiceId').equals(invoiceId).reverse().sortBy('createdAt');
    },
    NO_RETURNS,
    [invoiceId]
  );
};

/** Local-first list of all returns. */
export const useReturns = () => {
  return useSyncedQuery(
    'returns',
    async () => {
      return db.returns.where('_isDeleted').equals(0).reverse().sortBy('createdAt');
    },
    NO_RETURNS,
    []
  );
};

/** Synced mutation hook for recording/processing returns. */
export const useProcessReturn = () => {
  return useSyncedMutation<CreateReturnPayload, ReturnRecord>('returns', 'create');
};
