import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/schema';
import {
  createLocalId,
  isLocalId,
  createIdempotencyKey,
  randomUuid,
  LOCAL_ID_PREFIX,
} from '../ids/localId';
import { getDeviceId } from '../ids/deviceId';
import {
  mintLocalId,
  resolveMapping,
  abandonMapping,
  loadIdMap,
  rewriteReferences,
} from '../ids/idMap';
import { UnresolvedReferenceError, AbandonedReferenceError } from '../errors';

describe('offline IDs and mapping systems', () => {
  beforeEach(async () => {
    localStorage.clear();
    await db.idMap.clear();
  });

  describe('localId and randomUuid', () => {
    it('generates valid v4 UUID strings', () => {
      const uuid = randomUuid();
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('mints provisional local IDs with local_ prefix', () => {
      const id = createLocalId();
      expect(id.startsWith(LOCAL_ID_PREFIX)).toBe(true);
      expect(isLocalId(id)).toBe(true);
      expect(isLocalId('prod_12345')).toBe(false);
      expect(isLocalId('66c5fa1b84e1837b2d90a412')).toBe(false);
    });

    it('mints plain UUID idempotency keys', () => {
      const key = createIdempotencyKey();
      expect(key.startsWith(LOCAL_ID_PREFIX)).toBe(false);
      expect(key.length).toBe(36);
    });
  });

  describe('deviceId', () => {
    it('creates and persists a stable device id in localStorage', () => {
      const deviceId1 = getDeviceId();
      expect(deviceId1).toBeDefined();
      expect(deviceId1.length).toBe(36);

      const deviceId2 = getDeviceId();
      expect(deviceId2).toBe(deviceId1);
    });
  });

  describe('idMap operations and reference rewriting', () => {
    it('mints and stores unresolved localId record in database', async () => {
      const localId = await mintLocalId('products');
      expect(isLocalId(localId)).toBe(true);

      const idMap = await loadIdMap();
      const record = idMap.get(localId);
      expect(record).toBeDefined();
      expect(record?.status).toBe('unresolved');
      expect(record?.resource).toBe('products');
    });

    it('resolves mapping with server ID and server key', async () => {
      const localId = await mintLocalId('categories');
      await resolveMapping(localId, 'mongo-cat-id', 'cat_001');

      const idMap = await loadIdMap();
      const record = idMap.get(localId);
      expect(record?.status).toBe('resolved');
      expect(record?.serverId).toBe('mongo-cat-id');
      expect(record?.serverKey).toBe('cat_001');
    });

    it('marks mapping as abandoned', async () => {
      const localId = await mintLocalId('categories');
      await abandonMapping(localId);

      const idMap = await loadIdMap();
      expect(idMap.get(localId)?.status).toBe('abandoned');
    });

    it('rewrites blocking and non-blocking references in payload', async () => {
      const localCatId = await mintLocalId('categories');
      await resolveMapping(localCatId, 'server-cat-id', 'cat_electron');

      const idMap = await loadIdMap();

      const payload = {
        name: 'USB Cable',
        categoryKey: localCatId,
      };

      const rewritten = rewriteReferences(
        payload,
        [{ path: 'categoryKey', target: 'categories', kind: 'key', blocking: true }],
        idMap
      ) as { name: string; categoryKey: string };

      expect(rewritten.categoryKey).toBe('cat_electron');
    });

    it('throws UnresolvedReferenceError for blocking unresolved references', async () => {
      const localCatId = await mintLocalId('categories');
      const idMap = await loadIdMap();

      const payload = { categoryKey: localCatId };

      expect(() =>
        rewriteReferences(
          payload,
          [{ path: 'categoryKey', target: 'categories', kind: 'key', blocking: true }],
          idMap
        )
      ).toThrow(UnresolvedReferenceError);
    });

    it('throws AbandonedReferenceError for abandoned references', async () => {
      const localCatId = await mintLocalId('categories');
      await abandonMapping(localCatId);
      const idMap = await loadIdMap();

      const payload = { categoryKey: localCatId };

      expect(() =>
        rewriteReferences(
          payload,
          [{ path: 'categoryKey', target: 'categories', kind: 'key', blocking: true }],
          idMap
        )
      ).toThrow(AbandonedReferenceError);
    });
  });
});
