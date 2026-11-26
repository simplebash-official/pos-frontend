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
  IconShieldCheck,
  IconTool,
  IconUser,
  IconWallet,
} from '@tabler/icons-react';
import { JOB_STATUS, JOB_STATUS_COLORS, JOB_STATUS_LABELS, ROUTES } from '@/constants';
import { PERMISSIONS } from '@/constants/permissions';
import { ItemCountBadge } from '@/shared/components/ticket-items/ItemCountBadge';
import { JobWarrantiesPanel } from '@/shared/components/ticket-items/JobWarrantiesPanel';
import { coverageLabel } from '@/features/warranties';
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
import { useTicketInvoice } from '@/features/billing/hooks/useTicketInvoice';
import type { Invoice } from '@/features/billing/types';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { t } from '@/shared/i18n/t';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { getJobDueMeta } from '@/shared/lib/jobDueDate';
import { nextStatus, stepLabel } from '@/shared/lib/jobStatusFlow';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { snapshot } from '@/shared/lib/jobPanelState';
import { notify } from '@/shared/notify';
import { billBlocker } from '../lib/billable';
import {
  itemsFromSaved,
  countItems,
  itemsProblem,
  toItemInputs,
  useRepairTotals,
  type ItemDraft,
} from '../lib/repairItems';
import { repairStepBlock } from '../lib/statusStep';
import { useUpdateRepairJob } from '../hooks/useRepairs';
import type { RepairItem, RepairJob } from '../types';
import { RepairItemsEditor } from './RepairItemsEditor';

type Tab = 'work' | 'warranty';

/** What the footer's buttons do; the panel that shows this view supplies them. */
export interface RepairDetailActions {
  onEdit: (job: RepairJob) => void;
  /** Opens the preview of the invoice that billed this job. */
  onPrintInvoice: (invoice: Invoice) => void;
  onBill: (job: RepairJob) => void;
}

const itemNetCents = (item: RepairItem) =>
  item.laborCents + item.partCents - (item.discount === undefined ? 0 : item.discount.amountCents);

const partLine = (item: RepairItem): string | null => {
  if (item.part === undefined) return null;
  if (item.part.source === 'outside') return item.part.name;
  return item.part.serialNumber === undefined
    ? item.part.productName
    : `${item.part.productName} · ${item.part.serialNumber}`;
};

