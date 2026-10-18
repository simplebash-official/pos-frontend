import { describe, expect, it } from 'vitest';
import type { DocumentKindSettings } from '../../types';
import {
  NO_EDITS,
  buildRequest,
  changedKinds,
  defaultDesign,
  designSelectData,
  editsAreValid,
  hasChanges,
  hasUnavailableChoice,
  isOptionValueValid,
  savedDesign,
  shownDesign,
  shownFamily,
  shownOptionValue,
  type DesignEdits,
} from '../designOptions';

const CLIENT_OPTIONS = [
  { key: 'showSign', type: 'toggle' as const, label: 'Signature box', default: true },
  {
    key: 'accent',
    type: 'select' as const,
    label: 'Accent',
    default: 'blue',
    choices: [
      { value: 'blue', label: 'Blue' },
      { value: 'red', label: 'Red' },
    ],
  },
  { key: 'tint', type: 'color' as const, label: 'Tint', default: '#112233' },
  { key: 'note', type: 'text' as const, label: 'Note', default: '', maxLength: 5 },
];

const invoices = (selected: string | null, effective: string | null = selected ?? 'doc_classic') =>
  ({
    kind: 'a4-invoice',
    label: 'A4 Invoice',
    selected,
    effective,
    families: [
      { family: 'doc_classic', title: 'A4 Invoice', version: 1, isDefault: true, options: [] },
      {
        family: 'doc_modern',
        title: 'A4 Invoice Modern',
        version: 1,
        isDefault: false,
        options: [],
      },
      {
        family: 'fam_client',
        title: 'Client Invoice',
        version: 3,
        isDefault: false,
        options: CLIENT_OPTIONS,
      },
    ],
    optionValues: { fam_client: { showSign: true, accent: 'blue', tint: '#112233', note: '' } },
  }) satisfies DocumentKindSettings;

const receipts: DocumentKindSettings = {
  kind: 'thermal-receipt',
  label: 'Receipt',
  selected: null,
  effective: 'doc_receipt',
  families: [
    { family: 'doc_receipt', title: 'Thermal Receipt', version: 1, isDefault: true, options: [] },
  ],
  optionValues: {},
};

const edit = (partial: Partial<DesignEdits>): DesignEdits => ({ ...NO_EDITS, ...partial });

describe('designSelectData', () => {
  it('marks the standard design and keeps the other titles as published', () => {
    expect(designSelectData(invoices(null).families)).toEqual([
      { value: 'doc_classic', label: 'Standard design — A4 Invoice' },
      { value: 'doc_modern', label: 'A4 Invoice Modern' },
      { value: 'fam_client', label: 'Client Invoice' },
    ]);
  });
});

describe('what each dropdown shows', () => {
  it('is the standard design when nothing was chosen, else the saved choice', () => {
    expect(defaultDesign(invoices(null))).toBe('doc_classic');
    expect(savedDesign(invoices(null))).toBe('doc_classic');
    expect(savedDesign(invoices('doc_modern'))).toBe('doc_modern');
  });

  it('shows nothing when the saved choice is no longer offered, until another is picked', () => {
    const gone = invoices('fam_revoked', null);
    expect(hasUnavailableChoice(gone)).toBe(true);
    expect(hasUnavailableChoice(invoices('doc_modern'))).toBe(false);
    expect(savedDesign(gone)).toBeNull();
    expect(shownFamily(gone, NO_EDITS)).toBeNull();
    expect(shownDesign(gone, edit({ designs: { 'a4-invoice': 'doc_classic' } }))).toBe(
      'doc_classic'
    );
    expect(shownFamily(gone, edit({ designs: { 'a4-invoice': 'doc_classic' } }))?.title).toBe(
      'A4 Invoice'
    );
  });

  it('prefers an unsaved edit over the saved choice', () => {
    expect(shownDesign(invoices(null), edit({ designs: { 'a4-invoice': 'doc_modern' } }))).toBe(
      'doc_modern'
    );
    expect(shownDesign(invoices(null), edit({ designs: { 'thermal-receipt': 'doc_x' } }))).toBe(
      'doc_classic'
    );
  });
});

