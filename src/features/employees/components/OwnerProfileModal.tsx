import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPhone } from '@tabler/icons-react';
import { useState } from 'react';
import { t } from '@/shared/i18n/t';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import type { ApiError } from '@/shared/types/common';
import { useCreateOwnerProfile } from '../hooks/useEmployees';
import type { Employee } from '../types';

export interface OwnerProfileModalProps {
  opened: boolean;
  onClose: () => void;
  /** Called with the new profile once it was saved. */
  onCreated: (employee: Employee) => void;
}

/** Same letters the server accepts in a phone number. */
const PHONE_PATTERN = /^[0-9+\s-]{9,15}$/;

/** Lets the shop owner add themselves as someone who does repair and print jobs. */
export const OwnerProfileModal = ({ opened, onClose, onCreated }: OwnerProfileModalProps) => {
  const isMobile = useIsMobile();
  const createProfile = useCreateOwnerProfile();
  const [failure, setFailure] = useState<string | null>(null);
  const form = useForm({
    initialValues: { phone: '' },
    validate: {
      phone: (value) =>
        PHONE_PATTERN.test(value.trim()) ? null : t('Enter a phone number, like 0771234567.'),
    },
  });

  const close = () => {
    form.reset();
    setFailure(null);
    onClose();
  };

  const submit = async (values: { phone: string }) => {
    setFailure(null);
    try {
      const employee = await createProfile.mutateAsync({ phone: values.phone.trim() });
      form.reset();
      onCreated(employee);
    } catch (error) {
      setFailure((error as ApiError).message);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <Text fw={700} size="lg">
          {t('Add me as a technician')}
        </Text>
      }
      size="sm"
      centered
      fullScreen={isMobile}
      zIndex={400}
    >
      <form
        onSubmit={(event) => {
          // This window sits inside the ticket window; its submit must not save the ticket too.
          event.stopPropagation();
          void form.onSubmit(submit)(event);
        }}
      >
        <Stack gap="md">
          <Text size="sm">
            {t(
              'You will be listed with your staff, so you can pick yourself on repair and print jobs. You keep the whole profit, so no commission is paid.'
            )}
          </Text>
          <TextInput
            label={t('Your phone number')}
            placeholder={t('e.g. 0771234567')}
            leftSection={<IconPhone size={16} />}
            required
            data-autofocus
            {...form.getInputProps('phone')}
          />
          {failure !== null && (
            <Text size="sm" c="red" role="alert">
              {failure}
            </Text>
          )}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={close} disabled={createProfile.isPending}>
              {t('Cancel')}
            </Button>
            <Button type="submit" color="blue" loading={createProfile.isPending}>
              {t('Add me')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
