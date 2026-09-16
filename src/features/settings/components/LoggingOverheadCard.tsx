import { t } from '@/shared/i18n/t';
import { Alert, Badge, Group, Paper, Stack, Table, Text, ThemeIcon } from '@mantine/core';
import { IconInfoCircle, IconListDetails } from '@tabler/icons-react';
import type { LoggingModeMetrics, LoggingOverheadResult } from '../types/benchmark';

const MODE_LABEL: Record<string, string> = {
  off: 'Logging off',
  standard: 'Standard logging',
  full: 'Full logging',
};

const totalMemoryMb = (mode: LoggingModeMetrics): number =>
  Math.round(mode.processes.reduce((sum, process) => sum + process.peakRssMb, 0) * 10) / 10;

const formatKb = (kb: number): string =>
  kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;

/**
 * What the activity log costs, measured on this computer: CPU, memory, disk
 * and checkout speed with logging off, standard and full. Numbers are per
 * 1,000 sales so they can be read as "a busy day".
 */
export const LoggingOverheadCard = ({ data }: { data: LoggingOverheadResult }) => {
  const { modes, overhead, flows } = data;
  const rows = (['off', 'standard', 'full'] as const).map((mode) => modes[mode]);
  const worstDrop = Math.max(...rows.map((row) => row.droppedEvents));

  return (
    <Paper p="md" withBorder radius="var(--mantine-radius-default)" bg="var(--bg-card)">
      <Stack gap="sm">
        <Group gap="xs" align="flex-start">
          <ThemeIcon color="blue" variant="light" size="lg">
            <IconListDetails size={20} />
          </ThemeIcon>
          <div>
            <Text fw={700} size="sm">
              {t('What the activity log costs')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('Measured on this computer with')} {flows} {t('simulated sales per setting')}
            </Text>
          </div>
        </Group>

        <div style={{ overflowX: 'auto' }}>
          <Table striped withTableBorder verticalSpacing="xs" fz="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('Setting')}</Table.Th>
                <Table.Th ta="right">{t('CPU per 1,000 sales')}</Table.Th>
                <Table.Th ta="right">{t('Peak memory')}</Table.Th>
                <Table.Th ta="right">{t('Log written per 1,000 sales')}</Table.Th>
                <Table.Th ta="right">{t('Entries per sale')}</Table.Th>
                <Table.Th ta="right">{t('Sale speed (p95)')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.mode}>
                  <Table.Td>
                    <Badge
                      variant={row.mode === 'off' ? 'outline' : 'light'}
                      color={
                        row.mode === 'full' ? 'blue' : row.mode === 'standard' ? 'teal' : 'gray'
                      }
                      tt="none"
                    >
                      {t(MODE_LABEL[row.mode])}
                    </Badge>
                  </Table.Td>
                  <Table.Td ta="right" ff="monospace">
                    {(row.cpuMsPerThousandFlows / 1000).toFixed(2)} s
                  </Table.Td>
                  <Table.Td ta="right" ff="monospace">
                    {totalMemoryMb(row).toFixed(1)} MB
                  </Table.Td>
                  <Table.Td ta="right" ff="monospace">
                    {formatKb(row.diskKbPerThousandFlows)}
                  </Table.Td>
                  <Table.Td ta="right" ff="monospace">
                    {row.eventsPerFlow}
                  </Table.Td>
                  <Table.Td ta="right" ff="monospace">
                    {row.flowLatency.p95.toFixed(0)} ms
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>

        <Alert color="blue" icon={<IconInfoCircle size={18} />} variant="light">
          <Stack gap={4}>
            {(['standard', 'full'] as const).map((mode) => {
              const delta = overhead[mode];
              return (
                <Text size="xs" key={mode}>
                  <Text span fw={700}>
                    {t(MODE_LABEL[mode])}:
                  </Text>{' '}
                  +{(delta.cpuMsPerThousandFlows / 1000).toFixed(2)} s {t('CPU')} (
                  {delta.cpuPercentOverBaseline}%), +{delta.memoryMb.toFixed(1)} MB,{' '}
                  {formatKb(delta.diskKbPerThousandFlows)} {t('of log per 1,000 sales')}
                </Text>
              );
            })}
            <Text size="xs" c="dimmed">
              {t('Sale speed change with full logging (p95)')}:{' '}
              {overhead.full.latencyP95Ms >= 0 ? '+' : ''}
              {overhead.full.latencyP95Ms} ms
            </Text>
          </Stack>
        </Alert>

        {worstDrop > 0 && (
          <Alert color="orange" icon={<IconInfoCircle size={18} />} variant="light">
            {t('Some entries were dropped because logging could not keep up')}: {worstDrop}.{' '}
            {t('Sales were never delayed — logging is skipped rather than slowing the till.')}
          </Alert>
        )}
      </Stack>
    </Paper>
  );
};
