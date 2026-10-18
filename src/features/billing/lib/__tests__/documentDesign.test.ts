import { describe, expect, it } from 'vitest';
import type { DocumentKindSettings } from '@/features/settings/types';
import type { DocumentDesignStatus } from '../../api/documentsApi';
import {
  designKindFor,
  designToFetch,
  hasDesignChoice,
  isDesignUnavailable,
  needsDesignChoice,
  nextDesignPick,
  versionLabel,
} from '../documentDesign';

const kind = (count: number, effective: string | null = 'doc_classic'): DocumentKindSettings => ({
  kind: 'a4-invoice',
  label: 'A4 Invoice',
  selected: effective === 'doc_classic' ? null : effective,
  effective,
  families: Array.from({ length: count }, (_, index) => ({
    family: index === 0 ? 'doc_classic' : `doc_other_${index}`,
    title: `Design ${index}`,
    version: 1,
    isDefault: index === 0,
    options: [],
  })),
  optionValues: {},
});

const status = (differs: boolean): DocumentDesignStatus => ({
  stored: { templateRef: 'doc_a', title: 'A', version: 1, createdAt: '2026-01-01T00:00:00Z' },
  current: { templateRef: 'doc_b', title: 'B', version: 2 },
  differs,
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

  it('offers it even for one design when the shop’s own choice is gone', () => {
    expect(hasDesignChoice(kind(1, null))).toBe(true);
  });
});

describe('nextDesignPick', () => {
  it('treats the design prints already use as no override', () => {
    expect(nextDesignPick(kind(2), 'doc_classic')).toBeNull();
  });

  it('keeps any other pick as an override for this print', () => {
    expect(nextDesignPick(kind(2), 'doc_other_1')).toBe('doc_other_1');
    expect(nextDesignPick(kind(2, null), 'doc_classic')).toBe('doc_classic');
  });
});

describe('designToFetch / needsDesignChoice', () => {
  it('waits until the status is known', () => {
    expect(designToFetch(null, { isError: false })).toBeNull();
    expect(needsDesignChoice(null, {})).toBe(false);
  });

  it('prints with the current design when nothing differs', () => {
    expect(designToFetch(null, { data: status(false), isError: false })).toBe('current');
    expect(needsDesignChoice(null, { data: status(false) })).toBe(false);
  });

  it('holds back and asks when the stored print used another design', () => {
    expect(designToFetch(null, { data: status(true), isError: false })).toBeNull();
    expect(needsDesignChoice(null, { data: status(true) })).toBe(true);
  });

  it('follows the user’s answer once given', () => {
    expect(designToFetch('original', { data: status(true), isError: false })).toBe('original');
    expect(designToFetch('current', { data: status(true), isError: false })).toBe('current');
    expect(needsDesignChoice('original', { data: status(true) })).toBe(false);
  });

  it('lets the document request report the problem when the status could not be read', () => {
    expect(designToFetch(null, { isError: true })).toBe('current');
  });
});

describe('isDesignUnavailable', () => {
  it('recognises the backend codes for a design that cannot be used', () => {
    expect(isDesignUnavailable('TEMPLATE_UNAVAILABLE')).toBe(true);
    expect(isDesignUnavailable('TEMPLATE_OPTIONS_INVALID')).toBe(true);
    expect(isDesignUnavailable('NO_ORIGINAL_DOCUMENT')).toBe(false);
    expect(isDesignUnavailable(null)).toBe(false);
  });
});

describe('versionLabel', () => {
  it('shows the version as v2', () => {
    expect(versionLabel({ version: 2 })).toBe('v2');
  });
});
