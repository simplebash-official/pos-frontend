import { t } from '@/shared/i18n/t';
import { Button, Group, Modal, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconCheck, IconLock } from '@tabler/icons-react';
import { SessionClosingAlert } from '@/features/billing/components/sessions/SessionClosingAlert';

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
  shiftClosing?: boolean;
  closingCashierName?: string | null;
  closingError?: string | null;
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
  shiftClosing = false,
  closingCashierName,
  closingError = null,
}: InvoicePaymentModalProps) => {
  const isCashPaused = shiftClosing && method === 'cash';
  const showClosingBanner = isCashPaused || Boolean(closingError);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      zIndex={400}
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
            { label: t('Cash'), value: 'cash' },
            { label: t('Online / Bank Transfer'), value: 'online' },
            { label: t('Card'), value: 'card' },
          ]}
        />

        {showClosingBanner && (
          <SessionClosingAlert
            closingCashierName={closingError ? undefined : closingCashierName}
            message={
              closingError ??
              t(
                'A register cash count is in progress. Finish or cancel the close count before taking cash payments, or choose Online / Card.'
              )
            }
          />
        )}

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
            color={isCashPaused ? 'orange' : 'blue'}
            loading={submitting}
            disabled={isCashPaused}
            onClick={onConfirm}
            leftSection={isCashPaused ? <IconLock size={16} /> : <IconCheck size={16} />}
          >
            {isCashPaused ? t('Cash Count In Progress') : t('Confirm & Update Balance')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
