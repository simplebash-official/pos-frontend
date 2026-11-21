import { Button, Group, Stack, Text } from '@mantine/core';
import {
  IconArrowRight,
  IconCalendarDue,
  IconCash,
  IconChartPie,
  IconClock,
  IconEdit,
  IconPackage,
  IconPrinter,
  IconUser,
  IconWallet,
} from '@tabler/icons-react';
import { JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/constants';
import {
  DrawerAfter,
  DrawerCard,
  DrawerFooter,
  DrawerGrid,
  DrawerHero,
  DrawerMain,
  DrawerRail,
  Figure,
  InfoRow,
  KpiStrip,
  KpiTile,
  RichDrawer,
} from '@/shared/components/drawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { t } from '@/shared/i18n/t';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { getJobDueMeta } from '@/shared/lib/jobDueDate';
import { nextStatus, stepLabel } from '@/shared/lib/jobStatusFlow';
import { formatMoney } from '@/shared/lib/money';
import { notify } from '@/shared/notify';
import { useUpdatePrintJob } from '../hooks/usePrintJobs';
import { printJobTypeLabel } from '../lib/jobTypeLabels';
import type { PrintJob } from '../types';

export interface PrintJobDetailDrawerProps {
  job: PrintJob | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (job: PrintJob) => void;
  /** `null` when this person may not print receipts. */
  onPrintReceipt: ((job: PrintJob) => void) | null;
  /** Pass `false` while a window opened over this panel is up, so Escape closes only that window. */
  closeOnEscape: boolean;
}

const Body = ({ job }: { job: PrintJob }) => {
  const materialCents = job.materialCostCents ?? 0;
  const earnings = useJobEarnings({
    priceCents: job.estimatedCostCents,
    materialCostCents: materialCents,
    splitType: job.splitType ?? null,
    splitValue: job.splitValue ?? 0,
  });
  const profit = earnings.data === undefined ? null : earnings.data.profitCents;
  const due = getJobDueMeta(job);

  return (
    <DrawerGrid>
      <KpiStrip>
        <KpiTile icon={<IconCash size={16} />} color="blue" label={t('Amount')}>
          <Figure
            value={formatMoney(job.estimatedCostCents)}
            hint={t('Customer pays')}
            color="blue"
          />
        </KpiTile>
        <KpiTile icon={<IconPackage size={16} />} color="gray" label={t('Material cost')}>
          <Figure value={formatMoney(materialCents)} hint={t('Blanks and ink')} color="gray" />
        </KpiTile>
        <KpiTile icon={<IconChartPie size={16} />} color="green" label={t('Profit')}>
          {profit === null ? (
            <Figure value="—" hint={t('Not worked out yet')} color="gray" />
          ) : (
            <Figure value={formatMoney(profit)} hint={t('After material cost')} color="green" />
          )}
        </KpiTile>
        <KpiTile
          icon={<IconCalendarDue size={16} />}
          color={due === null ? 'gray' : due.color}
          label={t('Promised')}
        >
          <Figure
            value={job.promisedReadyAt === undefined ? '—' : formatDate(job.promisedReadyAt)}
            hint={due === null ? t('No date flagged') : due.label}
            color={due === null ? 'gray' : due.color}
          />
        </KpiTile>
      </KpiStrip>

      <DrawerRail>
        <DrawerHero
          accent={JOB_STATUS_COLORS[job.status]}
          icon={<IconPrinter size={32} />}
          eyebrow={job.ticketNumber}
          status={{
            color: JOB_STATUS_COLORS[job.status],
            label: t(JOB_STATUS_LABELS[job.status]),
          }}
          title={printJobTypeLabel(job.jobType)}
          subtitle={<div>{`${job.quantity} ${t('units')}`}</div>}
        />

        <DrawerAfter>
          <DrawerCard label={t('Customer')} icon={<IconUser size={14} />}>
            <Stack gap="xs">
              <Text size="sm" fw={700}>
                {job.customerName}
              </Text>
              <PhoneDisplay primaryPhone={job.customerPhone} layout="stack" />
            </Stack>
          </DrawerCard>
        </DrawerAfter>
      </DrawerRail>

      <DrawerMain>
        <DrawerCard label={t('Money')} icon={<IconWallet size={14} />}>
          <Stack gap="xs">
            <InfoRow icon={<IconCash size={16} />} label={t('Customer pays')}>
              {formatMoney(job.estimatedCostCents)}
            </InfoRow>
            <InfoRow icon={<IconPackage size={16} />} label={t('Material cost')}>
              {formatMoney(materialCents)}
            </InfoRow>
            <InfoRow icon={<IconChartPie size={16} />} label={t('Profit')}>
              {profit === null ? '—' : formatMoney(profit)}
            </InfoRow>
            <InfoRow icon={<IconWallet size={16} />} label={t('Technician earns')}>
              {job.assignedEmployeeName === undefined
                ? '—'
                : formatMoney(job.employeeEarningsCents ?? 0)}
            </InfoRow>
          </Stack>
        </DrawerCard>

        <DrawerCard label={t('Details')} icon={<IconClock size={14} />}>
          <Stack gap="xs">
            <InfoRow icon={<IconClock size={16} />} label={t('Received')}>
              {formatDateTime(job.createdAt)}
            </InfoRow>
            <InfoRow icon={<IconCalendarDue size={16} />} label={t('Promised')}>
              {job.promisedReadyAt === undefined ? '—' : formatDate(job.promisedReadyAt)}
            </InfoRow>
            <InfoRow icon={<IconUser size={16} />} label={t('Technician')}>
              {job.assignedEmployeeName === undefined ? t('Unassigned') : job.assignedEmployeeName}
            </InfoRow>
          </Stack>
        </DrawerCard>
      </DrawerMain>
    </DrawerGrid>
  );
};

const Footer = ({
  job,
  onClose,
  onEdit,
  onPrintReceipt,
}: Pick<PrintJobDetailDrawerProps, 'onEdit' | 'onPrintReceipt'> & {
  job: PrintJob;
  onClose: () => void;
}) => {
  const update = useUpdatePrintJob();
  const next = nextStatus(job.status);

  const moveOn = async () => {
    if (next === null) return;
    try {
      await update.mutateAsync({ printJobKey: job.id, input: { status: next } });
      notify.success({
        title: t('Print Job Updated'),
        message: `${job.ticketNumber}: ${t(JOB_STATUS_LABELS[next])}`,
      });
    } catch (error: unknown) {
      notify.error({ title: t('Could not update the ticket'), message: getErrorMessage(error) });
    }
  };

  return (
    <DrawerFooter>
      <Group gap="sm" wrap="wrap" justify="flex-end">
        <Button variant="default" size="sm" onClick={onClose}>
          {t('Close')}
        </Button>
        {onPrintReceipt !== null && (
          <Button
            variant="default"
            size="sm"
            leftSection={<IconPrinter size={16} />}
            onClick={() => onPrintReceipt(job)}
          >
            {t('Print receipt')}
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          leftSection={<IconEdit size={16} />}
          onClick={() => onEdit(job)}
        >
          {t('Edit')}
        </Button>
        {next !== null && (
          <Button
            color="blue"
            size="sm"
            loading={update.isPending}
            leftSection={<IconArrowRight size={16} />}
            onClick={() => void moveOn()}
            data-log-id="print-jobs.next-status"
          >
            {stepLabel(next)}
          </Button>
        )}
      </Group>
    </DrawerFooter>
  );
};

/** The side panel a print job row opens: what was ordered, the money, and the next step. */
export const PrintJobDetailDrawer = ({
  job,
  opened,
  onClose,
  onEdit,
  onPrintReceipt,
  closeOnEscape,
}: PrintJobDetailDrawerProps) => (
  <RichDrawer
    data={job}
    opened={opened}
    onClose={onClose}
    width="standard"
    closeOnEscape={closeOnEscape}
    title={{
      icon: <IconPrinter size={20} />,
      text: t('Print Order'),
      subtitle: t('What was ordered and the money'),
    }}
    footer={(item) => (
      <Footer job={item} onClose={onClose} onEdit={onEdit} onPrintReceipt={onPrintReceipt} />
    )}
  >
    {(item) => <Body key={item.id} job={item} />}
  </RichDrawer>
);
