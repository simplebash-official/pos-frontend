import { t } from '@/shared/i18n/t';
import type { PrintFrameSize, PrintJobFrame, PrintJobFrameInput } from '../types';
import { lineQuantity, MAX_LINE_QUANTITY } from './printItems';

/** The server's limits. */
export const FRAME_SIZE_MAX_LENGTH = 20;
export const FRAME_WIDTH_MAX_INCHES = 100;
export const MAX_JOB_FRAMES = 50;

/** The form sizes are compared and searched by: no spaces or case, and `×` read as `x`. */
export const normalizeFrameSize = (text: string): string =>
  text.replace(/\s+/g, '').toLowerCase().replaceAll('×', 'x');

/** A typed width in inches (0.75) as it is stored, in whole hundredths (75). */
export const toWidthHundredths = (inches: number): number => Math.round(inches * 100);

/** "0.75 inch". */
export const frameWidthLabel = (widthHundredthsInch: number): string =>
  `${widthHundredthsInch / 100} ${t('inch')}`;

/** "8x10 · 0.75 inch", for a listed size or a frame on a job. */
export const frameName = (frame: { size: string; widthHundredthsInch: number }): string =>
  `${frame.size} · ${frameWidthLabel(frame.widthHundredthsInch)}`;

export interface FrameSizeGroup {
  /** The normalized size, one per group. */
  id: string;
  /** The size as written on its narrowest frame. */
  size: string;
  /** Narrowest first. */
  widths: PrintFrameSize[];
}

// Numbers inside a size count as numbers: "8x10" comes before "10x12", paper sizes after them.
const sizeOrder = new Intl.Collator('en', { numeric: true });

/** The list as the screens show it: one group per size, in number order. */
export const groupFrameSizes = (sizes: PrintFrameSize[]): FrameSizeGroup[] => {
  const groups = new Map<string, FrameSizeGroup>();
  const narrowestFirst = [...sizes].sort((a, b) => a.widthHundredthsInch - b.widthHundredthsInch);
  for (const frame of narrowestFirst) {
    const id = normalizeFrameSize(frame.size);
    const group = groups.get(id);
    if (group === undefined) {
      groups.set(id, { id, size: frame.size, widths: [frame] });
    } else {
      group.widths.push(frame);
    }
  }
  return [...groups.values()].sort((a, b) => sizeOrder.compare(a.id, b.id));
};

/** A wanted frame while it is being edited; the quantity box may be empty. */
export type FrameDraft = Omit<PrintJobFrame, 'quantity'> & { quantity: number | '' };

export const frameDraftsFromSaved = (frames: PrintJobFrame[]): FrameDraft[] =>
  frames.map((frame) => ({ ...frame }));

/** The frames after one is picked: one more of a frame already wanted, otherwise a new row. */
export const addWantedFrame = (frames: FrameDraft[], picked: PrintFrameSize): FrameDraft[] => {
  const wanted = frames.find((frame) => frame.frameSizeKey === picked.key);
  if (wanted === undefined) {
    return [
      ...frames,
      {
        frameSizeKey: picked.key,
        size: picked.size,
        widthHundredthsInch: picked.widthHundredthsInch,
        quantity: 1,
      },
    ];
  }
  const quantity = lineQuantity(wanted.quantity);
  const next = quantity === null ? 1 : Math.min(quantity + 1, MAX_LINE_QUANTITY);
  return frames.map((frame) =>
    frame.frameSizeKey === picked.key ? { ...frame, quantity: next } : frame
  );
};

/** What stops the wanted frames being saved, in plain words (`null` when nothing). */
export const framesProblem = (frames: FrameDraft[]): string | null => {
  if (frames.length > MAX_JOB_FRAMES) return t('A print job can list at most 50 frames.');
  if (frames.some((frame) => lineQuantity(frame.quantity) === null)) {
    return t('Enter a quantity of 1 or more for every frame.');
  }
  return null;
};

/** The frames as the server takes them. Call only when `framesProblem` finds nothing. */
export const toFrameInputs = (frames: FrameDraft[]): PrintJobFrameInput[] =>
  frames.map((frame) => ({
    frameSizeKey: frame.frameSizeKey,
    quantity: Number(frame.quantity),
  }));
