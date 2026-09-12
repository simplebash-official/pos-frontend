import { describe, it, expect } from 'vitest';
import {
  formatShortcutCombo,
  getShortcutKeyParts,
  getActionShortcut,
  SHORTCUT_REGISTRY,
} from '../shortcuts';

describe('shortcuts module', () => {
  describe('formatShortcutCombo', () => {
    it('formats Mac symbol combos correctly', () => {
      expect(formatShortcutCombo('Mod+Enter', { platform: 'macos' })).toBe('⌘↵');
      expect(formatShortcutCombo('Alt+Q', { platform: 'macos' })).toBe('⌥Q');
      expect(formatShortcutCombo('Mod+Shift+H', { platform: 'macos' })).toBe('⌘⇧H');
      expect(formatShortcutCombo('Ctrl+G', { platform: 'macos' })).toBe('⌃G');
    });

    it('formats Mac text combos correctly', () => {
      expect(formatShortcutCombo('Mod+Enter', { platform: 'macos', style: 'text' })).toBe(
        'Cmd+Enter'
      );
      expect(formatShortcutCombo('Alt+Q', { platform: 'macos', style: 'text' })).toBe('Option+Q');
    });

    it('formats Windows combos correctly', () => {
      expect(formatShortcutCombo('Mod+Enter', { platform: 'windows' })).toBe('Ctrl+Enter');
      expect(formatShortcutCombo('Alt+Q', { platform: 'windows' })).toBe('Alt+Q');
      expect(formatShortcutCombo('Ctrl+Shift+H', { platform: 'windows' })).toBe('Ctrl+Shift+H');
    });

    it('handles slash-separated alternative combos', () => {
      expect(formatShortcutCombo('F1 / Esc', { platform: 'macos' })).toBe('F1 / Esc');
    });
  });

  describe('getShortcutKeyParts', () => {
    it('splits Windows chords into distinct keys with + separator', () => {
      const parts = getShortcutKeyParts('Ctrl+Enter', { platform: 'windows' });
      expect(parts).toEqual([
        { text: 'Ctrl', separatorAfter: '+' },
        { text: 'Enter', separatorAfter: undefined },
      ]);
    });

    it('splits Mac chords into symbol keys without + separator', () => {
      const parts = getShortcutKeyParts('Mod+Enter', { platform: 'macos' });
      expect(parts).toEqual([
        { text: '⌘', separatorAfter: undefined },
        { text: '↵', separatorAfter: undefined },
      ]);
    });

    it('handles alternative keys separated by /', () => {
      const parts = getShortcutKeyParts('F1 / Esc', { platform: 'windows' });
      expect(parts).toEqual([
        { text: 'F1', separatorAfter: '/' },
        { text: 'Esc', separatorAfter: undefined },
      ]);
    });
  });

  describe('getActionShortcut', () => {
    it('returns macOS configuration for completeCheckout', () => {
      const sc = getActionShortcut('completeCheckout', 'macos');
      expect(sc.primary).toBe('F2');
      expect(sc.alias).toBe('Mod+Enter');
      expect(sc.formattedAlias).toBe('⌘↵');
    });

    it('returns Windows configuration for completeCheckout', () => {
      const sc = getActionShortcut('completeCheckout', 'windows');
      expect(sc.primary).toBe('F2');
      expect(sc.alias).toBe('Ctrl+Enter');
      expect(sc.formattedAlias).toBe('Ctrl+Enter');
    });

    it('returns macOS safe holdSale keys avoiding Cmd+H collision', () => {
      const sc = getActionShortcut('holdSale', 'macos');
      expect(sc.primary).toBe('Alt+H');
      expect(sc.alias).toBe('Mod+Shift+H');
      expect(sc.formattedPrimary).toBe('⌥H');
      expect(sc.formattedAlias).toBe('⌘⇧H');
    });

    it('has valid entries for all defined actions in registry', () => {
      Object.keys(SHORTCUT_REGISTRY).forEach((key) => {
        const action = getActionShortcut(key as keyof typeof SHORTCUT_REGISTRY);
        expect(action.primary).toBeDefined();
        expect(action.formattedPrimary).toBeDefined();
      });
    });
  });
});
