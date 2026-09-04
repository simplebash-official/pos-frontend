import { describe, it, expect } from 'vitest';
import { useProcessImport, useImportBatches, useImportBatch } from '../useImportBatches';

describe('useImportBatches hooks', () => {
  it('exports hook functions properly', () => {
    expect(typeof useProcessImport).toBe('function');
    expect(typeof useImportBatches).toBe('function');
    expect(typeof useImportBatch).toBe('function');
  });
});
