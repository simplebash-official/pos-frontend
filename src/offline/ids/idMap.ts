import { db } from '../db/schema';
import type { IdMapRecord } from '../db/tables';
import { AbandonedReferenceError, UnresolvedReferenceError } from '../errors';
import type { ReferenceDeclaration, SyncResourceId } from '../types';
import { createLocalId, isLocalId } from './localId';

/**
 * Translation between the provisional ids minted on this device and the
 * canonical ids the server issues.
 *
 * An entity created offline is referenced by other local rows and by queued
 * operations long before the server has ever seen it. When the create finally
 * lands, every one of those references has to be rewritten — this module owns
 * both halves of that: recording the mapping, and applying it to payloads.
 */

/** Mints a provisional id and records it as unresolved. Call inside a transaction. */
export async function mintLocalId(resource: SyncResourceId): Promise<string> {
  const localId = createLocalId();
  await db.idMap.put({
    localId,
    serverId: null,
    serverKey: null,
    resource,
    status: 'unresolved',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  });
  return localId;
}

/** Records the server's identity for a provisional id. Call inside a transaction. */
export async function resolveMapping(
  localId: string,
  serverId: string,
  serverKey: string | null
): Promise<void> {
  await db.idMap.update(localId, {
    serverId,
    serverKey,
    status: 'resolved',
    resolvedAt: new Date().toISOString(),
  });
}

/** Marks a provisional id as permanently unresolvable, so dependents fail fast. */
export async function abandonMapping(localId: string): Promise<void> {
  await db.idMap.update(localId, { status: 'abandoned' });
}

export async function loadIdMap(): Promise<Map<string, IdMapRecord>> {
  const records = await db.idMap.toArray();
  return new Map(records.map((record) => [record.localId, record]));
}

// ---------------------------------------------------------------------------
// Reference rewriting
// ---------------------------------------------------------------------------

type RewriteOutcome =
  { action: 'keep' } | { action: 'replace'; value: string } | { action: 'drop' };

/** Sentinel returned when a nested rewrite means the whole array element goes. */
const DROP_ELEMENT = Symbol('drop-element');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Resolves one reference value against the id map, honouring the declaration's
 * `blocking` flag.
 *
 * A server id never starts with `local_` (a backend contract clause), so a
 * value that doesn't carry the prefix is already canonical and passes through.
 */
function resolveValue(
  value: string,
  reference: ReferenceDeclaration,
  idMap: Map<string, IdMapRecord>
): RewriteOutcome {
  if (!isLocalId(value)) {
    return { action: 'keep' };
  }

  const mapping = idMap.get(value);

  if (!mapping || mapping.status === 'unresolved') {
    if (reference.blocking) {
      throw new UnresolvedReferenceError(value, reference.target);
    }
    return { action: 'drop' };
  }

  if (mapping.status === 'abandoned') {
    if (reference.blocking) {
      throw new AbandonedReferenceError(value, reference.target);
    }
    return { action: 'drop' };
  }

  const resolved = reference.kind === 'id' ? mapping.serverId : mapping.serverKey;
  if (resolved === null) {
    // Resolved but missing the half we need — treat as unresolved rather than
    // sending a null id the server would reject with a confusing 400.
    if (reference.blocking) {
      throw new UnresolvedReferenceError(value, reference.target);
    }
    return { action: 'drop' };
  }

  return { action: 'replace', value: resolved };
}

function rewriteNode(
  node: unknown,
  segments: readonly string[],
  reference: ReferenceDeclaration,
  idMap: Map<string, IdMapRecord>
): unknown | typeof DROP_ELEMENT {
  if (!isRecord(node)) {
    return node;
  }

  const [head, ...rest] = segments;
  const isArraySegment = head.endsWith('[]');
  const field = isArraySegment ? head.slice(0, -2) : head;
  const current = node[field];

  if (current === undefined || current === null) {
    return node;
  }

  if (isArraySegment) {
    if (!Array.isArray(current)) {
      return node;
    }

    // `productKeys[]` — an array of reference values.
    if (rest.length === 0) {
      const next: unknown[] = [];
      for (const element of current) {
        if (typeof element !== 'string') {
          next.push(element);
          continue;
        }
        const outcome = resolveValue(element, reference, idMap);
        if (outcome.action === 'drop') {
          continue;
        }
        next.push(outcome.action === 'replace' ? outcome.value : element);
      }
      return { ...node, [field]: next };
    }

    // `suppliers[].supplierKey` — a dropped reference takes its element with it,
    // because an intake line with no supplier is meaningless.
    const next: unknown[] = [];
    for (const element of current) {
      const rewritten = rewriteNode(element, rest, reference, idMap);
      if (rewritten === DROP_ELEMENT) {
        continue;
      }
      next.push(rewritten);
    }
    return { ...node, [field]: next };
  }

  // `categoryKey` — a plain reference field.
  if (rest.length === 0) {
    if (typeof current !== 'string') {
      return node;
    }
    const outcome = resolveValue(current, reference, idMap);
    if (outcome.action === 'drop') {
      return DROP_ELEMENT;
    }
    if (outcome.action === 'replace') {
      return { ...node, [field]: outcome.value };
    }
    return node;
  }

  // `updates.categoryKey` — descend.
  const rewritten = rewriteNode(current, rest, reference, idMap);
  if (rewritten === DROP_ELEMENT) {
    return DROP_ELEMENT;
  }
  return { ...node, [field]: rewritten };
}

/**
 * Returns a copy of `payload` with every declared reference resolved to its
 * server id.
 *
 * Throws `UnresolvedReferenceError` when a blocking reference is not ready —
 * the flush loop catches that and requeues without burning a retry attempt.
 *
 * The stored payload is never mutated, so a later retry re-resolves against a
 * fresher id map.
 */
export function rewriteReferences(
  payload: unknown,
  references: readonly ReferenceDeclaration[],
  idMap: Map<string, IdMapRecord>
): unknown {
  let result = payload;
  for (const reference of references) {
    const rewritten = rewriteNode(result, reference.path.split('.'), reference, idMap);
    if (rewritten === DROP_ELEMENT) {
      // The payload's own root reference was dropped; there is nothing to send.
      throw new AbandonedReferenceError(reference.path, reference.target);
    }
    result = rewritten;
  }
  return result;
}
