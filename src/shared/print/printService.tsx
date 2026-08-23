import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Same worker setup as PdfCanvasViewer — both entry points load documents independently.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Prints a backend-rendered PDF blob. The PDF is rasterised through pdf.js at
// print resolution and printed from a plain-HTML hidden iframe. Pointing the
// iframe straight at the blob URL no longer works in Chrome — its built-in PDF
// viewer owns that frame, so `contentWindow.print()` is silently ignored and
// nothing happens.
const PRINT_DPI = 300;
const PT_TO_MM = 25.4 / 72;
const PRINT_IFRAME_ID = 'pdf-print-iframe';

interface PrintedPageImage {
  dataUrl: string;
  widthMm: number;
  heightMm: number;
}

const renderPagesToImages = async (blob: Blob): Promise<PrintedPageImage[]> => {
  const data = await blob.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data });
  const doc = await loadingTask.promise;

  const pages: PrintedPageImage[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
      const page = await doc.getPage(pageNumber);
      const pointViewport = page.getViewport({ scale: 1 });
      const printViewport = page.getViewport({ scale: PRINT_DPI / 72 });

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

      pages.push({
        dataUrl: canvas.toDataURL('image/png'),
        widthMm: pointViewport.width * PT_TO_MM,
        heightMm: pointViewport.height * PT_TO_MM,
      });
    }
  } finally {
    void loadingTask.destroy();
  }
  return pages;
};

// Pages within one document share their physical size in practice (A4 invoices,
// single-width receipts), so the @page rule is taken from the first page.
const buildPrintHtml = (pages: PrintedPageImage[]): string => {
  const { widthMm, heightMm } = pages[0];
  const round = (mm: number) => Number(mm.toFixed(3));
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
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
  .page img { display: block; width: 100%; height: 100%; }
</style>
</head>
<body>${pages.map((p) => `<div class="page"><img src="${p.dataUrl}" alt=""></div>`).join('\n')}</body>
</html>`;
};

export const printPdfBlob = async (blob: Blob): Promise<void> => {
  // Drop any stale print frame from a prior invocation before building a new one.
  document.getElementById(PRINT_IFRAME_ID)?.remove();

  let html: string;
  try {
    html = buildPrintHtml(await renderPagesToImages(blob));
  } catch (e) {
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

    iframe.onload = () => {
      const win = iframe.contentWindow;
      const images = Array.from(iframe.contentDocument?.images ?? []);
      void Promise.all(
        images.map((img) => (img.decode ? img.decode().catch(() => undefined) : Promise.resolve()))
      ).then(() => {
        // Let layout settle before opening the print dialog.
        window.setTimeout(() => {
          try {
            win?.focus();
            win?.print();
          } catch (e) {
            console.error('Failed to print PDF:', e);
          } finally {
            resolve();
            // Removing the frame mid-job can cancel the print — wait for the
            // dialog to close, with a generous fallback for engines that never
            // fire 'afterprint'.
            win?.addEventListener('afterprint', () => iframe.remove(), { once: true });
            window.setTimeout(() => iframe.remove(), 60_000);
          }
        }, 100);
      });
    };

    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });
};
