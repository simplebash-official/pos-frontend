import { useState } from 'react';
import {
  Alert,
  Anchor,
  Button,
  Center,
  Group,
  Loader,
  Menu,
  Progress,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconActivity,
  IconAlertTriangle,
  IconBox,
  IconCalendarDue,
  IconChevronUp,
  IconClipboardCheck,
  IconClockHour4,
  IconFileInvoice,
  IconInfoCircle,
  IconLink,
  IconPhone,
  IconPrinter,
  IconReceipt,
  IconShieldCheck,
  IconShieldOff,
  IconShieldPlus,
  IconUser,
} from '@tabler/icons-react';
import {
  AnimatedTabs,
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
  ListRow,
  RichDrawer,
} from '@/shared/components/drawer';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { t } from '@/shared/i18n/t';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { useExtendWarranty, useVoidWarranty, useWarranty } from '../hooks/useWarranties';
import {
  coverageLabel,
  daysLeftLabel,
  eventLabel,
  periodUsedPercent,
  stateLook,
  typeLabel,
} from '../lib/warrantyView';
import type { Warranty, WarrantyCoverage, WarrantyDetail } from '../types';
import { CoverageEditor } from './CoverageEditor';
import { ageLabel, decisionLabel } from '../lib/claimView';
import { ClaimLauncher } from './ClaimLauncher';
import { ManagerApprovalModal } from './ManagerApprovalModal';
import { WarrantyCardModal } from './WarrantyCardModal';
import { ClaimStatusDot, WarrantyStateDot } from './WarrantyStateDot';

type DetailTab = 'overview' | 'claims' | 'activity' | 'linked';

export interface WarrantyDetailDrawerProps {
  /** The `wty_` key to show; `null` while closed. */
  warrantyKey: string | null;
  onClose: () => void;
  /** Opens another warranty in this drawer (the replacement chain). */
  onOpenWarranty: (key: string) => void;
  /** Shows a claim (in place of this drawer). */
  onOpenClaim: (claimKey: string) => void;
}

type Loaded = { kind: 'loading' } | { kind: 'failed'; message: string } | WarrantyDetailReady;
interface WarrantyDetailReady {
  kind: 'ready';
  detail: WarrantyDetail;
}

const UNPAID = new Set(['pending', 'partially_paid']);

const PeriodBar = ({ warranty }: { warranty: Warranty }) => {
  const used = periodUsedPercent(warranty);
  const look = stateLook(warranty.state);
  return (
    <Stack gap={6}>
      {used !== null && (
        <Progress
          value={used}
          color={look.color}
          size="sm"
          aria-label={t('How much of the warranty has passed')}
        />
      )}
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Text size="xs" c="dimmed">
          {t('From')} {formatDate(warranty.startsOn)}
        </Text>
        <Text size="xs" c="dimmed">
          {warranty.endsOn === undefined
            ? t('Covered for life')
            : `${t('Until')} ${formatDate(warranty.endsOn)}`}
        </Text>
      </Group>
    </Stack>
  );
};

const WarrantyLinkRow = ({
  label,
  warranty,
  onOpen,
  index,
}: {
  label: string;
  warranty: Warranty;
  onOpen: (key: string) => void;
  index: number;
}) => (
  <ListRow
    index={index}
    first={index === 0}
    icon={<IconShieldCheck size={18} />}
    title={`${label}: ${warranty.warrantyNumber}`}
    meta={warranty.serialNumber === undefined ? warranty.itemName : warranty.serialNumber}
    trailing={
      <Button variant="subtle" size="xs" onClick={() => onOpen(warranty.key)}>
        {t('Open')}
      </Button>
    }
  />
);

/**
 * One warranty in full: how much cover is left, the sale it came from, what it covers, and every
 * step taken on it with who did it. A manager-approved cancel or extension starts here.
 */
