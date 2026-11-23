import { useState } from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useCanSelfApprove } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { useOpenClaim } from '../hooks/useClaims';
import {
  emptyIntake,
  intakeClaimFields,
  damageProblem,
  intakeProblem,
  issueProblem,
  type IntakeState,
} from '../lib/claimIntake';
import type { ManagerApproval, Warranty, WarrantyClaim } from '../types';
import { ClaimIntakeFields } from './ClaimIntakeFields';
import { ManagerApprovalModal } from './ManagerApprovalModal';

export interface StartClaimModalProps {
  /** The warranty to claim on; `null` while closed. */
  warranty: Warranty | null;
  onClose: () => void;
  onStarted: (claim: WarrantyClaim) => void;
}

/**
 * Takes a faulty item in under its warranty: what the customer says is wrong, what staff can see
 * on it, how many units, and (optionally) who will look at it. A warranty that has run out needs
 * a manager or owner to accept the claim; the server checks the PIN.
 */
export const StartClaimModal = ({ warranty, onClose, onStarted }: StartClaimModalProps) => {
  const isMobile = useIsMobile();
  const open = useOpenClaim();
  const selfApproves = useCanSelfApprove();
  const [state, setState] = useState<IntakeState>(emptyIntake(warranty));
  const [tried, setTried] = useState(false);

  const close = () => {
    setState(emptyIntake(null));
    setTried(false);
    open.reset();
    onClose();
  };

  if (warranty === null) return null;

  const problem = intakeProblem(state);
  const expired = warranty.state === 'expired';
  const error = open.isError ? getErrorMessage(open.error) : null;
  const isBusy = open.isPending;

  const submit = (approval: ManagerApproval | undefined) => {
    setTried(true);
    if (problem !== null) return;
    open.mutate(
      {
        ...intakeClaimFields(warranty, state),
        assignedEmployeeKey: state.technicianKey === null ? undefined : state.technicianKey,
        approval,
      },
      {
        onSuccess: (claim) => {
          setState(emptyIntake(null));
          setTried(false);
          onStarted(claim);
        },
      }
    );
  };

  const fields = (
    <ClaimIntakeFields
      warranty={warranty}
      value={state}
      onChange={setState}
      issueError={tried ? issueProblem(state) : null}
      damageError={tried ? damageProblem(state) : null}
    />
  );

  if (expired) {
    return (
      <ManagerApprovalModal
        opened
        onClose={close}
        title={t('Start a claim on an ended warranty')}
        description={`${t('This warranty ended on')} ${formatDate(warranty.endsOn as string)}.${
          selfApproves
            ? ''
            : ` ${t('A manager or owner can still accept the claim as a goodwill gesture.')}`
        }`}
        reasonLabel={t('Why is it being accepted?')}
        confirmLabel={t('Start the claim')}
        confirmColor="blue"
        blocker={problem}
        loading={isBusy}
        error={error}
        onConfirm={(approval) => submit(approval)}
      >
        {fields}
      </ManagerApprovalModal>
    );
  }

  return (
    <Modal
      opened
      onClose={close}
      title={
        <Text fw={700} size="lg">
          {t('Start a warranty claim')}
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
          // See ManagerApprovalModal: a submit here must not reach a form around the opener.
          event.stopPropagation();
          submit(undefined);
        }}
      >
        <Stack gap="md">
          {fields}
          {error !== null && (
            <Text size="sm" c="red" role="alert">
              {error}
            </Text>
          )}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={close} disabled={isBusy}>
              {t('Cancel')}
            </Button>
            <Button type="submit" loading={isBusy} data-log-id="warranties.start-claim">
              {t('Start the claim')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
