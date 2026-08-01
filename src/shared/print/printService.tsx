import { createRoot as createReactRoot } from 'react-dom/client';
import type { PrintPayload } from '@/features/billing/lib/buildPrintPayload';
import { ThermalReceipt } from './documents/ThermalReceipt';
import { A4Invoice } from './documents/A4Invoice';
import { PAPER_PROFILES, PaperProfile } from './paperProfiles';
import { recordPrintEvent } from '@/features/invoices/api/printLogStore';
import { notifications } from '@mantine/notifications';

export async function printThermalReceipt(
  payload: PrintPayload,
  paper?: PaperProfile
): Promise<void> {
  const profile = paper || PAPER_PROFILES.thermal80;

  // Log print event
  recordPrintEvent({
    invoiceId: payload.invoice.id,
    invoiceNumber: payload.invoice.invoiceNumber,
    format: profile.id === 'thermal58' ? 'receipt-58' : 'receipt-80',
    copy: payload.copyDesignation,
    printedBy: payload.invoice.cashierName,
  });

  // Create off-screen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  document.body.appendChild(container);

  const root = createReactRoot(container);
  root.render(<ThermalReceipt payload={payload} paperProfile={profile} />);

  // Wait for React render
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Remove stale iframe
  const existingIframe = document.getElementById('thermal-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'thermal-print-iframe';
  iframe.style.position = 'fixed';
  iframe.style.left = '-10000px';
  iframe.style.top = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc) {
    iframe.remove();
    container.remove();
    root.unmount();
    window.print();
    return;
  }

  const styleEl = doc.createElement('style');
  styleEl.textContent = `
    @media print {
      @page {
        size: ${profile.widthMm}mm auto;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
      }
    }
  `;
  doc.head.appendChild(styleEl);
  doc.body.innerHTML = container.innerHTML;

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Failed iframe print:', e);
      window.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
        container.remove();
        root.unmount();
      }, 1000);
    }
  }, 200);
}

export async function printA4Invoice(
  payload: PrintPayload,
  paper: 'a4' | 'a5' = 'a4',
  copy: 'customer' | 'office' = 'customer'
): Promise<void> {
  const invoiceId = payload.invoice.id || payload.invoice.invoiceNumber;
  const printUrl = `/print/invoice/${encodeURIComponent(invoiceId)}?paper=${paper}&copy=${copy}`;

  const win = window.open(printUrl, '_blank', 'width=900,height=800');

  if (!win) {
    notifications.show({
      title: 'Popup Blocker Detected',
      message: 'Popups are blocked by your browser. Falling back to background printing...',
      color: 'orange',
    });

    // Fallback: Off-screen iframe rendering for A4
    const profile = paper === 'a5' ? PAPER_PROFILES.a5 : PAPER_PROFILES.a4;
    recordPrintEvent({
      invoiceId: payload.invoice.id,
      invoiceNumber: payload.invoice.invoiceNumber,
      format: paper,
      copy: copy === 'customer' ? 'ORIGINAL — CUSTOMER COPY' : 'DUPLICATE — OFFICE COPY',
      printedBy: payload.invoice.cashierName,
    });

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    document.body.appendChild(container);

    const root = createReactRoot(container);
    root.render(<A4Invoice payload={payload} paperProfile={profile} />);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.left = '-10000px';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.body.innerHTML = container.innerHTML;
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          iframe.remove();
          container.remove();
          root.unmount();
        }, 1000);
      }, 300);
    }
  }
}
