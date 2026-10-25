import { t } from '@/shared/i18n/t';

/** Same limits as the server's `clean_name` in the payees module. */
export const PAYEE_NAME_MIN = 2;
export const PAYEE_NAME_MAX = 60;

/** The name as the server will store it: surrounding and repeated spaces collapsed. */
export const cleanPayeeName = (raw: string): string => raw.split(/\s+/).filter(Boolean).join(' ');

/** What is wrong with a payee name, or null when it is fine. */
export const payeeNameError = (raw: string): string | null => {
  const length = Array.from(cleanPayeeName(raw)).length;
  return length < PAYEE_NAME_MIN || length > PAYEE_NAME_MAX
    ? t('A name needs 2 to 60 letters.')
    : null;
};
