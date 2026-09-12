// Which shell the app is running inside. The web (PWA) build and the Tauri
// desktop build ship the same bundle, so this is a runtime check, not a
// build-time flag — shared code must not assume one or the other.

export {
  isTauri,
  isWeb,
  detectOS,
  resolvePlatformInfo,
  platformInfo,
  isMac,
  isWindows,
  isLinux,
  isApple,
  isDesktopOS,
  isMobileOS,
  currentOS,
  currentRuntime,
  platformModifiers,
  usePlatform,
  type OperatingSystem,
  type AppRuntime,
  type PlatformModifiers,
  type PlatformInfo,
} from './platform';
