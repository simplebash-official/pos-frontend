/**
 * Central Platform & Runtime Identity Engine
 *
 * Single source of truth for identifying:
 * 1. The operating system (macOS, Windows, Linux, iOS, Android, etc.)
 * 2. The runtime shell (Tauri desktop app vs standard Web/PWA)
 * 3. Platform keyboard modifier conventions (⌘/Ctrl, ⌥/Alt, ⇧/Shift)
 *
 * Designed to be consumed by utilities, shortcuts, UI components, and future
 * platform-specific features (native file dialogs, thermal printers, window controls).
 */

export type OperatingSystem = 'macos' | 'windows' | 'linux' | 'ios' | 'android' | 'unknown';
export type AppRuntime = 'tauri' | 'web';

export interface PlatformModifiers {
  /** Primary command modifier: 'meta' (Cmd) on Mac, 'ctrl' on Windows/Linux */
  primary: 'meta' | 'ctrl';
  /** Primary modifier label: 'Cmd' on Mac, 'Ctrl' on Windows/Linux */
  primaryLabel: 'Cmd' | 'Ctrl';
  /** Primary modifier symbol: '⌘' on Mac, 'Ctrl' on Windows/Linux */
  primarySymbol: '⌘' | 'Ctrl';
  /** Secondary modifier: 'alt' */
  secondary: 'alt';
  /** Secondary modifier label: 'Option' on Mac, 'Alt' on Windows/Linux */
  secondaryLabel: 'Option' | 'Alt';
  /** Secondary modifier symbol: '⌥' on Mac, 'Alt' on Windows/Linux */
  secondarySymbol: '⌥' | 'Alt';
  /** Shift modifier label: 'Shift' */
  shiftLabel: 'Shift';
  /** Shift modifier symbol: '⇧' on Mac, 'Shift' on Windows/Linux */
  shiftSymbol: '⇧' | 'Shift';
  /** Control modifier symbol: '⌃' on Mac, 'Ctrl' on Windows/Linux */
  ctrlSymbol: '⌃' | 'Ctrl';
  /** Return/Enter symbol: '↵' on Mac, 'Enter' on Windows/Linux */
  enterSymbol: '↵' | 'Enter';
  /** Backspace symbol: '⌫' on Mac, 'Backspace' on Windows/Linux */
  backspaceSymbol: '⌫' | 'Backspace';
}

export interface PlatformInfo {
  /** Operating system */
  os: OperatingSystem;
  /** Runtime shell */
  runtime: AppRuntime;
  /** True if running on macOS */
  isMac: boolean;
  /** True if running on Windows */
  isWindows: boolean;
  /** True if running on Linux */
  isLinux: boolean;
  /** True if running on an Apple OS (macOS or iOS/iPadOS) */
  isApple: boolean;
  /** True if running on a desktop operating system (macOS, Windows, Linux) */
  isDesktopOS: boolean;
  /** True if running on a mobile operating system (iOS, Android) */
  isMobileOS: boolean;
  /** True when running inside the Tauri desktop shell */
  isTauri: boolean;
  /** True when running inside a standard web browser or PWA */
  isWeb: boolean;
  /** Platform keyboard modifier conventions */
  modifiers: PlatformModifiers;
}

const MAC_MODIFIERS: PlatformModifiers = {
  primary: 'meta',
  primaryLabel: 'Cmd',
  primarySymbol: '⌘',
  secondary: 'alt',
  secondaryLabel: 'Option',
  secondarySymbol: '⌥',
  shiftLabel: 'Shift',
  shiftSymbol: '⇧',
  ctrlSymbol: '⌃',
  enterSymbol: '↵',
  backspaceSymbol: '⌫',
};

