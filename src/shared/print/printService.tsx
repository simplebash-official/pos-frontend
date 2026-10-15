import * as pdfjsLib from 'pdfjs-dist';
import { ensurePdfWorker } from '@/shared/lib/pdfWorker';
import { isTauri, resolvePlatformInfo } from '@/shared/lib/platform';
import { logger } from '@/shared/logging/logger';
import type { LabelDpi, LabelPrintSettings } from '@/features/labels/types';
import { printLabelPages } from './nativePrinters';

// Converts a Blob to a raw base64 string.
const blobToBase64 = async (blob: Blob): Promise<string> => {
  let buffer: ArrayBuffer;
  if (typeof blob.arrayBuffer === 'function') {
    buffer = await blob.arrayBuffer();
  } else if (typeof Response !== 'undefined') {
    buffer = await new Response(blob).arrayBuffer();
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const commaIdx = result.indexOf(',');
        resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunkSize) as unknown as number[]
    );
  }
  return btoa(binary);
};

// Prints a backend-rendered PDF blob. The PDF is rasterised through pdf.js at
// print resolution and printed from a plain-HTML hidden iframe. Pointing the
// iframe straight at the blob URL no longer works in Chrome — its built-in PDF
// viewer owns that frame, so `contentWindow.print()` is silently ignored and
// nothing happens.
//
// 300 DPI (the original value here) rasterises an A4 page to ~2480x3508px per
// page. Chrome's print-preview generation has to decode and lay out that
// bitmap on the main thread before the dialog ever appears, and on ordinary
// hardware that pass can take long enough that the tab looks frozen and the
// dialog never seems to open — indistinguishable, from the user's side, from
// "the print button does nothing". 200 DPI cuts the pixel count to under half
// while still being well above what a laser/inkjet needs for an invoice
// that's mostly text, and JPEG (vs. the previous PNG) shrinks the embedded
// data URI further without a visible quality loss at print size.
const PRINT_DPI = 200;
const PRINT_IMAGE_TYPE = 'image/jpeg';
const PRINT_IMAGE_QUALITY = 0.92;

// How a PDF page becomes the bitmap that is printed. Documents keep the
// compact JPEG above. Labels need the opposite: the printer's own resolution,
// lossless, and pure black or white, so a thin bar is never blurred by
// resampling or by JPEG, and a 1-bit label printer sees exactly what we drew.
interface RasterOptions {
  dpi: number;
  imageType: 'image/jpeg' | 'image/png';
  /** JPEG quality, 0 to 1; only meaningful for `image/jpeg`. */
  quality: number | undefined;
  /** Luminance (0 to 255) below which a pixel prints black; `null` keeps the greys. */
  blackThreshold: number | null;
}

const DOCUMENT_RASTER: RasterOptions = {
  dpi: PRINT_DPI,
  imageType: PRINT_IMAGE_TYPE,
  quality: PRINT_IMAGE_QUALITY,
  blackThreshold: null,
};

/** Halfway grey: darker prints black. Anti-aliased edges fall to whichever side they lean. */
const LABEL_BLACK_THRESHOLD = 128;

const labelRaster = (dpi: LabelDpi): RasterOptions => ({
  dpi,
  imageType: 'image/png',
  quality: undefined,
  blackThreshold: LABEL_BLACK_THRESHOLD,
});

const toBlackAndWhite = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold: number
) => {
  const image = context.getImageData(0, 0, width, height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const value = luminance < threshold ? 0 : 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = 255;
  }
  context.putImageData(image, 0, 0);
};
const PT_TO_MM = 25.4 / 72;
const PRINT_IFRAME_ID = 'pdf-print-iframe';
// If the iframe never fires `load` (seen on some engines with a very large
// `srcdoc` payload), fall back to printing anyway rather than hanging forever
// with no dialog and no error — see `printPdfBlob` below.
const PRINT_LOAD_FALLBACK_MS = 4_000;

interface PrintedPageImage {
  dataUrl: string;
  widthMm: number;
  heightMm: number;
}

