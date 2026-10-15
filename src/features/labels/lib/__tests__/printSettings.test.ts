import { describe, it, expect } from 'vitest';
import { parseLabelPrintSettings } from '../printSettings';
import {
  EMPTY_SETUP_DRAFT,
  draftFromSettings,
  settingsFromDraft,
  type SetupDraft,
} from '../printSetupDraft';

describe('parseLabelPrintSettings', () => {
  it('accepts a complete system-print choice', () => {
    expect(
      parseLabelPrintSettings({ method: 'system', templateKey: 'starter_x', dpi: 203 })
    ).toEqual({ method: 'system', templateKey: 'starter_x', dpi: 203 });
  });

  it('accepts a complete direct-print choice', () => {
    expect(
      parseLabelPrintSettings({
        method: 'direct',
        printerName: 'Zebra ZD220',
        templateKey: 'ltpl_1',
        dpi: 300,
      })
    ).toEqual({ method: 'direct', printerName: 'Zebra ZD220', templateKey: 'ltpl_1', dpi: 300 });
  });

  it('drops stray fields instead of carrying them along', () => {
    const parsed = parseLabelPrintSettings({
      method: 'system',
      templateKey: 'k',
      dpi: 600,
      printerName: 'old',
      junk: true,
    });
    expect(parsed).toEqual({ method: 'system', templateKey: 'k', dpi: 600 });
  });

  it.each([
    ['nothing stored', undefined],
    ['not an object', 'x'],
    ['no design', { method: 'system', dpi: 203 }],
    ['an empty design key', { method: 'system', templateKey: '', dpi: 203 }],
    ['an unknown detail level', { method: 'system', templateKey: 'k', dpi: 250 }],
    ['an unknown method', { method: 'cloud', templateKey: 'k', dpi: 203 }],
    ['direct without a printer', { method: 'direct', templateKey: 'k', dpi: 203 }],
    [
      'direct with a blank printer',
      { method: 'direct', printerName: '', templateKey: 'k', dpi: 203 },
    ],
  ])('treats %s as not set up', (_label, raw) => {
    expect(parseLabelPrintSettings(raw)).toBeNull();
  });
});

describe('setup draft', () => {
  it('starts empty and is not settings yet', () => {
    expect(settingsFromDraft(EMPTY_SETUP_DRAFT)).toBeNull();
    expect(draftFromSettings(null)).toEqual(EMPTY_SETUP_DRAFT);
  });

  it('only becomes settings once every choice is made', () => {
    const draft: SetupDraft = { templateKey: 'k', method: 'direct', printerName: null, dpi: 203 };
    expect(settingsFromDraft(draft)).toBeNull();
    expect(settingsFromDraft({ ...draft, printerName: 'Zebra' })).toEqual({
      method: 'direct',
      printerName: 'Zebra',
      templateKey: 'k',
      dpi: 203,
    });
    expect(settingsFromDraft({ ...draft, method: 'system' })).toEqual({
      method: 'system',
      templateKey: 'k',
      dpi: 203,
    });
    expect(settingsFromDraft({ ...draft, method: null })).toBeNull();
    expect(settingsFromDraft({ ...draft, templateKey: null, printerName: 'Z' })).toBeNull();
    expect(settingsFromDraft({ ...draft, dpi: null, printerName: 'Z' })).toBeNull();
  });

  it('round-trips saved settings', () => {
    const saved = { method: 'direct', printerName: 'Z', templateKey: 'k', dpi: 600 } as const;
    expect(settingsFromDraft(draftFromSettings(saved))).toEqual(saved);
  });
});
