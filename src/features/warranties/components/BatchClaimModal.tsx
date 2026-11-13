import { useEffect, useRef, useState } from 'react';
import { Alert, Anchor, Button, Group, Modal, Paper, Stack, Switch, Text } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { useUploadClaimPhotos } from '../hooks/useClaimPhotos';
import { useOpenClaimsBatch } from '../hooks/useClaims';
import {
  batchHasProblem,
  batchItemFields,
  emptyBatchItem,
  needsApproval,
  type BatchItemState,
} from '../lib/batchClaim';
import { damageProblem, emptyIntake, issueProblem, type IntakeState } from '../lib/claimIntake';
import { validUntil } from '../lib/warrantyView';
import type { ManagerApproval, Warranty, WarrantyClaim } from '../types';
import { ConditionsField, IssueField, PhotosField, UnitsFields } from './ClaimIntakeFields';
import { ManagerApprovalModal } from './ManagerApprovalModal';
import { WarrantyStateDot } from './WarrantyStateDot';

export interface BatchClaimModalProps {
  /** The warranties to claim, all from one invoice. */
  warranties: Warranty[];
  onClose: () => void;
  /** Told which warranties now have a claim, so the screen behind can stop offering them. */
  onOpened: (warrantyKeys: string[]) => void;
}

/**
 * Starts a claim on each of several warranties of one invoice in one go: what is wrong is written
 * once and every item can have its own note instead. Each warranty answers on its own, so when
 * some fail the window stays open with only those, each with its reason, ready to try again.
 * Warranties that have ended need a manager or owner, once for the whole batch.
 */
