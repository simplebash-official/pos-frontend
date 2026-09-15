import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LogTransport } from '../transport';
import { logger } from '../logger';
import type { LogEntry } from '../types';

const entry = (event: string): LogEntry => ({
  ts: '2026-09-15T10:00:00.000+05:30',
  level: 'info',
  category: 'ui',
  event,
  msg: undefined,
  route: undefined,
  request_id: undefined,
  session_user: undefined,
  data: undefined,
});

describe('LogTransport', () => {
  it('sends in batches, in order', async () => {
    const batches: LogEntry[][] = [];
    const transport = new LogTransport({
      send: async (events) => {
        batches.push(events);
      },
      flushIntervalMs: 60_000,
      maxBatch: 2,
      maxBuffered: 100,
    });
    ['a', 'b', 'c'].forEach((e) => transport.push(entry(e)));
    await transport.flush();
    expect(batches.flat().map((e) => e.event)).toEqual(['a', 'b', 'c']);
    expect(batches.every((b) => b.length <= 2)).toBe(true);
    expect(transport.size).toBe(0);
  });

  it('keeps a failed batch for retry and reports drops', async () => {
    let fail = true;
    const sent: LogEntry[] = [];
    const transport = new LogTransport({
      send: async (events) => {
        if (fail) throw new Error('shell reloading');
        sent.push(...events);
      },
      flushIntervalMs: 60_000,
      maxBatch: 10,
      maxBuffered: 2,
    });
    transport.push(entry('a'));
    transport.push(entry('b'));
    transport.push(entry('overflow'));
    await transport.flush();
    expect(transport.size).toBe(2);
    fail = false;
    await transport.flush();
    expect(sent.map((e) => e.event)).toEqual(['log.dropped', 'a', 'b']);
    expect(sent[0].data).toEqual({ count: 1 });
  });
});

describe('logger', () => {
  let sent: LogEntry[];

  afterEach(() => {
    logger.reset();
  });

  beforeEach(() => {
    logger.reset();
    sent = [];
    logger.start(async (events) => {
      sent.push(...events);
    });
  });

  it('is a no-op until started', async () => {
    logger.reset();
    expect(logger.enabled).toBe(false);
    logger.info('ui', 'ignored');
    await logger.flush();
    expect(sent).toHaveLength(0);
  });

  it('stamps route, user, level and redacts data and message', async () => {
    logger.setRoute('/billing');
    logger.setSessionUser('usr_1');
    logger.event(
      'ui',
      'click',
      { password: 'p', label: 'Save' },
      { level: 'warn', msg: 'Bearer abc.def' }
    );
    await logger.flush();
    expect(sent).toHaveLength(1);
    const [e] = sent;
    expect(e.route).toBe('/billing');
    expect(e.session_user).toBe('usr_1');
    expect(e.level).toBe('warn');
    expect(e.data).toEqual({ password: '[REDACTED]', label: 'Save' });
    expect(e.msg).toBe('[REDACTED]');
    expect(e.ts).toMatch(/T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/);
  });

  it('records errors with stack and message', async () => {
    logger.error('error', 'boom', new Error('kaput'), { where: 'test' });
    await logger.flush();
    const data = sent[0].data as { where: string; error: { message: string; stack: string } };
    expect(sent[0].level).toBe('error');
    expect(sent[0].msg).toBe('kaput');
    expect(data.where).toBe('test');
    expect(data.error.message).toBe('kaput');
    expect(typeof data.error.stack).toBe('string');
  });
});
