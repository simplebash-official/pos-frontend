import { describe, it, expect } from 'vitest';
import { a4InvoiceDocumentType } from '../documentsApi';

describe('a4InvoiceDocumentType', () => {
  it('maps the terminal invoice design to the backend document type', () => {
    expect(a4InvoiceDocumentType('classic')).toBe('a4-invoice');
    expect(a4InvoiceDocumentType('modern')).toBe('a4-invoice-modern');
  });
});
