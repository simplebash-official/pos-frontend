/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
// @ts-expect-error React act environment flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { WarrantySummarySection, type WarrantySummaryLine } from '../WarrantySummarySection';

describe('WarrantySummarySection', () => {
  let host: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    if (root !== null) {
      act(() => {
        root!.unmount();
      });
      root = null;
    }
    if (host !== null) {
      host.remove();
      host = null;
    }
  });

  const renderSection = async (lines: WarrantySummaryLine[]) => {
    await act(async () => {
      root!.render(
        <MantineProvider>
          <WarrantySummarySection lines={lines} />
        </MantineProvider>
      );
    });
  };

  it('renders nothing when no items have warranty coverage', async () => {
    await renderSection([
      {
        id: '1',
        name: 'Plain Item',
        quantity: 1,
        coverage: { kind: 'none' },
      },
    ]);
    expect(host?.querySelector('button')).toBeNull();
    expect(host?.textContent).not.toContain('Warranty on this sale');
  });

  it('renders the header and badge when items are covered', async () => {
    await renderSection([
      {
        id: '1',
        name: 'CAT6 RJ45 Patch Cable 5m',
        quantity: 1,
        coverage: { kind: 'limited', value: 6, unit: 'days' },
      },
      {
        id: '2',
        name: 'Canon CLI-751 CMYK Ink Set',
        quantity: 1,
        coverage: { kind: 'lifetime' },
      },
    ]);

    expect(host?.textContent).toContain('Warranty on this sale');
    expect(host?.textContent).toContain('2 items covered');
  });

  it('toggles expand/collapse when clicked and shows item details cleanly', async () => {
    await renderSection([
      {
        id: '1',
        name: 'CAT6 RJ45 Patch Cable 5m',
        quantity: 2,
        coverage: { kind: 'limited', value: 6, unit: 'days' },
      },
      {
        id: '2',
        name: 'Canon CLI-751 CMYK Ink Set',
        quantity: 1,
        coverage: { kind: 'lifetime' },
      },
    ]);

    const button = host?.querySelector('button[aria-expanded]');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('aria-expanded')).toBe('false');

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(button?.getAttribute('aria-expanded')).toBe('true');
    expect(host?.textContent).toContain('2 ×');
    expect(host?.textContent).toContain('CAT6 RJ45 Patch Cable 5m');
    expect(host?.textContent).toContain('6 days');
    expect(host?.textContent).toContain('Canon CLI-751 CMYK Ink Set');
    expect(host?.textContent).toContain('Lifetime');
  });
});
