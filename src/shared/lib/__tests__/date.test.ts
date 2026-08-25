import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatTime, formatRelativeTime } from '../date';

describe('date formatting utilities', () => {
  const sampleIso = '2026-08-25T14:30:00.000Z';

  describe('formatDate', () => {
    it('formats ISO string with default format', () => {
      const result = formatDate(sampleIso);
      expect(result).toContain('2026');
      expect(result).toContain('Aug');
    });

    it('formats with custom format pattern', () => {
      const result = formatDate(sampleIso, 'YYYY-MM-DD');
      expect(result).toBe('2026-08-25');
    });

    it('returns "-" for null, undefined, or empty string', () => {
      expect(formatDate('')).toBe('-');
      expect(formatDate(null as never)).toBe('-');
      expect(formatDate(undefined as never)).toBe('-');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time string', () => {
      const result = formatDateTime(sampleIso);
      expect(result).toContain('Aug 2026');
      expect(result).toMatch(/AM|PM/);
    });

    it('returns "-" for empty value', () => {
      expect(formatDateTime('')).toBe('-');
    });
  });

  describe('formatTime', () => {
    it('formats only the time portion with AM/PM', () => {
      const result = formatTime(sampleIso);
      expect(result).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
    });

    it('returns "-" for empty value', () => {
      expect(formatTime('')).toBe('-');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns relative time string', () => {
      const pastIso = new Date(Date.now() - 60000).toISOString();
      const result = formatRelativeTime(pastIso);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('returns "-" for empty value', () => {
      expect(formatRelativeTime('')).toBe('-');
    });
  });
});
