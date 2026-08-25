import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAppShortcuts, type Shortcut } from '../useShortcuts';

describe('useAppShortcuts utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    // cleanup
  });

  it('exports useAppShortcuts function', () => {
    expect(typeof useAppShortcuts).toBe('function');
  });

  it('validates shortcut definitions structure', () => {
    const handler = vi.fn();
    const shortcut: Shortcut = {
      key: 'Ctrl+D',
      handler,
      ignoreInput: true,
      preventDefault: true,
    };

    expect(shortcut.key).toBe('Ctrl+D');
    expect(shortcut.ignoreInput).toBe(true);
    shortcut.handler({} as KeyboardEvent);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
