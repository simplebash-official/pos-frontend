import { t } from '@/shared/i18n/t';
import { formatDate, toIsoDate } from '@/shared/lib/date';
import { calc_warranty } from '@/wasm';
import type {
  ProductWarranty,
  Warranty,
  WarrantyCoverage,
  WarrantyEventKind,
  WarrantyLookupMatch,
  WarrantyState,
  WarrantyType,
  WarrantyUnit,
} from '../types';

/** A warranty state as a coloured dot and a word (Mantine colour names, readable in both themes). */
export interface StateLook {
  color: string;
  label: string;
}

const STATE_LOOK: Record<WarrantyState, { color: string; label: string }> = {
  active: { color: 'green', label: 'Active' },
  expiring_soon: { color: 'orange', label: 'Expiring soon' },
  expired: { color: 'red', label: 'Expired' },
  under_claim: { color: 'blue', label: 'Under claim' },
  void: { color: 'gray', label: 'Cancelled' },
};

export const stateLook = (state: WarrantyState): StateLook => ({
  color: STATE_LOOK[state].color,
  label: t(STATE_LOOK[state].label),
});

const UNIT_WORDS: Record<WarrantyUnit, { one: string; many: string }> = {
  days: { one: 'day', many: 'days' },
  weeks: { one: 'week', many: 'weeks' },
  months: { one: 'month', many: 'months' },
  years: { one: 'year', many: 'years' },
};

/** "12 months", "1 year", "Lifetime", "No warranty". */
export const coverageLabel = (coverage: WarrantyCoverage): string => {
  switch (coverage.kind) {
    case 'none':
      return t('No warranty');
    case 'lifetime':
      return t('Lifetime');
    case 'limited': {
      const words = UNIT_WORDS[coverage.unit];
      return `${coverage.value} ${t(coverage.value === 1 ? words.one : words.many)}`;
    }
  }
};

const TYPE_LABEL: Record<WarrantyType, string> = {
  shop: 'Shop warranty',
  manufacturer: 'Manufacturer warranty',
  both: 'Shop and manufacturer',
};

export const typeLabel = (type: WarrantyType): string => t(TYPE_LABEL[type]);

/** "Valid until 2 Nov 2027", or "Covered for life". */
export const validUntil = (warranty: Pick<Warranty, 'endsOn'>): string =>
  warranty.endsOn === undefined
    ? t('Covered for life')
    : `${t('Valid until')} ${formatDate(warranty.endsOn)}`;

/** "45 days left", "Last day today", "Ended", or "" for lifetime. */
export const daysLeftLabel = (warranty: Pick<Warranty, 'daysRemaining' | 'state'>): string => {
  if (warranty.daysRemaining === undefined) return '';
  if (warranty.daysRemaining === 0) return t('Ended');
  if (warranty.daysRemaining === 1) return t('Last day today');
  return `${warranty.daysRemaining} ${t('days left')}`;
};

/**
 * How much of the period has gone, 0 to 100, for the progress bar. Display only: the days come
 * from the server (`daysRemaining`) and the two stored dates. `null` for lifetime.
 */
export const periodUsedPercent = (
  warranty: Pick<Warranty, 'startsOn' | 'endsOn' | 'daysRemaining'>
): number | null => {
  if (warranty.endsOn === undefined || warranty.daysRemaining === undefined) return null;
  const dayMs = 86_400_000;
  const total =
    Math.round((Date.parse(warranty.endsOn) - Date.parse(warranty.startsOn)) / dayMs) + 1;
  if (total <= 0) return 100;
  const used = total - warranty.daysRemaining;
  return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
};

const EVENT_LABEL: Record<WarrantyEventKind, string> = {
  created: 'Warranty started',
  voided: 'Warranty cancelled',
  extended: 'Warranty extended',
  claim_opened: 'Claim opened',
  claim_advanced: 'Claim moved on',
  claim_decided: 'Claim decided',
  replaced: 'Replaced with a new unit',
  expired_override: 'Expired warranty honoured',
  supplier_sent: 'Sent to the supplier',
  supplier_returned: 'Back from the supplier',
  returned_to_customer: 'Given back to the customer',
};

export const eventLabel = (kind: WarrantyEventKind): string => t(EVENT_LABEL[kind]);

const MATCH_LABEL: Record<WarrantyLookupMatch, string> = {
  warranty_number: 'Found by warranty number',
  serial: 'Found by serial or IMEI',
  invoice_number: 'Found by invoice number',
  phone: 'Found by phone number',
  nothing: 'Nothing found',
};

export const matchLabel = (match: WarrantyLookupMatch): string => t(MATCH_LABEL[match]);

/** Whether a product warranty profile is ready to save, and if not, what to do. */
export const profileProblem = (profile: ProductWarranty): string | null => {
  if (profile.coverage.kind === 'limited') {
    if (!Number.isInteger(profile.coverage.value) || profile.coverage.value < 1) {
      return t('Enter how long the warranty lasts, at least 1.');
    }
    if (profile.warrantyType === undefined) {
      return t('Choose who gives the warranty.');
    }
  }
  if (profile.coverage.kind === 'lifetime' && profile.warrantyType === undefined) {
    return t('Choose who gives the warranty.');
  }
  return null;
};

/** The profile as the server wants it: no type or terms when not covered, blank terms left out. */
export const toProfileInput = (profile: ProductWarranty): ProductWarranty => {
  if (profile.coverage.kind === 'none') return { coverage: { kind: 'none' } };
  const terms = profile.terms?.trim();
  return {
    coverage: profile.coverage,
    warrantyType: profile.warrantyType,
    terms: terms === undefined || terms === '' ? undefined : terms,
  };
};

/** True when two profiles describe the same warranty (used for the "From category" hint). */
export const sameProfile = (a: ProductWarranty, b: ProductWarranty): boolean =>
  JSON.stringify(toProfileInput(a)) === JSON.stringify(toProfileInput(b));

/**
 * The last covered day if a warranty with `coverage` started today, worked out by the shared
 * calculation code (the same rule the server uses when it issues the warranty). `null` when
 * the coverage gives no end (lifetime) or no warranty.
 */
export const endsOnIfStartedToday = (coverage: WarrantyCoverage): string | null => {
  if (coverage.kind !== 'limited') return null;
  const reply = calc_warranty({ startsOn: toIsoDate(new Date()), coverage });
  return reply.kind === 'until' ? reply.endsOn : null;
};
