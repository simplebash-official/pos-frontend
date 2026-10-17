import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  Modal,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCheck,
  IconCoins,
  IconLock,
  IconPrinter,
} from '@tabler/icons-react';
import { useCreateCashMovement, useVerifyPin } from '../../hooks/useRegisterSession';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { formatMoney } from '@/shared/lib/money';
import { t } from '@/shared/i18n/t';
import type { CashMovement, CashMovementType } from '../../types';

export interface CashMovementModalProps {
  opened: boolean;
  onClose: () => void;
  terminalId: string;
  sessionKey?: string;
  onMovementCreated?: (movement: CashMovement) => void;
}

import { OWNER_ADMIN_THRESHOLD_CENTS } from './constants';
import { printCashMovementVoucher } from './sessionPrint';

export const CashMovementModal: React.FC<CashMovementModalProps> = ({
  opened,
  onClose,
  terminalId,
  sessionKey,
  onMovementCreated,
}) => {
  const createMovementMutation = useCreateCashMovement();
  const verifyPinMutation = useVerifyPin();

  const [movementType, setMovementType] = useState<CashMovementType>('pay_out_expense');
  const [amountCents, setAmountCents] = useState(0);
  const [reason, setReason] = useState('');
  const [recipientOrSource, setRecipientOrSource] = useState('');
  const [managerPin, setManagerPin] = useState('');
  const [verifiedApprover, setVerifiedApprover] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [completedMovement, setCompletedMovement] = useState<CashMovement | null>(null);

  const isOwnerWithdrawal = movementType === 'owner_withdrawal';
  const isNoSale = movementType === 'drawer_open_no_sale';
  const requiresAdmin = isOwnerWithdrawal && amountCents > OWNER_ADMIN_THRESHOLD_CENTS;
  const requiresPin = isOwnerWithdrawal;

  const handleVerifyPin = async () => {
    if (!managerPin.trim()) {
      setPinError(t('Please enter a PIN'));
      return;
    }
    try {
      const res = await verifyPinMutation.mutateAsync({
        pin: managerPin,
        requiredRole: requiresAdmin ? 'admin' : 'manager',
      });
      if (res.valid) {
        setVerifiedApprover(res.userName ?? t('Authorized'));
        setPinError(null);
      } else {
        setPinError(
          requiresAdmin
            ? t('Admin / Owner PIN is required for withdrawals above Rs. 500')
            : t('Manager PIN is required')
        );
        setVerifiedApprover(null);
      }
    } catch {
      setPinError(t('Invalid PIN or insufficient role permissions'));
      setVerifiedApprover(null);
    }
  };

  const handleReset = () => {
    setMovementType('pay_out_expense');
    setAmountCents(0);
    setReason('');
    setRecipientOrSource('');
    setManagerPin('');
    setVerifiedApprover(null);
    setPinError(null);
    setSubmitError(null);
    setCompletedMovement(null);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isNoSale && amountCents <= 0) {
      setSubmitError(t('Please enter a valid amount greater than zero.'));
      return;
    }

    if (!reason.trim()) {
      setSubmitError(t('Please enter a reason or description for this movement.'));
      return;
    }

    if (isOwnerWithdrawal) {
      if (!recipientOrSource.trim()) {
        setSubmitError(t('Recipient name is required for owner withdrawal.'));
        return;
      }
      if (!managerPin.trim()) {
        setSubmitError(
          requiresAdmin
            ? t('Admin / Owner PIN authorization is required for withdrawals over Rs. 500.')
            : t('Manager PIN authorization is required for owner withdrawal.')
        );
        return;
      }
    }

    try {
      const movement = await createMovementMutation.mutateAsync({
        movementType,
        amountCents: isNoSale ? 0 : amountCents,
        sessionKey: sessionKey || undefined,
        terminalId,
        reason: reason.trim(),
        recipientOrSource: recipientOrSource.trim() || undefined,
        managerPin: managerPin.trim() || undefined,
      });

      notifications.show({
        title: t('Cash Movement Recorded'),
        message: `${movement.movementNumber} ${t('logged successfully.')}`,
        color: 'teal',
      });

      setCompletedMovement(movement);
      onMovementCreated?.(movement);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : t('Failed to record cash movement');
      setSubmitError(message);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleModalClose}
      title={
        <Group gap="xs">
          <IconCoins size={22} color="var(--mantine-color-blue-6)" />
          <Text fw={700} size="lg">
            {t('Cash Movement / Drawer Action')}
          </Text>
        </Group>
      }
      size="md"
      centered
    >
      {completedMovement ? (
        <Stack gap="md">
          <Alert
            color="teal"
            variant="light"
            icon={<IconCheck size={20} />}
            title={t('Transaction Completed')}
          >
            {t('The cash movement has been recorded and the drawer balance has been adjusted.')}
          </Alert>

          <Card withBorder padding="md" radius="md">
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  {t('Voucher Number')}
                </Text>
                <Badge size="lg" color="blue" variant="filled">
                  {completedMovement.movementNumber}
                </Badge>
              </Group>

              <Group justify="space-between">
                <Text size="sm">{t('Amount:')}</Text>
                <Text size="lg" fw={700}>
                  {formatMoney(completedMovement.amountCents)}
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm">{t('Reason:')}</Text>
                <Text size="sm" fw={500}>
                  {completedMovement.reason}
                </Text>
              </Group>

              {completedMovement.recipientOrSource && (
                <Group justify="space-between">
                  <Text size="sm">{t('Recipient / Source:')}</Text>
                  <Text size="sm" fw={500}>
                    {completedMovement.recipientOrSource}
                  </Text>
                </Group>
              )}

              <Group justify="space-between">
                <Text size="sm">{t('Recorded By:')}</Text>
                <Text size="sm">{completedMovement.recordedByNameSnapshot}</Text>
              </Group>

              {completedMovement.approvedByNameSnapshot && (
                <Group justify="space-between">
                  <Text size="sm">{t('Authorized By:')}</Text>
                  <Badge color="green" variant="light">
                    {completedMovement.approvedByNameSnapshot}
                  </Badge>
                </Group>
              )}
            </Stack>
          </Card>

          <Group justify="space-between" mt="sm">
            <Button
              variant="outline"
              color="blue"
              leftSection={<IconPrinter size={18} />}
              onClick={() => printCashMovementVoucher(completedMovement)}
            >
              {t('Print Voucher')}
            </Button>
            <Button color="teal" onClick={handleModalClose}>
              {t('Done')}
            </Button>
          </Group>
        </Stack>
      ) : (
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {submitError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                title={t('Error')}
              >
                {submitError}
              </Alert>
            )}

            <Select
              label={t('Movement Type')}
              data={[
                { value: 'pay_out_expense', label: t('Pay-Out: Petty Expense') },
                { value: 'pay_out_supplier', label: t('Pay-Out: Supplier Payment') },
                { value: 'owner_withdrawal', label: t('Owner Withdrawal (Drawings)') },
                { value: 'pay_in', label: t('Pay-In: Add Cash to Drawer') },
                { value: 'cash_drop', label: t('Cash Drop: Excess to Safe') },
                { value: 'drawer_open_no_sale', label: t('No Sale: Open Drawer (Audit Log)') },
              ]}
              value={movementType}
              onChange={(val) => {
                if (val) {
                  setMovementType(val as CashMovementType);
                  setSubmitError(null);
                }
              }}
              required
            />

            {!isNoSale && (
              <MoneyInput
                label={t('Amount')}
                description={
                  movementType === 'owner_withdrawal'
                    ? t('Amount taken by owner. Amounts over Rs. 500 require Admin PIN.')
                    : t('Enter amount to add or withdraw.')
                }
                valueCents={amountCents}
                onChangeCents={setAmountCents}
                size="md"
                required
                autoFocus
              />
            )}

            <TextInput
              label={t('Reason / Description')}
              placeholder={
                isNoSale
                  ? t('Reason for opening drawer (e.g. Making change)')
                  : movementType === 'owner_withdrawal'
                    ? t('Purpose of owner drawings')
                    : t('Reason for cash movement')
              }
              value={reason}
              onChange={(e) => setReason(e.currentTarget.value)}
              required
            />

            {(movementType === 'owner_withdrawal' ||
              movementType === 'pay_out_supplier' ||
              movementType === 'pay_out_expense' ||
              movementType === 'pay_in') && (
              <TextInput
                label={
                  movementType === 'owner_withdrawal'
                    ? t('Recipient (Who took the cash)')
                    : movementType === 'pay_out_supplier'
                      ? t('Supplier Name / Contact')
                      : movementType === 'pay_in'
                        ? t('Cash Source (e.g. Owner capital, bank change)')
                        : t('Paid To / Payee')
                }
                placeholder={
                  movementType === 'owner_withdrawal'
                    ? t('e.g. Shop Owner name')
                    : t('Person or entity receiving or providing cash')
                }
                value={recipientOrSource}
                onChange={(e) => setRecipientOrSource(e.currentTarget.value)}
                required={isOwnerWithdrawal}
              />
            )}

            {/* PIN Authorization for Owner Withdrawals */}
            {requiresPin && (
              <Alert
                icon={<IconLock size={18} />}
                color="blue"
                variant="light"
                title={
                  requiresAdmin
                    ? t('Owner / Admin Authorization Required')
                    : t('Manager Authorization Required')
                }
              >
                <Stack gap="xs" mt="xs">
                  <Text size="xs">
                    {requiresAdmin
                      ? t(
                          'Withdrawals exceeding Rs. 500 must be approved with the Owner/Admin PIN.'
                        )
                      : t('Owner withdrawals must be authorized by a Manager or Owner PIN.')}
                  </Text>
                  <Group align="flex-end" gap="xs">
                    <PasswordInput
                      label={requiresAdmin ? t('Admin PIN') : t('Manager PIN')}
                      placeholder={t('Enter PIN')}
                      value={managerPin}
                      onChange={(e) => {
                        setManagerPin(e.currentTarget.value);
                        setPinError(null);
                        setVerifiedApprover(null);
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
                  {verifiedApprover && (
                    <Badge color="green" variant="light" leftSection={<IconCheck size={14} />}>
                      {t('Authorized by:')} {verifiedApprover}
                    </Badge>
                  )}
                </Stack>
              </Alert>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="default" onClick={handleModalClose} type="button">
                {t('Cancel')}
              </Button>
              <Button
                type="submit"
                color={
                  movementType === 'pay_in'
                    ? 'teal'
                    : movementType === 'cash_drop'
                      ? 'indigo'
                      : isNoSale
                        ? 'gray'
                        : 'orange'
                }
                loading={createMovementMutation.isPending}
                leftSection={
                  movementType === 'pay_in' ? (
                    <IconArrowDownRight size={18} />
                  ) : movementType === 'cash_drop' ? (
                    <IconBuildingBank size={18} />
                  ) : (
                    <IconArrowUpRight size={18} />
                  )
                }
              >
                {isNoSale ? t('Log No Sale & Open Drawer') : t('Record Cash Movement')}
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
};
