import type { LabelDpi, LabelPrintSettings } from '../types';

/**
 * A setup form in progress. Every choice starts empty: nothing is picked for
 * the person, and it only becomes real settings once every choice is made.
 */
export interface SetupDraft {
  templateKey: string | null;
  method: 'system' | 'direct' | null;
  printerName: string | null;
  dpi: LabelDpi | null;
}

export const EMPTY_SETUP_DRAFT: SetupDraft = {
  templateKey: null,
  method: null,
  printerName: null,
  dpi: null,
};

export const draftFromSettings = (settings: LabelPrintSettings | null): SetupDraft =>
  settings === null
    ? EMPTY_SETUP_DRAFT
    : {
        templateKey: settings.templateKey,
        method: settings.method,
        printerName: settings.method === 'direct' ? settings.printerName : null,
        dpi: settings.dpi,
      };

/** The settings a finished draft stands for, or `null` while a choice is missing. */
export const settingsFromDraft = (draft: SetupDraft): LabelPrintSettings | null => {
  if (draft.templateKey === null || draft.dpi === null) return null;
  if (draft.method === 'system') {
    return { method: 'system', templateKey: draft.templateKey, dpi: draft.dpi };
  }
  if (draft.method === 'direct' && draft.printerName !== null) {
    return {
      method: 'direct',
      printerName: draft.printerName,
      templateKey: draft.templateKey,
      dpi: draft.dpi,
    };
  }
  return null;
};
