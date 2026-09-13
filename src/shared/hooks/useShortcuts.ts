import { useEffect, useRef, type RefObject } from 'react';
import { isMac } from '../lib/platform';

export interface Shortcut {
  key: string | string[]; // e.g. "Enter", "F2", "Mod+Enter", ["F2", "Mod+Enter"], "?"
  handler: (e: KeyboardEvent) => void;
  ignoreInput?: boolean; // fire even while an <input>/<textarea>/contentEditable is focused
  preventDefault?: boolean; // defaults to true
}

interface ShortcutScope {
  id: symbol;
  shortcuts: RefObject<Shortcut[]>;
}

const activeScopes: ShortcutScope[] = [];
let isListenerBound = false;

const MODIFIER_TOKENS = ['mod', 'cmd', 'meta', 'ctrl', 'control', 'alt', 'opt', 'option', 'shift'];

/**
 * Parses and matches a combo string against a KeyboardEvent.
 * Supports cross-platform 'Mod' modifier (Cmd on Mac, Ctrl on Win/Linux),
 * as well as explicit Alt/Option, Shift, and Control keys.
 */
const SHIFTED_PUNCTUATION = new Set([
  '?', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', ':', '"', '<', '>', '~'
]);

/**
 * Tokenizes a shortcut combo string into modifier tokens and the main action key.
 * Correctly handles combinations targeting '+' or shifted characters.
 */
export const tokenizeCombo = (combo: string): { modifiers: string[]; mainKey: string } => {
  const normalized = combo.trim();
  if (!normalized) return { modifiers: [], mainKey: '' };
  if (normalized === '+') {
    return { modifiers: [], mainKey: '+' };
  }

  let mainKey = '';
  let modPart = normalized;

  if (normalized.endsWith('++')) {
    mainKey = '+';
    modPart = normalized.slice(0, -2);
  } else if (normalized.endsWith('+') && normalized.length > 1) {
    mainKey = '+';
    modPart = normalized.slice(0, -1);
  }

  const rawTokens = modPart
    .toLowerCase()
    .split('+')
    .map((t) => t.trim())
    .filter(Boolean);

  if (!mainKey) {
    const nonModIndex = rawTokens.findLastIndex((t) => !MODIFIER_TOKENS.includes(t));
    if (nonModIndex !== -1) {
      mainKey = rawTokens[nonModIndex];
      rawTokens.splice(nonModIndex, 1);
    }
  }

  return { modifiers: rawTokens, mainKey };
};

/**
 * Parses and matches a combo string against a KeyboardEvent.
 * Supports cross-platform 'Mod' modifier (Cmd on Mac, Ctrl on Win/Linux),
 * as well as explicit Alt/Option, Shift, and Control keys.
 * Accurately falls back to e.code so macOS Option/Alt diacritic characters
 * (e.g. Option+Q => 'œ', Option+H => '˙') match reliably.
 */
