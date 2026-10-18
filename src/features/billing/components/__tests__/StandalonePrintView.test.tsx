import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'inv_42' }),
}));

vi.mock('@/features/billing/hooks/useInvoiceDocument', () => ({
  useInvoiceDocument: () => ({
    blob: new Blob(['%PDF'], { type: 'application/pdf' }),
    loading: false,
    error: null,
    errorCode: null,
    isPaused: false,
  }),
  // Nothing printed before: no question to ask, the current design prints.
  useInvoiceDocumentDesign: () => ({ data: undefined, isError: true }),
}));

vi.mock('@/shared/components/PdfCanvasViewer', () => ({
  PdfCanvasViewer: () => null,
}));

vi.mock('@/shared/print/printService', () => ({
  printPdfBlob: vi.fn(),
}));

vi.mock('@/features/invoices/api/printLogStore', () => ({
  recordPrintEvent: vi.fn(),
}));

import { StandalonePrintView } from '../StandalonePrintView';

describe('StandalonePrintView', () => {
  it('offers Download PDF beside Print once the document is ready', () => {
    const out = renderToString(
      <MantineProvider>
        <StandalonePrintView />
      </MantineProvider>
    );

    expect(out).toContain('Download PDF');
    expect(out).toContain('data-log-id="billing.download-pdf"');
    expect(out).toContain('Print Document');
  });
});
