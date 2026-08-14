/**
 * The app's shared text-search engine.
 *
 * Search runs entirely on the local dataset — the Dexie mirror or an in-memory
 * list — never against the server. That is deliberate: the shop loses internet
 * regularly, and a search box that stops working during an outage is useless at
 * the till. See the "Offline & sync" section of CLAUDE.md.
 *
 * Matching rules:
 *   - the query is split into terms on whitespace;
 *   - a row matches only if **every** term hits **at least one** field (AND across
 *     terms, OR across fields), so "sam blue" finds "Blue Samsung Case";
 *   - each term scores the best tier it achieves on any field, weighted by that
 *     field's importance, and the row's score is the sum across terms.
 */

/**
 * How a field's text is prepared before matching.
 *
 * `digits` strips everything but 0-9 on both sides, so a phone typed as
 * "077 123" or "077-123" still finds the number stored as "0771234567".
 */
export type SearchFieldKind = 'text' | 'digits';

/**
 * One searchable field on an entity.
 *
 * Every property is required: a field that does not state its own weight and
 * kind would silently inherit a guessed default, which is exactly the kind of
 * implicit fallback the codebase avoids.
 */
export interface SearchField<T> {
  /** Pulls the raw text out of the row. Return `undefined` when the row has no value for it. */
  get: (item: T) => string | undefined | null;
  /** Relative importance. A name is worth more than an address. */
  weight: number;
  /** How the value is normalized before matching. */
  kind: SearchFieldKind;
}

/** A single term of the user's query, in both the forms a field may need. */
export interface SearchTerm {
  /** Normalized text form: lowercase, diacritics stripped, whitespace collapsed. */
  readonly text: string;
  /** Digits-only form. Empty string when the term contains no digits at all. */
  readonly digits: string;
}

interface IndexedField {
  readonly value: string;
  readonly weight: number;
  readonly kind: SearchFieldKind;
}

/** One row with all of its searchable text pre-normalized. */
export interface SearchEntry<T> {
  readonly item: T;
  readonly fields: readonly IndexedField[];
}

/**
 * A dataset with its text normalized once.
 *
 * Building this is the expensive half of searching, so it is done per dataset
 * change rather than per keystroke — see `useEntitySearch`.
 */
export type SearchIndex<T> = readonly SearchEntry<T>[];

/** An inclusive-exclusive `[start, end)` slice of a string that matched. */
export type MatchRange = readonly [start: number, end: number];

/** Scoring tiers, best first. Multiplied by the field's weight. */
const TIER_EXACT = 1000;
const TIER_PREFIX = 500;
const TIER_WORD_START = 250;
const TIER_SUBSTRING = 100;

const DIACRITIC_MARKS = /[̀-ͯ]/g;
const NON_DIGITS = /[^0-9]/g;
const WHITESPACE_RUN = /\s+/g;

/**
 * Lowercase, strip diacritics, collapse internal whitespace, trim.
 *
 * Note this can change string length (NFD decomposition), so it must not be used
 * to compute highlight offsets — `getMatchRanges` deliberately uses a
 * length-preserving lowercase instead.
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITIC_MARKS, '')
    .toLowerCase()
    .replace(WHITESPACE_RUN, ' ')
    .trim();
}

/** Everything but 0-9 removed, so punctuation and spacing in phone numbers stop mattering. */
export function normalizeDigits(value: string): string {
  return value.replace(NON_DIGITS, '');
}

/** Splits the query into terms. Returns an empty array for a blank query. */
export function tokenizeQuery(query: string): readonly SearchTerm[] {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  return normalized.split(' ').map((text) => ({ text, digits: normalizeDigits(text) }));
}

/** True for characters that continue a word, so we can spot word starts. */
function isWordChar(code: number): boolean {
  // Values are already lowercased and diacritic-free at this point.
  return (code >= 97 && code <= 122) || (code >= 48 && code <= 57);
}

