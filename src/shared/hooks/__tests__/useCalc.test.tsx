/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, useEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCalc, type LiveCalc } from '../useCalc';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

interface Reply {
  double: number;
}

let latest: LiveCalc<Reply>;
const Probe = ({
  input,
  fetcher,
}: {
  input: number;
  fetcher: (n: number, s: AbortSignal) => Promise<Reply>;
}) => {
  const value = useCalc('probe', input, fetcher);
  useEffect(() => {
    latest = value;
  });
  return null;
};

describe('useCalc', () => {
  let container: HTMLDivElement;
  let root: Root;
  let client: QueryClient;

  beforeEach(() => {
    container = document.createElement('div');
    root = createRoot(container);
    client = new QueryClient();
  });
  afterEach(() => {
    act(() => root.unmount());
  });

  const render = async (input: number, fetcher: (n: number, s: AbortSignal) => Promise<Reply>) => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={client}>
          <Probe input={input} fetcher={fetcher} />
        </QueryClientProvider>
      );
    });
  };
  const tick = () => act(async () => new Promise((resolve) => setTimeout(resolve, 0)));

  it('is current once the server has answered this exact input', async () => {
    const fetcher = vi.fn((n: number) => Promise.resolve({ double: n * 2 }));
    await render(2, fetcher);
    await tick();
    expect(latest.data).toEqual({ double: 4 });
    expect(latest.isCurrent).toBe(true);
    expect(latest.error).toBeNull();
  });

  it('keeps showing the last answer, marked not current, while a newer one is on its way', async () => {
    let release: (reply: Reply) => void = () => undefined;
    const fetcher = vi.fn((n: number) =>
      n === 2
        ? Promise.resolve({ double: 4 })
        : new Promise<Reply>((resolve) => {
            release = resolve;
          })
    );
    await render(2, fetcher);
    await tick();
    await render(3, fetcher);
    expect(latest.data).toEqual({ double: 4 });
    expect(latest.isCurrent).toBe(false);

    release({ double: 6 });
    await tick();
    expect(latest.data).toEqual({ double: 6 });
    expect(latest.isCurrent).toBe(true);
  });

  it('cancels the request still in flight when the input changes', async () => {
    const signals: AbortSignal[] = [];
    const fetcher = vi.fn((_n: number, signal: AbortSignal) => {
      signals.push(signal);
      return new Promise<Reply>(() => undefined);
    });
    await render(1, fetcher);
    await render(2, fetcher);
    expect(signals).toHaveLength(2);
    expect(signals[0].aborted).toBe(true);
  });

  it('has no answer and an error when the server cannot answer, and works nothing out itself', async () => {
    const fetcher = vi.fn(() => Promise.reject({ message: 'down', statusCode: 0 }));
    await render(5, fetcher);
    await tick();
    expect(latest.data).toBeUndefined();
    expect(latest.isCurrent).toBe(false);
    expect(latest.error).toMatchObject({ message: 'down' });
  });
});
