import { getAllSyncMeta, seedSyncMeta } from '../db/syncMeta';
import { getResourcesInDependencyOrder } from '../registry/registry';
import { fetchSyncStatus } from '../resources/syncApi';
import type { SyncResourceId } from '../types';

/**
 * Decides which resources a pull pass should refresh.
 *
 * Driven by the resource registry, never by what happens to be in `syncMeta`.
 * A resource with no bookkeeping row has *never* synced, so it needs a pull
 * more than any other — deriving the work list from existing rows instead is
 * what let an empty database diagnose itself as fully up to date and download
 * nothing, permanently.
 *
 * `/sync/status` is an optimisation on top of that: it can only ever remove a
 * resource that has already completed a pull and is provably unchanged.
 */
export const resolvePullTargets = async (signal: AbortSignal): Promise<Set<SyncResourceId>> => {
  const resources = getResourcesInDependencyOrder();
  await seedSyncMeta(resources.map((resource) => resource.id));

  const targets = new Set<SyncResourceId>(resources.map((resource) => resource.id));

  let status: Awaited<ReturnType<typeof fetchSyncStatus>>;
  try {
    status = await fetchSyncStatus(signal);
  } catch {
    // No watermarks available: pull everything. Skipping work on the strength
    // of a failed request is how a broken status endpoint turns into an app
    // that never loads any data.
    return targets;
  }

  const meta = new Map((await getAllSyncMeta()).map((record) => [record.resource, record]));

  for (const resource of resources) {
    const record = meta.get(resource.id);
    const watermark = status.resources[resource.id];

    // Anything that has never completed a pull, or is currently in error,
    // always pulls so it can establish a baseline or clear the error state.
    if (
      !record ||
      record.cursor === null ||
      record.lastPulledAt === null ||
      record.pullState === 'error'
    ) {
      continue;
    }
    // The server reports nothing for this resource: it has no rows, so there
    // is nothing to fetch.
    if (!watermark) {
      targets.delete(resource.id);
      continue;
    }

    // Compare instants, not strings. The server emits RFC 3339 with an offset
    // and nanosecond precision; `toISOString()` emits `Z` with milliseconds.
    // Lexicographic comparison of the two orders them wrong and silently skips
    // resources that genuinely changed.
    const serverAt = Date.parse(watermark.lastUpdatedAt);
    const localAt = Date.parse(record.lastPulledAt);
    if (Number.isNaN(serverAt) || Number.isNaN(localAt)) {
      continue;
    }
    if (serverAt <= localAt) {
      targets.delete(resource.id);
    }
  }

  return targets;
};
