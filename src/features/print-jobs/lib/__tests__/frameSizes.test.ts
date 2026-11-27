import { describe, expect, it } from 'vitest';
import type { PrintFrameSize } from '../../types';
import {
  addWantedFrame,
  frameName,
  framesProblem,
  groupFrameSizes,
  normalizeFrameSize,
  toFrameInputs,
  toWidthHundredths,
  type FrameDraft,
} from '../frameSizes';
import { MAX_LINE_QUANTITY } from '../printItems';

const listed = (size: string, widthHundredthsInch: number): PrintFrameSize => ({
  id: `${size}-${widthHundredthsInch}`,
  key: `pfs_${size}_${widthHundredthsInch}`,
  size,
  widthHundredthsInch,
  active: true,
  version: 1,
  createdAt: '2026-11-27T00:00:00Z',
  updatedAt: '2026-11-27T00:00:00Z',
});

describe('frame sizes', () => {
  it('compares sizes without spaces, case or the multiply sign', () => {
    for (const typed of ['8x10', '8 X 10', '8×10', ' 8x10 ']) {
      expect(normalizeFrameSize(typed)).toBe('8x10');
    }
    expect(normalizeFrameSize('A 4')).toBe('a4');
  });

  it('stores a typed width in whole hundredths of an inch', () => {
    expect(toWidthHundredths(0.75)).toBe(75);
    expect(toWidthHundredths(1)).toBe(100);
    expect(toWidthHundredths(1.15)).toBe(115);
    expect(toWidthHundredths(1.75)).toBe(175);
  });

  it('names a frame by size and width', () => {
    expect(frameName(listed('8x10', 75))).toBe('8x10 · 0.75 inch');
    expect(frameName(listed('A4', 100))).toBe('A4 · 1 inch');
  });

  it('lists the shop’s sizes in number order, paper sizes after, narrow frames first', () => {
    const sizes = [
      'A4',
      '10x12',
      '3x3',
      'A3',
      '8x12',
      '5x7',
      '24x36',
      'A5',
      '8x10',
      '4x6',
      '4x4',
      '12x18',
      '16x24',
      '5x5',
      '10x15',
      '6x8',
      '12x15',
      '20x30',
    ].map((size) => listed(size, 75));
    expect(groupFrameSizes(sizes).map((group) => group.size)).toEqual([
      '3x3',
      '4x4',
      '4x6',
      '5x5',
      '5x7',
      '6x8',
      '8x10',
      '8x12',
      '10x12',
      '10x15',
      '12x15',
      '12x18',
      '16x24',
      '20x30',
      '24x36',
      'A3',
      'A4',
      'A5',
    ]);
  });

  it('puts one size typed two ways into one group, named as its narrowest frame', () => {
    const groups = groupFrameSizes([listed('a4', 100), listed('A4', 75)]);
    expect(groups).toHaveLength(1);
    expect(groups[0].size).toBe('A4');
    expect(groups[0].widths.map((frame) => frame.widthHundredthsInch)).toEqual([75, 100]);
  });
});

describe('the frames a job asks for', () => {
  const frame = listed('8x10', 75);

  it('adds one row per picked frame, with no price anywhere', () => {
    const wanted = addWantedFrame(addWantedFrame([], frame), listed('8x10', 100));
    expect(wanted).toEqual([
      { frameSizeKey: frame.key, size: '8x10', widthHundredthsInch: 75, quantity: 1 },
      { frameSizeKey: 'pfs_8x10_100', size: '8x10', widthHundredthsInch: 100, quantity: 1 },
    ]);
    expect(toFrameInputs(wanted)).toEqual([
      { frameSizeKey: frame.key, quantity: 1 },
      { frameSizeKey: 'pfs_8x10_100', quantity: 1 },
    ]);
  });

  it('counts one more when the same frame is picked again', () => {
    const twice = addWantedFrame(addWantedFrame([], frame), frame);
    expect(twice).toHaveLength(1);
    expect(twice[0].quantity).toBe(2);
  });

  it('starts at one again on an emptied box, and never counts past the limit', () => {
    const [row] = addWantedFrame([], frame);
    expect(addWantedFrame([{ ...row, quantity: '' }], frame)[0].quantity).toBe(1);
    expect(addWantedFrame([{ ...row, quantity: MAX_LINE_QUANTITY }], frame)[0].quantity).toBe(
      MAX_LINE_QUANTITY
    );
  });

  it('says what stops a save', () => {
    const [row] = addWantedFrame([], frame);
    expect(framesProblem([])).toBeNull();
    expect(framesProblem([row])).toBeNull();
    for (const quantity of ['', 0, 1.5, MAX_LINE_QUANTITY + 1] as FrameDraft['quantity'][]) {
      expect(framesProblem([{ ...row, quantity }])).toBe(
        'Enter a quantity of 1 or more for every frame.'
      );
    }
    const tooMany = Array.from({ length: 51 }, (_, index) => ({
      ...row,
      frameSizeKey: `pfs_${index}`,
    }));
    expect(framesProblem(tooMany)).toBe('A print job can list at most 50 frames.');
  });
});
