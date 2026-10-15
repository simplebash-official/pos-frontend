/**
 * @jest-environment jsdom
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as platform from '@/shared/lib/platform';

const getViewport = vi.fn(({ scale }: { scale: number }) => ({
  width: 141.73 * scale, // 50 mm
  height: 85.04 * scale, // 30 mm
}));

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 2,
      getPage: async () => ({
        getViewport: (options: { scale: number }) => getViewport(options),
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

import { printLabelPdf } from '../printService';
import { listPrinters } from '../nativePrinters';

const blob = Object.assign(new Blob(['%PDF-1.4'], { type: 'application/pdf' }), {
  arrayBuffer: async () => new ArrayBuffer(8),
});

// Three pixels: pure black, mid-dark grey, light grey (RGBA).
const pixels = () => new Uint8ClampedArray([0, 0, 0, 255, 100, 100, 100, 255, 200, 200, 200, 255]);

describe('printLabelPdf', () => {
  let imageData: { data: Uint8ClampedArray };
  const putImageData = vi.fn();
  const toDataURL = vi.fn(() => 'data:image/png;base64,UElYRUxT');

  beforeEach(() => {
    vi.clearAllMocks();
    document.getElementById('pdf-print-iframe')?.remove();
    imageData = { data: pixels() };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillStyle: '',
      fillRect: () => undefined,
      getImageData: () => imageData,
      putImageData,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(toDataURL);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('straight to a printer', () => {
    const direct = {
      method: 'direct',
      printerName: 'Zebra ZD220',
      templateKey: 'starter_x',
      dpi: 203,
    } as const;

    it('renders each page at the printer resolution as black and white PNG and sends it', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);

      await printLabelPdf(blob, direct, 'labels-20261016-090000');

      expect(getViewport).toHaveBeenCalledWith({ scale: 203 / 72 });
      expect(toDataURL).toHaveBeenCalledWith('image/png', undefined);
      expect(mockInvoke).toHaveBeenCalledTimes(1);
      const [command, args] = mockInvoke.mock.calls[0] as [string, Record<string, unknown>];
      expect(command).toBe('print_label_pages');
      expect(args).toMatchObject({
        printer: 'Zebra ZD220',
        pagesBase64: ['UElYRUxT', 'UElYRUxT'],
        dpi: 203,
        copies: 1,
      });
      expect(args.widthMm as number).toBeCloseTo(50, 1);
      expect(args.heightMm as number).toBeCloseTo(30, 1);
    });

    it('turns every pixel pure black or pure white', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await printLabelPdf(blob, direct, 'labels');
      expect(putImageData).toHaveBeenCalled();
      expect(Array.from(imageData.data)).toEqual([0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255]);
    });

    it('uses the chosen detail level', async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await printLabelPdf(blob, { ...direct, dpi: 600 }, 'labels');
      expect(getViewport).toHaveBeenCalledWith({ scale: 600 / 72 });
    });

    it('lets a printing failure reach the caller instead of hiding it', async () => {
      mockInvoke.mockRejectedValueOnce('Printer is offline');
      await expect(printLabelPdf(blob, direct, 'labels')).rejects.toBe('Printer is offline');
    });
  });

  describe('through the print window', () => {
    it('prints pixel-exact PNG pages at the label size', async () => {
      vi.spyOn(platform, 'isTauri').mockReturnValue(false);
      const captured: { iframe?: HTMLIFrameElement } = {};
      const append = document.body.appendChild.bind(document.body);
      vi.spyOn(document.body, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
        const result = append(node);
        if (node instanceof HTMLIFrameElement) {
          captured.iframe = node;
          (node.contentWindow as Window).focus = () => undefined;
          (node.contentWindow as Window).print = () => undefined;
        }
        return result;
      });

      await printLabelPdf(
        blob,
        { method: 'system', templateKey: 'starter_x', dpi: 300 },
        'labels-20261016-090000'
      );

      const html = captured.iframe?.srcdoc ?? '';
      expect(getViewport).toHaveBeenCalledWith({ scale: 300 / 72 });
      expect(html).toContain('image-rendering: pixelated');
      expect(html).toContain('data:image/png;base64,UElYRUxT');
      // 141.73 pt is 49.999 mm; the page rule follows the PDF's own size, margin zero.
      expect(html).toMatch(/@page \{ size: (49\.99\d|50)mm (29\.99\d|30)mm; margin: 0; \}/);
      expect(html).toContain('<title>labels-20261016-090000</title>');
      expect(mockInvoke).not.toHaveBeenCalled();
    });
  });
});

describe('listPrinters', () => {
  it('asks the desktop shell for the installed printers', async () => {
    mockInvoke.mockResolvedValueOnce(['Zebra ZD220', 'Brother QL-820']);
    expect(await listPrinters()).toEqual(['Zebra ZD220', 'Brother QL-820']);
    expect(mockInvoke).toHaveBeenCalledWith('list_printers');
  });
});
