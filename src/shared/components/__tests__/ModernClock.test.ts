import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ModernClock } from '../ModernClock';
import { formatClockTime, formatClockDate, parseClockTimeParts } from '@/shared/lib/date';

describe('ModernClock component', () => {
  it('exports ModernClock as a functional component', () => {
    expect(typeof ModernClock).toBe('function');
  });

  it('formats time and date consistently for clock display', () => {
    const fixedDate = new Date(2026, 7, 27, 9, 35, 56);
    expect(formatClockTime(fixedDate)).toBe('9:35:56 AM');
    expect(formatClockDate(fixedDate)).toBe('Thu, Aug 27');
  });

  it('derives the per-digit segments the component renders from the formatted time', () => {
    const fixedDate = new Date(2026, 7, 27, 9, 35, 56);
    expect(parseClockTimeParts(formatClockTime(fixedDate))).toEqual({
      hours: '9',
      minutes: '35',
      seconds: '56',
      period: 'AM',
    });
  });

  it('validates clock time segmentation for both AM and PM boundaries', () => {
    const morningDate = new Date(2026, 7, 27, 9, 5, 2);
    expect(parseClockTimeParts(formatClockTime(morningDate))).toEqual({
      hours: '9',
      minutes: '05',
      seconds: '02',
      period: 'AM',
    });

    const eveningDate = new Date(2026, 7, 27, 21, 45, 30);
    expect(parseClockTimeParts(formatClockTime(eveningDate))).toEqual({
      hours: '9',
      minutes: '45',
      seconds: '30',
      period: 'PM',
    });
  });

  it('renders standard split pill header variant with date, live dot, time and period', () => {
    const html = renderToString(
      React.createElement(ModernClock, { variant: 'header', id: 'test-header-clock' })
    );
    expect(html).toContain('id="test-header-clock"');
    expect(html).toContain('role="timer"');
    expect(html).toContain('pos-clock-live-dot');
    expect(html).toContain('var(--bg-card)');
    expect(html).toContain('var(--bg-active)');
    expect(html).toContain('var(--border)');
    expect(html).toContain('var(--mantine-color-blue-5)');
  });

  it('renders compact split pill variant with compact styling for billing header', () => {
    const html = renderToString(
      React.createElement(ModernClock, { variant: 'compact', id: 'test-compact-clock' })
    );
    expect(html).toContain('id="test-compact-clock"');
    expect(html).toContain('role="timer"');
    expect(html).toContain('pos-clock-live-dot');
    expect(html).toContain('var(--mantine-radius-default)');
  });
});
