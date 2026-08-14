import React, { useMemo } from 'react';
import { getMatchRanges, type SearchTerm } from '@/shared/lib/search';

export interface SearchHighlightProps {
  /** The text to render. */
  text: string;
  /** Query terms from `useEntitySearch`. Pass an empty array to render plain text. */
  terms: readonly SearchTerm[];
}

/**
 * Renders `text`, marking the parts that matched the query.
 *
 * Keeping the highlight next to the scorer means what is emphasised is exactly
 * what was matched, rather than a second, slightly different string comparison
 * done for display.
 */
export const SearchHighlight = ({ text, terms }: SearchHighlightProps) => {
  const segments = useMemo(() => {
    const ranges = getMatchRanges(text, terms);
    if (ranges.length === 0) return null;

    const parts: Array<{ value: string; matched: boolean }> = [];
    let cursor = 0;

    for (const [start, end] of ranges) {
      if (start > cursor) parts.push({ value: text.slice(cursor, start), matched: false });
      parts.push({ value: text.slice(start, end), matched: true });
      cursor = end;
    }

    if (cursor < text.length) parts.push({ value: text.slice(cursor), matched: false });

    return parts;
  }, [text, terms]);

  if (segments === null) return <>{text}</>;

  return (
    <>
      {segments.map((part, i) =>
        part.matched ? (
          <mark key={i} className="search-highlight">
            {part.value}
          </mark>
        ) : (
          <React.Fragment key={i}>{part.value}</React.Fragment>
        )
      )}
    </>
  );
};
