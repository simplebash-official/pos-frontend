import { describe, it, expect } from 'vitest';
import {
  PHONE_COUNTRY,
  formatNationalPhone,
  maskPhone,
  normalizeLkPhone,
  validatePhone,
} from '../lib/phone';

// These mirror identity's `domain/phone.rs` tests: the two must accept and refuse the same numbers.
describe('normalizeLkPhone', () => {
  it.each([
    '0771234567',
    '077 123 4567',
    '077-123-4567',
    '+94 77 123 4567',
    '+94771234567',
    '0094771234567',
    '94771234567',
    '771234567',
    '  (077) 1234567 ',
  ])('reads %j as 94771234567', (value) => {
    expect(normalizeLkPhone(value)).toEqual({ ok: true, phone: '94771234567' });
  });

  it('accepts the 070-078 mobile ranges only', () => {
    expect(normalizeLkPhone('0701234567')).toEqual({ ok: true, phone: '94701234567' });
    expect(normalizeLkPhone('0781234567')).toEqual({ ok: true, phone: '94781234567' });
    expect(normalizeLkPhone('0791234567')).toEqual({ ok: false, reason: 'landline' });
  });

  it.each(['0112345678', '94112345678', '+94112345678', '112345678'])(
    'calls %j a landline',
    (value) => {
      expect(normalizeLkPhone(value)).toEqual({ ok: false, reason: 'landline' });
    }
  );

  it.each(['+1 415 555 0100', '+44 7911 123456', '0044 7911 123456', '+91 98765 43210'])(
    'calls %j a number from an unsupported country',
    (value) => {
      expect(normalizeLkPhone(value)).toEqual({ ok: false, reason: 'unsupported-country' });
    }
  );

  it.each([
    '',
    '   ',
    'abc',
    '077 123 456',
    '07712345678',
    '0771234567x',
    '077123456',
    '+',
    '+123',
    '1 415 555 0100',
  ])('calls %j invalid, without guessing a country', (value) => {
    expect(normalizeLkPhone(value)).toEqual({ ok: false, reason: 'invalid' });
  });
});

describe('validatePhone', () => {
  it('accepts a mobile number', () => {
    expect(validatePhone('077 123 4567')).toBeNull();
  });

  it('gives a different plain message for empty, landline, foreign and mistyped numbers', () => {
    expect(validatePhone('  ')).toMatch(/Enter your mobile number/);
    expect(validatePhone('011 234 5678')).toMatch(/Landline/);
    expect(validatePhone('+1 415 555 0100')).toMatch(/Only Sri Lankan mobile numbers/);
    expect(validatePhone('12345')).toMatch(/like 077 123 4567/);
  });
});

describe('display helpers', () => {
  it('shows the part typed after the fixed prefix', () => {
    expect(formatNationalPhone('94771234567')).toBe('77 123 4567');
  });

  it('masks the middle of a number', () => {
    expect(maskPhone('94771234567')).toBe('077 *** 4567');
  });

  it('is locked to Sri Lanka', () => {
    expect(PHONE_COUNTRY).toMatchObject({ iso: 'LK', dialCode: '94', label: 'LK' });
  });
});
