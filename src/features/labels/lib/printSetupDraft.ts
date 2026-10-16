import { isTauri } from '@/shared/lib/platform';
import type { LabelDpi, LabelPrintSettings } from '../types';

/**
 * A setup form in progress. Every choice starts empty: nothing is picked for
 * the person, and it only becomes real settings once every choice is made.
 * The one exception is the way to print in a browser, where the print window
 * is the only way there is, so there is nothing to choose.
 */
export interface SetupDraft {
  templateKey: string | null;
  method: 'system' | 'direct' | null;
  printerName: string | null;
  dpi: LabelDpi | null;
}

export const emptySetupDraft = (): SetupDraft => ({
  templateKey: null,
  method: isTauri() ? null : 'system',
  printerName: null,
  dpi: null,
});

export const draftFromSettings = (settings: LabelPrintSettings | null): SetupDraft =>
  settings === null
    ? emptySetupDraft()
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
