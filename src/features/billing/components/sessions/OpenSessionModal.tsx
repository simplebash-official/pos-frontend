import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconCheck,
  IconInfoCircle,
  IconKey,
  IconLock,
} from '@tabler/icons-react';
import { queryKeys } from '@/api/queryKeys';
import { useShopProfile } from '@/features/settings';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useCalc } from '@/shared/hooks/useCalc';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import { useAppSelector } from '@/store/hooks';
import type { SettingsState } from '@/store/slices/settingsSlice';
import { calcShiftCount } from '../../api/calcApi';
import { getCurrentSession } from '../../api/sessionsApi';
import { useCashCount } from '../../hooks/useCashCount';
import { useDrawerState, useOpenSession, useVerifyPin } from '../../hooks/useRegisterSession';
import type { DrawerState, RegisterSession } from '../../types';
import { CountMethodToggle } from './CountMethodToggle';
import { DenominationCounter } from './DenominationCounter';
import { MoneyInput } from '@/shared/components/MoneyInput';

interface OpenSessionFormProps {
  terminalId: string;
  drawerState: DrawerState | null;
  isDrawerLoading: boolean;
  isSharedShop: boolean;
  allowStaffMultiDeviceSessions: boolean | null;
  onClose: () => void;
  onSessionOpened?: (session: RegisterSession) => void;
}

