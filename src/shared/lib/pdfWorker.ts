import { GlobalWorkerOptions } from 'pdfjs-dist';

// WKWebView (the engine Tauri uses on macOS) refuses to load a Worker script
// from the app's `tauri://` custom scheme, so pdf.js's default `?url` worker
// silently falls back to the main thread and trips the app CSP. A blob-URL
// worker (Vite `?worker&inline`) loads fine — see pdfWorkerInstance.ts.
//
// The worker module is `import()`-ed lazily so its ~1.2 MB payload gets its
// own chunk instead of inflating the shared print/invoice code.

let ready: Promise<void> | null = null;

/** Point pdf.js at the blob-URL module worker. Cached; safe to call repeatedly. */
export function ensurePdfWorker(): Promise<void> {
  if (!ready) {
    ready = import('./pdfWorkerInstance').then(({ default: PdfJsWorker }) => {
      GlobalWorkerOptions.workerPort = new PdfJsWorker();
    });
  }
  return ready;
}