export const parseCombo = (
  combo: string,
  e: KeyboardEvent,
  isMacPlatform: boolean = isMac
): boolean => {
  const { modifiers, mainKey } = tokenizeCombo(combo);
  if (!mainKey) return false;

  const hasMod = modifiers.includes('mod');
  const hasCmd = modifiers.includes('cmd') || modifiers.includes('meta');
  const hasCtrl = modifiers.includes('ctrl') || modifiers.includes('control');
  const hasAlt = modifiers.includes('alt') || modifiers.includes('opt') || modifiers.includes('option');
  const hasShift = modifiers.includes('shift');

  // Check Mod / Cmd / Ctrl matching:
  if (hasMod) {
    if (isMacPlatform) {
      if (!e.metaKey || e.ctrlKey) return false;
    } else {
      if (!e.ctrlKey || e.metaKey) return false;
    }
  } else if (hasCmd) {
    if (!e.metaKey) return false;
  } else if (hasCtrl) {
    // Legacy / dual support: 'ctrl' matches ctrlKey OR metaKey for backwards compatibility
    if (!e.ctrlKey && !e.metaKey) return false;
  } else {
    // If neither command, ctrl, nor mod was requested, ensure neither is held
    if (e.ctrlKey || e.metaKey) return false;
  }

  if (hasAlt !== e.altKey) return false;

  // Shift matching: shifted punctuation characters (like '?' which requires Shift+/)
  // must not be rejected when the user physically presses Shift to produce the symbol.
  const isShiftedChar = SHIFTED_PUNCTUATION.has(mainKey);
  if (!isShiftedChar && hasShift !== e.shiftKey) {
    return false;
  }

  const eventKey = (e.key || '').toLowerCase();
  const targetKey = mainKey.toLowerCase();
  const eventCode = (e.code || '').toLowerCase();

  // Normalize common key aliases & physical code checks:
  if (targetKey === 'enter' || targetKey === 'return') {
    return eventKey === 'enter' || eventCode === 'enter' || eventCode === 'numpadenter';
  }
  if (targetKey === 'esc' || targetKey === 'escape') {
    return eventKey === 'escape' || eventCode === 'escape';
  }
  if (targetKey === 'up') {
    return eventKey === 'arrowup' || eventKey === 'up' || eventCode === 'arrowup';
  }
  if (targetKey === 'down') {
    return eventKey === 'arrowdown' || eventKey === 'down' || eventCode === 'arrowdown';
  }
  if (targetKey === 'left') {
    return eventKey === 'arrowleft' || eventKey === 'left' || eventCode === 'arrowleft';
  }
  if (targetKey === 'right') {
    return eventKey === 'arrowright' || eventKey === 'right' || eventCode === 'arrowright';
  }
  if (targetKey === 'space' || targetKey === 'spacebar') {
    return eventKey === ' ' || eventKey === 'spacebar' || eventCode === 'space';
  }
  if (targetKey === 'delete' || targetKey === 'del') {
    return eventKey === 'delete' || eventCode === 'delete';
  }
  if (targetKey === 'backspace') {
    return eventKey === 'backspace' || eventCode === 'backspace';
  }
  if (targetKey === '+') {
    return eventKey === '+' || eventCode === 'equal' || eventCode === 'numpadadd';
  }
  if (targetKey === '-') {
    return eventKey === '-' || eventCode === 'minus' || eventCode === 'numpadsubtract';
  }
  if (targetKey === '?') {
    return eventKey === '?' || (eventCode === 'slash' && e.shiftKey);
  }

  // Letters a-z: check eventKey first, then fall back to eventCode ('KeyA'...'KeyZ')
  // This is the critical fix for macOS Option/Alt chords where Option+Q produces 'œ', etc.
  if (targetKey.length === 1 && targetKey >= 'a' && targetKey <= 'z') {
    return eventKey === targetKey || eventCode === `key${targetKey}`;
  }

  // Numbers 0-9:
  if (targetKey.length === 1 && targetKey >= '0' && targetKey <= '9') {
    return (
      eventKey === targetKey ||
      eventCode === `digit${targetKey}` ||
      eventCode === `numpad${targetKey}`
    );
  }

  return eventKey === targetKey || eventCode === targetKey;
};

/**
 * Matches a shortcut definition's key (string or array of alias strings) against a KeyboardEvent.
 */
export const matchShortcutKey = (
  key: string | string[],
  e: KeyboardEvent,
  isMacPlatform: boolean = isMac
): boolean => {
  if (Array.isArray(key)) {
    return key.some((k) => parseCombo(k, e, isMacPlatform));
  }
  return parseCombo(key, e, isMacPlatform);
};

const isInputFocused = (): boolean => {
  const el = document.activeElement as HTMLElement | null;
  return el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA' || Boolean(el?.isContentEditable);
};

const handleKeyDown = (e: KeyboardEvent) => {
  const inputFocused = isInputFocused();

  for (let i = activeScopes.length - 1; i >= 0; i--) {
    const scope = activeScopes[i];
    let handled = false;

    for (const shortcut of scope.shortcuts.current) {
      if (!matchShortcutKey(shortcut.key, e)) continue;
      if (inputFocused && !shortcut.ignoreInput) continue;

      if (shortcut.preventDefault !== false) {
        e.preventDefault();
      }
      shortcut.handler(e);
      handled = true;
    }

    // A scope that handles the key shadows every scope below it in the stack —
    // this is how a modal's own shortcuts take priority over the page behind it.
    if (handled) return;
  }
};

/**
 * Registers a scope of keyboard shortcuts on the global `window` keydown listener.
 * Scopes stack: the most-recently-activated scope sees a key first, and if it
 * handles the key, scopes registered earlier (e.g. the page underneath a modal)
 * never see it.
 */
export const useAppShortcuts = (shortcuts: Shortcut[], isActive: boolean = true): void => {
  const shortcutsRef = useRef(shortcuts);

  // Keeps the ref pointing at the latest closures without re-subscribing the
  // scope below (which would reshuffle stack order on every render).
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    if (!isActive) return;

    const scope: ShortcutScope = { id: Symbol(), shortcuts: shortcutsRef };
    activeScopes.push(scope);

    if (!isListenerBound) {
      window.addEventListener('keydown', handleKeyDown);
      isListenerBound = true;
    }

    return () => {
      const index = activeScopes.findIndex((s) => s.id === scope.id);
      if (index !== -1) activeScopes.splice(index, 1);

      if (activeScopes.length === 0 && isListenerBound) {
        window.removeEventListener('keydown', handleKeyDown);
        isListenerBound = false;
      }
    };
  }, [isActive]);
};
