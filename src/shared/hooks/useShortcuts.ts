import { useEffect, useRef, type RefObject } from 'react';

export interface Shortcut {
  key: string; // e.g. "Enter", "F2", "Ctrl+D", "Ctrl+Shift+H", "?"
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

const parseCombo = (combo: string, e: KeyboardEvent): boolean => {
  const tokens = combo
    .toLowerCase()
    .split('+')
    .map((t) => t.trim());
  const wantsCtrl = tokens.includes('ctrl') || tokens.includes('cmd');
  const wantsShift = tokens.includes('shift');
  const wantsAlt = tokens.includes('alt');
  const mainKey = tokens.find((t) => !['ctrl', 'cmd', 'shift', 'alt'].includes(t));

  if (wantsCtrl !== (e.ctrlKey || e.metaKey)) return false;
  if (wantsAlt !== e.altKey) return false;
  if (wantsShift !== e.shiftKey) return false;

  return mainKey !== undefined && e.key.toLowerCase() === mainKey;
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
      if (!parseCombo(shortcut.key, e)) continue;
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
