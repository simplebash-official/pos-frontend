/**
 * Measures what the activity log costs, inside the app.
 *
 * It replays a *simulated* sale flow — catalog and customer lookups, the
 * billing stats query, a PDF render every tenth flow, plus the clicks, typing
 * and Redux actions a real sale produces — with logging Off, Standard and
 * Full, and reports the difference in CPU, memory and disk.
 *
 * Nothing is written to shop data: there are no sales, stock movements or
 * invoice numbers, only reads. (document-server does keep one render-history
 * row per PDF.) The logging mode is in-memory for the run and restored
 * afterwards, even if the run fails.
 *
 * Per-process CPU time and memory come from the OS via the shell's
 * `benchmark_resource_sample`; the webview is a separate process, so its
 * logging cost is reported both from the OS sample and from the logger's own
 * main-thread self-time.
 */

import { apiClient } from '@/api/client';
import { store } from '@/store';
import { logger } from '@/shared/logging';
import type { LogConfig } from '@/shared/logging';
import { calculatePercentiles } from './benchmarkRunner';
import type {
  LogBenchMode,
  LoggingModeMetrics,
  LoggingOverheadDelta,
  LoggingOverheadResult,
  ProcessCost,
} from '../types/benchmark';

type Invoke = <T>(command: string, args?: Record<string, unknown>) => Promise<T>;

export interface ProcessSample {
  name: string;
  pid: number;
  cpuTimeMs: number;
  rssBytes: number;
}

export interface ResourceSample {
  atMs: number;
  processes: ProcessSample[];
  log: {
    accepted: number;
    eventsWritten: number;
    bytesWritten: number;
    dropped: number;
    queuedBytes: number;
  };
}

/** Flow counts offered in Settings. */
export const LOGGING_BENCH_PRESETS = { quick: 200, full: 1000 } as const;

const RENDER_EVERY = 10;
const WARMUP_FLOWS = 3;
const RSS_SAMPLE_EVERY_MS = 500;
/** Let the writer's 250 ms flush cycle finish before the closing sample. */
const FLUSH_SETTLE_MS = 600;
const MODE_ORDER: LogBenchMode[] = ['off', 'standard', 'full', 'off'];

