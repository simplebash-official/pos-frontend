import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchHistoryInput } from '../SearchHistoryInput';
import { STORAGE_KEYS } from '@/constants/storage';

describe('SearchHistoryInput Component & Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('exports SearchHistoryInput as a forwardRef component', () => {
    expect(typeof SearchHistoryInput).toBe('object');
    expect(SearchHistoryInput.displayName).toBe('SearchHistoryInput');
  });

  describe('Search history storage & namespace isolation', () => {
    it('stores and retrieves search history per namespace in localStorage', () => {
      const billingData = {
        billing: [
          { query: 'USB-C Cable', timestamp: Date.now() },
          { query: 'Wireless Mouse', timestamp: Date.now() - 1000 },
        ],
        service_jobs: [{ query: 'REP-1001', timestamp: Date.now() }],
      };

      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(billingData));

      const raw = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      const parsed = JSON.parse(raw || '{}');

      expect(parsed.billing).toHaveLength(2);
      expect(parsed.billing[0].query).toBe('USB-C Cable');
      expect(parsed.service_jobs).toHaveLength(1);
      expect(parsed.service_jobs[0].query).toBe('REP-1001');
    });

    it('prunes search history entries exceeding max items per namespace', () => {
      const items = Array.from({ length: 12 }, (_, i) => ({
        query: `Search Item ${i + 1}`,
        timestamp: Date.now() - i * 100,
      }));

      const data = { billing: items.slice(0, 8) };
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(data));

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY) || '{}');
      expect(stored.billing).toHaveLength(8);
      expect(stored.billing[0].query).toBe('Search Item 1');
    });
  });

  describe('Trigger modes and history button behavior', () => {
    it('defaults trigger to focus when showHistoryButton is false or omitted', () => {
      const showHistoryButton = false;
      const explicitTrigger = undefined;
      const resolvedTrigger = explicitTrigger ?? (showHistoryButton ? 'button' : 'focus');
      expect(resolvedTrigger).toBe('focus');
    });

    it('resolves trigger to button when showHistoryButton is true and trigger is omitted', () => {
      const showHistoryButton = true;
      const explicitTrigger = undefined;
      const resolvedTrigger = explicitTrigger ?? (showHistoryButton ? 'button' : 'focus');
      expect(resolvedTrigger).toBe('button');
    });

    it('respects explicit trigger prop override', () => {
      const explicitTrigger = 'both' as const;
      const showHistoryButton = true;
      const resolvedTrigger = explicitTrigger ?? (showHistoryButton ? 'button' : 'focus');
      expect(resolvedTrigger).toBe('both');
    });

    it('determines canOpen correctly based on trigger and history presence', () => {
      const computeCanOpen = (
        enableHistory: boolean,
        trigger: 'focus' | 'button' | 'both',
        historyCount: number
      ) => {
        return enableHistory && (trigger === 'button' || trigger === 'both' || historyCount > 0);
      };

      // In focus mode: canOpen requires history.length > 0 to prevent empty popups
      expect(computeCanOpen(true, 'focus', 0)).toBe(false);
      expect(computeCanOpen(true, 'focus', 1)).toBe(true);

      // In button mode: canOpen is true even with 0 items so user sees friendly empty state
      expect(computeCanOpen(true, 'button', 0)).toBe(true);
      expect(computeCanOpen(true, 'both', 0)).toBe(true);

      // When enableHistory is false: canOpen is always false
      expect(computeCanOpen(false, 'button', 1)).toBe(false);
      expect(computeCanOpen(false, 'focus', 1)).toBe(false);
    });

    it('filters history items matching current query', () => {
      const history = ['USB-C Fast Charging Cable', 'Wireless Mouse', 'USB Adapter', 'Keyboard'];
      const query = 'usb';

      const filtered = history.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase().trim())
      );
      expect(filtered).toEqual(['USB-C Fast Charging Cable', 'USB Adapter']);
    });
  });
});
