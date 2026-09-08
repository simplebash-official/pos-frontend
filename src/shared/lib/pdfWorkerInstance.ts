// Isolated so the ~1.2 MB inlined pdf.js worker lands in its own lazily
// dynamically-imported chunk rather than being welded into the shared
// `printService` chunk that the invoice/billing routes pull. Imported only
// via `import()` from pdfWorker.ts.
import PdfJsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&inline';

export default PdfJsWorker;
