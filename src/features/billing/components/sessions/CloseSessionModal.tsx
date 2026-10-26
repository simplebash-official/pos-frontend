import React, { useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowLeft,
  IconBuildingBank,
  IconCheck,
  IconCoins,
  IconLock,
  IconPlayerTrackNext,
} from '@tabler/icons-react';
import {
  useCancelClose,
  useCloseSession,
  useConvertVariance,
  useSubmitBlindCount,
  useVerifyPin,
} from '../../hooks/useRegisterSession';
import { useHeldCarts } from '../../hooks/useCart';
import { DenominationCounter } from './DenominationCounter';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { CountMethodToggle } from './CountMethodToggle';
import { StepProgress } from './StepProgress';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { StepSwitch } from '@/shared/motion';
import { useQueryClient } from '@tanstack/react-query';
import { useCalc } from '@/shared/hooks/useCalc';
import { calcShiftCount } from '../../api/calcApi';
import { getSession } from '../../api/sessionsApi';
import { useCashCount } from '../../hooks/useCashCount';
import type { CalcShiftCountReply, RegisterSession } from '../../types';

/** The close figures of the server's answer, once it has them all (it always does for a shift being closed). */
const closeFigures = (reply: CalcShiftCountReply | undefined) =>
  reply !== undefined &&
  reply.closingFloatCents !== null &&
  reply.keepOpeningFloatCents !== null &&
  reply.safeDepositCents !== null
    ? {
        countedCents: reply.countedCents,
        expectedCents: reply.expectedCents,
        varianceCents: reply.varianceCents,
        reasonRequired: reply.reasonRequired,
        pinRequired: reply.pinRequired,
        varianceToleranceCents: reply.varianceToleranceCents,
        closingFloatCents: reply.closingFloatCents,
        keepOpeningFloatCents: reply.keepOpeningFloatCents,
        safeDepositCents: reply.safeDepositCents,
      }
    : undefined;

interface CloseSessionFormProps {
  session: RegisterSession;
  onClose: () => void;
  // Walking away without closing: the Cancel button, as opposed to `onClose` after a real close.
  onDismiss: () => void;
  onCountSubmitted: () => void;
  onSessionClosed?: (closedSession: RegisterSession) => void;
}

