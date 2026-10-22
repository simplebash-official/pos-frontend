import { t } from '@/shared/i18n/t';
import { useEffect } from 'react';
import { Modal, PasswordInput, Button, Group, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconKey, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useSetPin } from '@/features/billing/hooks/useRegisterSession';
import { validatePin } from '../lib/pin';
import type { UserAccount } from '../types';

export interface SetPinModalProps {
  opened: boolean;
  onClose: () => void;
  /** The account to set a PIN for (admin only). Absent = the signed-in user's own PIN. */
  target?: UserAccount | null;
}

export const SetPinModal = ({ opened, onClose, target }: SetPinModalProps) => {
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  const setPinMutation = useSetPin();

  const form = useForm({
    initialValues: { pin: '', confirm: '' },
    validate: {
      pin: validatePin,
      confirm: (val, values) => (val === values.pin ? null : 'PINs do not match'),
    },
  });

  useEffect(() => {
    if (!opened) form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleSubmit = async (values: { pin: string }) => {
    try {
      await setPinMutation.mutateAsync({ pin: values.pin, targetUserId: target?.id });
    } catch (err) {
      form.setFieldError('pin', err instanceof Error ? err.message : 'Could not set the PIN');
      return;
    }
    void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    notifications.show({
      title: 'PIN Saved',
      message: target ? `${target.name}'s PIN has been set` : 'Your PIN has been set',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {target ? `Set PIN for ${target.name}` : 'Set My PIN'}
        </Text>
      }
      size="sm"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('Used to approve register overrides, like a cash float difference.')}
          </Text>
          <PasswordInput
            label={t('PIN')}
            placeholder={t('4 to 8 digits')}
            leftSection={<IconKey size={16} />}
            inputMode="numeric"
            maxLength={8}
            data-autofocus
            required
            {...form.getInputProps('pin')}
          />
          <PasswordInput
            label={t('Confirm PIN')}
            inputMode="numeric"
            maxLength={8}
            required
            {...form.getInputProps('confirm')}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              {t('Cancel')}
            </Button>
            <Button type="submit" loading={setPinMutation.isPending}>
              {t('Save PIN')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
