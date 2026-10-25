import { t } from '@/shared/i18n/t';
import { Alert, Stack, TextInput } from '@mantine/core';
import type { ApprovalState } from '../lib/receiptForm';

export interface ApprovalFieldsProps {
  approval: ApprovalState;
  onChange: (approval: ApprovalState) => void;
  isMobile: boolean;
}

/** One manager or owner approval for all the cash this receipt takes out of the drawer. */
export const ApprovalFields = ({ approval, onChange, isMobile }: ApprovalFieldsProps) => {
  const fieldSize = isMobile ? 'md' : 'sm';
  return (
    <Alert color="orange" title={t('A manager or owner must approve this')}>
      <Stack gap="sm">
        <TextInput
          label={t('Manager or owner PIN')}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={approval.managerPin}
          onChange={(event) => onChange({ ...approval, managerPin: event.currentTarget.value })}
          size={fieldSize}
        />
        <TextInput
          label={t('Why is more being paid than the drawer holds?')}
          description={t('Only needed when the payment is bigger than the cash in the drawer.')}
          value={approval.overrideReason}
          onChange={(event) => onChange({ ...approval, overrideReason: event.currentTarget.value })}
          size={fieldSize}
        />
      </Stack>
    </Alert>
  );
};
