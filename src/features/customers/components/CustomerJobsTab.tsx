import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Center,
  Group,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconPrinter, IconReceipt, IconTools } from '@tabler/icons-react';
import { ROUTES } from '@/constants/routes';
import type { CustomerJob, JobKind } from '@/features/customer-jobs/types';
import { MAX_SLIP_JOBS } from '@/features/job-receipts/lib/jobSlip';
import { ListRow } from '@/shared/components/drawer';
import { t } from '@/shared/i18n/t';
import { formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';

type Filter = 'open' | 'all';

export interface CustomerJobsTabProps {
  /** `undefined` while the jobs are loading. */
  jobs: CustomerJob[] | undefined;
  isError: boolean;
  onRetry: () => void;
  /** Which kinds of job slip this person may print. */
  mayPrint: Record<JobKind, boolean>;
  /** Asks for one slip listing these jobs. */
  onPrintSlip: (jobs: CustomerJob[]) => void;
}

const amount = (job: CustomerJob) => {
  if (job.priceCents !== undefined) return formatMoney(job.priceCents);
  return job.isRework ? t('Free (warranty)') : t('Not priced yet');
};

/** A customer's repair and print jobs in one list, with one slip for the open ones. */
export const CustomerJobsTab = ({
  jobs,
  isError,
  onRetry,
  mayPrint,
  onPrintSlip,
}: CustomerJobsTabProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('open');

  if (isError) {
    return (
      <Center py="md">
        <Stack gap={8} align="center" role="alert">
          <Text size="sm" c="dimmed">
            {t('Could not load this customer’s jobs.')}
          </Text>
          <Button size="xs" variant="light" onClick={onRetry}>
            {t('Retry')}
          </Button>
        </Stack>
      </Center>
    );
  }
  if (jobs === undefined) {
    return (
      <Stack gap="xs" aria-busy="true">
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} height={40} />
        ))}
      </Stack>
    );
  }

  const shown = filter === 'open' ? jobs.filter((job) => job.isOpen) : jobs;
  // The newest open jobs that fit on one slip.
  const slipJobs = jobs.filter((job) => job.isOpen && mayPrint[job.kind]).slice(0, MAX_SLIP_JOBS);

  return (
    <Stack gap="xs">
      <Group justify="space-between" gap="xs">
        <SegmentedControl
          size="xs"
          aria-label={t('Which jobs')}
          value={filter}
          onChange={(value) => setFilter(value === 'all' ? 'all' : 'open')}
          data={[
            { value: 'open', label: `${t('Open')} (${jobs.filter((job) => job.isOpen).length})` },
            { value: 'all', label: `${t('All')} (${jobs.length})` },
          ]}
        />
        {slipJobs.length > 0 && (
          <Button
            size="xs"
            variant="light"
            leftSection={<IconReceipt size={14} />}
            onClick={() => onPrintSlip(slipJobs)}
            data-log-id="customers.print-job-slip"
          >
            {t('Print job slip')}
          </Button>
        )}
      </Group>

      {shown.length === 0 ? (
        <Center py="md">
          <Stack gap={6} align="center">
            <IconTools size={22} style={{ opacity: 0.4 }} />
            <Text size="sm" c="dimmed" ta="center">
              {jobs.length === 0
                ? t('No repair or print jobs for this customer.')
                : t('No open jobs. Choose All to see earlier ones.')}
            </Text>
          </Stack>
        </Center>
      ) : (
        <ScrollArea.Autosize
          mah="45dvh"
          type="hover"
          scrollbarSize={6}
          classNames={{ viewport: 'scrollarea-fluid-content' }}
        >
          {shown.map((job, index) => {
            const JobIcon = job.kind === 'repair' ? IconTools : IconPrinter;
            const color = job.kind === 'repair' ? 'orange' : 'teal';
            return (
              <ListRow
                key={job.id}
                index={index}
                first={index === 0}
                icon={<JobIcon size={20} style={{ color: `var(--mantine-color-${color}-6)` }} />}
                title={`#${job.ticketNumber} · ${job.title}`}
                meta={`${job.statusLabel} · ${formatDateTime(job.createdAt)}`}
                trailing={
                  <Group gap={6} wrap="nowrap">
                    <Text size="sm" fw={700}>
                      {amount(job)}
                    </Text>
                    <Button
                      variant="subtle"
                      size="xs"
                      aria-label={`${t('Open')} ${job.ticketNumber}`}
                      onClick={() =>
                        navigate(
                          `${job.kind === 'repair' ? ROUTES.REPAIRS : ROUTES.PRINT_JOBS}?jobKey=${job.id}`
                        )
                      }
                    >
                      {t('Open')}
                    </Button>
                  </Group>
                }
              />
            );
          })}
        </ScrollArea.Autosize>
      )}
    </Stack>
  );
};
