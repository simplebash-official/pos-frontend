/**
 * @vitest-environment jsdom
 * @jest-environment jsdom
 */
import { describe, expect, it, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { BrandBackdrop, BrandLogo, GlassPill } from '../index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('Brand Components', () => {
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

  const renderWithMantine = (node: React.ReactNode) => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root?.render(<MantineProvider>{node}</MantineProvider>);
    });
  };

  it('renders BrandBackdrop as a decorative layer', () => {
    renderWithMantine(<BrandBackdrop />);
    const backdrop = container?.querySelector('[data-testid="brand-backdrop"]');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders GlassPill children', () => {
    renderWithMantine(<GlassPill>Point of Sale</GlassPill>);
    expect(container?.textContent).toContain('Point of Sale');
  });

  it('renders BrandLogo with default and on-brand tones', () => {
    renderWithMantine(
      <div>
        <BrandLogo tone="default" />
        <BrandLogo tone="on-brand" />
      </div>
    );
    expect(container?.textContent).toContain('SimpleBash');
  });
});
