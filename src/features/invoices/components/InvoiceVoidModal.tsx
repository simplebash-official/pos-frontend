import { t } from '@/shared/i18n/t';
import { Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';

export interface InvoiceVoidModalProps {
  opened: boolean;
  onClose: () => void;
  invoiceNumber: string | undefined;
  reason: string;
  onReasonChange: (value: string) => void;
  voiding: boolean;
  onConfirm: () => void;
}

/**
 * Void Invoice confirmation — a small centered dialog, not fullScreen, per the "very small
 * confirmation dialogs" exception to the center-modal family (see ConfirmDialog.tsx). It needs
 * its own Modal rather than ConfirmDialog since a void reason is mandatory input, not just a
 * yes/no message. The drawer owns the reason and the void itself.
 */
export const InvoiceVoidModal = ({
  opened,
  onClose,
  invoiceNumber,
  reason,
  onReasonChange,
  voiding,
  onConfirm,
}: InvoiceVoidModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={
      <Text fw={700} size="lg">
        {t('Void Invoice — #')}
        {invoiceNumber}
      </Text>
    }
    centered
    size="sm"
  >
    <Stack gap="md">
      <Text size="sm">
        {t(
          'This reverses the sale — any stock and payments already recorded against this invoice are undone. This cannot be undone from here, so please explain why.'
        )}
      </Text>
      <Textarea
        label={t('Reason for voiding')}
        placeholder={t('e.g. Entered by mistake, duplicate sale')}
        required
        minRows={2}
        value={reason}
        onChange={(e) => onReasonChange(e.currentTarget.value)}
      />
      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={voiding}>
          {t('Cancel')}
        </Button>
        <Button color="red" onClick={onConfirm} loading={voiding} disabled={!reason.trim()}>
          {t('Void Invoice')}
        </Button>
      </Group>
    </Stack>
  </Modal>
);
