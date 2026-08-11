import { createRoot as createReactRoot } from 'react-dom/client';
import type { PrintPayload } from '@/features/billing/lib/buildPrintPayload';
import { ThermalReceipt } from './documents/ThermalReceipt';
import { A4Invoice } from './documents/A4Invoice';
import { PAPER_PROFILES, PaperProfile } from './paperProfiles';
import { recordPrintEvent } from '@/features/invoices/api/printLogStore';

export const printThermalReceipt = async (
  payload: PrintPayload,
  paper?: PaperProfile
): Promise<void> => {
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
};

export const printA4Invoice = async (
  payload: PrintPayload,
  copy: 'customer' | 'office' = 'customer'
): Promise<void> => {
  recordPrintEvent({
    invoiceId: payload.invoice.id,
    invoiceNumber: payload.invoice.invoiceNumber,
    format: 'a4',
    copy: copy === 'customer' ? 'ORIGINAL — CUSTOMER COPY' : 'DUPLICATE — OFFICE COPY',
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
  root.render(<A4Invoice payload={payload} paperProfile={PAPER_PROFILES.a4} />);

  // Wait for React render
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Remove stale iframe
  const existingIframe = document.getElementById('a4-print-iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'a4-print-iframe';
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

  // Inject active document style tags so styles match
  const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  doc.head.innerHTML = `
    ${styleTags}
    <style>
      @media print {
        @page {
          size: A4 portrait;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          background: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    </style>
  `;

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
  }, 250);
};
