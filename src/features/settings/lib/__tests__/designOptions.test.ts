import { describe, expect, it } from 'vitest';
import type { DocumentKindSettings } from '../../types';
import {
  buildSelections,
  changedKinds,
  defaultDesign,
  designSelectData,
  savedDesign,
  shownDesign,
} from '../designOptions';

const invoices = (selected: string | null): DocumentKindSettings => ({
  kind: 'a4-invoice',
  label: 'A4 Invoice',
  selected,
  effective: selected ?? 'doc_classic',
  templates: [
    { name: 'doc_classic', title: 'A4 Invoice', isDefault: true },
    { name: 'doc_modern', title: 'A4 Invoice Modern', isDefault: false },
  ],
});

const receipts: DocumentKindSettings = {
  kind: 'thermal-receipt',
  label: 'Receipt',
  selected: null,
  effective: 'doc_receipt',
  templates: [{ name: 'doc_receipt', title: 'Thermal Receipt', isDefault: true }],
};

describe('designSelectData', () => {
  it('marks the standard design and keeps the other titles as published', () => {
    expect(designSelectData(invoices(null).templates)).toEqual([
      { value: 'doc_classic', label: 'Standard design — A4 Invoice' },
      { value: 'doc_modern', label: 'A4 Invoice Modern' },
    ]);
  });
});

describe('what each dropdown shows', () => {
  it('is the standard design when nothing was chosen, else the saved choice', () => {
    expect(defaultDesign(invoices(null))).toBe('doc_classic');
    expect(savedDesign(invoices(null))).toBe('doc_classic');
    expect(savedDesign(invoices('doc_modern'))).toBe('doc_modern');
  });

  it('prefers an unsaved edit over the saved choice', () => {
    expect(shownDesign(invoices(null), { 'a4-invoice': 'doc_modern' })).toBe('doc_modern');
    expect(shownDesign(invoices(null), { 'thermal-receipt': 'doc_x' })).toBe('doc_classic');
  });
});

describe('changedKinds / buildSelections', () => {
  it('finds nothing to save when nothing was touched', () => {
    expect(changedKinds([invoices(null), receipts], {})).toEqual([]);
    expect(buildSelections([invoices(null), receipts], {})).toEqual({});
  });

  it('picking the saved design again is not a change', () => {
    const kinds = [invoices('doc_modern')];
    expect(changedKinds(kinds, { 'a4-invoice': 'doc_modern' })).toEqual([]);
  });

  it('sends only the changed kinds', () => {
    const kinds = [invoices(null), receipts];
    expect(buildSelections(kinds, { 'a4-invoice': 'doc_modern' })).toEqual({
      'a4-invoice': 'doc_modern',
    });
  });

  it('sends the standard design as null so a later change of it still reaches the shop', () => {
    const kinds = [invoices('doc_modern')];
    expect(buildSelections(kinds, { 'a4-invoice': 'doc_classic' })).toEqual({
      'a4-invoice': null,
    });
  });
});
