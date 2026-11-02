/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { BrandPanel } from '../components/BrandPanel';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('BrandPanel', () => {
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

  const renderPanel = (props: React.ComponentProps<typeof BrandPanel>) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root?.render(
        <MantineProvider>
          <BrandPanel {...props} />
        </MantineProvider>
      );
    });
  };

  it('renders headline, subline, badge, and logo on desktop', () => {
    renderPanel({
      badge: 'Point of Sale',
      headline: 'Run your shop, simply',
      subline: 'Sales, stock and repairs in one place.',
    });

    expect(container?.textContent).toContain('Point of Sale');
    expect(container?.textContent).toContain('Run your shop, simply');
    expect(container?.textContent).toContain('Sales, stock and repairs in one place.');
    expect(container?.textContent).toContain('SimpleBash');
    expect(container?.querySelector('[data-testid="receipt-card"]')).not.toBeNull();
    expect(container?.textContent).toContain("Today's profit");
  });

  it('renders in compact mode without badge and subline', () => {
    renderPanel({
      badge: 'Point of Sale',
      headline: 'Run your shop, simply',
      subline: 'Sales, stock and repairs in one place.',
      compact: true,
    });

    expect(container?.textContent).toContain('Run your shop, simply');
    expect(container?.textContent).not.toContain('Point of Sale');
    expect(container?.textContent).not.toContain('Sales, stock and repairs in one place.');
    expect(container?.querySelector('[data-testid="receipt-card"]')).toBeNull();
  });
});
