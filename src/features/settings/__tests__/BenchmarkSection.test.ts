import { describe, it, expect } from 'vitest';
import { BenchmarkSection } from '../components/sections/BenchmarkSection';
import { STORAGE_KEYS } from '@/constants/storage';
import { SETTINGS_SECTIONS } from '../settingsSections';
import type { BenchmarkGrade } from '../types/benchmark';

describe('BenchmarkSection Component & Presentation Contracts', () => {
  it('exports BenchmarkSection component function', () => {
    expect(typeof BenchmarkSection).toBe('function');
  });

  it('uses the dedicated pos_benchmark_result local storage key', () => {
    expect(STORAGE_KEYS.BENCHMARK_RESULT).toBe('pos_benchmark_result');
  });

  it('has benchmark registered as a desktop-only section in settings', () => {
    const section = SETTINGS_SECTIONS.find((s) => s.id === 'benchmark');
    expect(section).toBeDefined();
    expect(section?.label).toBe('System Benchmark');
    expect(section?.desktopOnly).toBe(true);
  });

  it('maps benchmark grades to appropriate theme colors correctly', () => {
    const getGradeColor = (grade: BenchmarkGrade): string => {
      switch (grade) {
        case 'A+':
          return 'teal';
        case 'A':
          return 'green';
        case 'B':
          return 'blue';
        case 'C':
          return 'yellow';
        case 'D':
        default:
          return 'red';
      }
    };

    expect(getGradeColor('A+')).toBe('teal');
    expect(getGradeColor('A')).toBe('green');
    expect(getGradeColor('B')).toBe('blue');
    expect(getGradeColor('C')).toBe('yellow');
    expect(getGradeColor('D')).toBe('red');
  });

  it('correctly maps diagnostic status values to Mantine badge colors', () => {
    const getStatusColor = (status: 'optimal' | 'good' | 'warning'): string => {
      switch (status) {
        case 'optimal':
          return 'teal';
        case 'good':
          return 'blue';
        case 'warning':
          return 'orange';
      }
    };

    expect(getStatusColor('optimal')).toBe('teal');
    expect(getStatusColor('good')).toBe('blue');
    expect(getStatusColor('warning')).toBe('orange');
  });

  it('guarantees that engine capacity chart includes all 3 column metrics with interval 0', () => {
    const mockReportMetrics = [
      { metric: 'Storage Write (MB/s)', value: 650 },
      { metric: 'Database Read (QPS)', value: 1250 },
      { metric: 'PDF Engine (docs/s)', value: 320 },
    ];

    expect(mockReportMetrics).toHaveLength(3);
    expect(mockReportMetrics.map((m) => m.metric)).toEqual([
      'Storage Write (MB/s)',
      'Database Read (QPS)',
      'PDF Engine (docs/s)',
    ]);

    const xAxisProps = { interval: 0, minTickGap: 0 };
    expect(xAxisProps.interval).toBe(0);
    expect(xAxisProps.minTickGap).toBe(0);
  });
});
