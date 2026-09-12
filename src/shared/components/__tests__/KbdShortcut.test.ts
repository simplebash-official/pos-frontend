import { describe, it, expect } from 'vitest';
import { KbdShortcut, KbdAction } from '../KbdShortcut';

describe('KbdShortcut and KbdAction components', () => {
  it('exports KbdShortcut component function', () => {
    expect(typeof KbdShortcut).toBe('function');
  });

  it('exports KbdAction component function', () => {
    expect(typeof KbdAction).toBe('function');
  });
});
