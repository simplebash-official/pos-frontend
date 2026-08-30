import { describe, it, expect, vi } from 'vitest';

vi.mock('@/shared/components/PdfCanvasViewer', () => ({
  PdfCanvasViewer: () => null,
}));

vi.mock('@/shared/print/printService', () => ({
  printPdfBlob: vi.fn(),
}));

import { AnalyticsReportPreviewModal } from '../AnalyticsReportPreviewModal';
import { ReportExportMenu } from '../ReportExportMenu';

describe('AnalyticsReportPreviewModal and ReportExportMenu', () => {
  it('exports AnalyticsReportPreviewModal component function', () => {
    expect(typeof AnalyticsReportPreviewModal).toBe('function');
  });

  it('exports ReportExportMenu component function', () => {
    expect(typeof ReportExportMenu).toBe('function');
  });
});
