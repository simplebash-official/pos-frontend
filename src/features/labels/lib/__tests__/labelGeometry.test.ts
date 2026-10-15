import { describe, it, expect } from 'vitest';
import {
  clampElement,
  designProblem,
  fitElementsToLabel,
  moveElement,
  newElement,
  nextElementId,
  placeBelow,
  resizeElement,
  roundMm,
  snapMm,
} from '../labelGeometry';
import type { LabelElement, LabelTemplateInput, TextElement } from '../../types';

const label = { widthMm: 50, heightMm: 30 };

const text = (over: Partial<TextElement> = {}): TextElement => ({
  id: 'a',
  type: 'text',
  source: 'productName',
  customText: null,
  xMm: 2,
  yMm: 2,
  widthMm: 20,
  heightMm: 5,
  fontSizePt: 8,
  bold: false,
  align: 'left',
  ...over,
});

const barcode = (): LabelElement => ({
  id: 'b',
  type: 'barcode',
  xMm: 1,
  yMm: 8,
  widthMm: 46,
  heightMm: 12,
  showValue: true,
  fontSizePt: 6,
});

const design = (over: Partial<LabelTemplateInput> = {}): LabelTemplateInput => ({
  name: 'Shelf',
  widthMm: 50,
  heightMm: 30,
  elements: [text()],
  ...over,
});

describe('rounding and snapping', () => {
  it('rounds to a tenth of a millimetre and snaps to half a millimetre', () => {
    expect(roundMm(1.26)).toBe(1.3);
    expect(snapMm(1.26)).toBe(1.5);
    expect(snapMm(1.2)).toBe(1);
    expect(snapMm(-0.3)).toBe(-0.5);
  });
});

describe('clampElement / moveElement / resizeElement', () => {
  it('keeps an item inside the label', () => {
    const moved = moveElement(text(), 100, 100, label);
    expect(moved.xMm).toBe(30);
    expect(moved.yMm).toBe(25);
    const back = moveElement(text(), -100, -100, label);
    expect(back.xMm).toBe(0);
    expect(back.yMm).toBe(0);
  });

  it('never makes an item smaller than 1 mm, except a line which may be thinner', () => {
    expect(resizeElement(text(), -100, -100, label)).toMatchObject({ widthMm: 1, heightMm: 1 });
    const line: LabelElement = {
      id: 'l',
      type: 'line',
      xMm: 0,
      yMm: 0,
      widthMm: 40,
      heightMm: 0.3,
    };
    expect(clampElement({ ...line, heightMm: 0.05 }, label).heightMm).toBe(0.1);
  });

  it('shrinks an item that is bigger than the label and pulls it back inside', () => {
    const fitted = clampElement(text({ xMm: 40, widthMm: 80 }), label);
    expect(fitted.widthMm).toBe(50);
    expect(fitted.xMm).toBe(0);
  });

  it('refits every item when the label gets smaller', () => {
    const fitted = fitElementsToLabel([text({ xMm: 40 }), barcode()], {
      widthMm: 30,
      heightMm: 20,
    });
    for (const element of fitted) {
      expect(element.xMm + element.widthMm).toBeLessThanOrEqual(30);
      expect(element.yMm + element.heightMm).toBeLessThanOrEqual(20);
    }
  });
});

describe('newElement / nextElementId', () => {
  it('numbers new items so no id repeats, even after removals', () => {
    expect(nextElementId([])).toBe('item-1');
    expect(nextElementId([text({ id: 'item-2' })])).toBe('item-3');
    expect(nextElementId([text({ id: 'item-2' }), text({ id: 'item-3' })])).toBe('item-4');
  });

  it.each(['text', 'barcode', 'qr', 'line'] as const)(
    'places a new %s item fully inside even a small label',
    (type) => {
      const small = { widthMm: 20, heightMm: 10 };
      const element = newElement(type, 'x', small, 'productName');
      expect(element.type).toBe(type);
      expect(element.xMm + element.widthMm).toBeLessThanOrEqual(small.widthMm);
      expect(element.yMm + element.heightMm).toBeLessThanOrEqual(small.heightMm);
      expect(element.widthMm).toBeGreaterThan(0);
    }
  );

  it('gives a custom text item its own text and others none', () => {
    expect(newElement('text', 'x', label, 'customText')).toMatchObject({
      source: 'customText',
      customText: 'Your text',
    });
    expect(newElement('text', 'x', label, 'sku')).toMatchObject({ customText: null });
  });
});

describe('placeBelow', () => {
  it('leaves the first item where it was created', () => {
    const first = newElement('text', 'a', label, 'productName');
    expect(placeBelow(first, [], label)).toEqual(first);
  });

  it('puts a new item one millimetre under the lowest existing item', () => {
    const existing = [
      text({ id: 'a', yMm: 2, heightMm: 5 }),
      text({ id: 'b', yMm: 10, heightMm: 4 }),
    ];
    const added = newElement('text', 'c', label, 'sku');
    expect(placeBelow(added, existing, label)).toMatchObject({ id: 'c', yMm: 15 });
  });

  it('keeps the original spot when there is no room below', () => {
    const existing = [text({ yMm: 2, heightMm: 26 })];
    const added = newElement('barcode', 'c', label, 'code');
    expect(placeBelow(added, existing, label).yMm).toBe(added.yMm);
  });
});

describe('designProblem', () => {
  it('accepts a good design', () => {
    expect(designProblem(design())).toBeNull();
  });

  it.each([
    ['a blank name', { name: '   ' }, 'name'],
    ['a name that is too long', { name: 'x'.repeat(61) }, 'too long'],
    ['a label that is too narrow', { widthMm: 19 }, 'width'],
    ['a label that is too wide', { widthMm: 121 }, 'width'],
    ['a label that is too short', { heightMm: 9 }, 'height'],
    ['a label that is too tall', { heightMm: 201 }, 'height'],
    ['an empty label', { elements: [] }, 'at least one'],
    [
      'too many items',
      { elements: Array.from({ length: 31 }, (_, i) => text({ id: `t${i}` })) },
      'at most 30',
    ],
    ['an item past the edge', { elements: [text({ xMm: 40, widthMm: 20 })] }, 'edge'],
    [
      'blank custom text',
      { elements: [text({ source: 'customText', customText: '  ' })] },
      'cannot be empty',
    ],
    [
      'custom text that is too long',
      { elements: [text({ source: 'customText', customText: 'x'.repeat(201) })] },
      'too long',
    ],
  ])('rejects %s', (_label, patch, fragment) => {
    expect(designProblem(design(patch))).toContain(fragment);
  });

  it('tolerates floating point noise at the edge', () => {
    expect(
      designProblem(design({ elements: [text({ xMm: 0.1 + 0.2, widthMm: 49.7 })] }))
    ).toBeNull();
  });
});