const renderPagesToImages = async (
  blob: Blob,
  raster: RasterOptions
): Promise<PrintedPageImage[]> => {
  await ensurePdfWorker();
  const data = await blob.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;

  const pages: PrintedPageImage[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const pointViewport = page.getViewport({ scale: 1 });
      const printViewport = page.getViewport({ scale: raster.dpi / 72 });

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(printViewport.width);
      canvas.height = Math.floor(printViewport.height);
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not acquire a 2D drawing context for the print canvas.');
      }

      // PDF pages have a transparent background; fill white so nothing behind
      // the page contents can show through on paper.
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvas, canvasContext: context, viewport: printViewport }).promise;
      if (raster.blackThreshold !== null) {
        toBlackAndWhite(context, canvas.width, canvas.height, raster.blackThreshold);
      }

      pages.push({
        dataUrl: canvas.toDataURL(raster.imageType, raster.quality),
        widthMm: pointViewport.width * PT_TO_MM,
        heightMm: pointViewport.height * PT_TO_MM,
      });
    }
  } finally {
    void loadingTask.destroy();
  }
  return pages;
};

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Pages within one document share their physical size in practice (A4 invoices,
// single-width receipts), so the @page rule is taken from the first page.
const buildPrintHtml = (
  pages: PrintedPageImage[],
  fileName: string | undefined,
  crisp: boolean
): string => {
  const { widthMm, heightMm } = pages[0];
  const round = (mm: number) => Number(mm.toFixed(3));
  // The document title is what "Save as PDF" proposes as the file name.
  const titleTag = fileName ? `\n<title>${escapeHtml(fileName)}</title>` : '';
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">${titleTag}
<style>
  @page { size: ${round(widthMm)}mm ${round(heightMm)}mm; margin: 0; }
  html, body { margin: 0; padding: 0; }
  .page {
    box-sizing: border-box;
    width: ${round(widthMm)}mm;
    height: ${round(heightMm)}mm;
    overflow: hidden;
    break-after: page;
    page-break-after: always;
  }
  .page:last-child { break-after: auto; page-break-after: auto; }
  .page img { display: block; width: 100%; height: 100%;${crisp ? ' image-rendering: pixelated;' : ''} }
</style>
</head>
<body>${pages.map((p) => `<div class="page"><img src="${p.dataUrl}" alt=""></div>`).join('\n')}</body>
</html>`;
};

interface PrintPdfArgs {
  blob: Blob;
  title: string | undefined;
  sourceUrl: string | undefined;
  // The proposed "Save as PDF" file name (no extension); see `pdfFileName`.
  fileName: string | undefined;
  raster: RasterOptions;
  /** Labels are drawn pixel for pixel; the browser must not smooth them when it scales. */
  crisp: boolean;
}

const printPdf = async ({
  blob,
  title,
  sourceUrl,
  fileName,
  raster,
  crisp,
}: PrintPdfArgs): Promise<void> => {
  logger.info(
    'print',
    'start',
    { title, sourceUrl, bytes: blob.size, type: blob.type },
    `Printing ${title ?? 'document'}`
  );
  // On macOS desktop under Tauri (WKWebView), `iframe.contentWindow.print()` is silently
  // ignored by WebKit. Delegate to native PDFKit printing via our Tauri bridge.
  if (isTauri() && resolvePlatformInfo().isMac) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      if (sourceUrl) {
        await invoke('print_pdf_native', { pdfUrl: sourceUrl, title: fileName ?? title });
        logger.info('print', 'native.done', { title, via: 'url' });
        return;
      }
      const pdfBase64 = await blobToBase64(blob);
      await invoke('print_pdf_native', { pdfBase64, title: fileName ?? title });
      logger.info('print', 'native.done', { title, via: 'bytes' });
      return;
    } catch (e) {
      logger.error('print', 'native.error', e, { title });
      console.error('Native macOS desktop printing failed, falling back to browser print:', e);
    }
  }

  // Drop any stale print frame from a prior invocation before building a new one.
  document.getElementById(PRINT_IFRAME_ID)?.remove();

  let html: string;
  try {
    html = buildPrintHtml(await renderPagesToImages(blob, raster), fileName, crisp);
  } catch (e) {
    logger.error('print', 'prepare.error', e, { title });
    console.error('Failed to prepare the PDF for printing:', e);
    return;
  }

  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.id = PRINT_IFRAME_ID;
    iframe.setAttribute('aria-hidden', 'true');
    // Off-screen but laid out (not display:none) so the browser still treats it
    // as printable content.
    const style = iframe.style;
    style.position = 'fixed';
    style.right = '0';
    style.bottom = '0';
    style.width = '1px';
    style.height = '1px';
    style.margin = '-1px';
    style.overflow = 'hidden';
    style.padding = '0';
    style.border = '0';

    let triggered = false;

    // Chrome and WebView2 may take the proposed file name from the top document's title rather
    // than the iframe's, so the app title is swapped for the print and always put back.
    const appTitle = document.title;
    const restoreTitle = () => {
      if (fileName) document.title = appTitle;
    };

    const triggerPrint = () => {
      if (triggered) return;
      triggered = true;
      window.clearTimeout(fallbackTimer);

      const win = iframe.contentWindow;
      try {
        if (fileName) document.title = fileName;
        win?.focus();
        win?.print();
        logger.info('print', 'dialog.opened', { title, via: 'iframe' });
      } catch (e) {
        logger.error('print', 'iframe.error', e, { title });
        console.error('Failed to print PDF:', e);
        restoreTitle();
      } finally {
        resolve();
        // Removing the frame mid-job can cancel the print — wait for the
        // dialog to close, with a generous fallback for engines that never
        // fire 'afterprint'.
        win?.addEventListener(
          'afterprint',
          () => {
            iframe.remove();
            restoreTitle();
          },
          { once: true }
        );
        window.setTimeout(() => {
          iframe.remove();
          restoreTitle();
        }, 60_000);
      }
    };

    iframe.onload = () => {
      const images = Array.from(iframe.contentDocument?.images ?? []);
      void Promise.all(
        images.map((img) => (img.decode ? img.decode().catch(() => undefined) : Promise.resolve()))
      ).then(() => {
        // Let layout settle before opening the print dialog.
        window.setTimeout(triggerPrint, 100);
      });
    };

    iframe.onerror = (e) => {
      console.error('Print frame failed to load:', e);
      triggerPrint();
    };

    // Some engines can fail to fire `load` for a large `srcdoc` payload —
    // without this, that would hang the caller forever with no dialog and no
    // error (indistinguishable from the Print button "doing nothing").
    const fallbackTimer = window.setTimeout(triggerPrint, PRINT_LOAD_FALLBACK_MS);

    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
};

export const printPdfBlob = (
  blob: Blob,
  title?: string,
  sourceUrl?: string,
  // The proposed "Save as PDF" file name (no extension); see `pdfFileName`.
  fileName?: string
): Promise<void> =>
  printPdf({ blob, title, sourceUrl, fileName, raster: DOCUMENT_RASTER, crisp: false });

/**
 * Prints a PDF of label stickers (one page per sticker) the way the person set
 * it up: through the system print window, or straight to a chosen label printer
 * (desktop only). A direct print that fails throws, so the caller can say so.
 */
export const printLabelPdf = async (
  blob: Blob,
  settings: LabelPrintSettings,
  fileName: string
): Promise<void> => {
  if (settings.method === 'direct') {
    const pages = await renderPagesToImages(blob, labelRaster(settings.dpi));
    const { widthMm, heightMm } = pages[0];
    await printLabelPages({
      printer: settings.printerName,
      pagesBase64: pages.map((page) => page.dataUrl.slice(page.dataUrl.indexOf(',') + 1)),
      widthMm,
      heightMm,
      dpi: settings.dpi,
      copies: 1,
    });
    logger.info('print', 'labels.direct', { printer: settings.printerName, pages: pages.length });
    return;
  }
  await printPdf({
    blob,
    title: fileName,
    sourceUrl: undefined,
    fileName,
    raster: labelRaster(settings.dpi),
    crisp: true,
  });
};
