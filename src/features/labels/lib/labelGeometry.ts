import { t } from '@/shared/i18n/t';
import {
  LABEL_LIMITS,
  type LabelElement,
  type LabelElementType,
  type LabelTemplateInput,
  type TextSource,
} from '../types';

/** Items snap to this grid (millimetres) while dragged, so layouts stay tidy. */
export const GRID_MM = 0.5;
/** Arrow-key nudges: normal and with Shift held. */
export const NUDGE_MM = 0.5;
export const NUDGE_BIG_MM = 2;

export interface LabelSize {
  widthMm: number;
  heightMm: number;
}

const MIN_SIZE_MM = 1;
const MIN_LINE_SIZE_MM = 0.1;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** One decimal place: a tenth of a millimetre is finer than any printer. */
export const roundMm = (value: number): number => Math.round(value * 10) / 10;

export const snapMm = (value: number): number => Math.round(value / GRID_MM) * GRID_MM;

const minSizeOf = (element: LabelElement): number =>
  element.type === 'line' ? MIN_LINE_SIZE_MM : MIN_SIZE_MM;

/** Keeps an item inside the label and at least its minimum size. */
export const clampElement = <T extends LabelElement>(element: T, label: LabelSize): T => {
  const min = minSizeOf(element);
  const widthMm = roundMm(clamp(element.widthMm, min, label.widthMm));
  const heightMm = roundMm(clamp(element.heightMm, min, label.heightMm));
  return {
    ...element,
    widthMm,
    heightMm,
    xMm: roundMm(clamp(element.xMm, 0, label.widthMm - widthMm)),
    yMm: roundMm(clamp(element.yMm, 0, label.heightMm - heightMm)),
  };
};

export const moveElement = <T extends LabelElement>(
  element: T,
  dxMm: number,
  dyMm: number,
  label: LabelSize
): T => clampElement({ ...element, xMm: element.xMm + dxMm, yMm: element.yMm + dyMm }, label);

export const resizeElement = <T extends LabelElement>(
  element: T,
  dwMm: number,
  dhMm: number,
  label: LabelSize
): T =>
  clampElement(
    { ...element, widthMm: element.widthMm + dwMm, heightMm: element.heightMm + dhMm },
    label
  );

/** Re-fits every item after the label itself changed size. */
export const fitElementsToLabel = (elements: LabelElement[], label: LabelSize): LabelElement[] =>
  elements.map((element) => clampElement(element, label));

/** A new id that no item on the label uses yet. */
export const nextElementId = (elements: LabelElement[]): string => {
  const used = new Set(elements.map((element) => element.id));
  let n = elements.length + 1;
  while (used.has(`item-${n}`)) n += 1;
  return `item-${n}`;
};

/** A freshly added item, placed near the top-left corner and sized to fit the label. */
export const newElement = (
  type: LabelElementType,
  id: string,
  label: LabelSize,
  source: TextSource
): LabelElement => {
  const frame = { id, xMm: 1, yMm: 1 };
  const room = label.widthMm - 2;
  switch (type) {
    case 'text':
      return clampElement(
        {
          ...frame,
          type,
          source,
          customText: source === 'customText' ? t('Your text') : null,
          widthMm: Math.min(room, 30),
          heightMm: 5,
          fontSizePt: 8,
          bold: false,
          align: 'left',
        },
        label
      );
    case 'barcode':
      return clampElement(
        {
          ...frame,
          type,
          widthMm: Math.min(room, 46),
          heightMm: 12,
          showValue: true,
          fontSizePt: 6,
        },
        label
      );
    case 'qr': {
      const size = Math.min(16, label.heightMm - 2, room);
      return clampElement({ ...frame, type, widthMm: size, heightMm: size }, label);
    }
    case 'line':
      return clampElement({ ...frame, type, widthMm: room, heightMm: 0.3 }, label);
  }
};

/**
 * Puts a new item just under the lowest item already on the label, so added items
 * do not pile up on top of each other. When there is no room left below, it
 * stays where it was created (the top-left corner).
 */
export const placeBelow = (
  element: LabelElement,
  existing: LabelElement[],
  label: LabelSize
): LabelElement => {
  if (existing.length === 0) return element;
  const bottom = Math.max(...existing.map((other) => other.yMm + other.heightMm));
  const y = roundMm(bottom + 1);
  return y + element.heightMm <= label.heightMm ? { ...element, yMm: y } : element;
};

/** The plain-language name of an item, for lists and screen readers. */
export const elementTitle = (element: LabelElement): string => {
  switch (element.type) {
    case 'barcode':
      return t('Barcode');
    case 'qr':
      return t('QR code');
    case 'line':
      return t('Line');
    case 'text':
      return textSourceTitle(element.source);
  }
};