const OpenSessionForm: React.FC<OpenSessionFormProps> = ({
  terminalId,
  drawerState,
  isDrawerLoading,
  isSharedShop,
  allowStaffMultiDeviceSessions,
  onClose,
  onSessionOpened,
}) => {
  const queryClient = useQueryClient();
  const openSessionMutation = useOpenSession();
  const verifyPinMutation = useVerifyPin();

  const [mode, setMode] = useState<'total' | 'denominations'>('total');
  const [typedFloatCents, setTypedFloatCents] = useState(drawerState?.currentBalanceCents ?? 0);
  const [denominations, setDenominations] = useState<Record<string, number>>({});
  const [openingNote, setOpeningNote] = useState('');
  const [discrepancyReason, setDiscrepancyReason] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [verifiedManager, setVerifiedManager] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const expectedFloatCents = drawerState?.currentBalanceCents ?? 0;
  const count = useCashCount(denominations);
  // The float counted: what was typed, or the server's total for the notes and coins. `null` until
  // that total is for the counts as they stand now.
  const countedFloatCents =
    mode === 'total'
      ? typedFloatCents
      : count.isCurrent && count.data
        ? count.data.totalCents
        : null;
  const shift = useCalc(
    'shift-count',
    {
      sessionKey: null,
      terminalId,
      // Unused while `countedFloatCents` is null: the request is not sent then.
      countedCents: countedFloatCents === null ? 0 : countedFloatCents,
      closingFloatCents: null,
    },
    calcShiftCount,
    countedFloatCents !== null
  );
  const figures = shift.isCurrent && countedFloatCents !== null ? shift.data : undefined;
  // The explanation is asked for any difference; the manager's PIN only of Staff.
  const hasDiscrepancy = figures !== undefined && figures.reasonRequired;
  const needsPin = figures !== undefined && figures.pinRequired;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (figures === undefined || countedFloatCents === null) {
      setSubmitError(
        shift.error === null
          ? t('Working out the figures...')
          : t('Could not work out the figures. Check the connection and try again.')
      );
      return;
    }
    if (hasDiscrepancy && !discrepancyReason.trim()) {
      setSubmitError(t('Please provide an explanation note for the float discrepancy.'));
      return;
    }
    if (needsPin && !managerPin.trim()) {
      setSubmitError(t('Manager PIN is required to authorize the float discrepancy.'));
      return;
    }

    try {
      const session = await openSessionMutation.mutateAsync({
        terminalId,
        openingFloatCents: countedFloatCents,
        openingDenominations: mode === 'denominations' ? denominations : undefined,
        openingNote: openingNote.trim() || undefined,
        discrepancyReason: hasDiscrepancy ? discrepancyReason.trim() : undefined,
        managerPin: needsPin ? managerPin.trim() : undefined,
      });

      notifications.show({
        title: t('Shift Opened'),
        message: `${t('Session')} ${session.sessionNumber} ${t('started successfully.')}`,
        color: 'teal',
      });

      onSessionOpened?.(session);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as { statusCode?: number; code?: string; message?: string };
      if (apiErr?.code === 'SESSION_ALREADY_OPEN' || apiErr?.statusCode === 409) {
        const existing = await getCurrentSession(terminalId).catch(() => null);
        await queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all });
        if (existing) {
          notifications.show({
            title: t('Joined Open Shop Shift'),
            message: `${existing.sessionNumber} ${t('was already opened by')} ${existing.cashierNameSnapshot}. ${t('Joined active shift automatically.')}`,
            color: 'cyan',
          });
          onSessionOpened?.(existing);
          onClose();
          return;
        }
      }
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : t('Failed to open shift session');
      setSubmitError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {submitError && (
          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="light"
            title={t('Cannot Open Shift')}
          >
            {submitError}
          </Alert>
        )}

        {isSharedShop && (
          <Alert
            icon={<IconBuildingStore size={18} />}
            color="cyan"
            variant="light"
            title={t('Shared Shop Shift')}
          >
            <Text size="sm">
              {t('Opening this shift starts one shared shop shift for all counters and staff.')}
            </Text>
          </Alert>
        )}

        {/* Previous Close Drawer Balance Info */}
        <Card withBorder padding="sm" radius="md" bg="var(--bg-app)">
          <Group justify="space-between" align="center" wrap="nowrap">
            <div>
              <Group gap="xs" align="center">
                <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                  {isSharedShop
                    ? t('Expected Shop Drawer Balance (From Last Close)')
                    : t('Expected Drawer Balance (From Last Close)')}
                </Text>
                {isSharedShop && (
                  <Badge size="xs" variant="light" color="cyan">
                    {t('Shared Shop Float')}
                  </Badge>
                )}
              </Group>
              <Text
                size="xl"
                fw={700}
                c={isDrawerLoading ? 'dimmed' : isSharedShop ? 'cyan' : 'blue'}
              >
                {formatMoney(expectedFloatCents)}
              </Text>
              {!isDrawerLoading && expectedFloatCents === 0 && drawerState?.lastSessionKey && (
                <Text size="xs" c="dimmed">
                  {t('The last shift kept nothing in the drawer; its cash went to the safe.')}
                </Text>
              )}
            </div>
          </Group>
        </Card>

        {!isSharedShop && allowStaffMultiDeviceSessions !== null && (
          <Group gap="xs" wrap="nowrap" align="flex-start">
            <IconInfoCircle
              size={15}
              color="var(--mantine-color-dimmed)"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <Text size="xs" c="dimmed">
              {allowStaffMultiDeviceSessions
                ? t(
                    'Personal shift: you can sign in and continue this shift across your other devices until closed.'
                  )
                : t(
                    'Personal shift: Managers & Admins can use multiple devices; Staff stay on this device until closed.'
                  )}
            </Text>
          </Group>
        )}

        {/* Count Mode Toggle */}
        <CountMethodToggle label={t('Count Opening Float')} value={mode} onChange={setMode} />

        {mode === 'total' ? (
          <MoneyInput
            label={t('Counted Cash in Drawer')}
            description={t('Enter the actual cash amount physically present in the drawer.')}
            valueCents={typedFloatCents}
            onChangeCents={setTypedFloatCents}
            size="md"
            autoFocus
          />
        ) : (
          <DenominationCounter counts={denominations} onChange={setDenominations} count={count} />
        )}

        {/* Discrepancy Warning & Approval */}
        {figures !== undefined && figures.reasonRequired && (
          <Alert
            icon={<IconAlertTriangle size={20} />}
            color={figures.varianceCents < 0 ? 'red' : 'yellow'}
            variant="light"
            title={
              figures.varianceCents < 0
                ? `${t('Float Shortage Detected:')} ${formatMoney(Math.abs(figures.varianceCents))}`
                : `${t('Float Overage Detected:')} ${formatMoney(figures.varianceCents)}`
            }
          >
            <Stack gap="xs" mt="xs">
              <Text size="sm">
                {t('The counted cash differs from what was left in the drawer at the last close.')}{' '}
                {needsPin
                  ? t('A reason and Manager approval are required to proceed.')
                  : t('A reason is required to proceed.')}
              </Text>

              <Textarea
                label={t('Reason for discrepancy')}
                placeholder={t('Explain why the drawer balance differs from previous close...')}
                required
                minRows={2}
                value={discrepancyReason}
                onChange={(e) => setDiscrepancyReason(e.currentTarget.value)}
              />

              {needsPin && <Divider my="xs" />}

              {needsPin && (
                <Group align="flex-end" gap="xs">
                  <PasswordInput
                    label={t('Manager PIN')}
                    placeholder={t('Enter PIN')}
                    leftSection={<IconLock size={16} />}
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

              {needsPin && verifiedManager && (
                <Badge color="green" variant="light" leftSection={<IconCheck size={14} />}>
                  {t('Authorized by:')} {verifiedManager}
                </Badge>
              )}
            </Stack>
          </Alert>
        )}

        <TextInput
          label={t('Opening Note (Optional)')}
          placeholder={t('Optional notes about this shift...')}
          value={openingNote}
          onChange={(e) => setOpeningNote(e.currentTarget.value)}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} type="button">
            {t('Cancel')}
          </Button>
          <Button
            type="submit"
            color="teal"
            size="md"
            loading={openSessionMutation.isPending}
            disabled={
              figures === undefined ||
              (hasDiscrepancy && !discrepancyReason.trim()) ||
              (needsPin && !managerPin.trim())
            }
            leftSection={<IconKey size={18} />}
          >
            {t('Open Shift Session')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export interface OpenSessionModalProps {
  opened: boolean;
  onClose: () => void;
  terminalId: string;
  onSessionOpened?: (session: RegisterSession) => void;
}

export const OpenSessionModal: React.FC<OpenSessionModalProps> = ({
  opened,
  onClose,
  terminalId,
  onSessionOpened,
}) => {
  const isMobile = useIsMobile();
  const { drawerState, isLoading: isDrawerLoading } = useDrawerState();
  const { shopProfile: fetchedProfile } = useShopProfile();
  const storeProfile = useAppSelector(
    (state: { settings?: SettingsState }) => state.settings?.shopProfile ?? null
  );
  const shopProfile = fetchedProfile ?? storeProfile;
  const isSharedShop = shopProfile?.allowSharedUserSessions === true;
  const allowStaffMultiDeviceSessions =
    shopProfile && typeof shopProfile.allowStaffMultiDeviceSessions === 'boolean'
      ? shopProfile.allowStaffMultiDeviceSessions
      : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {t('Open Register Session')}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      {opened && (
        <OpenSessionForm
          key={`${terminalId}-${drawerState?.currentBalanceCents ?? 0}`}
          terminalId={terminalId}
          drawerState={drawerState}
          isDrawerLoading={isDrawerLoading}
          isSharedShop={isSharedShop}
          allowStaffMultiDeviceSessions={allowStaffMultiDeviceSessions}
          onClose={onClose}
          onSessionOpened={onSessionOpened}
        />
      )}
    </Modal>
  );
};
