import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Anchor, Button, Center, Loader, Stack, Text } from '@mantine/core';
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconCamera,
  IconClipboardCheck,
  IconClockHour4,
  IconGavel,
  IconPhone,
  IconReceiptRefund,
  IconShieldCheck,
  IconSearch,
  IconTool,
  IconTruckDelivery,
  IconUser,
} from '@tabler/icons-react';
import { ReceiptPhotosModal } from '@/features/attachments/components/ReceiptPhotosModal';
import { PERMISSIONS } from '@/constants/permissions';
import { ROUTES } from '@/constants/routes';
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
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { useClaim } from '../hooks/useClaims';
import { useWarranty } from '../hooks/useWarranties';
import {
  ageLabel,
  claimActions,
  claimStatusLook,
  decisionLabel,
  needsAttention,
  outcomeLabel,
  tickedChecks,
  type ClaimAction,
} from '../lib/claimView';
import type { WarrantyClaim } from '../types';
import { ClaimStepDialog, type DialogAction } from './ClaimStepDialog';
import { ClaimTimeline } from './ClaimTimeline';

const ACTION_LABEL: Record<ClaimAction, string> = {
  inspect: 'Inspect',
  decide: 'Decide',
  sendToSupplier: 'Send to the supplier',
  supplierReturn: 'Back from the supplier',
  resolve: 'Finish the claim',
  refund: 'Give the refund',
  return: 'Give it back',
  paidRepair: 'Make a paid repair job',
  rework: 'Open the rework job',
};

type Loaded =
  | { kind: 'loading' }
  | { kind: 'failed'; message: string }
  | { kind: 'ready'; claim: WarrantyClaim };

export interface ClaimDetailDrawerProps {
  /** The `wcl_` key to show; `null` while closed. */
  claimKey: string | null;
  onClose: () => void;
  /** Shows the claimed warranty instead of this claim. */
  onOpenWarranty: (warrantyKey: string) => void;
}

/**
 * One claim: where it is (timeline), what came in, what was found and decided, the supplier trip
 * and the outcome. The next steps are the footer's buttons; each opens its own window.
 */
