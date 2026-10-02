// Phone numbers for cloud registration. Only Sri Lanka is supported today: identity's
// `domain/phone.rs` (`SUPPORTED`) and app-frontend's `lib/phoneCountries.ts` hold the same rules -
// keep the three in step. The country prefix is fixed in the field; people type only the rest.

import { t } from '@/shared/i18n/t';

export interface PhoneCountry {
  iso: string;
  /** International dialling code, no `+`. */
  dialCode: string;
  /** Text for the locked prefix chip (flag emoji do not render on Windows). */
  label: string;
  /** An example number without the dialling code or a leading 0. */
  placeholder: string;
  /** Digits after the dialling code. */
  nationalLength: number;
  /** Does this national number (no leading 0) start like a mobile? */
  isMobile: (national: string) => boolean;
}

export const SRI_LANKA: PhoneCountry = {
  iso: 'LK',
  dialCode: '94',
  label: 'LK',
  placeholder: '77 123 4567',
  nationalLength: 9,
  // Mobile ranges are 070-078; landlines start 011, 021, ...
  isMobile: (national) => /^7[0-8]/.test(national),
};

export const SUPPORTED_PHONE_COUNTRIES: readonly PhoneCountry[] = [SRI_LANKA];

/** The country the phone field is locked to (there is only one for now). */
export const PHONE_COUNTRY: PhoneCountry = SUPPORTED_PHONE_COUNTRIES[0];

export type PhoneCheck =
  | { ok: true; phone: string }
  | { ok: false; reason: 'invalid' | 'landline' | 'unsupported-country' };

/**
 * `077 123 4567`, `+94 77 123 4567`, `0094771234567`, `94771234567` or `771234567` become
 * `94771234567`. Says why a number is unusable: a landline (cannot get texts), another country's
 * number (`+1 415 ...`), or unreadable.
 */
export const normalizeLkPhone = (value: string): PhoneCheck => {
  let digits = value.replace(/[\s\-()]/g, '');
  let international = false;
  if (digits.startsWith('+')) {
    digits = digits.slice(1);
    international = true;
  } else if (digits.startsWith('00') && digits.length > 2) {
    digits = digits.slice(2);
    international = true;
  }
  if (!/^\d+$/.test(digits)) return { ok: false, reason: 'invalid' };

  for (const country of SUPPORTED_PHONE_COUNTRIES) {
    const { dialCode, nationalLength } = country;
    let national: string | null = null;
    if (digits.startsWith(dialCode) && digits.length === dialCode.length + nationalLength) {
      national = digits.slice(dialCode.length);
    } else if (!international && digits.length === nationalLength + 1 && digits.startsWith('0')) {
      national = digits.slice(1);
    } else if (!international && digits.length === nationalLength && !digits.startsWith('0')) {
      national = digits;
    }
    if (national !== null) {
      return country.isMobile(national)
        ? { ok: true, phone: `${dialCode}${national}` }
        : { ok: false, reason: 'landline' };
    }
  }

  const foreignCode = !SUPPORTED_PHONE_COUNTRIES.some((c) => digits.startsWith(c.dialCode));
  if (international && foreignCode && digits.length >= 8 && digits.length <= 15) {
    return { ok: false, reason: 'unsupported-country' };
  }
  return { ok: false, reason: 'invalid' };
};

/** A plain-language message for a number that cannot be used, or null when it is fine. */
export const validatePhone = (value: string): string | null => {
  if (!value.trim()) return t('Enter your mobile number.');
  const check = normalizeLkPhone(value);
  if (check.ok) return null;
  switch (check.reason) {
    case 'landline':
      return t('Enter a mobile number. Landline numbers cannot get text messages.');
    case 'unsupported-country':
      return t('Only Sri Lankan mobile numbers are supported right now.');
    default:
      return t('Enter a mobile number like 077 123 4567.');
  }
};

/** `94771234567` -> `77 123 4567`: the part typed after the fixed prefix. */
export const formatNationalPhone = (normalized: string): string => {
  const national = normalized.slice(PHONE_COUNTRY.dialCode.length);
  return `${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
};

/** `94771234567` -> `077 *** 4567`: recognisable to its owner, not readable by a bystander. */
export const maskPhone = (normalized: string): string =>
  `0${normalized.slice(2, 4)} *** ${normalized.slice(-4)}`;