export const BatchClaimModal = ({ warranties, onClose, onOpened }: BatchClaimModalProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const send = useOpenClaimsBatch();
  const photos = useUploadClaimPhotos();
  const [pending, setPending] = useState<Warranty[]>(warranties);
  const [shared, setShared] = useState<IntakeState>(emptyIntake(null));
  const [items, setItems] = useState<Record<string, BatchItemState>>(() =>
    Object.fromEntries(warranties.map((w) => [w.key, emptyBatchItem(w)]))
  );
  const [opened, setOpened] = useState<WarrantyClaim[]>([]);
  const [failures, setFailures] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);
  const startedRef = useRef<HTMLDivElement>(null);

  // The window keeps its scroll position when only the failed items are left, so bring the
  // list of claims that did start back into view.
  useEffect(() => {
    if (opened.length > 0) startedRef.current?.scrollIntoView({ block: 'start' });
  }, [opened.length]);

  const close = () => {
    send.reset();
    onClose();
  };

  const setItem = (key: string, next: BatchItemState) =>
    setItems((previous) => ({ ...previous, [key]: next }));

  const isBusy = send.isPending || photos.uploading;
  const approvalNeeded = pending.some(needsApproval);
  const sharedNeeded = pending.some((w) => items[w.key].own === null);
  const missing = batchHasProblem(pending, items, shared);
  const error = send.isError
    ? getErrorMessage(send.error)
    : tried && missing
      ? t('Some details are missing. Check the items marked in red.')
      : null;

  const submit = (approval: ManagerApproval | undefined) => {
    setTried(true);
    if (missing) return;
    const sent = pending;
    send.mutate(
      { items: sent.map((w) => batchItemFields(w, items[w.key], shared)), approval },
      {
        onSuccess: async (response) => {
          const started: WarrantyClaim[] = [];
          const reasons: Record<string, string> = {};
          for (const result of response.results) {
            if (result.outcome === 'opened') {
              started.push(result.claim);
              const own = items[result.warrantyKey].own;
              if (own !== null) await photos.upload(result.claim.key, own.photos);
            } else {
              reasons[result.warrantyKey] = result.error.message;
            }
          }
          const startedKeys = response.results.flatMap((result) =>
            result.outcome === 'opened' ? [result.warrantyKey] : []
          );
          onOpened(startedKeys);
          if (response.failedCount === 0) {
            close();
            return;
          }
          setOpened((previous) => [...previous, ...started]);
          setFailures(reasons);
          setPending(sent.filter((w) => !startedKeys.includes(w.key)));
        },
      }
    );
  };

  const first = pending[0];
  const startLabel =
    opened.length > 0
      ? `${t('Try again')} (${pending.length})`
      : pending.length === 1
        ? t('Start the claim')
        : `${t('Start claims')} (${pending.length})`;

  const body = (
    <Stack gap="md">
      {opened.length > 0 && (
        <Alert
          ref={startedRef}
          color="teal"
          // Keeps the list below the window's own title bar when it is scrolled into view.
          style={{ scrollMarginTop: 72 }}
          icon={<IconCheck size={16} />}
          title={t('Claims started')}
        >
          <Stack gap={4}>
            {opened.map((claim) => (
              <Group key={claim.key} justify="space-between" gap="xs" wrap="nowrap">
                <Text size="sm" style={{ minWidth: 0 }} lineClamp={1}>
                  {`${claim.claimNumber} · ${claim.itemName}`}
                </Text>
                <Anchor
                  component="button"
                  type="button"
                  size="sm"
                  onClick={() => navigate(`${ROUTES.WARRANTIES}?view=claims&claim=${claim.key}`)}
                >
                  {t('Open claim')}
                </Anchor>
              </Group>
            ))}
          </Stack>
        </Alert>
      )}

      <Paper withBorder p="sm" bg="var(--bg-app)">
        <Text fw={700}>{first.invoiceNumber}</Text>
        <Text size="xs" c="dimmed">
          {first.customerName === undefined ? t('Walk-in customer') : first.customerName}
        </Text>
      </Paper>

      <IssueField
        label={t('What is wrong with these items?')}
        value={shared}
        onChange={setShared}
        error={tried && sharedNeeded ? issueProblem(shared) : null}
        autoFocus
      />
      <ConditionsField
        value={shared}
        onChange={setShared}
        error={tried && sharedNeeded ? damageProblem(shared) : null}
      />

      <Stack gap="sm">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
          {`${t('Items')} (${pending.length})`}
        </Text>
        {pending.map((warranty) => {
          const item = items[warranty.key];
          const own = item.own;
          const failure = warranty.key in failures ? failures[warranty.key] : null;
          return (
            <Paper key={warranty.key} withBorder p="sm">
              <Stack gap="sm">
                <Group justify="space-between" wrap="nowrap" align="flex-start" gap="sm">
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Text fw={600} lineClamp={2}>
                      {warranty.itemName}
                    </Text>
                    <Text size="xs" c="dimmed" ff="monospace" style={{ overflowWrap: 'anywhere' }}>
                      {warranty.serialNumber === undefined
                        ? warranty.warrantyNumber
                        : `${warranty.serialNumber} · ${warranty.warrantyNumber}`}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {validUntil(warranty)}
                    </Text>
                    {needsApproval(warranty) && (
                      <Text size="xs" c="orange" fw={600}>
                        {t('Ended. A manager or owner must accept it.')}
                      </Text>
                    )}
                  </Stack>
                  <WarrantyStateDot state={warranty.state} size="xs" />
                </Group>

                <UnitsFields
                  warranty={warranty}
                  quantity={item.quantity}
                  serialNumber={item.serialNumber}
                  onChange={(units) => setItem(warranty.key, { ...item, ...units })}
                />

                <Switch
                  label={t('Different problem for this item')}
                  size={isMobile ? 'md' : 'sm'}
                  checked={own !== null}
                  onChange={(event) =>
                    setItem(warranty.key, {
                      ...item,
                      own: event.currentTarget.checked ? emptyIntake(warranty) : null,
                    })
                  }
                />
                {own !== null && (
                  <Stack gap="md">
                    <IssueField
                      label={t('What is wrong with this item?')}
                      value={own}
                      onChange={(next) => setItem(warranty.key, { ...item, own: next })}
                      error={tried ? issueProblem(own) : null}
                      autoFocus={false}
                    />
                    <ConditionsField
                      value={own}
                      onChange={(next) => setItem(warranty.key, { ...item, own: next })}
                      error={tried ? damageProblem(own) : null}
                    />
                    <PhotosField
                      value={own}
                      onChange={(next) => setItem(warranty.key, { ...item, own: next })}
                    />
                  </Stack>
                )}

                {failure !== null && (
                  <Text size="sm" c="red" role="alert">
                    {failure}
                  </Text>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );

  if (approvalNeeded) {
    return (
      <ManagerApprovalModal
        opened
        onClose={close}
        title={t('Start warranty claims')}
        description={`${t('Some of these warranties have ended.')} ${t(
          'A manager or owner can still accept their claims as a goodwill gesture.'
        )}`}
        reasonLabel={t('Why are they being accepted?')}
        confirmLabel={startLabel}
        confirmColor="blue"
        blocker={null}
        loading={isBusy}
        error={error}
        onConfirm={(approval) => submit(approval)}
      >
        {body}
      </ManagerApprovalModal>
    );
  }

  return (
    <Modal
      opened
      onClose={close}
      title={
        <Text fw={700} size="lg">
          {t('Start warranty claims')}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
      zIndex={400}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          // See ManagerApprovalModal: a submit here must not reach a form around the opener.
          event.stopPropagation();
          submit(undefined);
        }}
      >
        <Stack gap="md">
          {body}
          {error !== null && (
            <Text size="sm" c="red" role="alert">
              {error}
            </Text>
          )}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={close} disabled={isBusy}>
              {opened.length > 0 ? t('Close') : t('Cancel')}
            </Button>
            <Button type="submit" loading={isBusy} data-log-id="warranties.start-claims-batch">
              {startLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
