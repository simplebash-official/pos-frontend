import { db } from '@/offline/db/schema';
import type { MirroredRow } from '@/offline/db/tables';
import { useSyncedMutation } from '@/offline/react/useSyncedMutation';
import { useSyncedQuery } from '@/offline/react/useSyncedQuery';
import type {
  DeleteRepairsPayload,
  UpdateRepairPayload,
} from '@/offline/resources/repairs.resource';
import type { RepairJob, RepairJobInput } from '../types';

const NO_REPAIRS: MirroredRow<RepairJob>[] = [];

/** Local-first repair-ticket access — reads Dexie's mirror, writes queue through the outbox. */
export const useAllRepairs = () => {
  return useSyncedQuery(
    'repairs',
    // Dexie's `sortBy` always sorts ascending and ignores `.reverse()` on the
    // collection (it re-sorts in JS from a fresh fetch) — reverse the
    // resolved array instead to get newest-first.
    async () => (await db.repairs.where('_isDeleted').equals(0).sortBy('createdAt')).reverse(),
    NO_REPAIRS,
    []
  );
};

export const useCreateRepairJob = () => {
  return useSyncedMutation<RepairJobInput, RepairJob>('repairs', 'create');
};

export const useUpdateRepairJob = () => {
  return useSyncedMutation<UpdateRepairPayload, RepairJob>('repairs', 'update');
};

export const useDeleteRepairs = () => {
  return useSyncedMutation<DeleteRepairsPayload, void>('repairs', 'deleteMany');
};
