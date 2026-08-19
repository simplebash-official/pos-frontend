import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type {
  DeletePrintJobsPayload,
  UpdatePrintJobPayload,
} from '@/offline/resources/printJobs.resource';
import type { PrintJob, PrintJobInput } from '../types';

const NO_PRINT_JOBS: MirroredRow<PrintJob>[] = [];

/** Local-first print-job access — reads Dexie's mirror, writes queue through the outbox. */
export const useAllPrintJobs = () => {
  return useSyncedQuery(
    'printJobs',
    // Dexie's `sortBy` always sorts ascending — reverse the resolved array
    // for newest-first (see `useRepairs.ts`'s identical comment).
    async () => (await db.printJobs.where('_isDeleted').equals(0).sortBy('createdAt')).reverse(),
    NO_PRINT_JOBS,
    []
  );
};

export const useCreatePrintJob = () => {
  return useSyncedMutation<PrintJobInput, PrintJob>('printJobs', 'create');
};

export const useUpdatePrintJob = () => {
  return useSyncedMutation<UpdatePrintJobPayload, PrintJob>('printJobs', 'update');
};

export const useDeletePrintJobs = () => {
  return useSyncedMutation<DeletePrintJobsPayload, void>('printJobs', 'deleteMany');
};