const WorkList = ({ job }: { job: RepairJob }) => {
  if (job.items.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="md">
        {t('No work has been added yet.')}
      </Text>
    );
  }
  const rework = job.kind.kind === 'warranty_rework';
  return (
    <Stack gap="xs">
      <div>
        {job.items.map((item, index) => {
          const part = partLine(item);
          const warranty =
            item.warranty.coverage.kind === 'none' ? null : coverageLabel(item.warranty.coverage);
          return (
            <ListRow
              key={item.key}
              index={index}
              first={index === 0}
              icon={<IconTool size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />}
              title={item.description}
              meta={
                <>
                  {part !== null && <div>{`${t('Part')}: ${part}`}</div>}
                  {warranty !== null && <div>{`${t('Warranty')}: ${warranty}`}</div>}
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
          );
        })}
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
            {t('Parts cost the shop')}
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
 * The work card. Someone who may edit the ticket gets the parts-and-fees editor right here
 * (search, quick fees, rows); saving sends only the items, so the full form shows them at once.
 * Everyone else, and a handed-back ticket, gets the plain list.
 */
const WorkPanel = ({
  job,
  card,
  onNestedWindowChange,
}: {
  job: RepairJob;
  /** The title of the card to wrap the work in, with the item count at its right; `null` when a tab already holds it. */
  card: { label: string; icon: ReactNode } | null;
  onNestedWindowChange: (open: boolean) => void;
}) => {
  const canWrite = useHasPermission(PERMISSIONS.REPAIRS_WRITE);
  const update = useUpdateRepairJob();
  const rework = job.kind.kind === 'warranty_rework';
  // A billed job's work is locked, whether or not it has been handed back.
  const billed = job.billedInvoiceKey !== undefined;
  const editable = canWrite && job.status !== JOB_STATUS.DELIVERED && !billed;
  const savedSignature = snapshot(job.items);
  const [loaded, setLoaded] = useState(() => ({
    signature: savedSignature,
    drafts: itemsFromSaved(job.items),
  }));
  const [drafts, setDrafts] = useState<ItemDraft[]>(loaded.drafts);
  const [tried, setTried] = useState(false);
  const totals = useRepairTotals(drafts, rework);

  const strip = (list: ItemDraft[]) => snapshot(list.map(({ uid: _uid, ...rest }) => rest));
  const dirty = strip(drafts) !== strip(loaded.drafts);
  // The saved work changed (a save here, or in the full form) and nothing was typed: follow it.
  if (loaded.signature !== savedSignature && !dirty) {
    const fresh = itemsFromSaved(job.items);
    setLoaded({ signature: savedSignature, drafts: fresh });
    setDrafts(fresh);
  }

  const framed = (count: number, body: ReactNode) =>
    card === null ? (
      body
    ) : (
      <DrawerCard label={card.label} icon={card.icon} action={<ItemCountBadge count={count} />}>
        {body}
      </DrawerCard>
    );

  if (!editable) {
    return framed(
      countItems(itemsFromSaved(job.items)),
      <Stack gap="sm">
        <WorkList job={job} />
        {billed && job.status !== JOB_STATUS.DELIVERED && (
          <Text size="xs" c="dimmed">
            {t('Its work is locked. Void the invoice to change it.')}
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
        repairKey: job.id,
        input: { items: toItemInputs(drafts, rework) },
      });
      notify.success({ title: t('Repair Ticket Updated'), message: job.ticketNumber });
      setTried(false);
      // What was sent is now the saved work; the refreshed job then reloads the rows.
      setLoaded((now) => ({ ...now, drafts }));
    } catch (error: unknown) {
      notify.error({ title: t('Could not update the ticket'), message: getErrorMessage(error) });
    }
  };

  return framed(
    countItems(drafts),
    <Stack gap="md">
      <RepairItemsEditor
        drafts={drafts}
        onChange={setDrafts}
        rework={rework}
        readOnly={false}
        showProblems={tried}
        totals={totals}
        onNestedWindowChange={onNestedWindowChange}
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
            {t('Save work')}
          </Button>
        </Group>
      )}
    </Stack>
  );
};

