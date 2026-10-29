/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { BusyOverlay } from './BusyOverlay';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('BusyOverlay', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
  });

  it('shows the orb loader with its message while busy', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root?.render(
        <MantineProvider>
          <BusyOverlay visible title="Signing in..." subtitle="Connecting to POS console..." />
        </MantineProvider>
      );
    });

    expect(document.body.textContent).toContain('Signing in...');
    expect(document.body.textContent).toContain('Connecting to POS console...');
  });

  it('renders nothing when not busy', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root?.render(
        <MantineProvider>
          <BusyOverlay visible={false} title="Signing in..." />
        </MantineProvider>
      );
    });

    expect(document.body.textContent).not.toContain('Signing in...');
  });
});
