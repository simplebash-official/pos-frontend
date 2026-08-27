import { describe, it, expect } from 'vitest';
import {
  getSkeletonWidthPercent,
  getInitials,
  getAvatarColor,
  buildGridTemplateColumns,
} from '../utils';

describe('getSkeletonWidthPercent', () => {
  it('returns a smaller width for non-left aligned columns', () => {
    const left = getSkeletonWidthPercent(0, 0, 'left');
    const center = getSkeletonWidthPercent(0, 0, 'center');
    expect(center).toBeLessThan(left);
  });
});

describe('getInitials', () => {
  it('returns two initials for a multi-word name', () => {
    expect(getInitials('John Doe')).toBe('JD');
  });

  it('returns the first two characters for a single word name', () => {
    expect(getInitials('Cher')).toBe('CH');
  });

  it('falls back to "??" for an empty or missing name', () => {
    expect(getInitials('')).toBe('??');
    expect(getInitials(undefined)).toBe('??');
  });
});

describe('getAvatarColor', () => {
  it('returns a deterministic color for the same name', () => {
    expect(getAvatarColor('John Doe')).toBe(getAvatarColor('John Doe'));
  });

  it('falls back to blue for a missing name', () => {
    expect(getAvatarColor(undefined)).toBe('blue');
  });
});

describe('buildGridTemplateColumns', () => {
  it('converts percentage widths to proportional fr units', () => {
    const result = buildGridTemplateColumns(['35%', '25%', '20%', '20%'], {
      selectable: false,
      hasRowClick: false,
    });
    expect(result).toBe('3.5fr 2.5fr 2fr 2fr');
  });

  it('reserves fixed 40px tracks for the checkbox and row-click chevron columns', () => {
    const result = buildGridTemplateColumns(['50%', '50%'], {
      selectable: true,
      hasRowClick: true,
    });
    expect(result).toBe('40px 5fr 5fr 40px');
  });

  it('passes numeric widths through as pixel tracks', () => {
    const result = buildGridTemplateColumns([120, 200], {
      selectable: false,
      hasRowClick: false,
    });
    expect(result).toBe('120px 200px');
  });

  it('falls back to 1fr for an undefined width', () => {
    const result = buildGridTemplateColumns([undefined, '10%'], {
      selectable: false,
      hasRowClick: false,
    });
    expect(result).toBe('1fr 1fr');
  });

  it('passes a non-percentage string width through unchanged', () => {
    const result = buildGridTemplateColumns(['minmax(100px, 1fr)'], {
      selectable: false,
      hasRowClick: false,
    });
    expect(result).toBe('minmax(100px, 1fr)');
  });
});
