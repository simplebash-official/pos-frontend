import type { OutboxOp } from '../db/tables';
import type {
  AnySyncResource,
  LocalApplyResult,
  LocalContext,
  PushContext,
  PushResult,
  ReferenceDeclaration,
  SyncOperation,
  SyncResource,
  SyncResourceId,
} from '../types';

/**
 * The set of resources the engine syncs.
 *
 * Registration is explicit and happens once at startup (see
 * `src/offline/resources/index.ts`). Resources are stored in dependency order
 * so the pull and push loops can simply iterate.
 */

const resources = new Map<SyncResourceId, AnySyncResource>();
let orderCache: AnySyncResource[] | null = null;

/**
 * Identity helper. Exists so a descriptor gets full type-checking against
 * `SyncResource<TEntity>` at its declaration site without every consumer
 * having to carry the entity generic.
 */
export function defineSyncResource<TEntity extends object>(
  resource: SyncResource<TEntity>
): SyncResource<TEntity> {
  return resource;
}

/**
 * Declares one write operation with a concrete payload type.
 *
 * The registry stores operations with their payload erased (it dispatches them
 * generically), so this helper is what keeps `localApply`, `push` and
 * `describe` type-checked against the same payload inside a descriptor.
 */
export function defineOperation<TPayload>(operation: {
  localApply: (payload: TPayload, ctx: LocalContext) => Promise<LocalApplyResult>;
  push: (payload: TPayload, op: OutboxOp, ctx: PushContext) => Promise<PushResult>;
  references: readonly ReferenceDeclaration[];
  describe: (payload: TPayload) => string;
}): SyncOperation {
  return operation as unknown as SyncOperation;
}

export function registerSyncResource(resource: AnySyncResource): void {
  if (resources.has(resource.id)) {
    throw new Error(`Sync resource "${resource.id}" is already registered`);
  }
  resources.set(resource.id, resource);
  orderCache = null;
}

export function getSyncResource(id: SyncResourceId): AnySyncResource {
  const resource = resources.get(id);
  if (!resource) {
    throw new Error(`Sync resource "${id}" is not registered`);
  }
  return resource;
}

export function hasSyncResource(id: SyncResourceId): boolean {
  return resources.has(id);
}

/**
 * Resources in dependency order: a resource always appears after everything it
 * declares in `dependsOn`. This is the pull order and the push order — it is
 * what guarantees a locally created product is pushed before the supplier link
 * that references it.
 *
 * Throws on a dependency cycle, which is a programming error in a descriptor
 * and must fail loudly at startup rather than deadlock the flush loop.
 */
export function getResourcesInDependencyOrder(): AnySyncResource[] {
  if (orderCache !== null) {
    return orderCache;
  }

  const sorted: AnySyncResource[] = [];
  const permanent = new Set<SyncResourceId>();
  const inProgress = new Set<SyncResourceId>();

  const visit = (id: SyncResourceId, path: SyncResourceId[]): void => {
    if (permanent.has(id)) {
      return;
    }
    if (inProgress.has(id)) {
      throw new Error(`Sync resource dependency cycle: ${[...path, id].join(' -> ')}`);
    }

    const resource = resources.get(id);
    if (!resource) {
      throw new Error(
        `Sync resource "${path[path.length - 1]}" depends on "${id}", which is not registered`
      );
    }

    inProgress.add(id);
    resource.dependsOn.forEach((dependency) => visit(dependency, [...path, id]));
    inProgress.delete(id);
    permanent.add(id);
    sorted.push(resource);
  };

  resources.forEach((resource) => visit(resource.id, []));
  orderCache = sorted;
  return sorted;
}

/** Rank of each resource in dependency order, for sorting outbox operations. */
export function getResourceRanks(): Map<SyncResourceId, number> {
  const ranks = new Map<SyncResourceId, number>();
  getResourcesInDependencyOrder().forEach((resource, index) => {
    ranks.set(resource.id, index);
  });
  return ranks;
}

/**
 * Reverse index of which resources reference which, built from every
 * operation's `references`. Drives the sweep that rewrites provisional ids
 * across other tables once an entity is accepted by the server.
 */
export function getReferringResources(target: SyncResourceId): AnySyncResource[] {
  return getResourcesInDependencyOrder().filter((resource) =>
    Object.values(resource.operations).some((operation) =>
      operation.references.some((reference) => reference.target === target)
    )
  );
}

/** Test/maintenance seam — clears the registry so it can be rebuilt. */
export function resetRegistry(): void {
  resources.clear();
  orderCache = null;
}