const WINDOWS_MODIFIERS: PlatformModifiers = {
  primary: 'ctrl',
  primaryLabel: 'Ctrl',
  primarySymbol: 'Ctrl',
  secondary: 'alt',
  secondaryLabel: 'Alt',
  secondarySymbol: 'Alt',
  shiftLabel: 'Shift',
  shiftSymbol: 'Shift',
  ctrlSymbol: 'Ctrl',
  enterSymbol: 'Enter',
  backspaceSymbol: 'Backspace',
};

/**
 * Checks whether the application is running inside the Tauri desktop shell.
 * Tauri injects `__TAURI_INTERNALS__` on `window` before any app code runs;
 * a plain browser never has it.
 */
export const isTauri = (): boolean =>
  typeof window !== 'undefined' &&
  Object.prototype.hasOwnProperty.call(window, '__TAURI_INTERNALS__');

/**
 * Checks whether the application is running inside a web browser or PWA.
 */
export const isWeb = (): boolean => !isTauri();

/**
 * Detects the operating system from available navigator properties.
 * Safe for SSR and unit-test environments.
 */
export const detectOS = (customNav?: Navigator): OperatingSystem => {
  const nav = customNav ?? (typeof navigator !== 'undefined' ? navigator : undefined);
  if (!nav) return 'unknown';

  // 1. Check navigator.userAgentData.platform (Modern Chromium, Chrome, Edge, WebView2)
  const uaData = (nav as unknown as { userAgentData?: { platform?: string } }).userAgentData;
  if (uaData?.platform) {
    const platform = uaData.platform.toLowerCase();
    if (platform.startsWith('mac') || platform === 'macos') return 'macos';
    if (platform.startsWith('win') || platform === 'windows') return 'windows';
    if (platform.includes('android')) return 'android';
    if (platform.includes('linux')) return 'linux';
  }

  // 2. Fallback to navigator.userAgent
  const ua = nav.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  if (/Windows NT|Windows/i.test(ua)) return 'windows';
  if (/Linux/i.test(ua)) return 'linux';

  // 3. Fallback to navigator.platform (Deprecated but helpful for older engines)
  const plat = nav.platform || '';
  if (/Mac/i.test(plat)) return 'macos';
  if (/Win/i.test(plat)) return 'windows';
  if (/Linux/i.test(plat)) return 'linux';

  return 'unknown';
};

/**
 * Resolves full platform identity and capabilities.
 */
export const resolvePlatformInfo = (customNav?: Navigator): PlatformInfo => {
  const os = detectOS(customNav);
  const runtime: AppRuntime = isTauri() ? 'tauri' : 'web';

  const isMac = os === 'macos';
  const isWindows = os === 'windows';
  const isLinux = os === 'linux';
  const isApple = isMac || os === 'ios';
  const isDesktopOS = isMac || isWindows || isLinux;
  const isMobileOS = os === 'ios' || os === 'android';

  const modifiers = isApple ? MAC_MODIFIERS : WINDOWS_MODIFIERS;

  return {
    os,
    runtime,
    isMac,
    isWindows,
    isLinux,
    isApple,
    isDesktopOS,
    isMobileOS,
    isTauri: runtime === 'tauri',
    isWeb: runtime === 'web',
    modifiers,
  };
};

/**
 * Global singleton platform descriptor, evaluated once on startup.
 */
export const platformInfo: Readonly<PlatformInfo> = Object.freeze(resolvePlatformInfo());

// Convenience individual boolean flags matching current runtime:
export const isMac = platformInfo.isMac;
export const isWindows = platformInfo.isWindows;
export const isLinux = platformInfo.isLinux;
export const isApple = platformInfo.isApple;
export const isDesktopOS = platformInfo.isDesktopOS;
export const isMobileOS = platformInfo.isMobileOS;
export const currentOS = platformInfo.os;
export const currentRuntime = platformInfo.runtime;
export const platformModifiers = platformInfo.modifiers;

/**
 * React hook returning the immutable platform descriptor.
 */
export const usePlatform = (): Readonly<PlatformInfo> => platformInfo;
