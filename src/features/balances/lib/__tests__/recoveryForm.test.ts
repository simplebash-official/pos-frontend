import { describe, expect, it } from 'vitest';
import { toRecoveryInput, validateRecovery } from '../recoveryForm';

const form = { amountCents: 30000, recoveredOn: '2026-10-31', note: '' };

describe('validateRecovery', () => {
  it('accepts up to what is owed', () => {
    expect(validateRecovery(form, 30000)).toBeNull();
    expect(validateRecovery({ ...form, amountCents: 100 }, 30000)).toBeNull();
  });

  it('refuses nothing, too much, and a made-up date', () => {
    expect(validateRecovery({ ...form, amountCents: 0 }, 30000)).toMatch(/amount/);
    expect(validateRecovery({ ...form, amountCents: 30001 }, 30000)).toMatch(/more than/);
    expect(validateRecovery({ ...form, recoveredOn: '2026-02-30' }, 30000)).toMatch(/date/);
  });
});

describe('toRecoveryInput', () => {
  it('leaves an empty note out and trims a typed one', () => {
    expect(toRecoveryInput(form).note).toBeUndefined();
    expect(toRecoveryInput({ ...form, note: '  October pay ' }).note).toBe('October pay');
  });
});
