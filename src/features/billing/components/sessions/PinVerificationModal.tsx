import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import React, { useState } from 'react';
import { Alert, Button, Grid, Group, Modal, PasswordInput, Stack, Text } from '@mantine/core';
import { IconAlertCircle, IconBackspace, IconKey, IconLock } from '@tabler/icons-react';
import { useVerifyPin } from '../../hooks/useRegisterSession';
import { t } from '@/shared/i18n/t';

export interface PinVerificationModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: (verifiedUser: {
    userId?: string;
    userName?: string;
    role?: string;
    pin: string;
  }) => void;
  title?: string;
  description?: string;
  requiredRole?: string; // 'manager' or 'admin'
}

export const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  opened,
  onClose,
  onSuccess,
  title,
  description,
  requiredRole = 'manager',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const verifyPinMutation = useVerifyPin();
  const reduceMotion = useReducedMotion();

  const handleDigit = (digit: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setError(t('Please enter a PIN'));
      return;
    }

    try {
      const res = await verifyPinMutation.mutateAsync({
        pin,
        requiredRole,
      });

      if (res.valid) {
        setPin('');
        setError(null);
        onSuccess({
          userId: res.userId,
          userName: res.userName,
          role: res.role,
          pin,
        });
        onClose();
      } else {
        setError(t('Invalid PIN or insufficient role permissions'));
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
          ? err.message
          : t('PIN verification failed');
      setError(message);
    }
  };

  const handleModalClose = () => {
    setPin('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleModalClose}
      title={
        <Group gap="xs">
          <IconLock size={20} color="var(--mantine-color-blue-6)" />
          <Text fw={600}>
            {title ??
              (requiredRole === 'admin' ? t('Admin PIN Approval') : t('Manager PIN Approval'))}
          </Text>
        </Group>
      }
      size="sm"
      centered
    >
      <form onSubmit={handleVerify}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {description ??
              (requiredRole === 'admin'
                ? t('An Admin must enter their PIN to authorize this action.')
                : t('A Manager or Admin must enter their PIN to authorize this action.'))}
          </Text>

          <AnimatePresence initial={false}>
            {error && (
              <motion.div
                key="pin-error"
                initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                animate={
                  reduceMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 1, y: 0, x: [0, -8, 8, -5, 5, 0] }
                }
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35 }}
              >
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  variant="light"
                  title={t('Verification Failed')}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <PasswordInput
            size="md"
            placeholder={t('Enter 4-8 digit PIN')}
            value={pin}
            onChange={(e) => {
              setPin(e.currentTarget.value);
              setError(null);
            }}
            autoFocus
            leftSection={<IconKey size={18} />}
            styles={{
              input: { textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.25rem' },
            }}
          />

          {/* Touchscreen keypad */}
          <Grid gap="xs">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <Grid.Col span={4} key={digit}>
                <Button
                  variant="default"
                  size="md"
                  fullWidth
                  onClick={() => handleDigit(digit)}
                  type="button"
                >
                  <Text fw={600} size="lg">
                    {digit}
                  </Text>
                </Button>
              </Grid.Col>
            ))}
            <Grid.Col span={4}>
              <Button
                variant="subtle"
                color="gray"
                size="md"
                fullWidth
                onClick={handleClear}
                type="button"
              >
                {t('C')}
              </Button>
            </Grid.Col>
            <Grid.Col span={4}>
              <Button
                variant="default"
                size="md"
                fullWidth
                onClick={() => handleDigit('0')}
                type="button"
              >
                <Text fw={600} size="lg">
                  0
                </Text>
              </Button>
            </Grid.Col>
            <Grid.Col span={4}>
              <Button
                variant="subtle"
                color="gray"
                size="md"
                fullWidth
                onClick={handleBackspace}
                type="button"
              >
                <IconBackspace size={20} />
              </Button>
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleModalClose} type="button">
              {t('Cancel')}
            </Button>
            <Button
              type="submit"
              color="blue"
              loading={verifyPinMutation.isPending}
              disabled={pin.length < 4}
              onClick={() => handleVerify()}
            >
              {t('Authorize')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
