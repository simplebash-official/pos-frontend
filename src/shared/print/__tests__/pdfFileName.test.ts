/**
 * @jest-environment jsdom
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { downloadPdfBlob, pdfFileName } from '../pdfFileName';

describe('pdfFileName', () => {
  const now = new Date(2026, 9, 12, 14, 30, 5);

  it('joins the number and a sortable timestamp', () => {
    expect(pdfFileName('INV-2026-0042', now)).toBe('INV-2026-0042-20261012-143005');
  });

  it('replaces characters a file name cannot hold', () => {
    expect(pdfFileName('INV/2026\\42: a*b?"c"<d>|e', now)).toBe(
      'INV-2026-42-a-b-c-d-e-20261012-143005'
    );
  });

  it('collapses spaces and trims stray dashes', () => {
    expect(pdfFileName('  INV 42  ', now)).toBe('INV-42-20261012-143005');
  });

  it('uses the current time when none is given', () => {
    expect(pdfFileName('INV-1')).toMatch(/^INV-1-\d{8}-\d{6}$/);
  });
});

describe('downloadPdfBlob', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('saves the blob as <name>.pdf and releases the object URL', () => {
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const downloads: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      downloads.push(`${this.download}|${this.href}`);
    });

    const blob = new Blob(['%PDF'], { type: 'application/pdf' });
    downloadPdfBlob(blob, 'INV-1-20261012-143005');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(downloads).toEqual(['INV-1-20261012-143005.pdf|blob:test']);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
    expect(document.querySelector('a[download]')).toBeNull();
  });
});
