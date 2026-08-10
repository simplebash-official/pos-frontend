/**
 * Identifier generation for the offline engine.
 *
 * Records created while offline cannot be given a server id, so they get a
 * *provisional* id instead. The `local_` prefix makes them greppable, lets the
 * UI flag unsynced rows without a second lookup, and guarantees they can never
 * collide with a server id.
 *
 * Note this deliberately replaces the `prefix-${Date.now()}` pattern used
 * elsewhere in the codebase: millisecond timestamps collide both within a
 * single tick and across devices, which is fatal for multi-writer sync.
 */

export const LOCAL_ID_PREFIX = 'local_';

/**
 * `crypto.randomUUID` is only exposed in secure contexts (https / localhost).
 * Production is https, but a LAN-served build over plain http would not have
 * it, so fall back to the always-available `getRandomValues` and format the
 * bytes as a v4 UUID by hand.
 */
export function randomUuid(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex: string[] = [];
  for (let i = 0; i < bytes.length; i += 1) {
    hex.push(bytes[i].toString(16).padStart(2, '0'));
  }
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

/** A provisional id for an entity created on this device before it reached the server. */
export function createLocalId(): string {
  return `${LOCAL_ID_PREFIX}${randomUuid()}`;
}

/** True when `id` was minted on a device and has not yet been mapped to a server id. */
export function isLocalId(id: string): boolean {
  return id.startsWith(LOCAL_ID_PREFIX);
}

/** Idempotency keys are plain UUIDs — they are request identities, not entity identities. */
export function createIdempotencyKey(): string {
  return randomUuid();
}
