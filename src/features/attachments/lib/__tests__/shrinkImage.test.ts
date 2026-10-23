import { describe, expect, it } from 'vitest';
import { blobToBase64, fitWithin } from '../shrinkImage';

describe('fitWithin', () => {
  it('leaves a small image alone', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });

  it('shrinks the longest side to the limit and keeps the shape', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000, 1600)).toEqual({ width: 1200, height: 1600 });
  });
});

describe('blobToBase64', () => {
  it('encodes the bytes', async () => {
    expect(await blobToBase64(new Blob([new Uint8Array([0xff, 0xd8, 0xff])]))).toBe('/9j/');
  });
});
