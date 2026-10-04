import type { Phrase } from './syncView';

/** Joins a phrase: static words go through `translate`, numbers are shown as they are. */
export const phraseText = (phrase: Phrase, translate: (text: string) => string): string =>
  phrase.map((part) => (typeof part === 'number' ? String(part) : translate(part))).join(' ');
