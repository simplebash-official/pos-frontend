import React, { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { t } from '@/shared/i18n/t';
import { useCreatePayee, useUpdatePayee } from '@/features/billing/hooks/useCashLookups';
import { cleanPayeeName, payeeNameError, PAYEE_NAME_MAX } from '@/features/billing/lib/payeeName';
import type { Payee, UpdatePayeeInput } from '@/features/billing/types';

export interface PayeeFormModalProps {
  /** The payee being edited, or null to add a new landlord or company. */
  payee: Payee | null;
  onClose: () => void;
}

/** Only what the person changed is sent, so an edit made on another device is never overwritten. */
const changes = (p: Payee, f: { name: string; phone: string }): UpdatePayeeInput => {
  const out: UpdatePayeeInput = {};
  const name = cleanPayeeName(f.name);
  if (name !== p.name) out.name = name;
  if (f.phone.trim() !== (p.phone ?? '')) out.phone = f.phone.trim();
  return out;
};

/** Adds a landlord or company, or renames one and changes its phone number. */
export const PayeeFormModal: React.FC<PayeeFormModalProps> = ({ payee, onClose }) => {
  const isMobile = useIsMobile();
  const create = useCreatePayee();
  const update = useUpdatePayee();
  const [name, setName] = useState(payee === null ? '' : payee.name);
  const [phone, setPhone] = useState(payee?.phone ?? '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = payeeNameError(name);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      if (payee === null) {
        await create.mutateAsync({
          payeeType: 'vendor',
          name: cleanPayeeName(name),
          phone: phone.trim() === '' ? undefined : phone.trim(),
        });
      } else {
        const input = changes(payee, { name, phone });
        if (Object.keys(input).length === 0) {
          onClose();
          return;
        }
        await update.mutateAsync({ key: payee.key, input });
        notifications.show({
          title: t('Saved'),
          message: cleanPayeeName(name),
          color: 'green',
        });
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, t('This could not be saved. Please try again.')));
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {payee === null ? t('Add Landlord or Company') : t('Edit Landlord or Company')}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <TextInput
            label={t('Name')}
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value);
              setError(null);
            }}
            maxLength={PAYEE_NAME_MAX}
            required
            data-autofocus
          />
          <TextInput
            label={t('Phone number (optional)')}
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value)}
            inputMode="tel"
            autoComplete="off"
          />
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title={t('Please check')}
            >
              {error}
            </Alert>
          )}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} type="button">
              {t('Cancel')}
            </Button>
            <Button type="submit" color="blue" loading={create.isPending || update.isPending}>
              {t('Save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
