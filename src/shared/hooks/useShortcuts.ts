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
export const parseCombo = (
  combo: string,
  e: KeyboardEvent,
  isMacPlatform: boolean = isMac
): boolean => {
  const tokens = combo
    .toLowerCase()
    .split('+')
    .map((t) => t.trim());

  const hasMod = tokens.includes('mod');
  const hasCmd = tokens.includes('cmd') || tokens.includes('meta');
  const hasCtrl = tokens.includes('ctrl') || tokens.includes('control');
  const hasAlt = tokens.includes('alt') || tokens.includes('opt') || tokens.includes('option');
  const hasShift = tokens.includes('shift');

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
    // Legacy support: 'ctrl' matches ctrlKey OR metaKey for backwards compatibility
    if (!e.ctrlKey && !e.metaKey) return false;
  } else {
    // If no command/ctrl was requested, ensure neither is held
    if (e.ctrlKey || e.metaKey) return false;
  }

  if (hasAlt !== e.altKey) return false;
  if (hasShift !== e.shiftKey) return false;

  const mainKeyToken = tokens.find((t) => !MODIFIER_TOKENS.includes(t));
  if (!mainKeyToken) return false;

  const eventKey = e.key.toLowerCase();
  const targetKey = mainKeyToken.toLowerCase();

  // Normalize common key aliases
  if (targetKey === 'enter' || targetKey === 'return') {
    return eventKey === 'enter';
  }
  if (targetKey === 'esc' || targetKey === 'escape') {
    return eventKey === 'escape';
  }
  if (targetKey === 'up') {
    return eventKey === 'arrowup' || eventKey === 'up';
  }
  if (targetKey === 'down') {
    return eventKey === 'arrowdown' || eventKey === 'down';
  }
  if (targetKey === 'left') {
    return eventKey === 'arrowleft' || eventKey === 'left';
  }
  if (targetKey === 'right') {
    return eventKey === 'arrowright' || eventKey === 'right';
  }
  if (targetKey === 'space' || targetKey === 'spacebar') {
    return eventKey === ' ' || eventKey === 'spacebar';
  }
  if (targetKey === 'delete' || targetKey === 'del') {
    return eventKey === 'delete';
  }
  if (targetKey === 'backspace') {
    return eventKey === 'backspace';
  }

  return eventKey === targetKey;
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
