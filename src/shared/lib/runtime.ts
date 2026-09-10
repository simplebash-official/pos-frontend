// Which shell the app is running inside. The web (PWA) build and the Tauri
// desktop build ship the same bundle, so this is a runtime check, not a
// build-time flag — shared code must not assume one or the other.

/**
 * True when running inside the Tauri desktop shell. Tauri injects
 * `__TAURI_INTERNALS__` on `window` before any app code runs; a plain browser
 * never has it.
 */
export const isTauri = (): boolean =>
  typeof window !== 'undefined' &&
  Object.prototype.hasOwnProperty.call(window, '__TAURI_INTERNALS__');
