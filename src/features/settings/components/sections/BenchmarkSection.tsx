import { t } from '@/shared/i18n/t';
import { PRODUCT_NAME } from '@/config/branding';
import { useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Paper,
  Progress,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { BarChart } from '@mantine/charts';
import {
  IconAlertCircle,
  IconCheck,
  IconClipboardCopy,
  IconDeviceDesktopAnalytics,
  IconDownload,
  IconFileText,
  IconGauge,
  IconInfoCircle,
  IconPlayerPlay,
  IconRefresh,
  IconServer,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { isTauri } from '@/shared/lib/runtime';
import { formatDateTime } from '@/shared/lib/date';
import {
  formatMarkdownReport,
  loadLastBenchmarkResult,
  runSystemBenchmark,
  saveBenchmarkResult,
} from '../../lib/benchmarkRunner';
import { LOGGING_BENCH_PRESETS, runLoggingOverheadBenchmark } from '../../lib/loggingBenchmark';
import { LoggingOverheadCard } from '../LoggingOverheadCard';
import type { BenchmarkPhase, BenchmarkReportData } from '../../types/benchmark';
import type { SectionProps } from './ShopProfileSection';

export const BenchmarkSection = ({ onDirtyChange: _onDirtyChange }: SectionProps) => {
  const [phase, setPhase] = useState<BenchmarkPhase>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [phaseDetail, setPhaseDetail] = useState<string>('');
  const [report, setReport] = useState<BenchmarkReportData | null>(() => loadLastBenchmarkResult());
  // How many simulated sales the activity-log phase replays per mode.
  const [logFlows, setLogFlows] = useState<number>(LOGGING_BENCH_PRESETS.quick);

  // Desktop check
  if (!isTauri()) {
    return (
      <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
        <Stack gap="md">
          <div>
            <Text fw={700} size="lg">
              {t('System Benchmark')}
            </Text>
            <Text size="sm" c="dimmed" mt={2}>
              {t('Test computer performance, POS speed & document rendering')}
            </Text>
          </div>
          <Divider />
          <Alert color="blue" icon={<IconInfoCircle size={20} />} title={t('Desktop Only Feature')}>
            {t(
              `Hardware diagnostics and POS system benchmark testing are exclusively available in the desktop version of ${PRODUCT_NAME}.`
            )}
          </Alert>
        </Stack>
      </Paper>
    );
  }

  const isRunning = phase !== 'idle' && phase !== 'complete' && phase !== 'error';

  const handleStartBenchmark = async () => {
    setPhase('hardware');
    setProgressPercent(5);
    setPhaseDetail(t('Initializing hardware benchmark probes...'));

    try {
      const result = await runSystemBenchmark((currentPhase, percent, detail) => {
        setPhase(currentPhase);
        setProgressPercent(percent);
        if (detail) setPhaseDetail(detail);
      }, logFlows);

      setReport(result);
      setPhase('complete');
      notifications.show({
        title: t('Benchmark Completed'),
        message: `${t('Your computer scored')} ${result.overallScore}/100 (${t('Grade')} ${result.grade})`,
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
    } catch (err: unknown) {
      setPhase('error');
      const errorMessage =
        err instanceof Error ? err.message : t('An error occurred during benchmark testing');
      notifications.show({
        title: t('Benchmark Failed'),
        message: errorMessage,
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    }
  };

  /**
   * Measures only the activity-log overhead, keeping any existing hardware
   * scores — the common case when tuning what gets logged.
   */
  const handleMeasureLogging = async () => {
    setPhase('logging');
    setProgressPercent(2);
    setPhaseDetail(t('Measuring what the activity log costs...'));
    try {
      const logging = await runLoggingOverheadBenchmark(logFlows, (percent, detail) => {
        setProgressPercent(Math.round(percent));
        setPhaseDetail(detail);
      });
      setReport((current) => {
        if (!current) {
          return current;
        }
        const updated = { ...current, logging };
        saveBenchmarkResult(updated);
        return updated;
      });
      setPhase(report ? 'complete' : 'idle');
      notifications.show({
        title: t('Activity log measured'),
        message: `${t('Full logging CPU overhead')}: ${logging.overhead.full.cpuPercentOverBaseline}%`,
        color: 'teal',
        icon: <IconCheck size={18} />,
      });
    } catch (err: unknown) {
      setPhase('error');
      notifications.show({
        title: t('Could not measure the activity log'),
        message: err instanceof Error ? err.message : t('Please try again.'),
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    }
  };

  const handleCopySummary = () => {
    if (!report) return;
    const md = formatMarkdownReport(report);
    navigator.clipboard.writeText(md).then(() => {
      notifications.show({
        title: t('Copied to Clipboard'),
        message: t('Benchmark markdown report copied successfully.'),
        color: 'blue',
        icon: <IconClipboardCopy size={18} />,
      });
    });
  };

  const handleExportJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myrologic_benchmark_${report.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart datasets
  const latencyChartData = report
    ? [
        {
          operation: t('IPC Loopback Ping'),
          p50: report.ipc.pingMs,
          p95: report.ipc.pingMs * 1.4,
          p99: report.ipc.pingMs * 1.9,
        },
        {
          operation: t('SQLite DB Query'),
          p50: report.database.latency.p50,
          p95: report.database.latency.p95,
          p99: report.database.latency.p99,
        },
        {
          operation: t('Typst Document PDF'),
          p50: report.documents.latency.p50,
          p95: report.documents.latency.p95,
          p99: report.documents.latency.p99,
        },
      ]
    : [];

  const throughputChartData = report
    ? [
        {
          metric: t('Storage Write (MB/s)'),
          value: report.disk.writeSpeedMbS,
        },
        {
          metric: t('Database Read (QPS)'),
          value: report.database.qps,
        },
        {
          metric: t('PDF Engine (docs/s)'),
          value: report.documents.rendersPerSec,
        },
      ]
    : [];

  const gradeColor =
    report?.grade === 'A+' || report?.grade === 'A'
      ? 'teal'
      : report?.grade === 'B'
        ? 'blue'
        : report?.grade === 'C'
          ? 'orange'
          : 'red';

  return (
    <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <div>
            <Group gap="xs">
              <ThemeIcon
                color="blue"
                variant="light"
                size="lg"
                radius="var(--mantine-radius-default)"
              >
                <IconDeviceDesktopAnalytics size={20} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="lg">
                  {t('Hardware & POS Benchmark')}
                </Text>
                <Text size="sm" c="dimmed" mt={1}>
                  {t('Test computer performance, POS speed & document rendering')}
                </Text>
              </div>
            </Group>
          </div>

          <Group gap="xs" wrap="wrap">
            <SegmentedControl
              size="xs"
              disabled={isRunning}
              value={String(logFlows)}
              onChange={(value) => setLogFlows(Number(value))}
              data={[
                { value: String(LOGGING_BENCH_PRESETS.quick), label: t('Quick log test') },
                { value: String(LOGGING_BENCH_PRESETS.full), label: t('Full log test') },
              ]}
            />
            {!isRunning && (
              <Button
                variant="default"
                size="sm"
                leftSection={<IconGauge size={16} />}
                onClick={() => void handleMeasureLogging()}
              >
                {t('Measure logging only')}
              </Button>
            )}
            {report && !isRunning && (
              <Button
                variant="default"
                size="sm"
                leftSection={<IconClipboardCopy size={16} />}
                onClick={handleCopySummary}
              >
                {t('Copy Summary')}
              </Button>
            )}
            <Button
              color="blue"
              size="sm"
              loading={isRunning}
              leftSection={report ? <IconRefresh size={16} /> : <IconPlayerPlay size={16} />}
              onClick={handleStartBenchmark}
            >
              {report ? t('Re-run Benchmark') : t('Run System Benchmark')}
            </Button>
          </Group>
        </Group>

        {/* Specs Pill Strip */}
        <Paper
          p="xs"
          withBorder
          radius="var(--mantine-radius-default)"
          bg="var(--mantine-color-body)"
        >
          <Group gap="sm" wrap="wrap" justify="space-between">
            <Group gap="xs">
              <Badge variant="dot" color="blue">
                {report ? `${report.specs.os} (${report.specs.arch})` : t('Local Desktop System')}
              </Badge>
              <Badge variant="outline" color="gray">
                {report ? `${report.specs.cpuCores} ${t('CPU Cores')}` : t('Multi-core Host')}
              </Badge>
              <Badge variant="outline" color="teal">
                {t('SQLite 3 (WAL Mode)')}
              </Badge>
              <Badge variant="outline" color="indigo">
                {t('Typst v0.12 Vector Engine')}
              </Badge>
            </Group>
            {report && (
              <Text size="xs" c="dimmed">
                {t('Last Tested')}: {formatDateTime(report.testedAt)}
              </Text>
            )}
          </Group>
        </Paper>

        {/* In-Progress Stepper Bar */}
        {isRunning && (
          <Paper
            p="md"
            withBorder
            radius="var(--mantine-radius-default)"
            bg="var(--mantine-color-body)"
          >
            <Stack gap="xs">
              <Group justify="space-between">
                <Text fw={600} size="sm">
                  {t('Benchmarking System Performance')}...
                </Text>
                <Text fw={700} size="sm" c="blue">
                  {progressPercent}%
                </Text>
              </Group>
              <Progress
                value={progressPercent}
                animated
                striped
                color="blue"
                size="md"
                radius="xl"
              />
              <Text size="xs" c="dimmed">
                {phaseDetail}
              </Text>
            </Stack>
          </Paper>
        )}

        {/* Idle prompt if no report yet */}
        {!report && !isRunning && (
          <Card
            p="xl"
            withBorder
            radius="var(--mantine-radius-default)"
            bg="var(--mantine-color-body)"
          >
            <Stack align="center" gap="md" py="lg">
              <ThemeIcon color="blue" variant="light" size={56} radius="xl">
                <IconGauge size={32} />
              </ThemeIcon>
              <div style={{ textAlign: 'center', maxWidth: 500 }}>
                <Text fw={700} size="md">
                  {t('Evaluate Your Computer Hardware for POS Readiness')}
                </Text>
                <Text size="sm" c="dimmed" mt="xs">
                  {t(
                    'Click Run System Benchmark to measure SQLite database response time, Typst receipt compilation speed, storage write throughput, and loopback latency.'
                  )}
                </Text>
              </div>
              <Button
                color="blue"
                size="md"
                leftSection={<IconPlayerPlay size={18} />}
                onClick={handleStartBenchmark}
              >
                {t('Start Full Benchmark')}
              </Button>
            </Stack>
          </Card>
        )}

        {/* Results Section */}
        {report && (
          <Stack gap="lg">
            {/* Scorecard Hero Banner */}
            <Paper
              p="lg"
              withBorder
              radius="var(--mantine-radius-default)"
              style={{
                background:
                  'linear-gradient(135deg, rgba(34, 139, 230, 0.08) 0%, rgba(18, 184, 134, 0.08) 100%)',
                borderColor: `var(--mantine-color-${gradeColor}-5)`,
              }}
            >
              <Grid align="center" gap="md">
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Group gap="md">
                    <ThemeIcon color={gradeColor} variant="filled" size={64} radius="md">
                      <Text fw={900} size="xl">
                        {report.grade}
                      </Text>
                    </ThemeIcon>
                    <div>
                      <Group gap="xs">
                        <Text fw={900} size="2xl" style={{ lineHeight: 1 }}>
                          {report.overallScore}
                        </Text>
                        <Text size="sm" c="dimmed" fw={600}>
                          / 100
                        </Text>
                      </Group>
                      <Badge color={gradeColor} variant="light" mt={4} size="sm">
                        {t(report.tierLabel)}
                      </Badge>
                    </div>
                  </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <Text size="sm" fw={500}>
                    {t(report.tierSummary)}
                  </Text>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Quick Metrics KPI Strip */}
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
              <Paper
                p="md"
                withBorder
                radius="var(--mantine-radius-default)"
                bg="var(--mantine-color-body)"
              >
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('Storage Write Rate')}
                </Text>
                <Text fw={800} size="xl" mt={4} c="blue">
                  {report.disk.writeSpeedMbS.toFixed(1)}{' '}
                  <span style={{ fontSize: '0.85rem' }}>MB/s</span>
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {t('Solid-state disk speed')}
                </Text>
              </Paper>

              <Paper
                p="md"
                withBorder
                radius="var(--mantine-radius-default)"
                bg="var(--mantine-color-body)"
              >
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('SQLite DB Latency')}
                </Text>
                <Text fw={800} size="xl" mt={4} c="teal">
                  {report.database.latency.p50.toFixed(1)}{' '}
                  <span style={{ fontSize: '0.85rem' }}>ms</span>
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {report.database.qps.toFixed(0)} {t('queries / sec')}
                </Text>
              </Paper>

              <Paper
                p="md"
                withBorder
                radius="var(--mantine-radius-default)"
                bg="var(--mantine-color-body)"
              >
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('PDF Vector Compile')}
                </Text>
                <Text fw={800} size="xl" mt={4} c="indigo">
                  {report.documents.latency.p50.toFixed(1)}{' '}
                  <span style={{ fontSize: '0.85rem' }}>ms</span>
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {report.documents.rendersPerSec.toFixed(0)} {t('renders / sec')}
                </Text>
              </Paper>

              <Paper
                p="md"
                withBorder
                radius="var(--mantine-radius-default)"
                bg="var(--mantine-color-body)"
              >
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  {t('Loopback IPC Ping')}
                </Text>
                <Text fw={800} size="xl" mt={4} c="violet">
                  {report.ipc.pingMs.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>ms</span>
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {t('Local sidecar latency')}
                </Text>
              </Paper>
            </SimpleGrid>

            {/* Performance Graphs */}
            <Grid gap="md">
              <Grid.Col span={{ base: 12, lg: 6 }}>
                <Paper p="md" withBorder radius="var(--mantine-radius-default)" bg="var(--bg-card)">
                  <Stack gap="xs">
                    <div>
                      <Text fw={700} size="sm">
                        {t('Latency Distribution')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t(
                          'Response latency across system layers in milliseconds (lower is faster)'
                        )}
                      </Text>
                    </div>
                    <Box style={{ overflow: 'hidden', minWidth: 0, width: '100%', height: 240 }}>
                      <BarChart
                        h={240}
                        data={latencyChartData}
                        dataKey="operation"
                        series={[
                          { name: 'p50', color: 'blue.6', label: t('Median (p50)') },
                          { name: 'p95', color: 'orange.6', label: t('95th Percentile (p95)') },
                          { name: 'p99', color: 'red.6', label: t('99th Percentile (p99)') },
                        ]}
                        unit=" ms"
                        xAxisProps={{ interval: 0, minTickGap: 0 }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 6 }}>
                <Paper p="md" withBorder radius="var(--mantine-radius-default)" bg="var(--bg-card)">
                  <Stack gap="xs">
                    <div>
                      <Text fw={700} size="sm">
                        {t('Engine Capacity')}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {t('Throughput capacity across system engines')}
                      </Text>
                    </div>
                    <Box style={{ overflow: 'hidden', minWidth: 0, width: '100%', height: 240 }}>
                      <BarChart
                        h={240}
                        data={throughputChartData}
                        dataKey="metric"
                        series={[{ name: 'value', color: 'teal.6', label: t('Throughput Rate') }]}
                        valueFormatter={(v) => `${Number(v).toFixed(0)}`}
                        xAxisProps={{ interval: 0, minTickGap: 0 }}
                      />
                    </Box>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Desktop Pipeline Topology Diagram */}
            <Paper p="md" withBorder radius="var(--mantine-radius-default)" bg="var(--bg-card)">
              <Stack gap="md">
                <div>
                  <Text fw={700} size="sm">
                    {t('System Architecture & Latency Topology')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('Measured roundtrip latency along the desktop sidecar data flow')}
                  </Text>
                </div>

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
                  {/* Node 1 */}
                  <Paper
                    p="sm"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    bg="var(--mantine-color-body)"
                  >
                    <Group gap="xs" mb="xs">
                      <ThemeIcon color="blue" size="md" variant="light" radius="sm">
                        <IconDeviceDesktopAnalytics size={16} />
                      </ThemeIcon>
                      <Text fw={700} size="sm">
                        {t('POS UI (Frontend)')}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {t('React 19 + Mantine UI running inside WebView shell.')}
                    </Text>
                    <Badge color="blue" variant="light" size="xs" mt="sm">
                      {t('Active Terminal')}
                    </Badge>
                  </Paper>

                  {/* Node 2 */}
                  <Paper
                    p="sm"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    bg="var(--mantine-color-body)"
                  >
                    <Group gap="xs" mb="xs">
                      <ThemeIcon color="teal" size="md" variant="light" radius="sm">
                        <IconServer size={16} />
                      </ThemeIcon>
                      <Text fw={700} size="sm">
                        {t('Backend (Axum + SQLite)')}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {t('Embedded SQLite WAL engine on 127.0.0.1:8080.')}
                    </Text>
                    <Group gap="xs" mt="sm">
                      <Badge color="teal" variant="light" size="xs">
                        {report.database.latency.p50.toFixed(1)} ms p50
                      </Badge>
                      <Badge color="gray" variant="outline" size="xs">
                        {report.ipc.pingMs.toFixed(1)} ms IPC
                      </Badge>
                    </Group>
                  </Paper>

                  {/* Node 3 */}
                  <Paper
                    p="sm"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    bg="var(--mantine-color-body)"
                  >
                    <Group gap="xs" mb="xs">
                      <ThemeIcon color="indigo" size="md" variant="light" radius="sm">
                        <IconFileText size={16} />
                      </ThemeIcon>
                      <Text fw={700} size="sm">
                        {t('Document Engine (Typst)')}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {t('Native Rust vector PDF compiler on 127.0.0.1:8090.')}
                    </Text>
                    <Badge color="indigo" variant="light" size="xs" mt="sm">
                      {report.documents.latency.p50.toFixed(1)} ms p50
                    </Badge>
                  </Paper>
                </SimpleGrid>
              </Stack>
            </Paper>

            {/* What the activity log costs (desktop measurement) */}
            {report.logging && <LoggingOverheadCard data={report.logging} />}

            {/* Diagnostics & Recommendations Table */}
            <Paper p="md" withBorder radius="var(--mantine-radius-default)" bg="var(--bg-card)">
              <Stack gap="md">
                <div>
                  <Text fw={700} size="sm">
                    {t('Hardware Health & Diagnostic Findings')}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('Detailed evaluation of each subsystem against commercial POS benchmarks')}
                  </Text>
                </div>

                <Table.ScrollContainer minWidth={760}>
                  <Table verticalSpacing="sm">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ width: '22%', minWidth: 150 }}>
                          {t('Component')}
                        </Table.Th>
                        <Table.Th style={{ width: '22%', minWidth: 150 }}>
                          {t('Measured Result')}
                        </Table.Th>
                        <Table.Th style={{ width: '18%', minWidth: 120 }}>
                          {t('Baseline Target')}
                        </Table.Th>
                        <Table.Th style={{ width: 120, minWidth: 110, whiteSpace: 'nowrap' }}>
                          {t('Status')}
                        </Table.Th>
                        <Table.Th style={{ minWidth: 200 }}>
                          {t('Store Operational Impact')}
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {report.diagnostics.map((diag) => {
                        const statusColor =
                          diag.status === 'optimal'
                            ? 'teal'
                            : diag.status === 'good'
                              ? 'blue'
                              : 'orange';
                        const statusLabel =
                          diag.status === 'optimal'
                            ? t('Optimal')
                            : diag.status === 'good'
                              ? t('Good')
                              : t('Warning');

                        return (
                          <Table.Tr key={diag.id}>
                            <Table.Td>
                              <Text fw={600} size="sm">
                                {t(diag.title)}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" fw={500}>
                                {diag.measured}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs" c="dimmed">
                                {diag.baseline}
                              </Text>
                            </Table.Td>
                            <Table.Td style={{ width: 120, minWidth: 110, whiteSpace: 'nowrap' }}>
                              <Badge
                                color={statusColor}
                                size="sm"
                                variant="light"
                                style={{ flexShrink: 0 }}
                              >
                                {statusLabel}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs">{diag.message}</Text>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Stack>
            </Paper>

            {/* Bottom Actions */}
            <Group justify="flex-end" gap="sm">
              <Button
                variant="default"
                size="sm"
                leftSection={<IconDownload size={16} />}
                onClick={handleExportJson}
              >
                {t('Export JSON Diagnostics')}
              </Button>
              <Button
                variant="default"
                size="sm"
                leftSection={<IconClipboardCopy size={16} />}
                onClick={handleCopySummary}
              >
                {t('Copy Summary')}
              </Button>
              <Button
                color="blue"
                size="sm"
                leftSection={<IconRefresh size={16} />}
                onClick={handleStartBenchmark}
              >
                {t('Re-run Benchmark')}
              </Button>
            </Group>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
