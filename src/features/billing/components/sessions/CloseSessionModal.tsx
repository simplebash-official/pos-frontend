import React, { useState } from 'react';
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
import { VARIANCE_TOLERANCE_CENTS } from './constants';
import { calculateExpectedDrawerCash, calculateCashVariance } from './sessionMath';
import type { RegisterSession } from '../../types';

interface CloseSessionFormProps {
  session: RegisterSession;
  onClose: () => void;
  onSessionClosed?: (closedSession: RegisterSession) => void;
}

const CloseSessionForm: React.FC<CloseSessionFormProps> = ({
  session: initialSession,
  onClose,
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
  const [countedCashCents, setCountedCashCents] = useState(initialSession.countedCashCents ?? 0);
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
  const [closingFloatCents, setClosingFloatCents] = useState(initialSession.openingFloatCents);
  const [closingNote, setClosingNote] = useState('');

  const [error, setError] = useState<string | null>(null);

  const expectedCashCents =
    session.expectedCashCents ?? calculateExpectedDrawerCash(session);
  const varianceCents = calculateCashVariance(countedCashCents, expectedCashCents);
  const hasVariance = varianceCents !== 0;
  const isLargeVariance = Math.abs(varianceCents) > VARIANCE_TOLERANCE_CENTS;
  const safeDepositCents = Math.max(0, countedCashCents - closingFloatCents);

  const handleDenominationsChange = (denoms: Record<string, number>, totalCents: number) => {
    setDenominations(denoms);
    setCountedCashCents(totalCents);
  };

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
    try {
      const updated = await submitBlindCountMutation.mutateAsync({
        key: session.key,
        input: {
          countedCashCents,
          closingDenominations: countMode === 'denominations' ? denominations : undefined,
        },
      });
      setSession(updated);
      setClosingFloatCents(Math.min(countedCashCents, updated.openingFloatCents));
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

      // Recalculate session state with 0 variance
      setSession((prev) => ({
        ...prev,
        totalOwnerWithdrawalsCents: prev.totalOwnerWithdrawalsCents + Math.abs(varianceCents),
        cashVarianceCents: 0,
        expectedCashCents: countedCashCents,
        hasLateMovements: true,
      }));
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

    if (hasVariance) {
      if (!varianceReason.trim()) {
        setError(t('Please provide an explanation for the cash variance.'));
        return;
      }
      if (isLargeVariance && !managerPin.trim()) {
        setError(t('Manager PIN authorization is required for variance exceeding tolerance.'));
        return;
      }
    }

    try {
      const closed = await closeSessionMutation.mutateAsync({
        key: session.key,
        input: {
          countedCashCents,
          closingDenominations: countMode === 'denominations' ? denominations : undefined,
          closingFloatCents,
          cashDropToSafeCents: safeDepositCents,
          closingNote: closingNote.trim() || undefined,
          varianceReason: hasVariance ? varianceReason.trim() : undefined,
          managerPin: isLargeVariance ? managerPin.trim() : undefined,
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
              <Button variant="default" onClick={onClose}>
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
                valueCents={countedCashCents}
                onChangeCents={setCountedCashCents}
                size="md"
                autoFocus
              />
            ) : (
              <DenominationCounter value={denominations} onChange={handleDenominationsChange} />
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
                disabled={countedCashCents < 0}
              >
                {t('Submit Count & Calculate')}
              </Button>
            </Group>
          </Stack>
        )}

        {/* Step 3: Reconciliation & Variance */}
        {activeStep === 2 && (
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
                    {formatMoney(expectedCashCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    {t('Counted Cash:')}
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatMoney(countedCashCents)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" fw={700}>
                    {t('Variance:')}
                  </Text>
                  <Badge
                    size="lg"
                    color={varianceCents === 0 ? 'teal' : varianceCents < 0 ? 'red' : 'yellow'}
                    variant="filled"
                  >
                    {varianceCents > 0
                      ? `+${formatMoney(varianceCents)}`
                      : varianceCents < 0
                        ? `-${formatMoney(Math.abs(varianceCents))}`
                        : formatMoney(0)}
                  </Badge>
                </Group>
              </Stack>
            </Card>

            {hasVariance && (
              <Alert
                icon={<IconAlertTriangle size={20} />}
                color={varianceCents < 0 ? 'red' : 'yellow'}
                variant="light"
                title={varianceCents < 0 ? t('Cash Shortage') : t('Cash Overage')}
              >
                <Stack gap="xs" mt="xs">
                  <Text size="sm">
                    {isLargeVariance
                      ? t(
                          'The variance exceeds the allowed tolerance (Rs. 5.00). An explanation and Manager PIN approval are required.'
                        )
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
                  {varianceCents < 0 && !showConvertVariance && (
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

                  {isLargeVariance && (
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
                  hasVariance && (!varianceReason.trim() || (isLargeVariance && !managerPin.trim()))
                }
              >
                {t('Proceed to Next Float')}
              </Button>
            </Group>
          </Stack>
        )}

        {/* Step 4: Next Shift Float & Safe Deposit */}
        {activeStep === 3 && (
          <Stack gap="md">
            <Card withBorder p="sm" radius="md">
              <Stack gap="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  {t('Shift Cash Distribution')}
                </Text>
                <Group justify="space-between">
                  <Text size="sm">{t('Total Cash Counted in Drawer:')}</Text>
                  <Text size="md" fw={700}>
                    {formatMoney(countedCashCents)}
                  </Text>
                </Group>
              </Stack>
            </Card>

            <MoneyInput
              label={t('Closing Float (Kept in Drawer for Next Shift)')}
              description={t('The amount left in the drawer for the incoming cashier.')}
              valueCents={closingFloatCents}
              onChangeCents={(val) => setClosingFloatCents(Math.min(val, countedCashCents))}
              size="md"
              required
            />

            <Group gap="xs">
              <Button
                size="xs"
                variant="default"
                onClick={() => setClosingFloatCents(countedCashCents)}
              >
                {t('Keep all in drawer')} ({formatMoney(countedCashCents)})
              </Button>
              <Button
                size="xs"
                variant="default"
                onClick={() =>
                  setClosingFloatCents(Math.min(countedCashCents, session.openingFloatCents))
                }
              >
                {t('Keep opening float')} (
                {formatMoney(Math.min(countedCashCents, session.openingFloatCents))})
              </Button>
              <Button size="xs" variant="default" onClick={() => setClosingFloatCents(0)}>
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
                  {formatMoney(safeDepositCents)}
                </Text>
              </Group>
            </Card>

            {closingFloatCents === 0 && countedCashCents > 0 ? (
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
                {t('The next shift will open with')} {formatMoney(closingFloatCents)}{' '}
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
  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
          onClose={onClose}
          onSessionClosed={onSessionClosed}
        />
      )}
    </Modal>
  );
};
