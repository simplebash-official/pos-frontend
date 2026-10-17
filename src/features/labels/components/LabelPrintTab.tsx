import { t } from '@/shared/i18n/t';
import { FadeIn } from '@/shared/motion';
import type { Dispatch, SetStateAction } from 'react';
import { Button, Group, Paper, Stack, Text } from '@mantine/core';
import { IconRepeat } from '@tabler/icons-react';
import { formatDateTime } from '@/shared/lib/date';
import { useLabelJobs } from '../hooks/useLabelJobs';
import { usePrintAgain } from '../hooks/usePrintAgain';
import { howItPrinted, labelCount } from '../lib/jobView';
import type { LabelRow } from '../lib/printJob';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { FILL_COLUMN } from '../lib/listScroll';
import { LabelPrintWorkspace } from './LabelPrintWorkspace';

export interface LabelPrintTabProps {
  rows: LabelRow[];
  onRowsChange: Dispatch<SetStateAction<LabelRow[]>>;
  onPrintAgain: (rows: LabelRow[]) => void;
}

/** The Labels page's print tab: the last print one click away, then the print workspace. */
export const LabelPrintTab = ({ rows, onRowsChange, onPrintAgain }: LabelPrintTabProps) => {
  const last = useLabelJobs({ page: 1, limit: 1 }).data?.items[0];
  const { printAgain, loadingKey } = usePrintAgain(onPrintAgain);
  const isMobile = useIsMobile();
  return (
    <Stack gap="md" style={isMobile ? undefined : FILL_COLUMN}>
      {last !== undefined && (
        <FadeIn>
          <Paper p="sm" withBorder>
            <Group justify="space-between" wrap="wrap" gap="sm">
              <div style={{ minWidth: 0 }}>
                <Text size="sm" fw={600}>
                  {t('Last print')}: {formatDateTime(last.createdAt)}
                </Text>
                <Text size="xs" c="dimmed">
                  {last.templateName} · {labelCount(last.totalLabels)} · {howItPrinted(last)}
                </Text>
              </div>
              <Button
                variant="light"
                leftSection={<IconRepeat size={16} />}
                loading={loadingKey === last.key}
                onClick={() => void printAgain(last)}
              >
                {t('Print again')}
              </Button>
            </Group>
          </Paper>
        </FadeIn>
      )}
      <Paper p="md" withBorder style={isMobile ? undefined : FILL_COLUMN}>
        <LabelPrintWorkspace
          rows={rows}
          onRowsChange={onRowsChange}
          onPrinted={() => onRowsChange([])}
          footerStart={null}
          shortcutsActive
          fill
        />
      </Paper>
    </Stack>
  );
};