/** The panel's body for a job: figures, hero, customer, details and the work. */
export const RepairDetailView = ({
  job,
  onJobSlip,
  onNestedWindowChange,
}: {
  job: RepairJob;
  /** `null` when this person may not print job slips. */
  onJobSlip: ((job: RepairJob) => void) | null;
  onNestedWindowChange: (open: boolean) => void;
}) => {
  const navigate = useNavigate();
  const canViewWarranties = useHasPermission(PERMISSIONS.WARRANTIES_VIEW);
  const [tab, setTab] = useState<Tab>('work');
  const rework = job.kind.kind === 'warranty_rework';
  const priced = job.items.length > 0;
  const earnings = useJobEarnings({
    priceCents: priced ? job.priceCents : null,
    materialCostCents: job.costCents,
    splitType: job.splitType ?? null,
    splitValue: job.splitValue ?? 0,
  });
  const due = getJobDueMeta(job);
  const showWarranties = canViewWarranties && job.status === JOB_STATUS.DELIVERED && !rework;
  const activeTab: Tab = showWarranties ? tab : 'work';

  return (
    <DrawerGrid>
      <KpiStrip>
        <KpiTile icon={<IconCash size={16} />} color="blue" label={t('Amount')}>
          {rework ? (
            <Figure value={t('Free')} hint={t('Warranty rework')} color="teal" />
          ) : priced ? (
            <Figure
              value={formatMoney(job.priceCents)}
              hint={`${job.items.length} ${t('work item(s)')}`}
              color="blue"
            />
          ) : (
            <Figure value="—" hint={t('Pending diagnosis')} color="gray" />
          )}
        </KpiTile>
        <KpiTile icon={<IconChartPie size={16} />} color="green" label={t('Profit')}>
          {priced && earnings.data !== undefined ? (
            <Figure
              value={formatMoney(earnings.data.profitCents)}
              hint={t('After parts cost')}
              color="green"
            />
          ) : (
            <Figure value="—" hint={t('Not priced yet')} color="gray" />
          )}
        </KpiTile>
        <KpiTile icon={<IconWallet size={16} />} color="indigo" label={t('Technician earns')}>
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
          icon={<IconTool size={32} />}
          eyebrow={job.ticketNumber}
          status={{
            color: JOB_STATUS_COLORS[job.status],
            label: t(JOB_STATUS_LABELS[job.status]),
          }}
          title={job.deviceModel}
          subtitle={
            job.serialNumber === undefined && job.billedInvoiceKey === undefined ? undefined : (
              <>
                {job.serialNumber !== undefined && (
                  <div>{`${t('Serial number or IMEI')}: ${job.serialNumber}`}</div>
                )}
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
            )
          }
        >
          <Stack gap={6}>
            <Text size="xs" c="dimmed">
              {t('The problem')}
            </Text>
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
              {job.issueDescription}
            </Text>
            {job.kind.kind === 'warranty_rework' && (
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
            )}
          </Stack>
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
            <DrawerCard label={t('Details')} icon={<IconClock size={14} />}>
              <Stack gap="xs">
                <InfoRow icon={<IconClock size={16} />} label={t('Received')}>
                  {formatDateTime(job.createdAt)}
                </InfoRow>
                <InfoRow icon={<IconCalendarDue size={16} />} label={t('Promised')}>
                  {job.promisedReadyAt === undefined ? '—' : formatDate(job.promisedReadyAt)}
                </InfoRow>
                <InfoRow icon={<IconUser size={16} />} label={t('Technician')}>
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
                value: 'work',
                label: t('Work'),
                icon: <IconTool size={16} />,
                count: job.items.length,
              },
              { value: 'warranty', label: t('Warranty'), icon: <IconShieldCheck size={16} /> },
            ]}
          >
            {(value) =>
              value === 'work' ? (
                <WorkPanel job={job} card={null} onNestedWindowChange={onNestedWindowChange} />
              ) : (
                <JobWarrantiesPanel
                  job={{ repairKey: job.id }}
                  onNestedWindowChange={onNestedWindowChange}
                />
              )
            }
          </AnimatedTabs>
        ) : (
          <WorkPanel
            job={job}
            card={{ label: t('Work'), icon: <IconTool size={14} /> }}
            onNestedWindowChange={onNestedWindowChange}
          />
        )}
      </DrawerMain>
    </DrawerGrid>
  );
};

/** The panel's pinned footer for a job: edit, invoice, bill and the next status. */
export const RepairDetailFooter = ({
  job,
  onEdit,
  onPrintInvoice,
  onBill,
}: RepairDetailActions & {
  job: RepairJob;
}) => {
  const invoice = useTicketInvoice(job.id);
  const update = useUpdateRepairJob();
  const next = nextStatus(job.status);
  const block = next === null ? null : repairStepBlock(job, next);
  const canBill = billBlocker(job) === null;
  const [confirmingHandBack, setConfirmingHandBack] = useState(false);
  // A job billed with the hand-over later gets its warranties the day it is handed back.
  const warrantiesStartToday =
    job.billedInvoiceKey !== undefined &&
    job.items.some((item) => item.warranty.coverage.kind !== 'none');
  const confirmsHandBack = next === JOB_STATUS.DELIVERED && warrantiesStartToday;

  const moveOn = async () => {
    if (next === null) return;
    try {
      await update.mutateAsync({ repairKey: job.id, input: { status: next } });
      notify.success({
        title: t('Repair Ticket Updated'),
        message: `${job.ticketNumber}: ${t(JOB_STATUS_LABELS[next])}`,
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
        label={stepLabel(next)}
        icon={<IconArrowRight size={16} />}
        iconSide="right"
        color={JOB_STATUS_COLORS[next]}
        loading={update.isPending}
        blockedMessage={block === null ? undefined : block.message}
        onClick={() => (confirmsHandBack ? setConfirmingHandBack(true) : void moveOn())}
        logId="repairs.next-status"
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
