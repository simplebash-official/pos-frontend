import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconCircleCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useCanSelfApprove } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { useOpenClaimsBatch } from '../hooks/useClaims';
import {
  batchHasProblem,
  batchItemFields,
  batchItemProblem,
  emptyBatchItem,
  needsApproval,
  sharingWarranties,
  storySummary,
  type BatchItemState,
} from '../lib/batchClaim';
import { damageProblem, emptyStory, issueProblem, type Story } from '../lib/claimIntake';
import { validUntil } from '../lib/warrantyView';
import type { ManagerApproval, Warranty, WarrantyClaim } from '../types';
import { ConditionsField, IssueField, UnitsFields } from './ClaimIntakeFields';
import { ManagerApprovalModal } from './ManagerApprovalModal';
import { ModalFooter } from './ModalFooter';
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
  const theme = useMantineTheme();
  const selfApproves = useCanSelfApprove();
  const navigate = useNavigate();
  const send = useOpenClaimsBatch();
  const [pending, setPending] = useState<Warranty[]>(warranties);
  const [shared, setShared] = useState<Story>(emptyStory());
  const [items, setItems] = useState<Record<string, BatchItemState>>(() =>
    Object.fromEntries(warranties.map((w) => [w.key, emptyBatchItem(w)]))
  );
  const [opened, setOpened] = useState<WarrantyClaim[]>([]);
  const [failures, setFailures] = useState<Record<string, string>>({});
  const [tried, setTried] = useState(false);
  const startedRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

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

  const isBusy = send.isPending;
  const approvalNeeded = pending.some(needsApproval);
  const sharing = sharingWarranties(pending, items);
  const single = pending.length === 1;
  const someOwn = sharing.length < pending.length;
  const incomplete = tried
    ? pending.filter((w) => batchItemProblem(items[w.key], shared) !== null).length
    : 0;
  const error = send.isError
    ? getErrorMessage(send.error)
    : incomplete > 0
      ? `${incomplete} ${incomplete === 1 ? t('item needs details') : t('items need details')}`
      : null;

  // Take the person to the first thing still missing instead of leaving them to hunt for it.
  const showFirstProblem = () =>
    requestAnimationFrame(() => {
      const field = bodyRef.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"], [data-invalid="true"]'
      );
      const target = field?.matches('input, textarea, button')
        ? field
        : field?.querySelector<HTMLElement>('button');
      target?.scrollIntoView({ block: 'center' });
      target?.focus({ preventScroll: true });
    });

  const submit = (approval: ManagerApproval | undefined) => {
    setTried(true);
    if (batchHasProblem(pending, items, shared)) {
      showFirstProblem();
      return;
    }
    const sent = pending;
    send.mutate(
      { items: sent.map((w) => batchItemFields(w, items[w.key], shared)), approval },
      {
        onSuccess: (response) => {
          const started: WarrantyClaim[] = [];
          const reasons: Record<string, string> = {};
          for (const result of response.results) {
            if (result.outcome === 'opened') {
              started.push(result.claim);
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
    <Stack gap="md" ref={bodyRef}>
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

      {sharing.length > 0 && (
        <Stack gap="xs">
          {someOwn && (
            <Group gap={6} align="center">
              <Text size="xs" c="dimmed">
                {t('Applies to:')}
              </Text>
              {sharing.map((warranty) => (
                <Badge key={warranty.key} variant="light" tt="none" fw={600}>
                  {warranty.itemName}
                </Badge>
              ))}
            </Group>
          )}
          <IssueField
            label={
              single
                ? t('What is wrong with it?')
                : someOwn
                  ? t('What is wrong with the other items?')
                  : t('What is wrong with these items?')
            }
            value={shared}
            onChange={setShared}
            error={tried ? issueProblem(shared) : null}
            autoFocus
          />
          <ConditionsField
            value={shared}
            onChange={setShared}
            error={tried ? damageProblem(shared) : null}
          />
        </Stack>
      )}

      <Stack gap="sm">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
          {`${t('Items')} (${pending.length})`}
        </Text>
        {pending.map((warranty) => {
          const item = items[warranty.key];
          const own = item.own;
          const failure = warranty.key in failures ? failures[warranty.key] : null;
          const summary = storySummary(shared);
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
                        {selfApproves
                          ? t('Warranty ended')
                          : t('Ended. A manager or owner must accept it.')}
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

                {!single && (
                  <SegmentedControl
                    fullWidth
                    radius="md"
                    color={theme.primaryColor}
                    size={isMobile ? 'md' : 'sm'}
                    styles={{ label: { fontWeight: 600 } }}
                    value={own === null ? 'shared' : 'own'}
                    onChange={(choice) =>
                      setItem(warranty.key, {
                        ...item,
                        own: choice === 'own' ? emptyStory() : null,
                      })
                    }
                    data={[
                      { value: 'shared', label: t('Same as above') },
                      { value: 'own', label: t('Different problem') },
                    ]}
                  />
                )}
                {own === null && !single && (
                  <Group gap={6} wrap="nowrap" align="flex-start">
                    {summary !== null ? (
                      <IconCircleCheck
                        size={16}
                        color="var(--mantine-color-teal-filled)"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                    ) : tried ? (
                      <IconAlertCircle
                        size={16}
                        color="var(--mantine-color-red-filled)"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      />
                    ) : null}
                    <Text size="sm" c={summary === null && tried ? 'red' : 'dimmed'} lineClamp={2}>
                      {summary ??
                        (tried ? t('Not filled in yet') : t('Uses the description above'))}
                    </Text>
                  </Group>
                )}
                {own !== null && (
                  <Stack
                    gap="md"
                    pl="sm"
                    style={{
                      borderInlineStart: '3px solid var(--mantine-primary-color-filled)',
                    }}
                  >
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
        description={
          selfApproves
            ? t('Some of these warranties have ended.')
            : `${t('Some of these warranties have ended.')} ${t(
                'A manager or owner can still accept their claims as a goodwill gesture.'
              )}`
        }
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
          <ModalFooter note={error}>
            <Button variant="default" onClick={close} disabled={isBusy}>
              {opened.length > 0 ? t('Close') : t('Cancel')}
            </Button>
            <Button type="submit" loading={isBusy} data-log-id="warranties.start-claims-batch">
              {startLabel}
            </Button>
          </ModalFooter>
        </Stack>
      </form>
    </Modal>
  );
};
