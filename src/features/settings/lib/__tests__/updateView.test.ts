import { describe, it, expect } from 'vitest';

import { downloadPercent, versionLabel } from '../updateView';

describe('downloadPercent', () => {
  it('rounds the ratio to a whole percent', () => {
    expect(downloadPercent(0, 200)).toBe(0);
    expect(downloadPercent(50, 200)).toBe(25);
    expect(downloadPercent(200, 200)).toBe(100);
    expect(downloadPercent(3, 7)).toBe(43);
  });

  it('clamps a bad ratio into 0..100', () => {
    expect(downloadPercent(300, 200)).toBe(100);
    expect(downloadPercent(-10, 200)).toBe(0);
  });

  it('returns null while the total is unknown', () => {
    expect(downloadPercent(10, 0)).toBeNull();
    expect(downloadPercent(0, 0)).toBeNull();
  });
});

describe('versionLabel', () => {
  it('prefixes a plain version', () => {
    expect(versionLabel('1.4.0')).toBe('Version 1.4.0');
  });

  it('degrades gracefully with no version', () => {
    expect(versionLabel('')).toBe('Version unknown');
  });
});
