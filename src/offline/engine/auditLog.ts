import { AUDIT_LOG_LIMIT } from '../constants';
import { db } from '../db/schema';
import type { AuditEvent, AuditLevel } from '../db/tables';

/**
 * A capped ring buffer of sync events.
 *
 * Debugging "the Nugegoda terminal's stock is wrong" on a machine you cannot
 * attach a debugger to is otherwise guesswork. The dashboard exports this as
 * JSON alongside the outbox and sync metadata.
 */

let writesSinceTrim = 0;

export const logSyncEvent = async (
  level: AuditLevel,
  resource: string | null,
  message: string,
  detail: Record<string, unknown> | null
): Promise<void> => {
  const event: AuditEvent = {
    at: new Date().toISOString(),
    level,
    resource,
    message,
    detail,
  };

  try {
    await db.auditLog.add(event);
  } catch {
    // Diagnostics must never break the thing they are diagnosing.
    return;
  }

  // Trim in batches rather than on every write — a 500-row pull would
  // otherwise pay for a count() and a delete() per logged line.
  writesSinceTrim += 1;
  if (writesSinceTrim >= 50) {
    writesSinceTrim = 0;
    await trimAuditLog();
  }
};

const trimAuditLog = async (): Promise<void> => {
  try {
    const count = await db.auditLog.count();
    if (count <= AUDIT_LOG_LIMIT) {
      return;
    }
    const excess = count - AUDIT_LOG_LIMIT;
    const oldest = await db.auditLog.orderBy('seq').limit(excess).primaryKeys();
    await db.auditLog.bulkDelete(oldest);
  } catch {
    return;
  }
};

export const logInfo = (
  resource: string | null,
  message: string,
  detail: Record<string, unknown> | null = null
): void => {
  void logSyncEvent('info', resource, message, detail);
};

export const logWarn = (
  resource: string | null,
  message: string,
  detail: Record<string, unknown> | null = null
): void => {
  void logSyncEvent('warn', resource, message, detail);
};

export const logError = (
  resource: string | null,
  message: string,
  detail: Record<string, unknown> | null = null
): void => {
  void logSyncEvent('error', resource, message, detail);
};
