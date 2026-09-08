import { GlobalWorkerOptions } from 'pdfjs-dist';
// `?worker&inline` makes Vite embed the pdf.js worker and instantiate it from
// a blob URL. The previous `?url` approach let pdf.js call
// `new Worker('/assets/….mjs', { type: 'module' })` — and WKWebView (the
// engine Tauri uses on macOS) refuses to load a Worker script from the
// app's `tauri://` custom scheme, so pdf.js fell back to running the worker
// on the main thread, which then trips the app's CSP. A blob-URL worker
// loads fine under the custom scheme, so the real off-thread worker is used.
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&inline';

let configured = false;

/** Point pdf.js at a Vite-built module worker. Safe to call repeatedly. */
export function ensurePdfWorker(): void {
  if (configured) return;
  configured = true;
  GlobalWorkerOptions.workerPort = new PdfJsWorker();
}