const CloseSessionForm: React.FC<CloseSessionFormProps> = ({
  session: initialSession,
  onClose,
  onDismiss,
  onCountSubmitted,
  onSessionClosed,
}) => {
  const { heldCarts } = useHeldCarts();
  const submitBlindCountMutation = useSubmitBlindCount();
  const closeSessionMutation = useCloseSession();
  const convertVarianceMutation = useConvertVariance();
  const verifyPinMutation = useVerifyPin();

  // A session already counted ("closing") picks up at Reconcile with the figure it recorded.
  const [activeStep, setActiveStep] = useState(initialSession.status === 'closing' ? 2 : 0);
  const [session, setSession] = useState<RegisterSession>(initialSession);

  // Step 2: Blind Count
  const [countMode, setCountMode] = useState<'total' | 'denominations'>('total');
  const [typedCountedCents, setTypedCountedCents] = useState(0);
  const [denominations, setDenominations] = useState<Record<string, number>>({});

  // Step 3: Variance & Approval
  const [varianceReason, setVarianceReason] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [verifiedManager, setVerifiedManager] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  // Late Owner Withdrawal conversion
  const [showConvertVariance, setShowConvertVariance] = useState(false);
  const [withdrawalRecipient, setWithdrawalRecipient] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');

  // Step 4: Next Shift Float & Deposit
  // The float the person chose; until they do the server suggests keeping the opening float.
  const [closingFloatChoice, setClosingFloatChoice] = useState<number | null>(null);
  const [closingNote, setClosingNote] = useState('');

  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const denominationCount = useCashCount(denominations);
  // The count being entered: what was typed, or the server's total for the notes and coins. `null`
  // until that total is for the counts as they stand now.
  const enteredCents =
    countMode === 'total'
      ? typedCountedCents
      : denominationCount.isCurrent && denominationCount.data
        ? denominationCount.data.totalCents
        : null;

  // Once the count is recorded the server compares it with the drawer and works out the variance,
  // whether a reason or PIN is needed, and the float and safe deposit.
  const recordedCount = session.countedCashCents;
  const shift = useCalc(
    'shift-count',
    {
      sessionKey: session.key,
      terminalId: null,
      // Unused until a count is recorded: the request is not sent before then.
      countedCents: recordedCount === undefined ? 0 : recordedCount,
      closingFloatCents: closingFloatChoice,
    },
    calcShiftCount,
    recordedCount !== undefined
  );
  const figures = closeFigures(shift.data);

  const handleVerifyPin = async () => {
    if (!managerPin.trim()) {
      setPinError(t('Please enter a Manager PIN'));
      return;
    }
    try {
      const res = await verifyPinMutation.mutateAsync({
        pin: managerPin,
        requiredRole: 'manager',
      });
      if (res.valid) {
        setVerifiedManager(res.userName ?? t('Manager'));
        setPinError(null);
      } else {
        setPinError(t('Invalid PIN or insufficient role permissions'));
        setVerifiedManager(null);
      }
    } catch {
      setPinError(t('Invalid PIN or insufficient role permissions'));
      setVerifiedManager(null);
    }
  };

  const handleSubmitBlindCount = async () => {
    setError(null);
    if (enteredCents === null) return;
    try {
      const updated = await submitBlindCountMutation.mutateAsync({
        key: session.key,
        input: {
          countedCashCents: enteredCents,
          closingDenominations: countMode === 'denominations' ? denominations : undefined,
        },
      });
      setSession(updated);
      onCountSubmitted();
      setClosingFloatChoice(null);
      setActiveStep(2); // Move to reconciliation step
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : t('Failed to submit blind count');
      setError(message);
    }
  };

  const handleConvertVariance = async () => {
    setError(null);
    if (!withdrawalRecipient.trim()) {
      setError(t('Recipient is required to convert variance to owner withdrawal.'));
      return;
    }
    if (!withdrawalReason.trim()) {
      setError(t('Reason is required for owner withdrawal.'));
      return;
    }
    if (!managerPin.trim()) {
      setError(t('Manager PIN is required.'));
      return;
    }

    try {
      await convertVarianceMutation.mutateAsync({
        key: session.key,
        input: {
          recipient: withdrawalRecipient.trim(),
          reason: withdrawalReason.trim(),
          managerPin: managerPin.trim(),
        },
      });

      notifications.show({
        title: t('Variance Converted'),
        message: t('Late owner withdrawal recorded. Variance has been cleared.'),
        color: 'teal',
      });

      // The shift now holds the withdrawal; ask the server for it and for the figures again.
      setSession(await getSession(session.key));
      await queryClient.invalidateQueries({ queryKey: ['calc', 'shift-count'] });
      setShowConvertVariance(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : t('Failed to convert variance');
      setError(message);
    }
  };

  const handleFinalClose = async () => {
    setError(null);

    if (figures === undefined || !shift.isCurrent) {
      setError(t('Working out the figures...'));
      return;
    }
    if (figures.reasonRequired) {
      if (!varianceReason.trim()) {
        setError(t('Please provide an explanation for the cash variance.'));
        return;
      }
      if (figures.pinRequired && !managerPin.trim()) {
        setError(t('Manager PIN authorization is required for variance exceeding tolerance.'));
        return;
      }
    }

    try {
      const closed = await closeSessionMutation.mutateAsync({
        key: session.key,
        input: {
          countedCashCents: figures.countedCents,
          closingDenominations: countMode === 'denominations' ? denominations : undefined,
          closingFloatCents: figures.closingFloatCents,
          cashDropToSafeCents: figures.safeDepositCents,
          closingNote: closingNote.trim() || undefined,
          varianceReason: figures.reasonRequired ? varianceReason.trim() : undefined,
          managerPin: figures.pinRequired ? managerPin.trim() : undefined,
        },
      });

      notifications.show({
        title: t('Shift Closed'),
        message: `${t('Session')} ${closed.sessionNumber} ${t('closed and locked.')}`,
        color: 'teal',
      });

      onSessionClosed?.(closed);
      onClose();
    } catch (err: unknown) {
      // The server words this one in raw cents; say it in plain words instead.
      const needsReason =
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'VARIANCE_APPROVAL_REQUIRED';
      const message = needsReason
        ? t('Please provide an explanation for the cash variance.')
        : err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : t('Failed to close session');
      setError(message);
    }
  };

  const waiting = (
    <Text size="sm" c="dimmed">
      {shift.error === null
        ? t('Working out the figures...')
        : t('Could not work out the figures. Check the connection and try again.')}
    </Text>
  );

  return (
    <Stack gap="md">
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" title={t('Error')}>
          {error}
        </Alert>
      )}

      <StepProgress
        active={activeStep}
        onBack={setActiveStep}
        steps={[
          { label: t('Check Work'), description: t('Pending sales') },
          { label: t('Blind Count'), description: t('Count cash') },
          { label: t('Reconcile'), description: t('Variance check') },
          { label: t('Float & Lock'), description: t('Next shift') },
        ]}
      />

      <StepSwitch step={activeStep}>
        {/* Step 1: Unfinished Work */}
        {activeStep === 0 && (
          <Stack gap="md">
            {heldCarts.length > 0 ? (
              <Alert
                icon={<IconAlertTriangle size={20} />}
                color="yellow"
                variant="light"
                title={t('Unfinished Held Sales Warning')}
              >
                <Text size="sm">
                  {t('There are')} <strong>{heldCarts.length}</strong>{' '}
                  {t('held / parked sales waiting in the register.')}{' '}
                  {t('Staff should complete or discard them before ending the shift.')}
                </Text>
              </Alert>
            ) : (
              <Alert
                icon={<IconCheck size={20} />}
                color="teal"
                variant="light"
                title={t('No Unfinished Work')}
              >
                {t('All sales are completed. The register is ready for closing count.')}
              </Alert>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={onDismiss}>
                {t('Cancel')}
              </Button>
              <Button
                color="blue"
                rightSection={<IconPlayerTrackNext size={16} />}
                onClick={() => setActiveStep(1)}
              >
                {t('Proceed to Cash Count')}
              </Button>
            </Group>
          </Stack>
        )}

        {/* Step 2: Blind Count */}
        {activeStep === 1 && (
          <Stack gap="md">
            <Alert
              icon={<IconCoins size={20} />}
              color="blue"
              variant="light"
              title={t('Blind Count Protocol')}
            >
              <Text size="sm">
                {t('Count all physical cash present in the drawer.')}{' '}
                {t(
                  'To ensure accurate reconciliation, expected figures are hidden until count is recorded.'
                )}
              </Text>
            </Alert>

            <CountMethodToggle
              label={t('Count Method')}
              value={countMode}
              onChange={setCountMode}
            />

            {countMode === 'total' ? (
              <MoneyInput
                label={t('Total Cash Counted')}
                description={t('Enter the exact cash amount in drawer.')}
                valueCents={typedCountedCents}
                onChangeCents={setTypedCountedCents}
                size="md"
                autoFocus
              />
            ) : (
              <DenominationCounter
                counts={denominations}
                onChange={setDenominations}
                count={denominationCount}
              />
            )}

            <Group justify="space-between" mt="md">
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => setActiveStep(0)}
              >
                {t('Back')}
              </Button>
              <Button
                color="blue"
                loading={submitBlindCountMutation.isPending}
                onClick={handleSubmitBlindCount}
                disabled={enteredCents === null}
              >
                {t('Submit Count & Calculate')}
              </Button>
            </Group>
          </Stack>
        )}

        {/* Step 3: Reconciliation & Variance */}
        {activeStep === 2 && figures === undefined && waiting}
        {activeStep === 2 && figures !== undefined && (
          <Stack gap="md">
            <Card withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  {t('Cash Drawer Reconciliation')}
                </Text>

                <Group justify="space-between">
                  <Text size="sm">{t('Opening Float:')}</Text>
                  <Text size="sm">{formatMoney(session.openingFloatCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Cash Sales:')}</Text>
                  <Text size="sm">+{formatMoney(session.totalCashSalesCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Pay-Ins:')}</Text>
                  <Text size="sm">+{formatMoney(session.totalPayInCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Pay-Outs:')}</Text>
                  <Text size="sm">-{formatMoney(session.totalPayOutCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Refunds:')}</Text>
                  <Text size="sm">-{formatMoney(session.totalCashRefundsCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Owner Withdrawals:')}</Text>
                  <Text size="sm">-{formatMoney(session.totalOwnerWithdrawalsCents)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">{t('Cash Drops:')}</Text>
                  <Text size="sm">-{formatMoney(session.totalCashDropsCents)}</Text>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    {t('System Expected Cash:')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatMoney(figures.expectedCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    {t('Counted Cash:')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatMoney(figures.countedCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" fw={700}>
                    {t('Variance:')}
                  </Text>
                  <Badge
                    size="lg"
                    color={
                      figures.varianceCents === 0
                        ? 'teal'
                        : figures.varianceCents < 0
                          ? 'red'
                          : 'yellow'
                    }
                    variant="filled"
                  >
                    {figures.varianceCents > 0
                      ? `+${formatMoney(figures.varianceCents)}`
                      : figures.varianceCents < 0
                        ? `-${formatMoney(Math.abs(figures.varianceCents))}`
                        : formatMoney(0)}
                  </Badge>
                </Group>
              </Stack>
            </Card>

            {figures.reasonRequired && (
              <Alert
                icon={<IconAlertTriangle size={20} />}
                color={figures.varianceCents < 0 ? 'red' : 'yellow'}
                variant="light"
                title={figures.varianceCents < 0 ? t('Cash Shortage') : t('Cash Overage')}
              >
                <Stack gap="xs" mt="xs">
                  <Text size="sm">
                    {figures.pinRequired
                      ? t(
                          'The variance exceeds the allowed tolerance ({tolerance}). An explanation and Manager PIN approval are required.'
                        ).replace('{tolerance}', formatMoney(figures.varianceToleranceCents))
                      : t('A small variance was recorded. Please provide an explanation note.')}
                  </Text>

                  <Textarea
                    label={t('Variance Explanation Note')}
                    placeholder={t('Explain the discrepancy...')}
                    value={varianceReason}
                    onChange={(e) => setVarianceReason(e.currentTarget.value)}
                    required
                  />

                  {/* Option to convert cash shortage to late owner withdrawal */}
                  {figures.varianceCents < 0 && !showConvertVariance && (
                    <Button
                      variant="light"
                      color="orange"
                      size="xs"
                      onClick={() => setShowConvertVariance(true)}
                    >
                      {t('Convert Shortage to Late Owner Withdrawal')}
                    </Button>
                  )}

                  {showConvertVariance && (
                    <Card withBorder p="sm" radius="md" bg="var(--mantine-color-orange-light)">
                      <Stack gap="xs">
                        <Text size="xs" fw={700}>
                          {t('Convert Shortage to Late Owner Withdrawal')}
                        </Text>
                        <TextInput
                          label={t('Who took the cash (Recipient)')}
                          placeholder={t('Owner name')}
                          value={withdrawalRecipient}
                          onChange={(e) => setWithdrawalRecipient(e.currentTarget.value)}
                          required
                        />
                        <TextInput
                          label={t('Reason for withdrawal')}
                          placeholder={t('Purpose of drawings')}
                          value={withdrawalReason}
                          onChange={(e) => setWithdrawalReason(e.currentTarget.value)}
                          required
                        />
                        <Group justify="flex-end">
                          <Button
                            variant="default"
                            size="xs"
                            onClick={() => setShowConvertVariance(false)}
                          >
                            {t('Cancel')}
                          </Button>
                          <Button
                            color="orange"
                            size="xs"
                            loading={convertVarianceMutation.isPending}
                            onClick={handleConvertVariance}
                            disabled={
                              !withdrawalRecipient.trim() ||
                              !withdrawalReason.trim() ||
                              !managerPin.trim()
                            }
                          >
                            {t('Record Late Withdrawal')}
                          </Button>
                        </Group>
                      </Stack>
                    </Card>
                  )}

                  {figures.pinRequired && (
                    <Group align="flex-end" gap="xs">
                      <PasswordInput
                        label={t('Manager PIN')}
                        placeholder={t('Enter PIN')}
                        value={managerPin}
                        onChange={(e) => {
                          setManagerPin(e.currentTarget.value);
                          setPinError(null);
                          setVerifiedManager(null);
                        }}
                        error={pinError}
                        style={{ flex: 1 }}
                        required
                      />
                      <Button
                        variant="light"
                        color="blue"
                        onClick={handleVerifyPin}
                        loading={verifyPinMutation.isPending}
                        type="button"
                        disabled={!managerPin.trim()}
                      >
                        {t('Verify')}
                      </Button>
                    </Group>
                  )}

                  {verifiedManager && (
                    <Badge color="green" variant="light" leftSection={<IconCheck size={14} />}>
                      {t('Authorized by:')} {verifiedManager}
                    </Badge>
                  )}
                </Stack>
              </Alert>
            )}

            <Group justify="space-between" mt="md">
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => setActiveStep(1)}
              >
                {t('Recount Cash')}
              </Button>
              <Button
                color="blue"
                rightSection={<IconPlayerTrackNext size={16} />}
                onClick={() => setActiveStep(3)}
                disabled={
                  !shift.isCurrent ||
                  (figures.reasonRequired &&
                    (!varianceReason.trim() || (figures.pinRequired && !managerPin.trim())))
                }
              >
                {t('Proceed to Next Float')}
              </Button>
            </Group>
          </Stack>
        )}

        {/* Step 4: Next Shift Float & Safe Deposit */}
        {activeStep === 3 && figures === undefined && waiting}
        {activeStep === 3 && figures !== undefined && (
          <Stack gap="md">
            <Card withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  {t('Shift Cash Distribution')}
                </Text>
                <Group justify="space-between">
                  <Text size="sm">{t('Total Cash Counted in Drawer:')}</Text>
                  <Text size="md" fw={700}>
                    {formatMoney(figures.countedCents)}
                  </Text>
                </Group>
              </Stack>
            </Card>

            <MoneyInput
              label={t('Closing Float (Kept in Drawer for Next Shift)')}
              description={t('The amount left in the drawer for the incoming cashier.')}
              valueCents={figures.closingFloatCents}
              onChangeCents={(val) => setClosingFloatChoice(Math.min(val, figures.countedCents))}
              size="md"
              required
            />

            <Group gap="xs">
              <Button
                size="xs"
                variant="default"
                onClick={() => setClosingFloatChoice(figures.countedCents)}
              >
                {t('Keep all in drawer')} ({formatMoney(figures.countedCents)})
              </Button>
              <Button
                size="xs"
                variant="default"
                onClick={() => setClosingFloatChoice(figures.keepOpeningFloatCents)}
              >
                {t('Keep opening float')} ({formatMoney(figures.keepOpeningFloatCents)})
              </Button>
              <Button size="xs" variant="default" onClick={() => setClosingFloatChoice(0)}>
                {t('Take all to safe')}
              </Button>
            </Group>

            <Card withBorder p="sm" radius="md" bg="var(--mantine-color-blue-light)">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <IconBuildingBank size={20} color="var(--mantine-color-blue-6)" />
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                      {t('Cash Drop to Safe / Bank Deposit')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('Counted cash minus retained float')}
                    </Text>
                  </div>
                </Group>
                <Text size="xl" fw={700} c="blue">
                  {formatMoney(figures.safeDepositCents)}
                </Text>
              </Group>
            </Card>

            {figures.closingFloatCents === 0 && figures.countedCents > 0 ? (
              <Alert
                icon={<IconAlertTriangle size={18} />}
                color="yellow"
                variant="light"
                data-testid="empty-drawer-notice"
              >
                {t('Nothing will stay in the drawer. The next shift will open with')}{' '}
                {formatMoney(0)}.
              </Alert>
            ) : (
              <Text size="sm" c="dimmed" data-testid="next-shift-line">
                {t('The next shift will open with')} {formatMoney(figures.closingFloatCents)}{' '}
                {t('in the drawer.')}
              </Text>
            )}

            <TextInput
              label={t('Closing Note (Optional)')}
              placeholder={t('Optional notes about the shift or drawer handoff...')}
              value={closingNote}
              onChange={(e) => setClosingNote(e.currentTarget.value)}
            />

            <Group justify="space-between" mt="md">
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => setActiveStep(2)}
              >
                {t('Back')}
              </Button>
              <Button
                color="orange"
                size="md"
                leftSection={<IconLock size={18} />}
                loading={closeSessionMutation.isPending}
                onClick={handleFinalClose}
              >
                {t('Lock & Close Register Session')}
              </Button>
            </Group>
          </Stack>
        )}
      </StepSwitch>
    </Stack>
  );
};

export interface CloseSessionModalProps {
  opened: boolean;
  onClose: () => void;
  session: RegisterSession;
  onSessionClosed?: (closedSession: RegisterSession) => void;
}

export const CloseSessionModal: React.FC<CloseSessionModalProps> = ({
  opened,
  onClose,
  session,
  onSessionClosed,
}) => {
  const cancelCloseMutation = useCancelClose();
  // Set once the count is saved: the server then holds the shift as "closing" until it is closed
  // or this window is dismissed. A ref, because the shift prop only catches up after a refetch.
  const countSubmitted = useRef(false);

  const finish = () => {
    countSubmitted.current = false;
    onClose();
  };

  // Dismissing a counted shift puts it back to open, so the header stops saying "Closing...".
  const dismiss = async () => {
    if (countSubmitted.current || session.status === 'closing') {
      try {
        await cancelCloseMutation.mutateAsync(session.key);
      } catch {
        notifications.show({
          title: t('Shift still shows as closing'),
          message: t(
            'We could not put the shift back. Open Close Shift again to finish or cancel it.'
          ),
          color: 'orange',
        });
      }
    }
    finish();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => void dismiss()}
      title={
        <Group gap="xs">
          <ThemeIcon variant="light" color="orange" size={34}>
            <IconLock size={20} />
          </ThemeIcon>
          <Text fw={700} size="lg">
            {t('Close Register Session')} — {session.sessionNumber}
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      {opened && (
        <CloseSessionForm
          key={session.key}
          session={session}
          onClose={finish}
          onDismiss={() => void dismiss()}
          onCountSubmitted={() => {
            countSubmitted.current = true;
          }}
          onSessionClosed={onSessionClosed}
        />
      )}
    </Modal>
  );
};
