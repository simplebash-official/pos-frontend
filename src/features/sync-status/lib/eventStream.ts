/**
 * A minimal server-sent-events reader over `fetch`, for the cloud's
 * `GET /api/sync/events`. The browser's own `EventSource` cannot send an
 * `Authorization` header, which that endpoint requires.
 */

export interface StreamEvent {
  event: string;
  data: string;
}

/**
 * Incremental `text/event-stream` parser: feed decoded text as it arrives and
 * get back the events completed so far. Comment lines (the server's
 * heartbeat) are skipped.
 */
export class EventStreamParser {
  private buffer = '';
  private event = '';
  private data: string[] = [];

  feed(text: string): StreamEvent[] {
    this.buffer += text;
    const out: StreamEvent[] = [];
    let newline = this.buffer.indexOf('\n');
    while (newline !== -1) {
      const line = this.buffer.slice(0, newline).replace(/\r$/, '');
      this.buffer = this.buffer.slice(newline + 1);
      newline = this.buffer.indexOf('\n');
      if (line === '') {
        if (this.data.length > 0 || this.event !== '') {
          out.push({ event: this.event || 'message', data: this.data.join('\n') });
        }
        this.event = '';
        this.data = [];
        continue;
      }
      if (line.startsWith(':')) continue;
      const colon = line.indexOf(':');
      const field = colon === -1 ? line : line.slice(0, colon);
      let value = colon === -1 ? '' : line.slice(colon + 1);
      if (value.startsWith(' ')) value = value.slice(1);
      if (field === 'event') this.event = value;
      else if (field === 'data') this.data.push(value);
    }
    return out;
  }
}

/** Why a stream ended, so the caller can pick how long to wait. */
export type StreamEnd = 'closed' | 'unauthorized' | 'unsupported' | 'failed';

/**
 * Opens the stream and calls `onEvent` for each event until it ends, the
 * server goes silent for `silenceMs` (a dead connection) or `signal` aborts.
 */
export const readEventStream = async (
  url: string,
  headers: Record<string, string>,
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal,
  silenceMs = 45_000
): Promise<StreamEnd> => {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: 'text/event-stream', ...headers },
      signal,
      cache: 'no-store',
    });
  } catch {
    return 'failed';
  }
  if (response.status === 401 || response.status === 403) return 'unauthorized';
  if (response.status === 404 || response.status === 405) return 'unsupported';
  if (!response.ok || !response.body) return 'failed';

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parser = new EventStreamParser();
  try {
    for (;;) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const silence = new Promise<'silent'>((resolve) => {
        timer = setTimeout(() => resolve('silent'), silenceMs);
      });
      const next = await Promise.race([reader.read(), silence]);
      clearTimeout(timer);
      if (next === 'silent') return 'failed';
      if (next.done) return 'closed';
      for (const event of parser.feed(decoder.decode(next.value, { stream: true }))) {
        onEvent(event);
      }
    }
  } catch {
    return signal.aborted ? 'closed' : 'failed';
  } finally {
    reader.cancel().catch(() => undefined);
  }
};
