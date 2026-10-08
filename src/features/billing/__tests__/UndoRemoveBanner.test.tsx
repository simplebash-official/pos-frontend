import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { UndoRemoveBanner } from '../components/UndoRemoveBanner';

const renderBanner = (props: Partial<Parameters<typeof UndoRemoveBanner>[0]> = {}) => {
  const defaultProps = {
    itemName: 'Unisex Fleece Hoodie (Navy Blue - M)',
    onUndo: vi.fn(),
    onDismiss: vi.fn(),
    durationMs: 4000,
    ...props,
  };

  return renderToString(
    <MantineProvider>
      <UndoRemoveBanner {...defaultProps} />
    </MantineProvider>
  ).replace(/<!-- -->/g, '');
};

describe('UndoRemoveBanner', () => {
  it('renders the removed product name and "Removed" label', () => {
    const html = renderBanner({ itemName: 'Cordless Drill 18V' });
    expect(html).toContain('Removed');
    expect(html).toContain('Cordless Drill 18V');
  });

  it('renders the initial countdown on the undo button', () => {
    const html = renderBanner({ durationMs: 4000 });
    expect(html).toContain('Undo');
    expect(html).toContain('(4s)');
  });

  it('calculates initial seconds according to durationMs', () => {
    const html = renderBanner({ durationMs: 7000 });
    expect(html).toContain('(7s)');
  });

  it('renders the dismiss close action button', () => {
    const html = renderBanner();
    expect(html).toContain('aria-label="Dismiss"');
  });

  it('contains the smooth countdown progress bar element', () => {
    const html = renderBanner();
    expect(html).toContain('width:100%');
  });
});
