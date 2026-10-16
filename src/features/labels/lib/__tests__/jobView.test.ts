import { describe, it, expect } from 'vitest';
import { coverageLine, howItPrinted, labelCount, outcomeView } from '../jobView';
import type { LabelCoverageRow, LabelJob } from '../../types';

const job = (over: Partial<LabelJob>): LabelJob =>
  ({
    action: 'print',
    method: 'system',
    printerName: null,
    dpi: 203,
    outcome: 'sent',
    ...over,
  }) as LabelJob;

describe('print history wording', () => {
  it('counts labels in plain words', () => {
    expect(labelCount(1)).toBe('1 label');
    expect(labelCount(4)).toBe('4 labels');
  });

  it('says how a print left the computer', () => {
    expect(howItPrinted(job({}))).toBe('Print window · 203 dpi');
    expect(howItPrinted(job({ method: 'direct', printerName: 'Zebra', dpi: 300 }))).toBe(
      'Zebra · 300 dpi'
    );
    expect(howItPrinted(job({ action: 'download', method: null, dpi: null }))).toBe(
      'Saved as a PDF file'
    );
  });

  it('names the result with a status colour', () => {
    expect(outcomeView(job({}))).toEqual({ label: 'Printed', color: 'var(--status-ok)' });
    expect(outcomeView(job({ action: 'download' })).label).toBe('Saved');
    expect(outcomeView(job({ outcome: 'failed' })).color).toBe('var(--status-error)');
    expect(outcomeView(job({ outcome: 'rendered' })).color).toBe('var(--status-warn)');
  });

  it('describes an item’s labels', () => {
    const row = (over: Partial<LabelCoverageRow>) =>
      ({
        status: 'never',
        lastLabelledAt: null,
        receivedSinceLabel: 0,
        ...over,
      }) as LabelCoverageRow;
    const date = (iso: string) => iso.slice(0, 10);
    expect(coverageLine(row({}), date)).toBe('Never labelled');
    expect(coverageLine(row({ status: 'needed', receivedSinceLabel: 3 }), date)).toBe(
      '3 new since the last label'
    );
    expect(
      coverageLine(row({ status: 'labelled', lastLabelledAt: '2026-10-14T08:00:00Z' }), date)
    ).toBe('Labelled 2026-10-14');
    expect(coverageLine(row({ status: null }), date)).toBe('Out of stock');
  });
});
