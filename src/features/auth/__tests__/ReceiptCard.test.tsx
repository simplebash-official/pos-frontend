/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { MotionGlobalConfig } from 'framer-motion';
import { ReceiptCard } from '../components/ReceiptCard';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
MotionGlobalConfig.skipAnimations = true;

describe('ReceiptCard', () => {
  let root: Root | null = null;
  let container: HTMLDivElement | null = null;

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    container?.remove();
    container = null;
  });

  it('prints every feature line, the total and stays hidden from screen readers', () => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root?.render(
        <MantineProvider>
          <ReceiptCard />
        </MantineProvider>
      );
    });

    const card = container.querySelector('[data-testid="receipt-card"]');
    expect(card?.getAttribute('aria-hidden')).toBe('true');
    for (const text of [
      'Receipt',
      'Sales',
      'Stock',
      'Repairs',
      'Reports',
      'Total',
      'Ready to sell',
    ]) {
      expect(card?.textContent).toContain(text);
    }
  });
});
