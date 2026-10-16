import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Group,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  IconCalendar,
  IconPalette,
  IconPrinter,
  IconRepeat,
  IconTag,
  IconUser,
} from '@tabler/icons-react';
import { DrawerCard, DrawerFooter, InfoRow, ListRow, RichDrawer } from '@/shared/components/drawer';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatDateTime } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { useLabelJobs } from '../hooks/useLabelJobs';
import { usePrintAgain } from '../hooks/usePrintAgain';
import { howItPrinted, labelCount, outcomeView } from '../lib/jobView';
import type { LabelRow } from '../lib/printJob';
import type { LabelJob, LabelPrintAction } from '../types';
import { LIST_SCROLL } from '../lib/listScroll';

const PAGE_SIZE = 20;

const OutcomeDot = ({ job }: { job: LabelJob }) => {
  const view = outcomeView(job);
  return (
    <Group gap={6} wrap="nowrap">
      <Box aria-hidden w={8} h={8} style={{ borderRadius: '50%', background: view.color }} />
      <Text size="xs">{view.label}</Text>
    </Group>
  );
};

/** The items of one print, as they were printed. */
const JobDetails = ({ job }: { job: LabelJob }) => (
  <Stack gap="md">
    <DrawerCard label={t('This print')}>
      <InfoRow icon={<IconCalendar size={16} />} label={t('When')}>
        {formatDateTime(job.createdAt)}
      </InfoRow>
      <InfoRow icon={<IconUser size={16} />} label={t('Printed by')}>
        {job.printedByName}
      </InfoRow>
      <InfoRow icon={<IconPalette size={16} />} label={t('Design')}>
        {job.templateName} · {job.widthMm} × {job.heightMm} mm
      </InfoRow>
      <InfoRow icon={<IconPrinter size={16} />} label={t('How')}>
        {howItPrinted(job)}
      </InfoRow>
      <InfoRow icon={<IconTag size={16} />} label={t('Result')}>
        <OutcomeDot job={job} />
      </InfoRow>
      {job.error !== null && (
        <Text size="xs" c="red" mt="xs">
          {job.error}
        </Text>
      )}
    </DrawerCard>
    <DrawerCard label={`${t('Items')} · ${labelCount(job.totalLabels)}`}>
      {job.items.map((item, index) => (
        <ListRow
          key={`${item.productKey}-${item.serialNumber ?? index}`}
          index={index}
          first={index === 0}
          icon={<IconTag size={16} />}
          title={item.productName}
          meta={[
            item.serialNumber ?? item.sku,
            item.priceCents === null ? null : formatMoney(item.priceCents),
          ]
            .filter((part) => part !== null)
            .join(' · ')}
          trailing={<Text size="sm">× {item.copies}</Text>}
        />
      ))}
    </DrawerCard>
  </Stack>
);

export interface LabelHistoryTabProps {
  onPrintAgain: (rows: LabelRow[]) => void;
}

/** Every print and download of labels on this system, newest first. */
export const LabelHistoryTab = ({ onPrintAgain }: LabelHistoryTabProps) => {
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<LabelPrintAction | 'all'>('all');
  // The last job opened stays in `shown` so the drawer keeps its title while it slides shut.
  const [shown, setShown] = useState<LabelJob | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openJob = (job: LabelJob) => {
    setShown(job);
    setDrawerOpen(true);
  };
  const query = useLabelJobs({
    page,
    limit: PAGE_SIZE,
    action: action === 'all' ? undefined : action,
  });
  const { printAgain, loadingKey } = usePrintAgain((rows) => {
    setDrawerOpen(false);
    onPrintAgain(rows);
  });
  const jobs = query.data?.items ?? [];

  return (
    <Stack gap="md">
      <SegmentedToggle
        value={action}
        onChange={(value) => {
          setAction(value as LabelPrintAction | 'all');
          setPage(1);
        }}
        data={[
          { value: 'all', label: t('All') },
          { value: 'print', label: t('Printed') },
          { value: 'download', label: t('Saved as PDF') },
        ]}
        fullWidth={isMobile}
        style={{ alignSelf: isMobile ? undefined : 'flex-start' }}
      />

      {query.isError && (
        <Alert color="red" variant="light">
          {getErrorMessage(query.error)}
        </Alert>
      )}
      {query.isLoading && <Skeleton height={240} />}
      {query.data !== undefined && jobs.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          {t('Nothing has been printed yet. Prints and downloads show up here.')}
        </Text>
      )}

      <Stack gap={6} style={isMobile ? undefined : LIST_SCROLL}>
        {jobs.map((job) => {
          const products = [...new Set(job.items.map((item) => item.productName))];
          return (
            <UnstyledButton
              key={job.key}
              onClick={() => openJob(job)}
              aria-label={`${t('Open this print')}: ${formatDateTime(job.createdAt)}`}
            >
              <Paper p="sm" withBorder>
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <Box style={{ minWidth: 0, flex: 1 }}>
                    <Text fw={600} size="sm" truncate>
                      {products.slice(0, 2).join(', ')}
                      {products.length > 2 ? ` +${products.length - 2}` : ''}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {formatDateTime(job.createdAt)} · {job.printedByName} · {howItPrinted(job)}
                    </Text>
                  </Box>
                  <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
                    <Text size="sm" fw={600}>
                      {labelCount(job.totalLabels)}
                    </Text>
                    <OutcomeDot job={job} />
                  </Stack>
                </Group>
              </Paper>
            </UnstyledButton>
          );
        })}
      </Stack>

      {query.data !== undefined && query.data.pagination.totalPages > 1 && (
        <Group justify="center">
          <Pagination
            total={query.data.pagination.totalPages}
            value={page}
            onChange={setPage}
            size={isMobile ? 'md' : 'sm'}
          />
        </Group>
      )}

      <RichDrawer
        data={shown}
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width="narrow"
        title={{
          icon: <IconPrinter size={20} />,
          text: t('Label print'),
          subtitle: shown === null ? '' : formatDateTime(shown.createdAt),
        }}
        footer={(job) => (
          <DrawerFooter>
            <Button variant="default" onClick={() => setDrawerOpen(false)}>
              {t('Close')}
            </Button>
            <Button
              color="blue"
              leftSection={<IconRepeat size={16} />}
              loading={loadingKey === job.key}
              onClick={() => void printAgain(job)}
            >
              {t('Print again')}
            </Button>
          </DrawerFooter>
        )}
      >
        {(job) => <JobDetails job={job} />}
      </RichDrawer>
    </Stack>
  );
};
