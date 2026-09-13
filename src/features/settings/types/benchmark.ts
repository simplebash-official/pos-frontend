export type BenchmarkPhase =
  | 'idle'
  | 'hardware'
  | 'disk'
  | 'database'
  | 'documents'
  | 'complete'
  | 'error';

export interface SystemSpecs {
  os: string;
  arch: string;
  cpuCores: number;
  appVersion: string;
  engineMode: string;
}

export interface DiskIoResult {
  writeSpeedMbS: number;
  readSpeedMbS: number;
  durationMs: number;
}

export interface NativeComputeResult {
  singleThreadOpsSec: number;
  multiThreadOpsSec: number;
  speedupFactor: number;
  coresUsed: number;
}

export interface LatencyMetric {
  min: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  max: number;
  avg: number;
}

export interface DatabaseBenchmarkResult {
  qps: number;
  totalQueries: number;
  successQueries: number;
  latency: LatencyMetric;
}

export interface DocumentBenchmarkResult {
  rendersPerSec: number;
  totalRenders: number;
  successRenders: number;
  latency: LatencyMetric;
  avgSizeKb: number;
}

export interface IpcBenchmarkResult {
  pingMs: number;
  samples: number;
}

export type DiagnosticStatus = 'optimal' | 'good' | 'warning';

export interface DiagnosticItem {
  id: string;
  category: 'cpu' | 'disk' | 'database' | 'documents' | 'ipc';
  title: string;
  status: DiagnosticStatus;
  measured: string;
  baseline: string;
  message: string;
}

export type BenchmarkGrade = 'A+' | 'A' | 'B' | 'C' | 'D';

export interface BenchmarkReportData {
  id: string;
  testedAt: string;
  overallScore: number;
  grade: BenchmarkGrade;
  tierLabel: string;
  tierSummary: string;
  specs: SystemSpecs;
  disk: DiskIoResult;
  compute: NativeComputeResult;
  database: DatabaseBenchmarkResult;
  documents: DocumentBenchmarkResult;
  ipc: IpcBenchmarkResult;
  diagnostics: DiagnosticItem[];
}
