import { describe, expect, it } from 'vitest';
import type { DocumentKindSettings } from '@/features/settings/types';
import { designKindFor, hasDesignChoice, nextDesignPick } from '../documentDesign';

const kind = (count: number): DocumentKindSettings => ({
  kind: 'a4-invoice',
  label: 'A4 Invoice',
  selected: null,
  effective: 'doc_classic',
  templates: Array.from({ length: count }, (_, index) => ({
    name: index === 0 ? 'doc_classic' : `doc_other_${index}`,
    title: `Design ${index}`,
    isDefault: index === 0,
  })),
});

describe('designKindFor', () => {
  it('maps each previewable document to the kind the backend lists designs under', () => {
    expect(designKindFor('invoice')).toBe('a4-invoice');
    expect(designKindFor('receipt')).toBe('thermal-receipt');
    expect(designKindFor('credit-note')).toBe('credit-note');
    expect(designKindFor('quotation')).toBe('quotation');
  });
});

describe('hasDesignChoice', () => {
  it('only offers the dropdown when there is more than one design', () => {
    expect(hasDesignChoice(undefined)).toBe(false);
    expect(hasDesignChoice(kind(1))).toBe(false);
    expect(hasDesignChoice(kind(2))).toBe(true);
  });
});

describe('nextDesignPick', () => {
  it('treats the design prints already use as no override', () => {
    expect(nextDesignPick(kind(2), 'doc_classic')).toBeNull();
  });

  it('keeps any other pick as an override for this print', () => {
    expect(nextDesignPick(kind(2), 'doc_other_1')).toBe('doc_other_1');
  });
});
