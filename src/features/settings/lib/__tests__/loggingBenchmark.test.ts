import { describe, it, expect } from 'vitest';
import {
  averageModes,
  computeOverhead,
  cpuDeltas,
  peakRss,
  LOGGING_BENCH_PRESETS,
  type ResourceSample,
} from '../loggingBenchmark';
import type { LoggingModeMetrics } from '../../types/benchmark';

const sample = (
  atMs: number,
  processes: [string, number, number, number][],
  bytesWritten = 0,
  accepted = 0
): ResourceSample => ({
  atMs,
  processes: processes.map(([name, pid, cpuTimeMs, rssMb]) => ({
    name,
    pid,
    cpuTimeMs,
    rssBytes: rssMb * 1024 * 1024,
  })),
  log: { accepted, eventsWritten: accepted, bytesWritten, dropped: 0, queuedBytes: 0 },
});

const metrics = (overrides: Partial<LoggingModeMetrics>): LoggingModeMetrics => ({
  mode: 'off',
  flows: 200,
  wallMs: 1000,
  processes: [{ name: 'shell', cpuMsPerThousandFlows: 100, peakRssMb: 50 }],
  cpuMsPerThousandFlows: 100,
  frontendSelfMsPerThousandFlows: 10,
  diskKbPerThousandFlows: 0,
  eventsPerFlow: 0,
  droppedEvents: 0,
  flowLatency: { min: 1, p50: 10, p90: 18, p95: 20, p99: 25, max: 30, avg: 12 },
  ...overrides,
});

describe('logging benchmark measurement', () => {
  it('offers a quick and a full flow count', () => {
    expect(LOGGING_BENCH_PRESETS.quick).toBe(200);
    expect(LOGGING_BENCH_PRESETS.full).toBe(1000);
  });

  it('takes CPU time as a per-pid delta and buckets webview helpers together', () => {
    const start = sample(0, [
      ['shell', 1, 1000, 40],
      ['backend', 2, 500, 80],
      ['webview:WebContent:1', 3, 200, 120],
      ['webview:GPU:2', 4, 100, 30],
    ]);
    const end = sample(1000, [
      ['shell', 1, 1120, 44],
      ['backend', 2, 700, 90],
      ['webview:WebContent:1', 3, 260, 130],
      ['webview:GPU:2', 4, 130, 32],
      // A process that appeared mid-phase must not have its lifetime counted.
      ['backend', 9, 99_999, 10],
    ]);
    const deltas = cpuDeltas(start, end);
    expect(deltas.get('shell')).toBe(120);
    expect(deltas.get('backend')).toBe(200);
    expect(deltas.get('webview')).toBe(90);
  });

  it('takes peak memory per bucket across samples', () => {
    const peaks = peakRss([
      sample(0, [
        ['shell', 1, 0, 40],
        ['webview:WebContent:1', 3, 0, 100],
      ]),
      sample(500, [
        ['shell', 1, 0, 55],
        ['webview:WebContent:1', 3, 0, 90],
      ]),
    ]);
    expect(peaks.get('shell')).toBe(55 * 1024 * 1024);
    expect(peaks.get('webview')).toBe(100 * 1024 * 1024);
  });

  it('averages the two Off runs', () => {
    const averaged = averageModes(
      metrics({ cpuMsPerThousandFlows: 100, flowLatency: { ...metrics({}).flowLatency, p95: 20 } }),
      metrics({ cpuMsPerThousandFlows: 140, flowLatency: { ...metrics({}).flowLatency, p95: 30 } })
    );
    expect(averaged.cpuMsPerThousandFlows).toBe(120);
    expect(averaged.flowLatency.p95).toBe(25);
  });

  it('reports overhead as the difference from Off, including a percentage', () => {
    const off = metrics({ cpuMsPerThousandFlows: 1000, diskKbPerThousandFlows: 0 });
    const full = metrics({
      mode: 'full',
      cpuMsPerThousandFlows: 1250,
      diskKbPerThousandFlows: 2048,
      processes: [{ name: 'shell', cpuMsPerThousandFlows: 1250, peakRssMb: 62 }],
      flowLatency: { ...off.flowLatency, p95: 23.5 },
    });
    const overhead = computeOverhead(off, full);
    expect(overhead.mode).toBe('full');
    expect(overhead.cpuMsPerThousandFlows).toBe(250);
    expect(overhead.cpuPercentOverBaseline).toBe(25);
    expect(overhead.memoryMb).toBe(12);
    expect(overhead.diskKbPerThousandFlows).toBe(2048);
    expect(overhead.latencyP95Ms).toBe(3.5);
  });

  it('never divides by a zero baseline', () => {
    const off = metrics({ cpuMsPerThousandFlows: 0 });
    expect(computeOverhead(off, metrics({ cpuMsPerThousandFlows: 5 })).cpuPercentOverBaseline).toBe(
      0
    );
  });
});