export const ClaimDetailDrawer = ({
  claimKey,
  onClose,
  onOpenWarranty,
}: ClaimDetailDrawerProps) => {
  const navigate = useNavigate();
  const query = useClaim(claimKey);
  const claim = query.data;
  const warranty = useWarranty(claim === undefined ? null : claim.warrantyKey);
  const canRecord = useHasPermission(PERMISSIONS.WARRANTY_CLAIMS_RECORD);
  const canRepair = useHasPermission(PERMISSIONS.REPAIRS_WRITE);
  const canSeePhotos = useHasPermission(PERMISSIONS.ATTACHMENTS_VIEW);
  const canAddPhotos = useHasPermission(PERMISSIONS.ATTACHMENTS_CREATE);
  const [dialog, setDialog] = useState<DialogAction | null>(null);
  const [photosOpen, setPhotosOpen] = useState(false);

  const data: Loaded | null =
    claimKey === null
      ? null
      : claim !== undefined
        ? { kind: 'ready', claim }
        : query.isError
          ? { kind: 'failed', message: getErrorMessage(query.error) }
          : { kind: 'loading' };

  const start = (action: ClaimAction, current: WarrantyClaim) => {
    if (action === 'refund') {
      navigate(`${ROUTES.INVOICES}?invoiceKey=${current.invoiceKey}&refundClaim=${current.key}`);
      return;
    }
    setDialog(action);
  };

  // Opening a repair job, paid or rework, also needs `repairs:write`.
  const allowed = (action: ClaimAction) =>
    canRecord && ((action !== 'paidRepair' && action !== 'rework') || canRepair);
  const onRepairWork = warranty.data?.warranty.sourceType === 'repair';

  return (
    <>
      <RichDrawer<Loaded>
        data={data}
        opened={claimKey !== null}
        onClose={onClose}
        width="wide"
        title={{
          icon: <IconClipboardCheck size={20} />,
          text: t('Warranty claim'),
          subtitle: t('What came in, what was decided, what happens next'),
        }}
        footer={(loaded) => {
          if (loaded.kind !== 'ready') {
            return (
              <DrawerFooter>
                <Button variant="default" onClick={onClose}>
                  {t('Close')}
                </Button>
              </DrawerFooter>
            );
          }
          const actions = claimActions(loaded.claim, onRepairWork).filter(allowed);
          return (
            <DrawerFooter
              start={
                canSeePhotos ? (
                  <Button
                    variant="default"
                    leftSection={<IconCamera size={16} />}
                    onClick={() => setPhotosOpen(true)}
                  >
                    {t('Photos')}
                  </Button>
                ) : undefined
              }
            >
              <Button
                variant="default"
                leftSection={<IconShieldCheck size={16} />}
                onClick={() => onOpenWarranty(loaded.claim.warrantyKey)}
              >
                {t('Warranty')}
              </Button>
              {actions.map((action, index) => (
                <Button
                  key={action}
                  variant={index === 0 ? 'filled' : 'default'}
                  onClick={() => start(action, loaded.claim)}
                  disabled={warranty.data === undefined}
                  data-log-id={`warranties.claim.${action}`}
                >
                  {t(ACTION_LABEL[action])}
                </Button>
              ))}
            </DrawerFooter>
          );
        }}
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
          const c = loaded.claim;
          const look = claimStatusLook(c.status);
          const checks = tickedChecks(c.voidChecks);
          const slow = needsAttention(c);
          return (
            <DrawerGrid>
              <KpiStrip>
                <KpiTile
                  icon={<IconClockHour4 size={16} />}
                  color={slow ? 'orange' : 'blue'}
                  label={t('Waiting')}
                >
                  <Figure
                    value={ageLabel(c.ageDays)}
                    hint={`${t('Since')} ${formatDate(c.receivedOn)}`}
                    color={slow ? 'orange' : 'blue'}
                  />
                </KpiTile>
                <KpiTile icon={<IconGavel size={16} />} color="grape" label={t('Decision')}>
                  <Figure
                    value={c.decision === undefined ? t('Not yet') : decisionLabel(c.decision)}
                    hint={
                      c.decidedByName === undefined
                        ? t('A manager decides')
                        : `${t('By')} ${c.decidedByName}`
                    }
                    color="grape"
                  />
                </KpiTile>
                <KpiTile icon={<IconTool size={16} />} color="teal" label={t('Technician')}>
                  <Figure
                    value={
                      c.assignedEmployeeName === undefined
                        ? t('Nobody yet')
                        : c.assignedEmployeeName
                    }
                    hint={t('Looking at it')}
                    color="teal"
                  />
                </KpiTile>
              </KpiStrip>

              <DrawerRail>
                <DrawerHero
                  accent={look.color}
                  icon={<IconClipboardCheck size={32} />}
                  eyebrow={c.claimNumber}
                  status={look}
                  title={c.itemName}
                  subtitle={
                    <>
                      {c.serialNumber !== undefined && (
                        <div style={{ fontFamily: 'var(--mantine-font-family-monospace)' }}>
                          {c.serialNumber}
                        </div>
                      )}
                      <div>
                        {c.warrantyNumber} · {c.invoiceNumber}
                      </div>
                    </>
                  }
                />
                <DrawerAfter>
                  <DrawerCard label={t('Customer')} icon={<IconUser size={14} />}>
                    <InfoRow icon={<IconUser size={14} />} label={t('Name')}>
                      {c.customerName === undefined ? t('Walk-in customer') : c.customerName}
                    </InfoRow>
                    {c.customerPhone !== undefined && (
                      <InfoRow icon={<IconPhone size={14} />} label={t('Phone')}>
                        {c.customerPhone}
                      </InfoRow>
                    )}
                  </DrawerCard>
                </DrawerAfter>
              </DrawerRail>

              <DrawerMain>
                {c.supplierOverdue && c.supplier !== undefined && (
                  <Alert
                    color="orange"
                    icon={<IconAlertTriangle size={18} />}
                    title={t('The supplier is late')}
                  >
                    {`${c.supplier.supplierName} ${t('said it would be back on')} ${formatDate(
                      c.supplier.expectedBackOn as string
                    )}.`}
                  </Alert>
                )}
                <DrawerCard label={t('Progress')} icon={<IconClockHour4 size={14} />}>
                  <ClaimTimeline claim={c} />
                </DrawerCard>

                <DrawerCard label={t('What came in')} icon={<IconSearch size={14} />}>
                  <Stack gap="xs">
                    <InfoRow icon={<IconAlertTriangle size={14} />} label={t('The fault')} stacked>
                      {c.issueDescription}
                    </InfoRow>
                    <InfoRow icon={<IconSearch size={14} />} label={t('Seen on it')} stacked>
                      {checks.length === 0 ? t('Nothing; it looked fine') : checks.join(' · ')}
                    </InfoRow>
                    {c.inspectionNotes !== undefined && (
                      <InfoRow
                        icon={<IconTool size={14} />}
                        label={t('Found when inspected')}
                        stacked
                      >
                        {c.inspectionNotes}
                      </InfoRow>
                    )}
                  </Stack>
                </DrawerCard>

                {(c.decision !== undefined || c.expiredOverrideByName !== undefined) && (
                  <DrawerCard label={t('Decision')} icon={<IconGavel size={14} />}>
                    <Stack gap="xs">
                      {c.expiredOverrideByName !== undefined && (
                        <InfoRow
                          icon={<IconShieldCheck size={14} />}
                          label={t('Ended warranty accepted by')}
                        >
                          {c.expiredOverrideByName}
                        </InfoRow>
                      )}
                      {c.decision !== undefined && (
                        <InfoRow icon={<IconGavel size={14} />} label={t('Decided')}>
                          {decisionLabel(c.decision)}
                        </InfoRow>
                      )}
                      {c.decisionReason !== undefined && (
                        <InfoRow icon={<IconGavel size={14} />} label={t('Why')} stacked>
                          {c.decisionReason}
                        </InfoRow>
                      )}
                    </Stack>
                  </DrawerCard>
                )}

                {c.supplier !== undefined && (
                  <DrawerCard label={t('Supplier')} icon={<IconTruckDelivery size={14} />}>
                    <Stack gap="xs">
                      <InfoRow icon={<IconBuildingStore size={14} />} label={t('Sent to')}>
                        {c.supplier.supplierName}
                      </InfoRow>
                      <InfoRow icon={<IconTruckDelivery size={14} />} label={t('Sent on')}>
                        {formatDate(c.supplier.sentOn)}
                      </InfoRow>
                      {c.supplier.reference !== undefined && (
                        <InfoRow
                          icon={<IconClipboardCheck size={14} />}
                          label={t('Their number')}
                          mono
                        >
                          {c.supplier.reference}
                        </InfoRow>
                      )}
                      {c.supplier.expectedBackOn !== undefined && (
                        <InfoRow icon={<IconClockHour4 size={14} />} label={t('Expected back')}>
                          {formatDate(c.supplier.expectedBackOn)}
                        </InfoRow>
                      )}
                      {c.supplier.receivedBackOn !== undefined && (
                        <InfoRow icon={<IconTruckDelivery size={14} />} label={t('Came back')}>
                          {formatDate(c.supplier.receivedBackOn)}
                        </InfoRow>
                      )}
                      {c.supplier.outcome !== undefined && (
                        <InfoRow icon={<IconTool size={14} />} label={t('What they did')}>
                          {outcomeLabel(c.supplier.outcome)}
                        </InfoRow>
                      )}
                      {c.supplier.note !== undefined && (
                        <InfoRow icon={<IconClipboardCheck size={14} />} label={t('Note')} stacked>
                          {c.supplier.note}
                        </InfoRow>
                      )}
                    </Stack>
                  </DrawerCard>
                )}

                {(c.resolutionNote !== undefined ||
                  c.replacementSerialNumber !== undefined ||
                  c.creditNoteKey !== undefined ||
                  c.paidRepairNumber !== undefined ||
                  c.reworkRepairNumber !== undefined) && (
                  <DrawerCard label={t('Outcome')} icon={<IconReceiptRefund size={14} />}>
                    <Stack gap="xs">
                      {c.replacementSerialNumber !== undefined && (
                        <InfoRow icon={<IconShieldCheck size={14} />} label={t('New unit')} mono>
                          {c.replacementSerialNumber}
                        </InfoRow>
                      )}
                      {c.creditNoteKey !== undefined && (
                        <InfoRow icon={<IconReceiptRefund size={14} />} label={t('Refund')}>
                          {t('Given with a credit note')}
                        </InfoRow>
                      )}
                      {c.reworkRepairKey !== undefined && c.reworkRepairNumber !== undefined && (
                        <InfoRow icon={<IconTool size={14} />} label={t('Rework job')} mono>
                          <Anchor
                            component="button"
                            type="button"
                            size="sm"
                            ff="monospace"
                            onClick={() =>
                              navigate(`${ROUTES.REPAIRS}?jobKey=${c.reworkRepairKey}`)
                            }
                          >
                            {c.reworkRepairNumber}
                          </Anchor>
                        </InfoRow>
                      )}
                      {c.paidRepairNumber !== undefined && (
                        <InfoRow icon={<IconTool size={14} />} label={t('Paid repair job')} mono>
                          {c.paidRepairNumber}
                        </InfoRow>
                      )}
                      {c.resolutionNote !== undefined && (
                        <InfoRow icon={<IconClipboardCheck size={14} />} label={t('Note')} stacked>
                          {c.resolutionNote}
                        </InfoRow>
                      )}
                    </Stack>
                  </DrawerCard>
                )}
                {c.status === 'returned' && (
                  <Text size="xs" c="dimmed" ta="center">
                    {`${t('Given back on')} ${formatDate(c.returnedOn as string)}`}
                  </Text>
                )}
              </DrawerMain>
            </DrawerGrid>
          );
        }}
      </RichDrawer>

      {claim !== undefined && dialog !== null && warranty.data !== undefined && (
        <ClaimStepDialog
          claim={claim}
          action={dialog}
          warrantyEndsOn={warranty.data.warranty.endsOn}
          onClose={() => setDialog(null)}
        />
      )}
      {claim !== undefined && photosOpen && (
        <ReceiptPhotosModal
          ownerKind="warranty_claim"
          ownerKey={claim.key}
          title={`${t('Photos')} — ${claim.claimNumber}`}
          emptyText={t('No photos of this item yet. Take some when it comes in.')}
          canAdd={canAddPhotos && canRecord}
          onClose={() => setPhotosOpen(false)}
        />
      )}
    </>
  );
};
