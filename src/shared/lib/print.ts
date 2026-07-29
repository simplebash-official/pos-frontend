/**
 * Helper to trigger print dialog or handle printer communication requests
 * using a clean injected iframe without relying on deprecated document.write.
 */
export function triggerThermalPrint(elementId: string): void {
  const printElement = document.getElementById(elementId);
  if (!printElement) {
    console.warn(`Print element with ID "${elementId}" not found.`);
    window.print();
    return;
  }

  // Remove any stale print iframe from prior invocations
  const existingIframe = document.getElementById('thermal-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'thermal-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    window.print();
    return;
  }

  const titleEl = doc.createElement('title');
  titleEl.textContent = 'Receipt Print';
  doc.head.appendChild(titleEl);

  const styleEl = doc.createElement('style');
  styleEl.textContent = `
    body {
      font-family: monospace;
      width: 80mm;
      margin: 0;
      padding: 10px;
      font-size: 12px;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
  `;
  doc.head.appendChild(styleEl);

  doc.body.innerHTML = printElement.innerHTML;

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Failed to execute iframe print:', e);
      window.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 1000);
    }
  }, 250);
}
