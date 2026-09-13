import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePercentiles,
  computeBenchmarkScore,
  formatDurationMs,
  formatMarkdownReport,
  loadLastBenchmarkResult,
  saveBenchmarkResult,
} from '../lib/benchmarkRunner';
import type { BenchmarkReportData, DiskIoResult, NativeComputeResult, SystemSpecs } from '../types/benchmark';

describe('benchmarkRunner logic & calculations', () => {
  describe('calculatePercentiles', () => {
    it('handles empty array gracefully', () => {
      const res = calculatePercentiles([]);
      expect(res.p50).toBe(0);
      expect(res.max).toBe(0);
    });

    it('calculates percentiles accurately on sample latencies', () => {
      const latencies = [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0];
      const res = calculatePercentiles(latencies);
      expect(res.min).toBe(1.0);
      expect(res.max).toBe(10.0);
      expect(res.p50).toBe(6.0); // 50th percentile
      expect(res.avg).toBe(5.5);
    });
  });

  describe('formatDurationMs', () => {
    it('formats sub-millisecond durations as microseconds', () => {
      expect(formatDurationMs(0.45)).toBe('450 µs');
      expect(formatDurationMs(0.02)).toBe('20 µs');
    });

    it('formats millisecond durations with 1 decimal place', () => {
      expect(formatDurationMs(12.34)).toBe('12.3 ms');
      expect(formatDurationMs(150.0)).toBe('150.0 ms');
    });
  });

  describe('computeBenchmarkScore', () => {
    const mockSpecs: SystemSpecs = {
      os: 'macos',
      arch: 'aarch64',
      cpuCores: 8,
      appVersion: '0.6.0',
      engineMode: 'SQLite WAL + Typst',
    };

    const mockDiskHigh: DiskIoResult = {
      writeSpeedMbS: 650,
      readSpeedMbS: 820,
      durationMs: 20,
    };

    const mockCompute: NativeComputeResult = {
      singleThreadOpsSec: 150000,
      multiThreadOpsSec: 600000,
      speedupFactor: 4.0,
      coresUsed: 8,
    };

    it('computes Grade A+ and high score for optimal enterprise POS hardware', () => {
      const breakdown = computeBenchmarkScore(
        mockSpecs,
        mockDiskHigh,
        mockCompute,
        1.5, // 1.5ms DB latency
        25.0, // 25ms Typst render
        0.8 // 0.8ms loopback IPC ping
      );

      expect(breakdown.overallScore).toBeGreaterThanOrEqual(90);
      expect(breakdown.grade).toBe('A+');
      expect(breakdown.tierLabel).toContain('Enterprise');
      expect(breakdown.diagnostics.every((d) => d.status === 'optimal')).toBe(true);
    });

    it('computes appropriate warnings for slower storage and high latency', () => {
      const mockDiskSlow: DiskIoResult = {
        writeSpeedMbS: 15,
        readSpeedMbS: 25,
        durationMs: 400,
      };

      const breakdown = computeBenchmarkScore(
        { ...mockSpecs, cpuCores: 2 },
        mockDiskSlow,
        mockCompute,
        35.0, // 35ms DB latency
        220.0, // 220ms Typst render
        8.0 // 8ms IPC ping
      );

      expect(breakdown.overallScore).toBeLessThan(70);
      expect(['C', 'D']).toContain(breakdown.grade);
      expect(breakdown.diagnostics.some((d) => d.status === 'warning')).toBe(true);
    });
  });

  describe('storage persistence & markdown formatting', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    const sampleReport: BenchmarkReportData = {
      id: 'bench_123',
      testedAt: '2026-09-13T10:00:00.000Z',
      overallScore: 95,
      grade: 'A+',
      tierLabel: 'Enterprise High-Speed POS Ready',
      tierSummary: 'Outstanding hardware performance.',
      specs: {
        os: 'macos',
        arch: 'aarch64',
        cpuCores: 8,
        appVersion: '0.6.0',
        engineMode: 'SQLite WAL',
      },
      disk: {
        writeSpeedMbS: 580,
        readSpeedMbS: 720,
        durationMs: 25,
      },
      compute: {
        singleThreadOpsSec: 120000,
        multiThreadOpsSec: 480000,
        speedupFactor: 4.0,
        coresUsed: 8,
      },
      database: {
        qps: 1250,
        totalQueries: 20,
        successQueries: 20,
        latency: { min: 0.8, p50: 1.2, p90: 2.1, p95: 2.5, p99: 3.0, max: 3.5, avg: 1.4 },
      },
      documents: {
        rendersPerSec: 320,
        totalRenders: 4,
        successRenders: 4,
        latency: { min: 20, p50: 28, p90: 35, p95: 40, p99: 42, max: 45, avg: 30 },
        avgSizeKb: 83.4,
      },
      ipc: {
        pingMs: 0.8,
        samples: 5,
      },
      diagnostics: [
        {
          id: 'diag-storage',
          category: 'disk',
          title: 'Storage I/O',
          status: 'optimal',
          measured: '580 MB/s',
          baseline: '150 MB/s',
          message: 'Fast SSD.',
        },
      ],
    };

    it('saves and loads benchmark report from localStorage', () => {
      expect(loadLastBenchmarkResult()).toBeNull();
      saveBenchmarkResult(sampleReport);
      const loaded = loadLastBenchmarkResult();
      expect(loaded).toBeDefined();
      expect(loaded?.overallScore).toBe(95);
      expect(loaded?.grade).toBe('A+');
    });

    it('generates a formatted markdown summary with tables and diagnostics', () => {
      const md = formatMarkdownReport(sampleReport);
      expect(md).toContain('# Jana2U POS Desktop Benchmark Report');
      expect(md).toContain('**Overall Score**: 95 / 100');
      expect(md).toContain('Enterprise High-Speed POS Ready');
      expect(md).toContain('| **Storage I/O** |');
      expect(md).toContain('580.0 MB/s');
    });
  });
});
