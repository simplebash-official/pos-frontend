// Prints a backend-rendered PDF blob through a hidden iframe. Used by
// callers that need to fire a print job without a visible preview (e.g.
// `usePrint.ts`'s direct "Print Receipt" action) — components that already
// show the PDF in their own visible <iframe> should call
// `iframe.contentWindow.print()` on that element directly instead of
// spinning up a second hidden one.
export const printPdfBlob = (blob: Blob): Promise<void> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);

    const existingIframe = document.getElementById('pdf-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'pdf-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    const cleanup = () => {
      iframe.remove();
      URL.revokeObjectURL(url);
      resolve();
    };

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Failed to print PDF:', e);
      } finally {
        window.setTimeout(cleanup, 1000);
      }
    };

    iframe.src = url;
    document.body.appendChild(iframe);
  });
};
