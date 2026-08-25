import { describe, it, expect, beforeEach } from 'vitest';
import themeReducer, { setColorScheme } from '../themeSlice';

describe('themeSlice reducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const getInitialState = () => themeReducer(undefined, { type: '@@INIT' });

  it('initializes with default light color scheme when localStorage is empty', () => {
    const state = getInitialState();
    expect(state.colorScheme).toBe('light');
  });

  it('updates colorScheme on setColorScheme action', () => {
    let state = themeReducer(getInitialState(), setColorScheme('dark'));
    expect(state.colorScheme).toBe('dark');

    state = themeReducer(state, setColorScheme('system'));
    expect(state.colorScheme).toBe('system');

    state = themeReducer(state, setColorScheme('light'));
    expect(state.colorScheme).toBe('light');
  });
});
