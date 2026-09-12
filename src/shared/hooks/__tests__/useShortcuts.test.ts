/**
 * @jest-environment jsdom
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import React from 'react';
import { parseCombo, matchShortcutKey, useAppShortcuts, type Shortcut } from '../useShortcuts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('useAppShortcuts utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseCombo', () => {
    it('matches Mod+Enter on Mac with metaKey', () => {
      const macEvent = {
        key: 'Enter',
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('Mod+Enter', macEvent, true)).toBe(true);
      expect(parseCombo('Mod+Enter', macEvent, false)).toBe(false);
    });

    it('matches Mod+Enter on Windows with ctrlKey', () => {
      const winEvent = {
        key: 'Enter',
        metaKey: false,
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('Mod+Enter', winEvent, false)).toBe(true);
      expect(parseCombo('Mod+Enter', winEvent, true)).toBe(false);
    });

    it('matches Alt/Option shortcuts without command key', () => {
      const altQEvent = {
        key: 'q',
        metaKey: false,
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('Alt+Q', altQEvent, true)).toBe(true);
      expect(parseCombo('Option+Q', altQEvent, true)).toBe(true);
      expect(parseCombo('Alt+Q', altQEvent, false)).toBe(true);
    });

    it('matches Shift modifiers and multi-key chords', () => {
      const shiftChord = {
        key: 'f',
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
      } as KeyboardEvent;

      expect(parseCombo('Mod+Shift+F', shiftChord, true)).toBe(true);
    });

    it('matches Function keys without modifiers', () => {
      const f2Event = {
        key: 'F2',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('F2', f2Event)).toBe(true);
    });
  });

  describe('matchShortcutKey with arrays', () => {
    it('matches when any combo in array matches the event', () => {
      const f2Event = {
        key: 'F2',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      } as KeyboardEvent;

      const modEnterEvent = {
        key: 'Enter',
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      } as KeyboardEvent;

      const keys = ['F2', 'Mod+Enter'];

      expect(matchShortcutKey(keys, f2Event, true)).toBe(true);
      expect(matchShortcutKey(keys, modEnterEvent, true)).toBe(true);
      expect(
        matchShortcutKey(
          keys,
          {
            key: 'Escape',
            metaKey: false,
            ctrlKey: false,
            altKey: false,
            shiftKey: false,
          } as KeyboardEvent,
          true
        )
      ).toBe(false);
    });
  });

  describe('useAppShortcuts hook integration', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
    });

    afterEach(() => {
      act(() => {
        root.unmount();
      });
      container.remove();
    });

    it('registers and fires keydown handler', () => {
      const handler = vi.fn();
      const shortcut: Shortcut = {
        key: ['F2', 'Mod+Enter'],
        handler,
        ignoreInput: true,
      };

      const TestComp = ({ active }: { active: boolean }) => {
        useAppShortcuts([shortcut], active);
        return null;
      };

      act(() => {
        root.render(React.createElement(TestComp, { active: true }));
      });

      const event = new KeyboardEvent('keydown', {
        key: 'F2',
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(event);
      expect(handler).toHaveBeenCalledTimes(1);

      // Inactive test
      act(() => {
        root.render(React.createElement(TestComp, { active: false }));
      });

      window.dispatchEvent(event);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('shadows underlying scopes when a new modal scope is active', () => {
      const bgHandler = vi.fn();
      const modalHandler = vi.fn();

      const bgShortcut: Shortcut = { key: 'Escape', handler: bgHandler };
      const modalShortcut: Shortcut = { key: 'Escape', handler: modalHandler };

      const ModalComponent = () => {
        useAppShortcuts([modalShortcut], true);
        return null;
      };

      const TestStack = ({ modalOpen }: { modalOpen: boolean }) => {
        useAppShortcuts([bgShortcut], true);
        if (modalOpen) {
          return React.createElement(ModalComponent);
        }
        return null;
      };

      act(() => {
        root.render(React.createElement(TestStack, { modalOpen: false }));
      });
      act(() => {
        root.render(React.createElement(TestStack, { modalOpen: true }));
      });

      const escEvent = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });

      window.dispatchEvent(escEvent);
      expect(modalHandler).toHaveBeenCalledTimes(1);
      expect(bgHandler).toHaveBeenCalledTimes(0); // shadowed!

      // Close modal
      act(() => {
        root.render(React.createElement(TestStack, { modalOpen: false }));
      });

      window.dispatchEvent(escEvent);
      expect(bgHandler).toHaveBeenCalledTimes(1);
    });
  });
});
