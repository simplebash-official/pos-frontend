import { describe, it, expect, afterEach } from 'vitest';
import {
  detectOS,
  resolvePlatformInfo,
  isTauri,
  isWeb,
  platformInfo,
  usePlatform,
} from '../platform';

const g = globalThis as unknown as { window?: Record<string, unknown> };

describe('platform module', () => {
  afterEach(() => {
    if (g.window) delete g.window.__TAURI_INTERNALS__;
  });

  describe('isTauri and isWeb', () => {
    it('reports web runtime in normal environment without Tauri internals', () => {
      expect(isTauri()).toBe(false);
      expect(isWeb()).toBe(true);
    });

    it('reports tauri runtime when __TAURI_INTERNALS__ is present', () => {
      const hadWindow = g.window !== undefined;
      if (!hadWindow) g.window = {};
      g.window!.__TAURI_INTERNALS__ = {};
      try {
        expect(isTauri()).toBe(true);
        expect(isWeb()).toBe(false);
      } finally {
        if (!hadWindow) delete g.window;
      }
    });
  });

  describe('detectOS', () => {
    it('detects macOS via userAgentData.platform', () => {
      const mockNav = {
        userAgentData: { platform: 'macOS' },
        userAgent: '',
        platform: '',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('macos');
    });

    it('detects Windows via userAgentData.platform', () => {
      const mockNav = {
        userAgentData: { platform: 'Windows' },
        userAgent: '',
        platform: '',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('windows');
    });

    it('detects Linux via userAgentData.platform', () => {
      const mockNav = {
        userAgentData: { platform: 'Linux' },
        userAgent: '',
        platform: '',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('linux');
    });

    it('detects Android via userAgentData.platform', () => {
      const mockNav = {
        userAgentData: { platform: 'Android' },
        userAgent: '',
        platform: '',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('android');
    });

    it('detects macOS via userAgent fallback', () => {
      const mockNav = {
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('macos');
    });

    it('detects Windows via userAgent fallback', () => {
      const mockNav = {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('windows');
    });

    it('detects iOS via userAgent fallback', () => {
      const mockNav = {
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('ios');
    });

    it('detects Linux via userAgent fallback', () => {
      const mockNav = {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('linux');
    });

    it('detects macOS via navigator.platform fallback', () => {
      const mockNav = {
        userAgent: 'GenericBrowser/1.0',
        platform: 'MacIntel',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('macos');
    });

    it('detects Windows via navigator.platform fallback', () => {
      const mockNav = {
        userAgent: 'GenericBrowser/1.0',
        platform: 'Win32',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('windows');
    });

    it('returns unknown if navigator is empty or unrecognized', () => {
      const mockNav = {
        userAgent: 'UnknownDevice/1.0',
        platform: '',
      } as unknown as Navigator;
      expect(detectOS(mockNav)).toBe('unknown');
    });
  });

  describe('resolvePlatformInfo', () => {
    it('correctly maps macOS platform flags and modifier symbols', () => {
      const mockNav = {
        userAgentData: { platform: 'macOS' },
      } as unknown as Navigator;
      const info = resolvePlatformInfo(mockNav);

      expect(info.os).toBe('macos');
      expect(info.isMac).toBe(true);
      expect(info.isWindows).toBe(false);
      expect(info.isLinux).toBe(false);
      expect(info.isApple).toBe(true);
      expect(info.isDesktopOS).toBe(true);
      expect(info.isMobileOS).toBe(false);
      expect(info.modifiers.primarySymbol).toBe('⌘');
      expect(info.modifiers.secondarySymbol).toBe('⌥');
      expect(info.modifiers.primaryLabel).toBe('Cmd');
      expect(info.modifiers.secondaryLabel).toBe('Option');
      expect(info.modifiers.enterSymbol).toBe('↵');
    });

    it('correctly maps Windows platform flags and modifier symbols', () => {
      const mockNav = {
        userAgentData: { platform: 'Windows' },
      } as unknown as Navigator;
      const info = resolvePlatformInfo(mockNav);

      expect(info.os).toBe('windows');
      expect(info.isMac).toBe(false);
      expect(info.isWindows).toBe(true);
      expect(info.isLinux).toBe(false);
      expect(info.isApple).toBe(false);
      expect(info.isDesktopOS).toBe(true);
      expect(info.isMobileOS).toBe(false);
      expect(info.modifiers.primarySymbol).toBe('Ctrl');
      expect(info.modifiers.secondarySymbol).toBe('Alt');
      expect(info.modifiers.primaryLabel).toBe('Ctrl');
      expect(info.modifiers.secondaryLabel).toBe('Alt');
      expect(info.modifiers.enterSymbol).toBe('Enter');
    });

    it('correctly maps iOS mobile platform flags', () => {
      const mockNav = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      } as unknown as Navigator;
      const info = resolvePlatformInfo(mockNav);

      expect(info.os).toBe('ios');
      expect(info.isApple).toBe(true);
      expect(info.isMobileOS).toBe(true);
      expect(info.isDesktopOS).toBe(false);
    });
  });

  describe('platformInfo and usePlatform', () => {
    it('exports a frozen singleton matching usePlatform() output', () => {
      expect(Object.isFrozen(platformInfo)).toBe(true);
      expect(usePlatform()).toBe(platformInfo);
      expect(typeof platformInfo.os).toBe('string');
      expect(typeof platformInfo.isMac).toBe('boolean');
    });
  });
});
