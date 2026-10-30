import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { HeaderUpdateIndicator } from '../HeaderUpdateIndicator';

let mockUpdate: { phase: 'idle' | 'downloading' | 'ready'; percent: number | null } = {
  phase: 'idle',
  percent: null,
};
let mockHasProvider = true;
let mockIsTauri = false;
let mockIsMobile = false;

vi.mock('@/app/pwa/PwaUpdateContext', () => ({
  usePwaUpdate: () => (mockHasProvider ? { update: mockUpdate, applyUpdate: vi.fn() } : null),
}));

vi.mock('@/shared/lib/runtime', () => ({
  isTauri: () => mockIsTauri,
}));

vi.mock('@/shared/hooks/useResponsive', () => ({
  useIsMobile: () => mockIsMobile,
}));

vi.mock('@/store', () => ({
  store: { getState: () => ({ settings: { appLanguage: 'en' } }) },
}));

// MantineProvider prepends its own <style> tags; only the indicator's markup matters here.
const render = (cartItemsCount = 0) =>
  renderToString(
    <MantineProvider>
      <HeaderUpdateIndicator cartItemsCount={cartItemsCount} />
    </MantineProvider>
  ).replace(/<style[\s\S]*?<\/style>/g, '');

describe('HeaderUpdateIndicator', () => {
  beforeEach(() => {
    mockUpdate = { phase: 'idle', percent: null };
    mockHasProvider = true;
    mockIsTauri = false;
    mockIsMobile = false;
  });

  it('renders nothing when no update is on its way', () => {
    expect(render()).toBe('');
  });

  it('renders nothing without a provider', () => {
    mockHasProvider = false;
    mockUpdate = { phase: 'ready', percent: null };
    expect(render()).toBe('');
  });

  it('renders nothing in the desktop app, which updates from Settings', () => {
    mockIsTauri = true;
    mockUpdate = { phase: 'ready', percent: null };
    expect(render()).toBe('');
  });

  it('shows the download percentage and a determinate bar', () => {
    mockUpdate = { phase: 'downloading', percent: 42 };
    const html = render();
    expect(html).toContain('Downloading the update…');
    expect(html).toContain('42%');
    expect(html).toContain('update-pill-percent');
    expect(html).toContain('scaleX(0.42)');
    expect(html).not.toContain('update-progress-indeterminate');
  });

  it('shows an indeterminate bar until the size is known', () => {
    mockUpdate = { phase: 'downloading', percent: null };
    const html = render();
    expect(html).toContain('update-progress-indeterminate');
    expect(html).toContain('update-pill-percent');
    expect(html).toContain('visibility:hidden');
    expect(html).not.toContain('%');
  });

  it('offers Update now once the update is ready', () => {
    mockUpdate = { phase: 'ready', percent: 100 };
    const html = render();
    expect(html).toContain('Update ready');
    expect(html).toContain('Update now');
    expect(html).not.toContain('data-disabled');
  });

  it('disables Update now while a sale is on the till', () => {
    mockUpdate = { phase: 'ready', percent: 100 };
    expect(render(2)).toContain('data-disabled');
  });

  it('uses an icon-only control on a phone', () => {
    mockIsMobile = true;
    mockUpdate = { phase: 'ready', percent: 100 };
    const html = render();
    expect(html).toContain('aria-label="Update now"');
    expect(html).not.toContain('Update ready');
  });
});