export const textSourceTitle = (source: TextSource): string => {
  switch (source) {
    case 'productName':
      return t('Item name');
    case 'price':
      return t('Price');
    case 'sku':
      return t('Item code (SKU)');
    case 'code':
      return t('Barcode number');
    case 'category':
      return t('Category');
    case 'shopName':
      return t('Shop name');
    case 'customText':
      return t('Your own text');
  }
};

/**
 * What is wrong with a design, in plain words, or `null` when it can be saved.
 * Mirrors the rules the server applies, so the person hears about a problem
 * before they press Save; the server still has the final say.
 */
export const designProblem = (design: LabelTemplateInput): string | null => {
  const name = design.name.trim();
  if (name === '') return t('Give the label design a name.');
  if (name.length > LABEL_LIMITS.maxNameChars) {
    return t('The design name is too long.');
  }
  if (
    !Number.isFinite(design.widthMm) ||
    design.widthMm < LABEL_LIMITS.minWidthMm ||
    design.widthMm > LABEL_LIMITS.maxWidthMm
  ) {
    return t('The label width must be between 20 and 120 mm.');
  }
  if (
    !Number.isFinite(design.heightMm) ||
    design.heightMm < LABEL_LIMITS.minHeightMm ||
    design.heightMm > LABEL_LIMITS.maxHeightMm
  ) {
    return t('The label height must be between 10 and 200 mm.');
  }
  if (design.elements.length === 0) return t('Add at least one item to the label.');
  if (design.elements.length > LABEL_LIMITS.maxElements) {
    return t('A label can hold at most 30 items.');
  }
  for (const element of design.elements) {
    if (
      element.xMm + element.widthMm > design.widthMm + 0.001 ||
      element.yMm + element.heightMm > design.heightMm + 0.001
    ) {
      return t('An item sticks out past the edge of the label.');
    }
    if (element.type === 'text' && element.source === 'customText') {
      const text = element.customText?.trim() ?? '';
      if (text === '') return t('A custom text item cannot be empty.');
      if (text.length > LABEL_LIMITS.maxCustomTextChars) {
        return t('Custom text is too long.');
      }
    }
  }
  return null;
};

/** Where to line an item up on the label. */
export type Alignment = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

/** Moves an item to an edge or the centre of the label, along one direction. */
export const alignElement = <T extends LabelElement>(
  element: T,
  label: LabelSize,
  how: Alignment
): T => {
  switch (how) {
    case 'left':
      return clampElement({ ...element, xMm: 0 }, label);
    case 'center':
      return clampElement({ ...element, xMm: (label.widthMm - element.widthMm) / 2 }, label);
    case 'right':
      return clampElement({ ...element, xMm: label.widthMm - element.widthMm }, label);
    case 'top':
      return clampElement({ ...element, yMm: 0 }, label);
    case 'middle':
      return clampElement({ ...element, yMm: (label.heightMm - element.heightMm) / 2 }, label);
    case 'bottom':
      return clampElement({ ...element, yMm: label.heightMm - element.heightMm }, label);
  }
};

/** An item is pulled to the label's centre line when it comes this close (mm). */
export const CENTER_SNAP_MM = 1;

/** Which centre lines an item sits on, to draw as guides while it is dragged. */
export interface CenterGuides {
  vertical: boolean;
  horizontal: boolean;
}

/**
 * Pulls an item onto the label's centre lines when its own centre is within
 * `CENTER_SNAP_MM` of them, and says which lines it now sits on.
 */
export const snapToCenter = <T extends LabelElement>(
  element: T,
  label: LabelSize
): { element: T; guides: CenterGuides } => {
  const centerX = (label.widthMm - element.widthMm) / 2;
  const centerY = (label.heightMm - element.heightMm) / 2;
  const vertical = Math.abs(element.xMm - centerX) <= CENTER_SNAP_MM;
  const horizontal = Math.abs(element.yMm - centerY) <= CENTER_SNAP_MM;
  return {
    element: clampElement(
      {
        ...element,
        xMm: vertical ? centerX : element.xMm,
        yMm: horizontal ? centerY : element.yMm,
      },
      label
    ),
    guides: { vertical, horizontal },
  };
};

/** A copy of an item with a new id, shifted a little so both can be seen. */
export const duplicateElement = (
  element: LabelElement,
  elements: LabelElement[],
  label: LabelSize
): LabelElement =>
  moveElement({ ...element, id: nextElementId(elements) }, NUDGE_BIG_MM, NUDGE_BIG_MM, label);

/**
 * Moves an item one step in the drawing order: `up` draws it later (on top of
 * the item it passes), `down` earlier. Unchanged at either end.
 */
export const moveLayer = (
  elements: LabelElement[],
  id: string,
  direction: 'up' | 'down'
): LabelElement[] => {
  const index = elements.findIndex((element) => element.id === id);
  const target = direction === 'up' ? index + 1 : index - 1;
  if (index < 0 || target < 0 || target >= elements.length) return elements;
  const next = [...elements];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};
