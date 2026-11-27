import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Anchor, Button, Group, Stack, Text } from '@mantine/core';
import {
  IconArrowRight,
  IconCalendarDue,
  IconCash,
  IconChartPie,
  IconClock,
  IconDeviceFloppy,
  IconFrame,
  IconNote,
  IconPrinter,
  IconShieldCheck,
  IconTool,
  IconUser,
  IconWallet,
} from '@tabler/icons-react';
import { JOB_STATUS_COLORS, PRINT_JOB_STATUS, PRINT_JOB_STATUS_LABELS, ROUTES } from '@/constants';
import { PERMISSIONS } from '@/constants/permissions';
import { coverageLabel } from '@/features/warranties';
import { useTicketInvoice } from '@/features/billing/hooks/useTicketInvoice';
import type { Invoice } from '@/features/billing/types';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import {
  AnimatedTabs,
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
  ListRow,
  type FooterAction,
} from '@/shared/components/drawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { ItemCountBadge } from '@/shared/components/ticket-items/ItemCountBadge';
import { JobWarrantiesPanel } from '@/shared/components/ticket-items/JobWarrantiesPanel';
import { useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { t } from '@/shared/i18n/t';
import { billBlocker } from '@/shared/lib/billBlocker';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { getJobDueMeta } from '@/shared/lib/jobDueDate';
import { snapshot } from '@/shared/lib/jobPanelState';
import { nextPrintJobStatus, printJobStepLabel } from '@/shared/lib/jobStatusFlow';
import { formatMoney } from '@/shared/lib/money';
import { notify } from '@/shared/notify';
import { useUpdatePrintJob } from '../hooks/usePrintJobs';
import { printJobTypeLabel } from '../lib/jobTypeLabels';
import {
  draftsFromSaved,
  isRework,
  itemsProblem,
  toItemInputs,
  usePrintTotals,
  type PrintDraft,
} from '../lib/printItems';
import { printStepBlock } from '../lib/statusStep';
import type { PrintJob, PrintJobItem } from '../types';
import { PrintItemsEditor } from './PrintItemsEditor';
import { WantedFrames } from './WantedFrames';

/** What the footer's buttons do; the panel that shows this view supplies them. */
export interface PrintJobDetailActions {
  onEdit: (job: PrintJob) => void;
  /** Opens the preview of the invoice that billed this job. */
  onPrintInvoice: (invoice: Invoice) => void;
  onBill: (job: PrintJob) => void;
}

/** What a line sells, in one short phrase. */
const sourceLine = (item: PrintJobItem): string => {
  switch (item.source.type) {
    case 'service':
      return t('Service fee');
    case 'outside':
      return `${t('Part')}: ${item.source.name}`;
    case 'stock':
      return item.source.serialNumber === undefined
        ? `${t('Part')}: ${item.source.productName}`
        : `${t('Part')}: ${item.source.productName} · ${item.source.serialNumber}`;
  }
};

const itemNetCents = (item: PrintJobItem): number =>
  item.quantity * item.unitPriceCents -
  (item.discount === undefined ? 0 : item.discount.amountCents);

const ItemList = ({ job }: { job: PrintJob }) => {
  if (job.items.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        {t('No items have been added yet.')}
      </Text>
    );
  }
  const rework = job.kind.kind === 'warranty_rework';
  return (
    <Stack gap="xs">
      <div>
        {job.items.map((item, index) => (
          <ListRow
            key={item.key}
            index={index}
            first={index === 0}
            icon={<IconTool size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />}
            title={item.description}
            meta={
              <>
                <div>{sourceLine(item)}</div>
                <div>
                  {rework
                    ? `${t('Quantity')} ${item.quantity}`
                    : `${item.quantity} × ${formatMoney(item.unitPriceCents)}`}
                </div>
                {item.warranty.coverage.kind !== 'none' && (
                  <div>{`${t('Warranty')}: ${coverageLabel(item.warranty.coverage)}`}</div>
                )}
              </>
            }
            trailing={
              <>
                <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {rework ? t('Free (warranty)') : formatMoney(itemNetCents(item))}
                </Text>
                {item.discount !== undefined && item.discount.amountCents > 0 && (
                  <Text size="xs" c="dimmed">
                    {`${t('Discount')} −${formatMoney(item.discount.amountCents)}`}
                  </Text>
                )}
              </>
            }
          />
        ))}
      </div>
      <Stack gap={4} pt="xs" style={{ borderTop: '1px solid var(--border)' }}>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('Customer pays')}
          </Text>
          <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {rework ? t('Free (warranty)') : formatMoney(job.priceCents)}
          </Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('Cost to shop')}
          </Text>
          <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatMoney(job.costCents)}
          </Text>
        </Group>
      </Stack>
    </Stack>
  );
};

