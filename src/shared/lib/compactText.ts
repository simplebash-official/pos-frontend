/**
 * Lowercase with all spacing removed, so "Tea  and" matches "tea and" and "teaand". The loose
 * match the cash forms use for short names; `lib/search.ts` is the catalogue's richer search.
 */
export const compactText = (text: string): string => text.replace(/\s+/g, '').toLowerCase();
