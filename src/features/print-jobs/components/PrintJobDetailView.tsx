import { useNavigate } from 'react-router-dom';
import { Anchor, Stack, Text } from '@mantine/core';
import {
  IconArrowRight,
  IconCalendarDue,
  IconCash,
  IconChartPie,
  IconClock,
  IconPackage,
  IconPrinter,
  IconUser,
  IconWallet,
} from '@tabler/icons-react';
import { JOB_STATUS_COLORS, PRINT_JOB_STATUS_LABELS, ROUTES } from '@/constants';
import {
  DrawerAfter,
  DrawerCard,
  DrawerGrid,
  DrawerHero,
  DrawerMain,
  DrawerRail,
  Figure,
  FooterMain,
  InfoRow,
  JobFooter,
  JobSlipButton,
  KpiStrip,
  KpiTile,
  type FooterAction,
} from '@/shared/components/drawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { t } from '@/shared/i18n/t';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { getJobDueMeta } from '@/shared/lib/jobDueDate';
import { nextPrintJobStatus, printJobStepLabel } from '@/shared/lib/jobStatusFlow';
import { formatMoney } from '@/shared/lib/money';
import { notify } from '@/shared/notify';
import { useTicketInvoice } from '@/features/billing/hooks/useTicketInvoice';
import type { Invoice } from '@/features/billing/types';
import { useUpdatePrintJob } from '../hooks/usePrintJobs';
import { printJobTypeLabel } from '../lib/jobTypeLabels';
import type { PrintJob } from '../types';

/** What the footer's buttons do; the panel that shows this view supplies them. */
export interface PrintJobDetailActions {
  onEdit: (job: PrintJob) => void;
  /** Opens the preview of the invoice that billed this job. */
  onPrintInvoice: (invoice: Invoice) => void;
}

/** The panel's body for a job: figures, hero, customer, money and details. */
export const PrintJobDetailView = ({
  job,
  onJobSlip,
}: {
  job: PrintJob;
  /** `null` when this person may not print job slips. */
  onJobSlip: ((job: PrintJob) => void) | null;
}) => {
  const materialCents = job.materialCostCents ?? 0;
  const earnings = useJobEarnings({
    priceCents: job.estimatedCostCents,
    materialCostCents: materialCents,
    splitType: job.splitType ?? null,
    splitValue: job.splitValue ?? 0,
  });
  const profit = earnings.data === undefined ? null : earnings.data.profitCents;
  const due = getJobDueMeta(job);
  const navigate = useNavigate();

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
            label: t(PRINT_JOB_STATUS_LABELS[job.status]),
          }}
          title={printJobTypeLabel(job.jobType)}
          subtitle={
            <>
              <div>{`${job.quantity} ${t('units')}`}</div>
              {job.billedInvoiceKey !== undefined && (
                <div>
                  {t('Billed on')}{' '}
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    onClick={() =>
                      navigate(`${ROUTES.INVOICES}?invoiceKey=${job.billedInvoiceKey}`)
                    }
                  >
                    {job.billedInvoiceNumber}
                  </Anchor>
                </div>
              )}
            </>
          }
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
        {onJobSlip === null ? null : <JobSlipButton onClick={() => onJobSlip(job)} />}
      </DrawerMain>
    </DrawerGrid>
  );
};

/** The panel's pinned footer for a job: edit, invoice and the next status. */
export const PrintJobDetailFooter = ({
  job,
  onEdit,
  onPrintInvoice,
}: PrintJobDetailActions & {
  job: PrintJob;
}) => {
  const invoice = useTicketInvoice(job.id);
  const update = useUpdatePrintJob();
  const next = nextPrintJobStatus(job.status);

  const moveOn = async () => {
    if (next === null) return;
    try {
      await update.mutateAsync({ printJobKey: job.id, input: { status: next } });
      notify.success({
        title: t('Print Job Updated'),
        message: `${job.ticketNumber}: ${t(PRINT_JOB_STATUS_LABELS[next])}`,
      });
    } catch (error: unknown) {
      notify.error({ title: t('Could not update the ticket'), message: getErrorMessage(error) });
    }
  };

  const tools: FooterAction[] = [
    {
      id: 'edit',
      label: t('Edit'),
      onClick: () => onEdit(job),
    },
    ...(invoice === null
      ? []
      : [
          {
            id: 'print-invoice',
            label: t('Print invoice'),
            onClick: () => onPrintInvoice(invoice),
          },
        ]),
  ];

  return (
    <JobFooter
      tools={tools}
      bill={null}
      main={
        next === null ? null : (
          <FooterMain
            label={printJobStepLabel(next)}
            icon={<IconArrowRight size={16} />}
            iconSide="right"
            color={JOB_STATUS_COLORS[next]}
            loading={update.isPending}
            onClick={() => void moveOn()}
            logId="print-jobs.next-status"
          />
        )
      }
    />
  );
};
