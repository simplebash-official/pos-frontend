import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { EventStreamParser, readEventStream, type StreamEvent } from '../lib/eventStream';
import { queryRootsFor, RESOURCE_QUERY_ROOTS } from '../lib/resourceQueryKeys';
import { MODULES } from '../lib/syncView';
import { createRefresher } from '../hooks/useLiveRefresh';
import { logger } from '@/shared/logging';

/** Every record type the backend syncs (`SYNC_RESOURCES`). */
const SYNCED = MODULES.flatMap((m) => m.resources);

describe('resource → screens map', () => {
  it('covers every synced record type', () => {
    expect(SYNCED).toHaveLength(15);
    const missing = SYNCED.filter((resource) => !RESOURCE_QUERY_ROOTS[resource]);
    expect(missing).toEqual([]);
  });

  it('merges and de-duplicates roots across record types', () => {
    const roots = queryRootsFor(['invoices', 'payments']);
    expect(roots).not.toBeNull();
    const keys = roots!.map((r) => JSON.stringify(r));
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain(JSON.stringify(queryKeys.billing.all));
    expect(keys).toContain(JSON.stringify(queryKeys.customers.all));
  });

  it('asks for everything on a full re-download or an unknown type', () => {
    expect(queryRootsFor(['*'])).toBeNull();
    expect(queryRootsFor(['products', 'somethingNew'])).toBeNull();
  });
});

describe('EventStreamParser', () => {
  it('parses events split across chunks and skips heartbeats', () => {
    const p = new EventStreamParser();
    expect(p.feed(': ping\n\nevent: cha')).toEqual([]);
    const out = p.feed('nge\r\nid: 9\r\ndata: {"seq":9}\r\n\r\nevent: resync\ndata: {}\n\n');
    expect(out).toEqual<StreamEvent[]>([
      { event: 'change', data: '{"seq":9}' },
      { event: 'resync', data: '{}' },
    ]);
  });
});

// Real (short) timers: this file also runs under Jest, whose `vi` shim has no
// fake timers.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('createRefresher', () => {
  it('reloads each affected screen once per burst', async () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
    const refresher = createRefresher(client, 20);

    refresher.add(['invoices']);
    refresher.add(['payments', 'stockMovements']);
    expect(spy).not.toHaveBeenCalled();
    await sleep(60);

    const keys = spy.mock.calls.map(([filters]) => JSON.stringify(filters?.queryKey));
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain(JSON.stringify(queryKeys.billing.all));
    expect(keys).toContain(JSON.stringify(queryKeys.inventory.all));
    refresher.stop();
  });

  it('writes one activity-log line per reload naming what changed', async () => {
    const client = new QueryClient();
    vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
    const log = vi.spyOn(logger, 'event').mockImplementation(() => undefined);
    const refresher = createRefresher(client, 10);

    refresher.add(['invoices']);
    refresher.add(['payments']);
    await sleep(40);

    const calls = log.mock.calls.filter(([, event]) => event === 'live-refresh');
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toBe('sync');
    expect(calls[0][2]).toMatchObject({ resources: ['invoices', 'payments'], all: false });
    log.mockRestore();
    refresher.stop();
  });

  it('reloads everything after a full re-download', async () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
    const refresher = createRefresher(client, 10);
    refresher.add(['*']);
    await sleep(40);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });

  it('does nothing after stop', async () => {
    const client = new QueryClient();
    const spy = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
    const refresher = createRefresher(client, 10);
    refresher.add(['customers']);
    refresher.stop();
    await sleep(40);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('readEventStream', () => {
  afterEach(() => vi.unstubAllGlobals());

  const streamOf = (...chunks: string[]) =>
    new ReadableStream<Uint8Array>({
      start(controller) {
        const enc = new TextEncoder();
        chunks.forEach((c) => controller.enqueue(enc.encode(c)));
        controller.close();
      },
    });

  it('delivers events with the auth header and reports a clean close', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        streamOf('event: hello\ndata: {"latestSeq":3}\n\n', 'event: change\ndata: {"seq":4}\n\n'),
        {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);
    const seen: StreamEvent[] = [];

    const end = await readEventStream(
      '/api/sync/events',
      { Authorization: 'Bearer t' },
      (e) => seen.push(e),
      new AbortController().signal
    );

    expect(end).toBe('closed');
    expect(seen.map((e) => e.event)).toEqual(['hello', 'change']);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer t');
  });

  it('tells a server without the stream apart from a failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));
    const end = await readEventStream('/x', {}, () => undefined, new AbortController().signal);
    expect(end).toBe('unsupported');

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 401 })));
    expect(await readEventStream('/x', {}, () => undefined, new AbortController().signal)).toBe(
      'unauthorized'
    );

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
    expect(await readEventStream('/x', {}, () => undefined, new AbortController().signal)).toBe(
      'failed'
    );
  });
});
