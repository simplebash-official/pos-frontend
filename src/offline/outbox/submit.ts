import { db } from '../db/schema';
import type { IdMapRecord } from '../db/tables';
import { assignLedgerEntriesToOperation } from '../engine/stockLedger';
import { getDeviceId } from '../ids/deviceId';
import { createLocalId, isLocalId } from '../ids/localId';
import { getSyncResource } from '../registry/registry';
import type { LocalContext, SyncResourceId } from '../types';
import { assertOutboxHasCapacity, enqueueOperation } from './outbox';

/**
 * Applies a write locally and queues it for the server, atomically.
 *
 * Both halves run in one Dexie transaction, so it is impossible to end up with
 * a local change that has no operation to carry it, or an operation for a
 * change that was never applied. The call resolves as soon as the local write
 * commits — the user sees their change immediately whether or not there is a
 * network.
 */
export async function submitOperation<TResult>(
  resourceId: SyncResourceId,
  operationName: string,
  payload: unknown
): Promise<TResult> {
  const resource = getSyncResource(resourceId);
  const operation = resource.operations[operationName];
  if (!operation) {
    throw new Error(`Resource "${resourceId}" has no operation "${operationName}"`);
  }

  await assertOutboxHasCapacity();

  const now = new Date().toISOString();
  const mintedIds: IdMapRecord[] = [];

  const localContext: LocalContext = {
    now,
    deviceId: getDeviceId(),
    // Collected rather than written immediately so the whole thing stays in
    // one transaction without making this callback async.
    newLocalId: (target) => {
      const localId = createLocalId();
      mintedIds.push({
        localId,
        serverId: null,
        serverKey: null,
        resource: target,
        status: 'unresolved',
        createdAt: now,
        resolvedAt: null,
      });
      return localId;
    },
  };

  let entity: unknown;

  await db.transaction(
    'rw',
    [
      db.products,
      db.categories,
      db.suppliers,
      db.supplierProducts,
      db.purchases,
      db.stockMovements,
      db.outbox,
      db.idMap,
      db.stockLedger,
    ],
    async () => {
      const result = await operation.localApply(payload as never, localContext);
      entity = result.entity;

      if (mintedIds.length > 0) {
        await db.idMap.bulkPut(mintedIds);
      }

      // The version the edit was based on, so the server can detect that the
      // row moved underneath us. Locally created rows have no server version.
      const existing = await resource.table.get(result.entityKey);
      const baseVersion =
        existing && existing._version >= 0 && !isLocalId(result.entityKey)
          ? existing._version
          : null;

      const seq = await enqueueOperation({
        resource: resourceId,
        operation: operationName,
        entityLocalId: result.entityKey,
        payload,
        baseVersion,
        dependsOn: [],
        label: operation.describe(payload as never),
      });

      // Any stock deltas the local apply wrote belong to this operation.
      await assignLedgerEntriesToOperation(seq);
    }
  );

  return entity as TResult;
}
