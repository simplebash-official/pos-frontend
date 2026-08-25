import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db/schema';
import { logSyncEvent, logInfo, logWarn, logError } from '../engine/auditLog';

describe('auditLog ring buffer', () => {
  beforeEach(async () => {
    await db.auditLog.clear();
  });

  it('records log events into database with timestamps and levels', async () => {
    await logSyncEvent('info', 'products', 'Snapshot pull started', { rows: 50 });

    const logs = await db.auditLog.toArray();
    expect(logs).toHaveLength(1);
    expect(logs[0].level).toBe('info');
    expect(logs[0].resource).toBe('products');
    expect(logs[0].message).toBe('Snapshot pull started');
    expect(logs[0].detail).toEqual({ rows: 50 });
  });

  it('logs info, warn, and error convenience wrappers', async () => {
    logInfo('categories', 'Category updated');
    logWarn('suppliers', 'Network slow');
    logError('invoices', 'Push failed');

    // Wait a tick for async logging
    await new Promise((r) => setTimeout(r, 20));

    const logs = await db.auditLog.toArray();
    expect(logs).toHaveLength(3);
    expect(logs.map((l) => l.level)).toEqual(['info', 'warn', 'error']);
  });
});
