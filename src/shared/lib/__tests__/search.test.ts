import { describe, expect, it } from 'vitest';
import {
  buildSearchIndex,
  getMatchRanges,
  normalizeDigits,
  normalizeText,
  searchIndex,
  tokenizeQuery,
  type SearchField,
} from '@/shared/lib/search';

interface Row {
  name: string;
  sku: string;
  phone?: string;
}

const FIELDS: readonly SearchField<Row>[] = [
  { get: (r) => r.name, weight: 3, kind: 'text' },
  { get: (r) => r.sku, weight: 2, kind: 'text' },
  { get: (r) => r.phone, weight: 3, kind: 'digits' },
];

const run = (rows: Row[], query: string, limit: number | null = null) =>
  searchIndex(buildSearchIndex(rows, FIELDS), tokenizeQuery(query), limit);

describe('normalizeText', () => {
  it('lowercases, strips diacritics and collapses whitespace', () => {
    expect(normalizeText('  Café   DELUXE ')).toBe('cafe deluxe');
  });
});

describe('normalizeDigits', () => {
  it('keeps only digits', () => {
    expect(normalizeDigits('+94 (77) 123-4567')).toBe('94771234567');
  });
});

describe('tokenizeQuery', () => {
  it('returns no terms for a blank query', () => {
    expect(tokenizeQuery('   ')).toEqual([]);
  });

  it('splits on whitespace and carries a digits form', () => {
    expect(tokenizeQuery('sam 077')).toEqual([
      { text: 'sam', digits: '' },
      { text: '077', digits: '077' },
    ]);
  });
});

describe('searchIndex', () => {
  it('requires every term to match, across any field', () => {
    const rows: Row[] = [
      { name: 'Blue Samsung Case', sku: 'A1' },
      { name: 'Blue Nokia Case', sku: 'A2' },
      { name: 'Samsung Charger', sku: 'A3' },
    ];

    // Multi-term AND: only the row carrying both words survives.
    expect(run(rows, 'sam blue').map((r) => r.sku)).toEqual(['A1']);
  });

  it('ranks exact over prefix over word-start over mid-word', () => {
    const rows: Row[] = [
      { name: 'Panasonic Remote', sku: 'MID' },
      { name: 'Cable Anchor', sku: 'WORD' },
      { name: 'Anchor Bolt', sku: 'PREFIX' },
      { name: 'An', sku: 'EXACT' },
    ];

    expect(run(rows, 'an').map((r) => r.sku)).toEqual(['EXACT', 'PREFIX', 'WORD', 'MID']);
  });

  it('weights a name hit above a SKU hit', () => {
    const rows: Row[] = [
      { name: 'Screen Protector', sku: 'ZZZ-1' },
      { name: 'Unrelated Item', sku: 'SCREEN-9' },
    ];

    expect(run(rows, 'screen')[0].name).toBe('Screen Protector');
  });

  it('matches phone fields regardless of spacing or punctuation', () => {
    const rows: Row[] = [{ name: 'Nimal', sku: 'C1', phone: '0771234567' }];

    expect(run(rows, '077 123')).toHaveLength(1);
    expect(run(rows, '077-123')).toHaveLength(1);
    expect(run(rows, '0779999')).toHaveLength(0);
  });

  it('never matches a digitless term against a digits-only field', () => {
    const rows: Row[] = [{ name: 'Nimal', sku: 'C1', phone: '0771234567' }];

    // "nimal" must land on the name, not be silently tested against the phone.
    expect(run(rows, 'nimal')).toHaveLength(1);
    expect(run(rows, 'zzz')).toHaveLength(0);
  });

  it('keeps the original order for equally scored rows', () => {
    const rows: Row[] = [
      { name: 'Cable A', sku: '1' },
      { name: 'Cable B', sku: '2' },
      { name: 'Cable C', sku: '3' },
    ];

    expect(run(rows, 'cable').map((r) => r.sku)).toEqual(['1', '2', '3']);
  });

  it('returns every row, in order, for a blank query', () => {
    const rows: Row[] = [
      { name: 'B', sku: '1' },
      { name: 'A', sku: '2' },
    ];

    expect(run(rows, '').map((r) => r.sku)).toEqual(['1', '2']);
  });

  it('applies the limit', () => {
    const rows: Row[] = Array.from({ length: 10 }, (_, i) => ({
      name: `Cable ${i}`,
      sku: String(i),
    }));

    expect(run(rows, 'cable', 3)).toHaveLength(3);
    expect(run(rows, '', 4)).toHaveLength(4);
  });

  it('skips rows whose field is absent rather than treating it as empty', () => {
    const rows: Row[] = [
      { name: 'Has Phone', sku: '1', phone: '0771234567' },
      { name: 'No Phone', sku: '2' },
    ];

    expect(run(rows, '077').map((r) => r.sku)).toEqual(['1']);
  });
});

describe('getMatchRanges', () => {
  it('finds every occurrence, case-insensitively', () => {
    expect(getMatchRanges('Cable cable', tokenizeQuery('cable'))).toEqual([
      [0, 5],
      [6, 11],
    ]);
  });

  it('merges overlapping ranges from different terms', () => {
    // "blue" and "lue" overlap; the highlighter must not emit nested marks.
    expect(getMatchRanges('Blue Case', tokenizeQuery('blue lue'))).toEqual([[0, 4]]);
  });

  it('returns nothing for a blank query', () => {
    expect(getMatchRanges('Blue Case', tokenizeQuery(''))).toEqual([]);
  });

  it('produces offsets into the original string, not a normalized copy', () => {
    const text = 'The Blue Case';
    const [range] = getMatchRanges(text, tokenizeQuery('blue'));
    expect(text.slice(range[0], range[1])).toBe('Blue');
  });
});
