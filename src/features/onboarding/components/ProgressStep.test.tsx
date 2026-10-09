// @vitest-environment jsdom
// Vitest-only (lives outside __tests__/, which is all Jest collects): it renders the real
// component and its timers in jsdom.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { ProgressStep } from './ProgressStep';
import type { SetupSystemResult } from '../types';

vi.mock('@/shared/lib/runtime', () => ({ isTauri: () => false }));

// React needs this flag to run effects/timers inside `act` outside a test renderer.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const RESULT: SetupSystemResult = {
  setup_completed: true,
  sample_data_loaded: true,
  admin_username: 'admin',
  token: null,
  user: null,
  message: '',
};

const view = (result: SetupSystemResult | null) => (
  <MantineProvider>
    <ProgressStep
      payload={{ load_sample_data: true, admin_password: undefined }}
      loading={result === null}
      result={result}
      error={null}
      onRetry={() => {}}
      onComplete={() => {}}
    />
  </MantineProvider>
);

describe('ProgressStep while the server is still saving', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    // jsdom has no matchMedia, which Mantine's provider reads.
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  const advance = async (ms: number) => {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  };
  const launchButton = () =>
    [...container.querySelectorAll('button')].find((b) => /Launch/.test(b.textContent ?? ''));
  const launchStep = () => {
    const card = [...container.querySelectorAll('.mantine-Paper-root')].find((c) =>
      (c.textContent ?? '').includes('Launch Readiness')
    );
    return card?.textContent ?? '';
  };
  const waitingNote = () => container.querySelector('[data-testid="waiting-for-server"]');

  it('says it is still working at 100%, then shows the Launch button the moment the result arrives', async () => {
    await act(async () => root.render(view(null)));

    // The animation ends in a few seconds; the server has not answered yet.
    await advance(30_000);
    expect(waitingNote()?.textContent).toContain('Still saving your shop');
    expect(launchButton()).toBeUndefined();
    expect(container.textContent).toContain('99%');
    // The new last step of the pipeline is the one still running.
    expect(launchStep()).toContain('Launch Readiness');
    expect(launchStep()).not.toContain('Ready');
    expect(container.textContent).not.toContain('100%');

    // Minutes later the answer arrives: the button appears and the waiting note goes away.
    await advance(90_000);
    expect(launchButton()).toBeUndefined();
    await act(async () => root.render(view(RESULT)));
    await advance(1_000);
    expect(launchButton()).toBeDefined();
    expect(container.textContent).toContain('100%');
    expect(launchStep()).toContain('Ready');
    expect(waitingNote()).toBeNull();
  });

  it('shows the Launch button after the animation when the result is already there', async () => {
    await act(async () => root.render(view(RESULT)));
    await advance(30_000);
    expect(launchButton()).toBeDefined();
    expect(waitingNote()).toBeNull();
  });
});