export const WarrantyDetailDrawer = ({
  warrantyKey,
  onClose,
  onOpenWarranty,
  onOpenClaim,
}: WarrantyDetailDrawerProps) => {
  const query = useWarranty(warrantyKey);
  const canRecord = useHasPermission(PERMISSIONS.WARRANTY_CLAIMS_RECORD);
  const [tab, setTab] = useState<DetailTab>('overview');
  const [action, setAction] = useState<'void' | 'extend' | null>(null);
  const [printing, setPrinting] = useState(false);
  const [claimWindowOpen, setClaimWindowOpen] = useState(false);
  const [newCoverage, setNewCoverage] = useState<WarrantyCoverage>({
    kind: 'limited',
    value: 2,
    unit: 'years',
  });
  const voidMutation = useVoidWarranty();
  const extendMutation = useExtendWarranty();

  const data: Loaded | null =
    warrantyKey === null
      ? null
      : query.data !== undefined
        ? { kind: 'ready', detail: query.data }
        : query.isError
          ? { kind: 'failed', message: getErrorMessage(query.error) }
          : { kind: 'loading' };

  const closeAction = () => {
    setAction(null);
    voidMutation.reset();
    extendMutation.reset();
  };

  const extendBlocker =
    newCoverage.kind === 'limited' && newCoverage.value < 1
      ? t('Enter how long the warranty lasts, at least 1.')
      : null;

  return (
    <>
      <RichDrawer<Loaded>
        data={data}
        opened={warrantyKey !== null}
        onClose={onClose}
        width="wide"
        closeOnEscape={!claimWindowOpen}
        title={{
          icon: <IconShieldCheck size={20} />,
          text: t('Warranty'),
          subtitle: t('Cover, sale and history'),
        }}
        footer={(loaded) =>
          loaded.kind !== 'ready' ? (
            <DrawerFooter>
              <Button variant="default" onClick={onClose}>
                {t('Close')}
              </Button>
            </DrawerFooter>
          ) : (
            <DrawerFooter
              start={
                canRecord && loaded.detail.warranty.status !== 'void' ? (
                  <Menu position="top-start" withinPortal>
                    <Menu.Target>
                      <Button
                        variant="default"
                        size="sm"
                        rightSection={<IconChevronUp size={14} />}
                      >
                        {t('More')}
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {loaded.detail.warranty.endsOn !== undefined && (
                        <Menu.Item
                          leftSection={<IconShieldPlus size={16} />}
                          onClick={() => setAction('extend')}
                        >
                          {t('Extend the warranty')}
                        </Menu.Item>
                      )}
                      <Menu.Item
                        color="red"
                        leftSection={<IconShieldOff size={16} />}
                        onClick={() => setAction('void')}
                      >
                        {t('Cancel the warranty')}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                ) : undefined
              }
            >
              <Button variant="default" onClick={onClose}>
                {t('Close')}
              </Button>
              <Button
                variant="default"
                leftSection={<IconPrinter size={16} />}
                onClick={() => setPrinting(true)}
                data-log-id="warranties.open-card"
              >
                {t('Print card')}
              </Button>
              <ClaimLauncher
                key={loaded.detail.warranty.key}
                warranty={loaded.detail.warranty}
                compact={false}
                onStarted={(claim) => onOpenClaim(claim.key)}
                onNestedWindowChange={setClaimWindowOpen}
              />
            </DrawerFooter>
          )
        }
      >
        {(loaded) => {
          if (loaded.kind === 'loading') {
            return (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            );
          }
          if (loaded.kind === 'failed') {
            return (
              <Alert color="red" icon={<IconAlertTriangle size={18} />}>
                {loaded.message}
              </Alert>
            );
          }
          const { warranty, events, invoice, replaces, replacedBy, claims } = loaded.detail;
          const look = stateLook(warranty.state);
          const linkedCount = 1 + (replaces === null ? 0 : 1) + (replacedBy === null ? 0 : 1);
          return (
            <DrawerGrid>
              <KpiStrip>
                {warranty.endsOn === undefined ? (
                  <KpiTile
                    icon={<IconShieldCheck size={16} />}
                    color={look.color}
                    label={t('Coverage')}
                  >
                    <Figure
                      value={t('Lifetime')}
                      hint={typeLabel(warranty.warrantyType)}
                      color={look.color}
                    />
                  </KpiTile>
                ) : (
                  <>
                    <KpiTile
                      icon={<IconClockHour4 size={16} />}
                      color={look.color}
                      label={t('Cover left')}
                    >
                      <Figure
                        value={
                          warranty.daysRemaining === undefined
                            ? t('For life')
                            : `${warranty.daysRemaining}`
                        }
                        hint={daysLeftLabel(warranty)}
                        color={look.color}
                      />
                    </KpiTile>
                    <KpiTile
                      icon={<IconCalendarDue size={16} />}
                      color="blue"
                      label={t('Valid until')}
                    >
                      <Figure
                        value={formatDate(warranty.endsOn)}
                        hint={coverageLabel(warranty.coverage)}
                        color="blue"
                      />
                    </KpiTile>
                  </>
                )}
                {warranty.quantity > 1 && (
                  <KpiTile icon={<IconBox size={16} />} color="teal" label={t('Units')}>
                    <Figure
                      value={`${warranty.claimedQuantity ?? 0} / ${warranty.quantity}`}
                      hint={
                        (warranty.claimedQuantity ?? 0) > 0
                          ? `${warranty.claimedQuantity ?? 0} of ${warranty.quantity} ${t('claimed')}`
                          : `${warranty.quantity} ${t('units covered')}`
                      }
                      color="teal"
                    />
                  </KpiTile>
                )}
                <KpiTile icon={<IconActivity size={16} />} color="grape" label={t('Claims')}>
                  <Figure
                    value={String(warranty.claimCount)}
                    hint={warranty.claimCount === 0 ? t('None so far') : t('Opened on it')}
                    color="grape"
                  />
                </KpiTile>
              </KpiStrip>

              <DrawerRail>
                <DrawerHero
                  accent={look.color}
                  icon={<IconShieldCheck size={32} />}
                  eyebrow={warranty.warrantyNumber}
                  status={look}
                  title={warranty.itemName}
                  subtitle={
                    <>
                      {warranty.serialNumber !== undefined && (
                        <div style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
                          {warranty.serialNumber}
                        </div>
                      )}
                      {warranty.quantity > 1 && (
                        <div>
                          {(warranty.claimedQuantity ?? 0) > 0
                            ? `${warranty.claimedQuantity ?? 0} of ${warranty.quantity} ${t('units claimed')} · ${warranty.quantity - (warranty.claimedQuantity ?? 0)} ${t('remaining')}`
                            : `${warranty.quantity} ${t('units covered')}`}
                        </div>
                      )}
                      <div>{typeLabel(warranty.warrantyType)}</div>
                    </>
                  }
                >
                  <PeriodBar warranty={warranty} />
                </DrawerHero>
                <DrawerAfter>
                  <DrawerCard label={t('Sale & Customer')} icon={<IconReceipt size={14} />}>
                    <InfoRow icon={<IconFileInvoice size={14} />} label={t('Invoice')}>
                      <Anchor
                        component="a"
                        href={`/invoices?invoiceKey=${invoice.key}`}
                        size="xs"
                        fw={600}
                      >
                        {invoice.invoiceNumber}
                      </Anchor>
                    </InfoRow>
                    <InfoRow icon={<IconUser size={14} />} label={t('Customer')}>
                      {warranty.customerName === undefined
                        ? t('Walk-in customer')
                        : warranty.customerName}
                    </InfoRow>
                    {warranty.customerPhone !== undefined && (
                      <InfoRow icon={<IconPhone size={14} />} label={t('Phone')}>
                        {warranty.customerPhone}
                      </InfoRow>
                    )}
                  </DrawerCard>
                </DrawerAfter>
              </DrawerRail>

              <DrawerMain>
                {UNPAID.has(invoice.status) && (
                  <Alert
                    color="orange"
                    icon={<IconAlertTriangle size={18} />}
                    title={t('Invoice not fully paid')}
                  >
                    {t('The sale this warranty came from still has money owed on it.')}
                  </Alert>
                )}
                {warranty.state === 'void' && warranty.voidReason !== undefined && (
                  <Alert
                    color="gray"
                    icon={<IconInfoCircle size={18} />}
                    title={t('Why it was cancelled')}
                  >
                    {warranty.voidReason}
                  </Alert>
                )}
                <AnimatedTabs<DetailTab>
                  value={tab}
                  onChange={setTab}
                  tabs={[
                    { value: 'overview', label: t('Overview'), icon: <IconInfoCircle size={14} /> },
                    {
                      value: 'claims',
                      label: t('Claims'),
                      icon: <IconClipboardCheck size={14} />,
                      count: claims.length,
                    },
                    {
                      value: 'activity',
                      label: t('Activity'),
                      icon: <IconActivity size={14} />,
                      count: events.length,
                    },
                    {
                      value: 'linked',
                      label: t('Linked'),
                      icon: <IconLink size={14} />,
                      count: linkedCount,
                    },
                  ]}
                >
                  {(active) =>
                    active === 'overview' ? (
                      <DrawerCard label={t('What it covers')} icon={<IconShieldCheck size={14} />}>
                        <InfoRow icon={<IconClockHour4 size={14} />} label={t('Period')}>
                          {coverageLabel(warranty.coverage)}
                        </InfoRow>
                        <InfoRow icon={<IconShieldCheck size={14} />} label={t('Given by')}>
                          {typeLabel(warranty.warrantyType)}
                        </InfoRow>
                        <InfoRow
                          icon={<IconReceipt size={14} />}
                          label={
                            warranty.quantity > 1 ? t('Price paid (per unit)') : t('Price paid')
                          }
                        >
                          {formatMoney(warranty.unitPriceCents)}
                        </InfoRow>
                        <InfoRow icon={<IconInfoCircle size={14} />} label={t('Terms')} stacked>
                          {warranty.terms === undefined
                            ? t('No extra terms were written for this item.')
                            : warranty.terms}
                        </InfoRow>
                      </DrawerCard>
                    ) : active === 'claims' ? (
                      <DrawerCard label={t('Claims')} icon={<IconClipboardCheck size={14} />}>
                        {claims.length === 0 ? (
                          <Text size="sm" c="dimmed">
                            {t('No claim has been made on this warranty.')}
                          </Text>
                        ) : (
                          claims.map((claim, index) => (
                            <ListRow
                              key={claim.key}
                              index={index}
                              first={index === 0}
                              icon={<IconClipboardCheck size={18} />}
                              title={`${claim.claimNumber} · ${claim.issueDescription}`}
                              meta={`${formatDate(claim.receivedOn)} · ${
                                claim.decision === undefined
                                  ? ageLabel(claim.ageDays)
                                  : decisionLabel(claim.decision)
                              }`}
                              trailing={
                                <Group gap="xs" wrap="nowrap">
                                  <ClaimStatusDot status={claim.status} size="xs" />
                                  <Button
                                    variant="subtle"
                                    size="xs"
                                    onClick={() => onOpenClaim(claim.key)}
                                  >
                                    {t('Open')}
                                  </Button>
                                </Group>
                              }
                            />
                          ))
                        )}
                      </DrawerCard>
                    ) : active === 'activity' ? (
                      <DrawerCard label={t('History')} icon={<IconActivity size={14} />}>
                        {events.map((event, index) => (
                          <ListRow
                            key={event.key}
                            index={index}
                            first={index === 0}
                            icon={<IconActivity size={18} />}
                            title={eventLabel(event.kind)}
                            meta={
                              <>
                                <div>
                                  {formatDateTime(event.createdAt)} · {event.actorName}
                                  {event.approvedByName !== undefined &&
                                    ` · ${t('approved by')} ${event.approvedByName}`}
                                </div>
                                {event.note !== undefined && <div>{event.note}</div>}
                              </>
                            }
                          />
                        ))}
                      </DrawerCard>
                    ) : (
                      <DrawerCard label={t('Linked records')} icon={<IconLink size={14} />}>
                        <ListRow
                          index={0}
                          first
                          icon={<IconFileInvoice size={18} />}
                          title={`${t('Invoice')} ${invoice.invoiceNumber}`}
                          meta={`${formatDate(invoice.createdAt)} · ${formatMoney(invoice.totalCents)}`}
                          trailing={
                            <Group gap="xs" wrap="nowrap">
                              <WarrantyStateDot state={warranty.state} size="xs" />
                              <Button
                                variant="subtle"
                                size="xs"
                                component="a"
                                href={`/invoices?invoiceKey=${invoice.key}`}
                              >
                                {t('Open')}
                              </Button>
                            </Group>
                          }
                        />
                        {replaces !== null && (
                          <WarrantyLinkRow
                            index={1}
                            label={t('Replaced')}
                            warranty={replaces}
                            onOpen={onOpenWarranty}
                          />
                        )}
                        {replacedBy !== null && (
                          <WarrantyLinkRow
                            index={2}
                            label={t('Replaced by')}
                            warranty={replacedBy}
                            onOpen={onOpenWarranty}
                          />
                        )}
                      </DrawerCard>
                    )
                  }
                </AnimatedTabs>
              </DrawerMain>
            </DrawerGrid>
          );
        }}
      </RichDrawer>

      {warrantyKey !== null && (
        <>
          {printing && query.data !== undefined && (
            <WarrantyCardModal warranty={query.data.warranty} onClose={() => setPrinting(false)} />
          )}
          <ManagerApprovalModal
            opened={action === 'void'}
            onClose={closeAction}
            title={t('Cancel this warranty?')}
            description={t(
              'The customer will no longer be covered. This is kept in the history with your reason.'
            )}
            reasonLabel={t('Why is it being cancelled?')}
            confirmLabel={t('Cancel the warranty')}
            confirmColor="red"
            blocker={null}
            loading={voidMutation.isPending}
            error={voidMutation.isError ? getErrorMessage(voidMutation.error) : null}
            onConfirm={(approval) =>
              voidMutation.mutate({ key: warrantyKey, approval }, { onSuccess: closeAction })
            }
          />
          <ManagerApprovalModal
            opened={action === 'extend'}
            onClose={closeAction}
            title={t('Extend this warranty')}
            description={t(
              'Choose the new period. It is counted from the day the warranty started and must end later than now.'
            )}
            reasonLabel={t('Why is it being extended?')}
            confirmLabel={t('Extend the warranty')}
            confirmColor="blue"
            blocker={extendBlocker}
            loading={extendMutation.isPending}
            error={extendMutation.isError ? getErrorMessage(extendMutation.error) : null}
            onConfirm={(approval) =>
              extendMutation.mutate(
                { key: warrantyKey, coverage: newCoverage, approval },
                { onSuccess: closeAction }
              )
            }
          >
            <CoverageEditor value={newCoverage} onChange={setNewCoverage} allowNone={false} />
          </ManagerApprovalModal>
        </>
      )}
    </>
  );
};
