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

    it('matches Alt/Option shortcuts on macOS despite diacritic character substitution', () => {
      // On macOS, Option+Q produces 'œ' with code 'KeyQ'
      const optionQ = {
        key: 'œ',
        code: 'KeyQ',
        metaKey: false,
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('Alt+Q', optionQ, true)).toBe(true);
      expect(parseCombo('Option+Q', optionQ, true)).toBe(true);

      // On macOS, Option+H produces '˙' with code 'KeyH'
      const optionH = {
        key: '˙',
        code: 'KeyH',
        metaKey: false,
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('Alt+H', optionH, true)).toBe(true);

      // On macOS, Option+A produces 'å' with code 'KeyA'
      const optionA = {
        key: 'å',
        code: 'KeyA',
        metaKey: false,
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('Alt+A', optionA, true)).toBe(true);

      // On macOS, Option+M produces 'µ' with code 'KeyM'
      const optionM = {
        key: 'µ',
        code: 'KeyM',
        metaKey: false,
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('Alt+M', optionM, true)).toBe(true);

      // On macOS, Option+C produces 'ç' with code 'KeyC'
      const optionC = {
        key: 'ç',
        code: 'KeyC',
        metaKey: false,
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('Alt+C', optionC, true)).toBe(true);
    });

    it('matches shifted punctuation symbols such as question mark', () => {
      // Typing '?' requires physical Shift on standard keyboards
      const questionEvent = {
        key: '?',
        code: 'Slash',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
      } as KeyboardEvent;

      expect(parseCombo('?', questionEvent)).toBe(true);
    });

    it('matches plus and minus keys correctly', () => {
      const plusEvent = {
        key: '+',
        code: 'Equal',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
      } as KeyboardEvent;
      expect(parseCombo('+', plusEvent)).toBe(true);

      const numpadPlusEvent = {
        key: '+',
        code: 'NumpadAdd',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      } as KeyboardEvent;
      expect(parseCombo('+', numpadPlusEvent)).toBe(true);

      const minusEvent = {
        key: '-',
        code: 'Minus',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      } as KeyboardEvent;
      expect(parseCombo('-', minusEvent)).toBe(true);
    });

    it('matches NumpadEnter as enter', () => {
      const numpadEnterEvent = {
        key: 'Enter',
        code: 'NumpadEnter',
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      } as KeyboardEvent;
      expect(parseCombo('Enter', numpadEnterEvent)).toBe(true);
    });

    it('matches Ctrl+Enter on Mac when explicit Ctrl is configured', () => {
      const macCtrlEnter = {
        key: 'Enter',
        code: 'Enter',
        metaKey: false,
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
      } as KeyboardEvent;

      expect(parseCombo('Ctrl+Enter', macCtrlEnter, true)).toBe(true);
    });

    it('matches Shift modifiers and multi-key chords', () => {
      const shiftChord = {
        key: 'f',
        code: 'KeyF',
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
        code: 'F2',
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

    it('respects ignoreInput flag when an input is focused', () => {
      const ignoredHandler = vi.fn();
      const allowedHandler = vi.fn();

      const input = document.createElement('input');
      document.body.appendChild(input);

      const shortcuts: Shortcut[] = [
        { key: '?', handler: allowedHandler, ignoreInput: true },
        { key: 'N', handler: ignoredHandler, ignoreInput: false },
      ];

      const InputTestComp = () => {
        useAppShortcuts(shortcuts, true);
        return null;
      };

      act(() => {
        root.render(React.createElement(InputTestComp));
      });

      input.focus();
      expect(document.activeElement).toBe(input);

      // Press '?' (ignoreInput: true) -> should trigger
      const questionEvent = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(questionEvent);
      expect(allowedHandler).toHaveBeenCalledTimes(1);

      // Press 'N' (ignoreInput: false) -> should be blocked
      const nEvent = new KeyboardEvent('keydown', {
        key: 'n',
        code: 'KeyN',
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(nEvent);
      expect(ignoredHandler).toHaveBeenCalledTimes(0);

      input.remove();
    });
  });
});
