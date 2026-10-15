import { t } from '@/shared/i18n/t';
import { Button, Group, Modal, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

export interface InvoicePaymentModalProps {
  opened: boolean;
  onClose: () => void;
  invoiceNumber: string | undefined;
  amountRupees: number | '';
  onAmountChange: (value: number | '') => void;
  method: string;
  onMethodChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  submitting: boolean;
  onConfirm: () => void;
  fullScreen: boolean;
}

/** The Record Payment dialog for a credit invoice. The drawer owns the values and the save. */
export const InvoicePaymentModal = ({
  opened,
  onClose,
  invoiceNumber,
  amountRupees,
  onAmountChange,
  method,
  onMethodChange,
  notes,
  onNotesChange,
  submitting,
  onConfirm,
  fullScreen,
}: InvoicePaymentModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={
      <Text fw={700} size="lg">
        {t('Record Payment — #')}
        {invoiceNumber}
      </Text>
    }
    centered
    fullScreen={fullScreen}
  >
    <Stack gap="md">
      <NumberInput
        label={t('Payment Amount (Rs.)')}
        prefix="Rs. "
        min={1}
        value={amountRupees}
        onChange={(val) => onAmountChange(typeof val === 'number' ? val : '')}
      />

      <Select
        label={t('Payment Method')}
        value={method}
        onChange={(v) => onMethodChange(v || 'cash')}
        data={[
          { label: 'Cash', value: 'cash' },
          { label: 'Online / Bank Transfer', value: 'online' },
          { label: 'Card', value: 'card' },
        ]}
      />

      <TextInput
        label={t('Note / Transaction Ref (Optional)')}
        placeholder={t('e.g. Slip TRX-12345')}
        value={notes}
        onChange={(e) => onNotesChange(e.currentTarget.value)}
      />

      <Group justify="flex-end" mt="md" gap="sm">
        <Button variant="default" onClick={onClose} disabled={submitting}>
          {t('Cancel')}
        </Button>
        <Button
          color="blue"
          loading={submitting}
          onClick={onConfirm}
          leftSection={<IconCheck size={16} />}
        >
          {t('Confirm & Update Balance')}
        </Button>
      </Group>
    </Stack>
  </Modal>
);
