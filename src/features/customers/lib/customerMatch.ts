import { compactText } from '@/shared/lib/compactText';
import type { Customer } from '../types';

/** Fewest digits that can say "this is the same phone"; shorter input is still being typed. */
const MIN_PHONE_DIGITS = 7;
/** Sri Lankan numbers are nine digits after the leading 0 or the +94. */
const NATIONAL_DIGITS = 9;
/** Fewest letters before a typed name is compared with the list. */
const MIN_NAME_LETTERS = 2;

/**
 * The part of a phone number that identifies the line, so `0771234567`, `+94 77 123 4567` and
 * `77-123-4567` all read the same.
 */
export const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  return digits.length > NATIONAL_DIGITS ? digits.slice(-NATIONAL_DIGITS) : digits;
};

/** The saved customer who already has this phone number (either of their numbers), if any. */
export const findPhoneMatch = (customers: Customer[], phone: string): Customer | null => {
  const wanted = normalizePhone(phone);
  if (wanted.length < MIN_PHONE_DIGITS) {
    return null;
  }
  return (
    customers.find(
      (customer) =>
        normalizePhone(customer.primaryPhone) === wanted ||
        (customer.secondaryPhone !== undefined &&
          normalizePhone(customer.secondaryPhone) === wanted)
    ) ?? null
  );
};

/** Saved customers whose name contains what was typed, ignoring case and spacing. */
export const findNameMatches = (customers: Customer[], name: string, limit: number): Customer[] => {
  const wanted = compactText(name);
  if (wanted.length < MIN_NAME_LETTERS) {
    return [];
  }
  return customers
    .filter((customer) => compactText(customer.name).includes(wanted))
    .slice(0, limit);
};
