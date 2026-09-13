/**
 * @jest-environment jsdom
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as platform from '@/shared/lib/platform';

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: vi.fn(),
}));

const mockInvoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args),
}));

if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {} as unknown as typeof DOMMatrix;
}

import { printPdfBlob } from '../printService';

describe('printPdfBlob', () => {
  const dummyBlob = new Blob(['%PDF-1.4 dummy content'], { type: 'application/pdf' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('delegates to native Tauri print_pdf_native command when on macOS in Tauri', async () => {
    vi.spyOn(platform, 'isTauri').mockReturnValue(true);
    vi.spyOn(platform, 'resolvePlatformInfo').mockReturnValue({
      ...platform.resolvePlatformInfo(),
      os: 'macos',
      runtime: 'tauri',
      isMac: true,
      isWindows: false,
      isLinux: false,
      isApple: true,
      isDesktopOS: true,
      isMobileOS: false,
      isTauri: true,
      isWeb: false,
    });
    mockInvoke.mockResolvedValueOnce(undefined);

    await printPdfBlob(dummyBlob, 'Receipt — INV-000011');

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    expect(mockInvoke).toHaveBeenCalledWith('print_pdf_native', {
      pdfBase64: expect.any(String),
      title: 'Receipt — INV-000011',
    });
  });

  it('falls back gracefully to browser print when native Tauri command fails', async () => {
    vi.spyOn(platform, 'isTauri').mockReturnValue(true);
    vi.spyOn(platform, 'resolvePlatformInfo').mockReturnValue({
      ...platform.resolvePlatformInfo(),
      os: 'macos',
      runtime: 'tauri',
      isMac: true,
      isWindows: false,
      isLinux: false,
      isApple: true,
      isDesktopOS: true,
      isMobileOS: false,
      isTauri: true,
      isWeb: false,
    });
    mockInvoke.mockRejectedValueOnce(new Error('Printer driver unavailable'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await printPdfBlob(dummyBlob, 'Receipt — INV-000011');

    expect(mockInvoke).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Native macOS desktop printing failed'),
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it('does not invoke print_pdf_native when on Web (non-Tauri)', async () => {
    vi.spyOn(platform, 'isTauri').mockReturnValue(false);
    vi.spyOn(platform, 'resolvePlatformInfo').mockReturnValue({
      ...platform.resolvePlatformInfo(),
      os: 'macos',
      runtime: 'web',
      isMac: true,
      isWindows: false,
      isLinux: false,
      isApple: true,
      isDesktopOS: true,
      isMobileOS: false,
      isTauri: false,
      isWeb: true,
    });

    // In a test environment without pdfjs canvas, it will catch or attempt iframe print
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await printPdfBlob(dummyBlob, 'Receipt — INV-000011');

    expect(mockInvoke).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('does not invoke print_pdf_native when on Windows Tauri (uses Chromium iframe print)', async () => {
    vi.spyOn(platform, 'isTauri').mockReturnValue(true);
    vi.spyOn(platform, 'resolvePlatformInfo').mockReturnValue({
      ...platform.resolvePlatformInfo(),
      os: 'windows',
      runtime: 'tauri',
      isMac: false,
      isWindows: true,
      isLinux: false,
      isApple: false,
      isDesktopOS: true,
      isMobileOS: false,
      isTauri: true,
      isWeb: false,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await printPdfBlob(dummyBlob, 'Receipt — INV-000011');

    expect(mockInvoke).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});
