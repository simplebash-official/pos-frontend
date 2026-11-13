import { useState } from 'react';
import { Textarea } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { useUploadClaimPhotos } from '../hooks/useClaimPhotos';
import { useQuickReplace } from '../hooks/useClaims';
import {
  emptyIntake,
  intakeClaimFields,
  intakeProblem,
  type IntakeState,
} from '../lib/claimIntake';
import type { ManagerApproval, ReplacementInput, Warranty, WarrantyClaim } from '../types';
import { ClaimIntakeFields } from './ClaimIntakeFields';
import { ManagerApprovalModal } from './ManagerApprovalModal';
import { ReplacementEndsNote, ReplacementPicker } from './ReplacementPicker';

export interface QuickReplaceModalProps {
  /** The warranty of the faulty unit; the window is mounted only while it is open. */
  warranty: Warranty;
  onClose: () => void;
  onReplaced: (claim: WarrantyClaim) => void;
}

/**
 * Swaps a faulty unit for a new one in one window: what is wrong, what was found, the new unit,
 * and a manager or owner's PIN. The server records the whole claim, from taking the item in to
 * handing the new unit over, in one request.
 */
export const QuickReplaceModal = ({ warranty, onClose, onReplaced }: QuickReplaceModalProps) => {
  const isMobile = useIsMobile();
  const replace = useQuickReplace();
  const photos = useUploadClaimPhotos();
  const [intake, setIntake] = useState<IntakeState>(emptyIntake(warranty));
  const [found, setFound] = useState('');
  const [serial, setSerial] = useState<string | null>(null);
  const [priceCents, setPriceCents] = useState<string | null>(null);

  // The new unit is picked by serial number when the faulty one has one: the server's own rule.
  const serialized = warranty.serialNumber !== undefined || intake.serialNumber.trim() !== '';
  const replacement: ReplacementInput | null = serialized
    ? serial === null
      ? null
      : { serialNumber: serial }
    : priceCents === null
      ? null
      : { sellingPriceCents: Number(priceCents) };

  const problem = (): string | null => {
    const intakeIssue = intakeProblem(intake);
    if (intakeIssue !== null) return intakeIssue;
    if (found.trim() === '') return t('Please say what you found.');
    if (replacement === null) return t('Choose the new unit.');
    return null;
  };

  const submit = (approval: ManagerApproval | undefined) => {
    if (replacement === null) return;
    replace.mutate(
      {
        ...intakeClaimFields(warranty, intake),
        inspectionNotes: found.trim(),
        replacement,
        approval,
      },
      {
        onSuccess: async (claim) => {
          await photos.upload(claim.key, intake.photos);
          onReplaced(claim);
        },
      }
    );
  };

  return (
    <ManagerApprovalModal
      opened
      onClose={onClose}
      title={t('Replace the unit')}
      description={t(
        'The faulty unit comes back and the customer is given a new one from stock. The whole claim is recorded in one go.'
      )}
      reasonLabel={t('Why is it being replaced?')}
      confirmLabel={t('Hand over the new unit')}
      confirmColor="blue"
      blocker={problem()}
      loading={replace.isPending || photos.uploading}
      error={replace.isError ? getErrorMessage(replace.error) : null}
      onConfirm={submit}
    >
      <ClaimIntakeFields
        warranty={warranty}
        value={intake}
        onChange={setIntake}
        issueError={null}
        damageError={null}
      />
      <Textarea
        label={t('What did you find?')}
        placeholder={t('e.g. Battery swollen, no liquid marks, seal intact')}
        autosize
        minRows={2}
        maxLength={1000}
        value={found}
        onChange={(event) => setFound(event.currentTarget.value)}
        size={isMobile ? 'md' : 'sm'}
      />
      <ReplacementPicker
        productKey={warranty.productKey}
        serialized={serialized}
        serial={serial}
        onSerial={setSerial}
        priceCents={priceCents}
        onPrice={setPriceCents}
      />
      <ReplacementEndsNote endsOn={warranty.endsOn} />
    </ManagerApprovalModal>
  );
};
