import { useState, type ReactNode } from 'react';
import { Alert, Button, Group, Modal, PasswordInput, Stack, Text, Textarea } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import type { ManagerApproval } from '../types';

export interface ManagerApprovalModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  /** One plain sentence saying what will happen. */
  description: string;
  /** Asked above the reason, e.g. "Why is it being cancelled?". */
  reasonLabel: string;
  confirmLabel: string;
  /** `red` for a cancel, `blue` otherwise. */
  confirmColor: 'red' | 'blue';
  /** Extra fields above the sign-off (the new period of an extension). */
  children?: ReactNode;
  /** Something above still needs fixing; the confirm button stays off and this explains why. */
  blocker: string | null;
  loading: boolean;
  /** The server's reason when it said no (wrong PIN, nothing to extend...). */
  error: string | null;
  onConfirm: (approval: ManagerApproval) => void;
}

/**
 * A manager or owner signs off an action at the counter: their PIN and a reason. The PIN is
 * checked by the server on the request itself; this window only collects it.
 */
export const ManagerApprovalModal = ({
  opened,
  onClose,
  title,
  description,
  reasonLabel,
  confirmLabel,
  confirmColor,
  children,
  blocker,
  loading,
  error,
  onConfirm,
}: ManagerApprovalModalProps) => {
  const isMobile = useIsMobile();
  const [pin, setPin] = useState('');
  const [reason, setReason] = useState('');
  const [tried, setTried] = useState(false);

  const close = () => {
    setPin('');
    setReason('');
    setTried(false);
    onClose();
  };

  const pinProblem = /^\d{4,8}$/.test(pin.trim())
    ? null
    : t('Enter the manager or owner PIN (4 to 8 numbers).');
  const reasonProblem = reason.trim() === '' ? t('Please say why.') : null;

  const submit = () => {
    setTried(true);
    if (pinProblem !== null || reasonProblem !== null || blocker !== null) return;
    onConfirm({ managerPin: pin.trim(), reason: reason.trim() });
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <Text fw={700} size="lg">
          {title}
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
          // This window is a React child of whatever opened it; its submit must not reach a form
          // around that (a repair job's own form saved itself when a claim was started).
          event.stopPropagation();
          submit();
        }}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {description}
          </Text>
          {children}
          <Alert
            color="orange"
            icon={<IconLock size={18} />}
            title={t('A manager or owner must approve this')}
          >
            <Stack gap="sm">
              <PasswordInput
                label={t('Manager or owner PIN')}
                inputMode="numeric"
                autoComplete="off"
                data-log-redact
                value={pin}
                onChange={(event) => setPin(event.currentTarget.value)}
                error={tried ? pinProblem : null}
                size={isMobile ? 'md' : 'sm'}
              />
              <Textarea
                label={reasonLabel}
                autosize
                minRows={2}
                maxLength={500}
                value={reason}
                onChange={(event) => setReason(event.currentTarget.value)}
                error={tried ? reasonProblem : null}
                size={isMobile ? 'md' : 'sm'}
              />
            </Stack>
          </Alert>
          {error !== null && (
            <Text size="sm" c="red" role="alert">
              {error}
            </Text>
          )}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={close} disabled={loading}>
              {t('Cancel')}
            </Button>
            <Button
              type="submit"
              color={confirmColor}
              loading={loading}
              disabled={blocker !== null}
            >
              {confirmLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
