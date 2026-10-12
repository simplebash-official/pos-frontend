/**
 * @jest-environment jsdom
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as platform from '@/shared/lib/platform';

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: async () => ({
        getViewport: ({ scale }: { scale: number }) => ({
          width: 595 * scale,
          height: 842 * scale,
        }),
        render: () => ({ promise: Promise.resolve() }),
      }),
    }),
    destroy: () => Promise.resolve(),
  }),
}));

vi.mock('@/shared/lib/pdfWorker', () => ({ ensurePdfWorker: async () => undefined }));

const mockInvoke = vi.fn();
vi.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: unknown[]) => mockInvoke(...args),
}));

if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {} as unknown as typeof DOMMatrix;
}

import { printPdfBlob } from '../printService';

// jsdom's Blob has no arrayBuffer().
const blob = Object.assign(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
  arrayBuffer: async () => new ArrayBuffer(8),
});
const APP_TITLE = 'SimpleBash POS';

// Intercepts the hidden print iframe so the test can read its document and stub `print()`.
const captureIframe = (print: () => void) => {
  const captured: { iframe?: HTMLIFrameElement } = {};
  const append = document.body.appendChild.bind(document.body);
  vi.spyOn(document.body, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
    const result = append(node);
    if (node instanceof HTMLIFrameElement) {
      captured.iframe = node;
      (node.contentWindow as Window).focus = () => undefined;
      (node.contentWindow as Window).print = print;
    }
    return result;
  });
  return captured;
};

describe('printPdfBlob file name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.title = APP_TITLE;
    document.getElementById('pdf-print-iframe')?.remove();
    vi.spyOn(platform, 'isTauri').mockReturnValue(false);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      fillRect: () => undefined,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,AA');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('titles the print document with the file name, escaped', async () => {
    const captured = captureIframe(() => undefined);

    await printPdfBlob(blob, 'Invoice — INV-1', undefined, 'INV-1<&"x-20261012-143005');

    expect(captured.iframe?.srcdoc).toContain(
      '<title>INV-1&lt;&amp;&quot;x-20261012-143005</title>'
    );
  });

  it('has no title tag when no file name is given', async () => {
    const captured = captureIframe(() => undefined);

    await printPdfBlob(blob, 'Invoice — INV-1');

    expect(captured.iframe?.srcdoc).not.toContain('<title>');
    expect(document.title).toBe(APP_TITLE);
  });

  it('names the page while printing and restores the app title after the dialog closes', async () => {
    let titleDuringPrint = '';
    const captured = captureIframe(() => {
      titleDuringPrint = document.title;
    });

    await printPdfBlob(blob, 'Invoice — INV-1', undefined, 'INV-1-20261012-143005');

    expect(titleDuringPrint).toBe('INV-1-20261012-143005');
    expect(document.title).toBe('INV-1-20261012-143005');

    captured.iframe?.contentWindow?.dispatchEvent(new Event('afterprint'));

    expect(document.title).toBe(APP_TITLE);
  });

  it('restores the app title when printing throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    captureIframe(() => {
      throw new Error('print blocked');
    });

    await printPdfBlob(blob, 'Invoice — INV-1', undefined, 'INV-1-20261012-143005');

    expect(document.title).toBe(APP_TITLE);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('sends the file name as the native macOS job title', async () => {
    vi.spyOn(platform, 'isTauri').mockReturnValue(true);
    vi.spyOn(platform, 'resolvePlatformInfo').mockReturnValue({
      ...platform.resolvePlatformInfo(),
      isMac: true,
    });
    mockInvoke.mockResolvedValueOnce(undefined);

    await printPdfBlob(blob, 'Invoice — INV-1', undefined, 'INV-1-20261012-143005');

    expect(mockInvoke).toHaveBeenCalledWith('print_pdf_native', {
      pdfBase64: expect.any(String),
      title: 'INV-1-20261012-143005',
    });
  });
});