/**
 * The best tier `term` achieves against `value`, or 0 when it does not occur.
 *
 * A term appearing at a word start ranks above one buried mid-word, so typing
 * "an" puts "Anchor Cable" above "Panasonic Remote".
 */
function matchTier(value: string, term: string): number {
  if (!value || !term) return 0;
  if (value === term) return TIER_EXACT;

  let at = value.indexOf(term);
  if (at === -1) return 0;
  if (at === 0) return TIER_PREFIX;

  while (at !== -1) {
    if (!isWordChar(value.charCodeAt(at - 1))) return TIER_WORD_START;
    at = value.indexOf(term, at + 1);
  }

  return TIER_SUBSTRING;
}

/**
 * Normalizes every field of every row once.
 *
 * `fields` should be a stable reference (the module-level configs in
 * `searchFields.ts` are) so callers can memoize on it.
 */
export function buildSearchIndex<T>(
  items: readonly T[],
  fields: readonly SearchField<T>[]
): SearchIndex<T> {
  return items.map((item) => {
    const indexed: IndexedField[] = [];

    for (const field of fields) {
      const raw = field.get(item);
      if (raw === undefined || raw === null || raw === '') continue;

      const value = field.kind === 'digits' ? normalizeDigits(raw) : normalizeText(raw);
      if (!value) continue;

      indexed.push({ value, weight: field.weight, kind: field.kind });
    }

    return { item, fields: indexed };
  });
}

/**
 * Scores one row, or returns `null` when it does not match.
 *
 * Every term must land somewhere; a term that hits nothing rejects the row.
 */
export function scoreEntry<T>(entry: SearchEntry<T>, terms: readonly SearchTerm[]): number | null {
  let total = 0;

  for (const term of terms) {
    let best = 0;

    for (const field of entry.fields) {
      // A term with no digits can never match a digits-only field.
      const needle = field.kind === 'digits' ? term.digits : term.text;
      if (!needle) continue;

      const score = matchTier(field.value, needle) * field.weight;
      if (score > best) best = score;
    }

    if (best === 0) return null;
    total += best;
  }

  return total;
}

/**
 * Runs a tokenized query over a prepared index, best match first.
 *
 * Pass `limit: null` for uncapped results. Rows with equal scores keep their
 * original order — `Array.prototype.sort` is specified as stable — so a list
 * that was already sorted by name does not jitter as the user types.
 */
export function searchIndex<T>(
  index: SearchIndex<T>,
  terms: readonly SearchTerm[],
  limit: number | null
): T[] {
  if (terms.length === 0) {
    const all = index.map((entry) => entry.item);
    return limit === null ? all : all.slice(0, limit);
  }

  const scored: Array<{ item: T; score: number }> = [];

  for (const entry of index) {
    const score = scoreEntry(entry, terms);
    if (score !== null) scored.push({ item: entry.item, score });
  }

  scored.sort((a, b) => b.score - a.score);

  const capped = limit === null ? scored : scored.slice(0, limit);
  return capped.map((hit) => hit.item);
}

/**
 * Where each term occurs in `text`, merged and in order, for highlighting.
 *
 * This matches against a plain lowercase copy rather than `normalizeText`, so
 * the offsets still line up with the original string. The trade-off is that a
 * term only differing by an accent still matches and is shown — it just is not
 * highlighted.
 */
export function getMatchRanges(text: string, terms: readonly SearchTerm[]): readonly MatchRange[] {
  if (!text || terms.length === 0) return [];

  const haystack = text.toLowerCase();
  const found: Array<[number, number]> = [];

  for (const term of terms) {
    if (!term.text) continue;
    let at = haystack.indexOf(term.text);
    while (at !== -1) {
      found.push([at, at + term.text.length]);
      at = haystack.indexOf(term.text, at + term.text.length);
    }
  }

  if (found.length === 0) return [];

  found.sort((a, b) => a[0] - b[0]);

  const merged: Array<[number, number]> = [found[0]];
  for (let i = 1; i < found.length; i += 1) {
    const last = merged[merged.length - 1];
    const current = found[i];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}