/**
 * The items card. Someone who may edit the job gets the editor right here (search, print
 * services, rows); saving sends only the items, so the full form shows them at once. Everyone
 * else, and a billed or handed-back job, gets the plain list.
 */
const ItemsPanel = ({ job, framed }: { job: PrintJob; framed: boolean }) => {
  const canWrite = useHasPermission(PERMISSIONS.PRINT_JOBS_WRITE);
  const update = useUpdatePrintJob();
  const rework = isRework(job.kind);
  // A billed job's items are locked, whether or not it has been handed back.
  const billed = job.billedInvoiceKey !== undefined;
  const editable = canWrite && job.status !== PRINT_JOB_STATUS.DELIVERED && !billed;
  const savedSignature = snapshot(job.items);
  const [loaded, setLoaded] = useState(() => ({
    signature: savedSignature,
    drafts: draftsFromSaved(job.items),
  }));
  const [drafts, setDrafts] = useState<PrintDraft[]>(loaded.drafts);
  const [tried, setTried] = useState(false);
  const totals = usePrintTotals(drafts, rework);

  const strip = (list: PrintDraft[]) => snapshot(list.map(({ uid: _uid, ...rest }) => rest));
  const dirty = strip(drafts) !== strip(loaded.drafts);
  // The saved items changed (a save here, or in the full form) and nothing was typed: follow it.
  if (loaded.signature !== savedSignature && !dirty) {
    const fresh = draftsFromSaved(job.items);
    setLoaded({ signature: savedSignature, drafts: fresh });
    setDrafts(fresh);
  }

  const frame = (count: number, body: ReactNode) =>
    framed ? (
      <DrawerCard
        label={t('Items')}
        icon={<IconTool size={14} />}
        action={<ItemCountBadge count={count} />}
      >
        {body}
      </DrawerCard>
    ) : (
      body
    );

  if (!editable) {
    return frame(
      job.items.length,
      <Stack gap="sm">
        <ItemList job={job} />
        {billed && job.status !== PRINT_JOB_STATUS.DELIVERED && (
          <Text size="xs" c="dimmed">
            {t('Its items are locked. Void the invoice to change them.')}
          </Text>
        )}
      </Stack>
    );
  }

  const problem = itemsProblem(drafts, job.kind, job.status, totals);
  const save = async () => {
    setTried(true);
    if (problem !== null) return;
    try {
      await update.mutateAsync({
        printJobKey: job.id,
        input: { items: toItemInputs(drafts, rework) },
      });
      notify.success({ title: t('Print Job Updated'), message: job.ticketNumber });
      setTried(false);
      // What was sent is now the saved items; the refreshed job then reloads the rows.
      setLoaded((now) => ({ ...now, drafts }));
    } catch (error: unknown) {
      notify.error({ title: t('Could not update the ticket'), message: getErrorMessage(error) });
    }
  };

  return frame(
    drafts.length,
    <Stack gap="md">
      <PrintItemsEditor
        drafts={drafts}
        onChange={setDrafts}
        rework={rework}
        readOnly={false}
        showProblems={tried}
        totals={totals}
        orderQuantity={job.quantity}
      />
      {tried && problem !== null && (
        <Text size="sm" c="red" role="alert">
          {problem}
        </Text>
      )}
      {dirty && (
        <Group justify="flex-end" gap="sm" pt="sm" style={{ borderTop: '1px solid var(--border)' }}>
          <Button
            variant="default"
            size="sm"
            disabled={update.isPending}
            onClick={() => {
              setDrafts(loaded.drafts);
              setTried(false);
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            size="sm"
            loading={update.isPending}
            leftSection={<IconDeviceFloppy size={16} />}
            onClick={() => void save()}
          >
            {t('Save items')}
          </Button>
        </Group>
      )}
    </Stack>
  );
};

type Tab = 'items' | 'warranty';

/** The panel's body for a job: figures, hero, customer, details, the note and the items. */
export const PrintJobDetailView = ({
  job,
  onJobSlip,
  onNestedWindowChange,
}: {
  job: PrintJob;
  /** `null` when this person may not print job slips. */
  onJobSlip: ((job: PrintJob) => void) | null;
  onNestedWindowChange: (open: boolean) => void;
}) => {
  const navigate = useNavigate();
  const canViewWarranties = useHasPermission(PERMISSIONS.WARRANTIES_VIEW);
  const [tab, setTab] = useState<Tab>('items');
  const rework = job.kind.kind === 'warranty_rework';
  const priced = job.items.length > 0;
  const earnings = useJobEarnings({
    priceCents: priced ? job.priceCents : null,
    materialCostCents: job.costCents,
    splitType: job.splitType ?? null,
    splitValue: job.splitValue ?? 0,
  });
  const due = getJobDueMeta(job);
  const showWarranties = canViewWarranties && job.status === PRINT_JOB_STATUS.DELIVERED && !rework;
  const activeTab: Tab = showWarranties ? tab : 'items';

  return (
    <DrawerGrid>
      <KpiStrip>
        <KpiTile icon={<IconCash size={16} />} color="blue" label={t('Amount')}>
          {rework ? (
            <Figure value={t('Free')} hint={t('Warranty rework')} color="teal" />
          ) : priced ? (
            <Figure value={formatMoney(job.priceCents)} hint={t('Customer pays')} color="blue" />
          ) : (
            <Figure value="—" hint={t('Not priced yet')} color="gray" />
          )}
        </KpiTile>
        <KpiTile icon={<IconChartPie size={16} />} color="green" label={t('Profit')}>
          {priced && earnings.data !== undefined ? (
            <Figure
              value={formatMoney(earnings.data.profitCents)}
              hint={t('After costs')}
              color="green"
            />
          ) : (
            <Figure value="—" hint={t('Not priced yet')} color="gray" />
          )}
        </KpiTile>
        <KpiTile icon={<IconWallet size={16} />} color="indigo" label={t('Operator earns')}>
          {job.assignedEmployeeName === undefined ? (
            <Figure value="—" hint={t('Unassigned')} color="gray" />
          ) : (
            <Figure
              value={formatMoney(job.employeeEarningsCents ?? 0)}
              hint={job.assignedEmployeeName}
              color="indigo"
            />
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
        >
          {job.kind.kind === 'warranty_rework' ? (
            <Text size="xs" c="dimmed">
              {`${t('Rework of')} ${job.kind.originalTicketNumber} · `}
              <Anchor
                component="button"
                type="button"
                size="xs"
                onClick={() => {
                  if (job.kind.kind !== 'warranty_rework') return;
                  navigate(`${ROUTES.WARRANTIES}?view=claims&claim=${job.kind.claimKey}`);
                }}
              >
                {job.kind.claimNumber}
              </Anchor>
            </Text>
          ) : null}
        </DrawerHero>

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

        <DrawerAfter>
          <Stack gap="md">
            {job.frames.length > 0 && (
              <DrawerCard label={t('Frames wanted')} icon={<IconFrame size={14} />}>
                <WantedFrames
                  frames={job.frames}
                  onChange={() => undefined}
                  readOnly
                  showProblems={false}
                />
              </DrawerCard>
            )}
            {job.note !== undefined && (
              <DrawerCard label={t('Note')} icon={<IconNote size={14} />}>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                  {job.note}
                </Text>
              </DrawerCard>
            )}
            <DrawerCard label={t('Details')} icon={<IconClock size={14} />}>
              <Stack gap="xs">
                <InfoRow icon={<IconClock size={16} />} label={t('Received')}>
                  {formatDateTime(job.createdAt)}
                </InfoRow>
                <InfoRow icon={<IconCalendarDue size={16} />} label={t('Promised')}>
                  {job.promisedReadyAt === undefined ? '—' : formatDate(job.promisedReadyAt)}
                </InfoRow>
                <InfoRow icon={<IconUser size={16} />} label={t('Operator')}>
                  {job.assignedEmployeeName === undefined
                    ? t('Unassigned')
                    : job.assignedEmployeeName}
                </InfoRow>
              </Stack>
            </DrawerCard>
            {onJobSlip === null ? null : <JobSlipButton onClick={() => onJobSlip(job)} />}
          </Stack>
        </DrawerAfter>
      </DrawerRail>

      <DrawerMain>
        {showWarranties ? (
          <AnimatedTabs<Tab>
            value={activeTab}
            onChange={setTab}
            tabs={[
              {
                value: 'items',
                label: t('Items'),
                icon: <IconTool size={16} />,
                count: job.items.length,
              },
              { value: 'warranty', label: t('Warranty'), icon: <IconShieldCheck size={16} /> },
            ]}
          >
            {(value) =>
              value === 'items' ? (
                <ItemsPanel job={job} framed={false} />
              ) : (
                <JobWarrantiesPanel
                  job={{ printJobKey: job.id }}
                  onNestedWindowChange={onNestedWindowChange}
                />
              )
            }
          </AnimatedTabs>
        ) : (
          <ItemsPanel job={job} framed />
        )}
      </DrawerMain>
    </DrawerGrid>
  );
};

/** The panel's pinned footer for a job: edit, invoice, bill and the next status. */
export const PrintJobDetailFooter = ({
  job,
  onEdit,
  onPrintInvoice,
  onBill,
}: PrintJobDetailActions & {
  job: PrintJob;
}) => {
  const invoice = useTicketInvoice(job.id);
  const update = useUpdatePrintJob();
  const next = nextPrintJobStatus(job.status);
  const block = next === null ? null : printStepBlock(job, next);
  const canBill = billBlocker(job) === null;
  const [confirmingHandBack, setConfirmingHandBack] = useState(false);
  // A job billed with the hand-over later gets its warranties the day it is handed back.
  const warrantiesStartToday =
    job.billedInvoiceKey !== undefined &&
    job.items.some((item) => item.warranty.coverage.kind !== 'none');
  const confirmsHandBack = next === PRINT_JOB_STATUS.DELIVERED && warrantiesStartToday;

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

  // A stock part must be billed before it is handed back: then Bill is the filled main action.
  const billFirst = block !== null && block.reason === 'bill_first';
  const billAction: FooterAction = {
    id: 'bill',
    label: t('Bill'),
    icon: <IconArrowRight size={16} />,
    onClick: () => onBill(job),
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

  let main: ReactNode = null;
  if (billFirst) {
    if (canBill) {
      main = (
        <FooterMain
          label={billAction.label}
          icon={billAction.icon}
          iconSide="right"
          color="blue"
          onClick={billAction.onClick}
        />
      );
    }
  } else if (next !== null) {
    main = (
      <FooterMain
        label={printJobStepLabel(next)}
        icon={<IconArrowRight size={16} />}
        iconSide="right"
        color={JOB_STATUS_COLORS[next]}
        loading={update.isPending}
        blockedMessage={block === null ? undefined : block.message}
        onClick={() => (confirmsHandBack ? setConfirmingHandBack(true) : void moveOn())}
        logId="print-jobs.next-status"
      />
    );
  }

  return (
    <>
      <JobFooter tools={tools} bill={canBill && !billFirst ? billAction : null} main={main} />
      <ConfirmDialog
        opened={confirmingHandBack}
        onClose={() => setConfirmingHandBack(false)}
        onConfirm={() => {
          setConfirmingHandBack(false);
          void moveOn();
        }}
        title={t('Hand it back?')}
        confirmLabel={t('Hand back')}
        confirmColor="teal"
        loading={update.isPending}
        zIndex={400}
      >
        {`${t('Hand')} ${job.ticketNumber} ${t('back to')} ${job.customerName}? ${t('Its warranties start today.')}`}
      </ConfirmDialog>
    </>
  );
};
