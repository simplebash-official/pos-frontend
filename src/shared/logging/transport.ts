/**
 * Batches log entries and ships them to the Tauri shell (`log_ingest`), which
 * owns the log files. Batching keeps IPC cheap under click storms; a hard cap
 * means a runaway page can never grow memory without bound — overflow is
 * dropped and reported as its own entry on the next flush.
 */

import type { LogEntry } from '@/shared/logging/types';
import { isoWithOffset } from '@/shared/logging/time';

export type SendBatch = (events: LogEntry[]) => Promise<unknown>;

export interface TransportOptions {
  send: SendBatch;
  flushIntervalMs: number;
  maxBatch: number;
  maxBuffered: number;
}

export class LogTransport {
  private buffer: LogEntry[] = [];
  private dropped = 0;
  private timer: ReturnType<typeof setInterval> | undefined;
  private inFlight: Promise<void> | undefined;
  private readonly options: TransportOptions;

  constructor(options: TransportOptions) {
    this.options = options;
  }

  start(): void {
    if (this.timer !== undefined) {
      return;
    }
    this.timer = setInterval(() => {
      void this.flush();
    }, this.options.flushIntervalMs);
  }

  stop(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  push(entry: LogEntry): void {
    if (this.buffer.length >= this.options.maxBuffered) {
      this.dropped += 1;
      return;
    }
    this.buffer.push(entry);
    if (this.buffer.length >= this.options.maxBatch) {
      void this.flush();
    }
  }

  get size(): number {
    return this.buffer.length;
  }

  /** Sends everything buffered, one batch at a time, in order. */
  flush(): Promise<void> {
    if (this.inFlight) {
      return this.inFlight;
    }
    this.inFlight = this.drain().finally(() => {
      this.inFlight = undefined;
    });
    return this.inFlight;
  }

  private async drain(): Promise<void> {
    while (this.buffer.length > 0 || this.dropped > 0) {
      // Entries leave the buffer only after the shell accepted them, so a
      // failed send (shell reloading, shutting down) loses nothing and the
      // next flush simply retries the same batch.
      const droppedCount = this.dropped;
      const batch = this.buffer.slice(0, this.options.maxBatch);
      const payload = droppedCount > 0 ? [droppedNotice(droppedCount), ...batch] : batch;
      try {
        await this.options.send(payload);
      } catch {
        return;
      }
      this.buffer.splice(0, batch.length);
      this.dropped -= droppedCount;
    }
  }
}

const droppedNotice = (count: number): LogEntry => ({
  ts: isoWithOffset(new Date()),
  level: 'warn',
  category: 'app',
  event: 'log.dropped',
  msg: `${count} frontend log entries dropped: buffer was full`,
  route: undefined,
  request_id: undefined,
  session_user: undefined,
  data: { count },
});