describe('setting values', () => {
  it('shows the unsaved edit, else what is in force', () => {
    const kind = invoices('fam_client');
    const accent = CLIENT_OPTIONS[1];
    expect(shownOptionValue(kind, 'fam_client', accent, NO_EDITS)).toBe('blue');
    expect(
      shownOptionValue(
        kind,
        'fam_client',
        accent,
        edit({ options: { fam_client: { accent: 'red' } } })
      )
    ).toBe('red');
  });

  it('falls back to the design’s own default when nothing is in force yet', () => {
    const kind = { ...invoices('fam_client'), optionValues: {} };
    expect(shownOptionValue(kind, 'fam_client', CLIENT_OPTIONS[0], NO_EDITS)).toBe(true);
  });

  it('validates each kind of setting', () => {
    const [toggle, select, colour, text] = CLIENT_OPTIONS;
    expect(isOptionValueValid(toggle, false)).toBe(true);
    expect(isOptionValueValid(toggle, 'yes')).toBe(false);
    expect(isOptionValueValid(select, 'red')).toBe(true);
    expect(isOptionValueValid(select, 'green')).toBe(false);
    expect(isOptionValueValid(colour, '#AABBCC')).toBe(true);
    expect(isOptionValueValid(colour, '#abc')).toBe(false);
    expect(isOptionValueValid(text, 'hello')).toBe(true);
    expect(isOptionValueValid(text, 'hello!')).toBe(false);
  });
});

describe('changes and the save request', () => {
  it('finds nothing to save when nothing was touched', () => {
    const kinds = [invoices(null), receipts];
    expect(changedKinds(kinds, NO_EDITS)).toEqual([]);
    expect(hasChanges(kinds, NO_EDITS)).toBe(false);
    expect(buildRequest(kinds, NO_EDITS)).toEqual({ selections: {}, options: {} });
  });

  it('picking the saved design again is not a change', () => {
    const kinds = [invoices('doc_modern')];
    expect(changedKinds(kinds, edit({ designs: { 'a4-invoice': 'doc_modern' } }))).toEqual([]);
  });

  it('sends only the changed kinds', () => {
    const kinds = [invoices(null), receipts];
    expect(buildRequest(kinds, edit({ designs: { 'a4-invoice': 'doc_modern' } }))).toEqual({
      selections: { 'a4-invoice': 'doc_modern' },
      options: {},
    });
  });

  it('sends the standard design as null so a later change of it still reaches the shop', () => {
    const kinds = [invoices('doc_modern')];
    expect(buildRequest(kinds, edit({ designs: { 'a4-invoice': 'doc_classic' } }))).toEqual({
      selections: { 'a4-invoice': null },
      options: {},
    });
  });

  it('sends only the setting values that differ from what is in force', () => {
    const kinds = [invoices('fam_client')];
    const edits = edit({ options: { fam_client: { accent: 'red', showSign: true } } });
    expect(hasChanges(kinds, edits)).toBe(true);
    expect(buildRequest(kinds, edits)).toEqual({
      selections: {},
      options: { fam_client: { accent: 'red' } },
    });
    // Typing the value that is already in force is no change.
    expect(hasChanges(kinds, edit({ options: { fam_client: { accent: 'blue' } } }))).toBe(false);
  });

  it('refuses to be saved while a setting holds an unacceptable value', () => {
    const kinds = [invoices('fam_client')];
    expect(editsAreValid(kinds, NO_EDITS)).toBe(true);
    expect(editsAreValid(kinds, edit({ options: { fam_client: { tint: '#12' } } }))).toBe(false);
    expect(editsAreValid(kinds, edit({ options: { fam_client: { accent: 'red' } } }))).toBe(true);
  });
});