const loadInvoke = async (): Promise<Invoke> => {
  const core = await import('@tauri-apps/api/core');
  return core.invoke as Invoke;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Off-screen controls that the DOM capture sees exactly as it sees real ones.
 * `aria-hidden` and a fixed off-canvas position keep them out of the UI while
 * still being laid out.
 */
const createSandbox = (doc: Document) => {
  const host = doc.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.setAttribute('data-benchmark-sandbox', 'true');
  host.style.cssText =
    'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;';
  host.innerHTML = `
    <button type="button" data-log-id="benchmark.simulated-sale">Complete sale</button>
    <label for="bench-search">Product search</label>
    <input id="bench-search" name="productSearch" type="text" />
    <select name="paymentMethod"><option value="cash">Cash</option><option value="card">Card</option></select>`;
  doc.body.appendChild(host);

  const button = host.querySelector('button') as HTMLButtonElement;
  const input = host.querySelector('input') as HTMLInputElement;
  const select = host.querySelector('select') as HTMLSelectElement;

  return {
    interact(index: number) {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      input.value = `product ${index}`;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      select.value = index % 2 === 0 ? 'cash' : 'card';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    },
    destroy() {
      host.remove();
    },
  };
};

type Sandbox = ReturnType<typeof createSandbox>;

/** One simulated sale: the same log traffic a real sale produces, read-only. */
const runSimulatedFlow = async (index: number, sandbox: Sandbox): Promise<void> => {
  sandbox.interact(index);
  store.dispatch({ type: 'benchmark/simulatedSaleStep', payload: { index, step: 'catalog' } });

  const ignore = () => undefined;
  await apiClient.get('/inventory/products', { params: { search: 'a', limit: 20 } }).catch(ignore);
  await apiClient.get('/customers', { params: { search: 'a', limit: 10 } }).catch(ignore);

  store.dispatch({ type: 'benchmark/simulatedSaleStep', payload: { index, step: 'payment' } });
  await apiClient.get('/billing/invoices/stats').catch(ignore);

  if (index % RENDER_EVERY === RENDER_EVERY - 1) {
    await apiClient
      .get('/reports/analytics/document', {
        params: { preset: 'today' },
        responseType: 'blob',
      })
      .catch(ignore);
  }
};

/** Webview helper/GPU processes vary per platform; report them as one bucket. */
const bucketFor = (name: string): string => (name.startsWith('webview') ? 'webview' : name);

export const cpuDeltas = (start: ResourceSample, end: ResourceSample): Map<string, number> => {
  const before = new Map<number, number>(start.processes.map((p) => [p.pid, p.cpuTimeMs]));
  const deltas = new Map<string, number>();
  for (const process of end.processes) {
    const previous = before.get(process.pid);
    if (previous === undefined) {
      continue; // started mid-phase; its lifetime CPU isn't ours to attribute
    }
    const bucket = bucketFor(process.name);
    deltas.set(bucket, (deltas.get(bucket) ?? 0) + Math.max(0, process.cpuTimeMs - previous));
  }
  return deltas;
};

export const peakRss = (samples: ResourceSample[]): Map<string, number> => {
  const peaks = new Map<string, number>();
  for (const sample of samples) {
    const perBucket = new Map<string, number>();
    for (const process of sample.processes) {
      const bucket = bucketFor(process.name);
      perBucket.set(bucket, (perBucket.get(bucket) ?? 0) + process.rssBytes);
    }
    for (const [bucket, bytes] of perBucket) {
      peaks.set(bucket, Math.max(peaks.get(bucket) ?? 0, bytes));
    }
  }
  return peaks;
};

const toProcessCosts = (
  cpu: Map<string, number>,
  rss: Map<string, number>,
  perThousand: number
): ProcessCost[] =>
  [...new Set([...cpu.keys(), ...rss.keys()])].sort().map((name) => ({
    name,
    cpuMsPerThousandFlows: Math.round((cpu.get(name) ?? 0) * perThousand),
    peakRssMb: Math.round(((rss.get(name) ?? 0) / (1024 * 1024)) * 10) / 10,
  }));

const totalMemoryMb = (mode: LoggingModeMetrics): number =>
  mode.processes.reduce((sum, process) => sum + process.peakRssMb, 0);

/** What a logging mode costs over the Off baseline. */
export const computeOverhead = (
  off: LoggingModeMetrics,
  mode: LoggingModeMetrics
): LoggingOverheadDelta => ({
  mode: mode.mode,
  cpuMsPerThousandFlows:
    Math.round((mode.cpuMsPerThousandFlows - off.cpuMsPerThousandFlows) * 10) / 10,
  cpuPercentOverBaseline:
    off.cpuMsPerThousandFlows > 0
      ? Math.round(
          ((mode.cpuMsPerThousandFlows - off.cpuMsPerThousandFlows) / off.cpuMsPerThousandFlows) *
            1000
        ) / 10
      : 0,
  memoryMb: Math.round((totalMemoryMb(mode) - totalMemoryMb(off)) * 10) / 10,
  diskKbPerThousandFlows: mode.diskKbPerThousandFlows,
  latencyP95Ms: Math.round((mode.flowLatency.p95 - off.flowLatency.p95) * 10) / 10,
});

export type LoggingProgress = (percent: number, detail: string) => void;

const measureMode = async (
  mode: LogBenchMode,
  flows: number,
  sandbox: Sandbox,
  invoke: Invoke,
  onProgress: LoggingProgress,
  progressBase: number,
  progressSpan: number
): Promise<LoggingModeMetrics> => {
  const config = await invoke<LogConfig>('benchmark_log_mode', { mode });
  if (mode === 'off') {
    logger.pause();
  } else {
    logger.resume();
    logger.setConfig(config);
  }

  for (let i = 0; i < WARMUP_FLOWS; i += 1) {
    await runSimulatedFlow(i, sandbox);
  }
  await logger.flush();
  logger.resetStats();

  const samples: ResourceSample[] = [];
  const start = await invoke<ResourceSample>('benchmark_resource_sample');
  samples.push(start);
  let lastSampleAt = Date.now();
  const latencies: number[] = [];
  const wallStart = performance.now();

  for (let index = 0; index < flows; index += 1) {
    const flowStart = performance.now();
    await runSimulatedFlow(index, sandbox);
    latencies.push(performance.now() - flowStart);

    if (Date.now() - lastSampleAt >= RSS_SAMPLE_EVERY_MS) {
      lastSampleAt = Date.now();
      samples.push(await invoke<ResourceSample>('benchmark_resource_sample'));
      onProgress(
        progressBase + (progressSpan * (index + 1)) / flows,
        `Logging ${mode}: ${index + 1} of ${flows} simulated sales…`
      );
    }
  }

  const wallMs = performance.now() - wallStart;
  await logger.flush();
  await sleep(FLUSH_SETTLE_MS);
  const end = await invoke<ResourceSample>('benchmark_resource_sample');
  samples.push(end);

  const perThousand = 1000 / flows;
  const frontend = logger.stats();
  return {
    mode,
    flows,
    wallMs: Math.round(wallMs),
    processes: toProcessCosts(cpuDeltas(start, end), peakRss(samples), perThousand),
    cpuMsPerThousandFlows: Math.round(
      [...cpuDeltas(start, end).values()].reduce((a, b) => a + b, 0) * perThousand
    ),
    frontendSelfMsPerThousandFlows: Math.round(frontend.selfTimeMs * perThousand),
    diskKbPerThousandFlows:
      Math.round(((end.log.bytesWritten - start.log.bytesWritten) / 1024) * perThousand * 10) / 10,
    eventsPerFlow: Math.round(((end.log.accepted - start.log.accepted) / flows) * 10) / 10,
    droppedEvents: end.log.dropped - start.log.dropped,
    flowLatency: calculatePercentiles(latencies),
  };
};

/** Mean of the two Off runs, so warm-up drift doesn't land on one mode. */
export const averageModes = (a: LoggingModeMetrics, b: LoggingModeMetrics): LoggingModeMetrics => {
  const mid = (x: number, y: number) => Math.round(((x + y) / 2) * 10) / 10;
  const names = [...new Set([...a.processes, ...b.processes].map((p) => p.name))].sort();
  return {
    ...a,
    wallMs: mid(a.wallMs, b.wallMs),
    cpuMsPerThousandFlows: mid(a.cpuMsPerThousandFlows, b.cpuMsPerThousandFlows),
    frontendSelfMsPerThousandFlows: mid(
      a.frontendSelfMsPerThousandFlows,
      b.frontendSelfMsPerThousandFlows
    ),
    diskKbPerThousandFlows: mid(a.diskKbPerThousandFlows, b.diskKbPerThousandFlows),
    eventsPerFlow: mid(a.eventsPerFlow, b.eventsPerFlow),
    processes: names.map((name) => {
      const first = a.processes.find((p) => p.name === name);
      const second = b.processes.find((p) => p.name === name);
      return {
        name,
        cpuMsPerThousandFlows: mid(
          first?.cpuMsPerThousandFlows ?? 0,
          second?.cpuMsPerThousandFlows ?? 0
        ),
        peakRssMb: mid(first?.peakRssMb ?? 0, second?.peakRssMb ?? 0),
      };
    }),
    flowLatency: {
      ...a.flowLatency,
      p50: mid(a.flowLatency.p50, b.flowLatency.p50),
      p95: mid(a.flowLatency.p95, b.flowLatency.p95),
    },
  };
};

/**
 * Runs the three modes (Off → Standard → Full → Off) and returns per-mode
 * costs plus the overhead of each logging mode over Off. Off is measured twice
 * and averaged so warm-up drift doesn't land on one mode.
 */
export const runLoggingOverheadBenchmark = async (
  flows: number,
  onProgress?: LoggingProgress
): Promise<LoggingOverheadResult> => {
  const notify: LoggingProgress = (percent, detail) => onProgress?.(percent, detail);
  const invoke = await loadInvoke();
  const sandbox = createSandbox(document);
  const wasPaused = logger.isPaused;
  const measured: LoggingModeMetrics[] = [];

  try {
    const span = 95 / MODE_ORDER.length;
    for (let i = 0; i < MODE_ORDER.length; i += 1) {
      const mode = MODE_ORDER[i];
      notify(2 + span * i, `Measuring with logging ${mode}…`);
      measured.push(await measureMode(mode, flows, sandbox, invoke, notify, 2 + span * i, span));
    }
  } finally {
    sandbox.destroy();
    // Always hand logging back to the user's saved settings.
    try {
      const restored = await invoke<LogConfig>('benchmark_log_mode', { mode: 'restore' });
      logger.setConfig(restored);
    } catch {
      // Even if the command fails, the frontend must not stay paused.
    }
    if (wasPaused) {
      logger.pause();
    } else {
      logger.resume();
    }
  }

  const [firstOff, standard, full, secondOff] = measured;
  const off = averageModes(firstOff, secondOff);

  return {
    flows,
    measuredAt: new Date().toISOString(),
    modes: { off, standard, full },
    overhead: { standard: computeOverhead(off, standard), full: computeOverhead(off, full) },
  };
};
