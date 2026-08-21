import { db } from '../db/schema';
import { isLocalId } from '../ids/localId';
import { useLiveQuery } from './useLiveQuery';

export interface ResolvedId {
  /** The id to use against the server — `undefined` while still provisional. */
  resolvedId: string | undefined;
  /** True while `id` is a provisional `local_…` id with no server id yet. */
  isPending: boolean;
}

/**
 * Resolves a possibly-provisional entity id to its current server id.
 *
 * A row created offline is referenced by callers as its `local_…` id long
 * before the server has seen it. Once the outbox flushes the create,
 * `flush.ts`'s `commitSuccess` rewrites the mirror row's key and records the
 * mapping in `db.idMap` — but anything holding the old id as a React state
 * snapshot (e.g. a just-completed sale's invoice, captured before sync ran)
 * never finds out. Subscribing to `db.idMap` here means the resolved id
 * updates live the moment the mapping resolves, with no extra plumbing at
 * the call site.
 */
export const useResolvedId = (id: string | undefined): ResolvedId => {
  const local = id !== undefined && isLocalId(id);

  const { data: mapping } = useLiveQuery(
    () => (local ? db.idMap.get(id as string) : Promise.resolve(undefined)),
    undefined,
    [local, id]
  );

  if (!local) {
    return { resolvedId: id, isPending: false };
  }

  if (!mapping || mapping.status === 'unresolved') {
    return { resolvedId: undefined, isPending: true };
  }

  if (mapping.status === 'abandoned') {
    return { resolvedId: undefined, isPending: false };
  }

  return { resolvedId: mapping.serverId ?? mapping.serverKey ?? undefined, isPending: false };
};
