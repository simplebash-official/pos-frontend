import { LABEL_DPI_OPTIONS, type LabelDpi, type LabelPrintSettings } from '../types';

const isDpi = (value: unknown): value is LabelDpi =>
  LABEL_DPI_OPTIONS.some((option) => option === value);

/**
 * Reads label print settings back from storage. Anything that is not a complete,
 * valid choice becomes `null` (not set up yet) rather than being patched up.
 */
export const parseLabelPrintSettings = (raw: unknown): LabelPrintSettings | null => {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  if (typeof value.templateKey !== 'string' || value.templateKey === '') return null;
  if (!isDpi(value.dpi)) return null;
  if (value.method === 'system') {
    return { method: 'system', templateKey: value.templateKey, dpi: value.dpi };
  }
  if (
    value.method === 'direct' &&
    typeof value.printerName === 'string' &&
    value.printerName !== ''
  ) {
    return {
      method: 'direct',
      printerName: value.printerName,
      templateKey: value.templateKey,
      dpi: value.dpi,
    };
  }
  return null;
};
