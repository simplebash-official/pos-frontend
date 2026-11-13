import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Stepper,
  Text,
  Textarea,
  VisuallyHidden,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { StepSwitch } from '@/shared/motion';
import { useProcessClaim } from '../hooks/useClaims';
import { damageProblem, issueProblem } from '../lib/claimIntake';
import {
  confirmLabel,
  isSerialized,
  nextStep,
  previousStep,
  replaceUnavailable,
  reviewRows,
  startedClaimOf,
  stepLabel,
  stepProblem,
  toProcessInput,
  WIZARD_STEPS,
  emptyWizard,
  type RepairWhen,
  type WizardState,
  type WizardStep,
} from '../lib/claimWizard';
import { DECISIONS, decisionHint, decisionLabel, refundPath } from '../lib/claimView';
import { focusFirstInvalid } from '../lib/focusFirstInvalid';
import { storySummary } from '../lib/batchClaim';
import type { ClaimDecision, Warranty, WarrantyClaim } from '../types';
import { ChoiceCards } from './ChoiceCards';
import { ClaimIntakeFields } from './ClaimIntakeFields';
import { ModalFooter } from './ModalFooter';
import { ReplacementEndsNote, ReplacementPicker } from './ReplacementPicker';

export interface ClaimWizardModalProps {
  /** The warranty of the faulty item; the window is mounted only while it is open. */
  warranty: Warranty;
  onClose: () => void;
  /** The claim was recorded (a refund goes on to its credit note instead of calling this). */
  onDone: (claim: WarrantyClaim) => void;
}

const REPAIR_OPTIONS: RepairWhen[] = ['now', 'later'];
const REPAIR_LABEL: Record<RepairWhen, string> = {
  now: 'Repaired now',
  later: 'Not finished yet',
};
const REPAIR_HINT: Record<RepairWhen, string> = {
  now: 'The item is fixed. It is given back today and the warranty carries on.',
  later: 'The claim stays open. Finish it from the claim when the repair is done.',
};

type HandBackChoice = 'give' | 'keep';
const HAND_BACK_OPTIONS: HandBackChoice[] = ['give', 'keep'];
const HAND_BACK_LABEL: Record<HandBackChoice, string> = {
  give: 'Give it back now',
  keep: 'Keep it for now',
};
const HAND_BACK_HINT: Record<HandBackChoice, string> = {
  give: 'The item goes back to the customer as it came, and the claim is closed.',
  keep: 'The claim is closed but the item stays with you for now.',
};

/** Five thin segments and the step's name, for a phone where a full stepper would not fit. */
const CompactProgress = ({ index }: { index: number }) => (
  <Stack gap={6}>
    <Text size="sm" fw={600}>
      {`${t('Step')} ${index + 1} ${t('of')} ${WIZARD_STEPS.length} · ${stepLabel(WIZARD_STEPS[index])}`}
    </Text>
    <Group gap={4} wrap="nowrap" aria-hidden>
      {WIZARD_STEPS.map((step, position) => (
        <Box
          key={step}
          h={4}
          style={{
            flex: 1,
            borderRadius: 2,
            background:
              position <= index
                ? 'var(--mantine-primary-color-filled)'
                : 'var(--mantine-color-default-border)',
          }}
        />
      ))}
    </Group>
  </Stack>
);

/** The item and what is wrong with it, kept in view on every step after the first. */
const Recap = ({ warranty, state }: { warranty: Warranty; state: WizardState }) => {
  const unit = warranty.serialNumber ?? (state.intake.serialNumber.trim() || null);
  return (
    <Paper withBorder p="sm" bg="var(--bg-app)">
      <Text size="sm" fw={600}>
        {unit === null ? warranty.itemName : `${warranty.itemName} · ${unit}`}
      </Text>
      <Text size="xs" c="dimmed">
        {storySummary(state.intake)}
      </Text>
    </Paper>
  );
};

/**
 * Takes a faulty item from the counter to its outcome in one window with steps: the item, what
 * the inspection found, the decision, what happens next, and a last look. Nothing is saved until
 * the last button, and then one request records the whole claim. For an Admin or Manager, who
 * decide for themselves; Staff keep the claim window and the quick replace that ask for a PIN.
 */
export const ClaimWizardModal = ({ warranty, onClose, onDone }: ClaimWizardModalProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const process = useProcessClaim();
  const [state, setState] = useState<WizardState>(() => emptyWizard(warranty));
  const [step, setStep] = useState<WizardStep>('item');
  const [tried, setTried] = useState<WizardStep | null>(null);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const index = WIZARD_STEPS.indexOf(step);
  const previous = previousStep(step);
  const next = nextStep(step);
  const busy = process.isPending;
  // A phone needs 44px targets; Mantine's default button is 36px.
  const touch = isMobile ? 44 : undefined;
  const started = process.isError ? startedClaimOf(process.error) : null;

  const problem = stepProblem(step, state, warranty);
  const shown = tried === step ? problem : null;
  const dirty = step !== 'item' || state.intake.issue.trim() !== '' || state.intake.damage !== null;

  // A new step starts at its first field on a computer; a phone keeps its keyboard away.
  useEffect(() => {
    if (isMobile) return;
    const frame = requestAnimationFrame(() => {
      bodyRef.current?.querySelector<HTMLElement>('textarea, input:not([type=hidden])')?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [step, isMobile]);

  const requestClose = () => {
    if (busy) return;
    if (dirty && started === null) setConfirmingClose(true);
    else onClose();
  };

  const go = (target: WizardStep) => {
    process.reset();
    setTried(null);
    setStep(target);
  };

  const submit = () => {
    if (started !== null) return;
    if (problem !== null) {
      setTried(step);
      focusFirstInvalid(bodyRef.current);
      return;
    }
    if (next !== null) {
      go(next);
      return;
    }
    const input = toProcessInput(warranty, state);
    if (input === null) return;
    process.mutate(input, {
      onSuccess: (claim) => {
        if (claim.decision === 'refund') {
          onClose();
          navigate(refundPath(claim));
        } else {
          onDone(claim);
        }
      },
    });
  };

  const patch = (change: Partial<WizardState>) => setState({ ...state, ...change });
  const note = process.isError ? getErrorMessage(process.error) : shown;
  const expired = warranty.state === 'expired';
  const serialized = isSerialized(warranty, state);

  const decisionStep = (
    <Stack gap="md">
      <Recap warranty={warranty} state={state} />
      <ChoiceCards<ClaimDecision>
        groupLabel={t('What to do')}
        value={state.decision}
        onChange={(decision) => patch({ decision })}
        options={DECISIONS}
        label={decisionLabel}
        hint={decisionHint}
        unavailable={(decision) => (decision === 'replace' ? replaceUnavailable(warranty) : null)}
      />
    </Stack>
  );

  const outcomeBody = () => {
    switch (state.decision) {
      case 'replace':
        return (
          <>
            <ReplacementPicker
              productKey={warranty.productKey}
              serialized={serialized}
              serial={state.serial}
              onSerial={(serial) => patch({ serial })}
              priceCents={state.priceCents}
              onPrice={(priceCents) => patch({ priceCents })}
            />
            {expired ? (
              <Alert color="orange" icon={<IconInfoCircle size={16} />} p="xs">
                {t('This warranty has ended, so the new unit starts with no cover left.')}
              </Alert>
            ) : (
              <ReplacementEndsNote endsOn={warranty.endsOn} />
            )}
            <Textarea
              label={t('Note (optional)')}
              autosize
              minRows={2}
              maxLength={500}
              value={state.note}
              onChange={(event) => patch({ note: event.currentTarget.value })}
              size={isMobile ? 'md' : 'sm'}
            />
          </>
        );
      case 'repair':
        return (
          <>
            <ChoiceCards<RepairWhen>
              groupLabel={t('Is the repair finished?')}
              value={state.repairWhen}
              onChange={(repairWhen) => patch({ repairWhen })}
              options={REPAIR_OPTIONS}
              label={(option) => t(REPAIR_LABEL[option])}
              hint={(option) => t(REPAIR_HINT[option])}
              unavailable={null}
            />
            {state.repairWhen === 'now' && (
              <Textarea
                label={t('Note (optional)')}
                autosize
                minRows={2}
                maxLength={500}
                value={state.note}
                onChange={(event) => patch({ note: event.currentTarget.value })}
                size={isMobile ? 'md' : 'sm'}
              />
            )}
          </>
        );
      case 'refund':
        return (
          <Alert color="blue" icon={<IconInfoCircle size={16} />}>
            {t(
              'Nothing to choose here. Saving opens the credit note with this item ticked. The warranty ends once the refund is made.'
            )}
          </Alert>
        );
      case 'reject':
        return (
          <ChoiceCards<HandBackChoice>
            groupLabel={t('Does the item go back now?')}
            value={state.handBack === null ? null : state.handBack ? 'give' : 'keep'}
            onChange={(choice) => patch({ handBack: choice === 'give' })}
            options={HAND_BACK_OPTIONS}
            label={(option) => t(HAND_BACK_LABEL[option])}
            hint={(option) => t(HAND_BACK_HINT[option])}
            unavailable={null}
          />
        );
      case null:
        return null;
    }
  };

  const reviewStep = (
    <Stack gap="md">
      <Paper withBorder p="md">
        <Stack gap="sm">
          {reviewRows(warranty, state).map((row) => (
            <Group key={`${row.step}-${row.label}`} justify="space-between" align="flex-start">
              <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {row.label}
                </Text>
                <Text size="sm">{row.value}</Text>
              </Stack>
              <Button
                variant="subtle"
                size="compact-sm"
                h={touch}
                onClick={() => go(row.step)}
                aria-label={`${t('Change')}: ${row.label}`}
              >
                {t('Edit')}
              </Button>
            </Group>
          ))}
        </Stack>
      </Paper>
      <Text size="sm" c="dimmed">
        {t('This will be recorded as approved by you.')}
      </Text>
    </Stack>
  );

  const body: Record<WizardStep, ReactNode> = {
    item: (
      <ClaimIntakeFields
        warranty={warranty}
        value={state.intake}
        onChange={(intake) => patch({ intake })}
        issueError={tried === 'item' ? issueProblem(state.intake) : null}
        damageError={tried === 'item' ? damageProblem(state.intake) : null}
      />
    ),
    inspection: (
      <Stack gap="md">
        <Recap warranty={warranty} state={state} />
        {expired && warranty.endsOn !== undefined && (
          <Alert color="blue" icon={<IconInfoCircle size={16} />}>
            {`${t('This warranty ended on')} ${formatDate(warranty.endsOn)}. ${t(
              'Going on accepts the claim as a goodwill gesture.'
            )}`}
          </Alert>
        )}
        <Textarea
          label={t('What did you find?')}
          withAsterisk
          placeholder={t('e.g. Battery swollen, no liquid marks, seal intact')}
          autosize
          minRows={3}
          maxLength={1000}
          value={state.found}
          onChange={(event) => patch({ found: event.currentTarget.value })}
          error={tried === 'inspection' ? problem : null}
          size={isMobile ? 'md' : 'sm'}
        />
      </Stack>
    ),
    decision: decisionStep,
    outcome: (
      <Stack gap="md">
        <Recap warranty={warranty} state={state} />
        {outcomeBody()}
      </Stack>
    ),
    review: reviewStep,
  };

  return (
    <>
      <Modal
        opened
        onClose={requestClose}
        closeOnEscape={!confirmingClose}
        title={
          <Text fw={700} size="lg">
            {t('Process warranty claim')}
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
            submit();
          }}
        >
          <Stack gap="md">
            {isMobile ? (
              <CompactProgress index={index} />
            ) : (
              <Stepper
                active={index}
                size="sm"
                wrap={false}
                iconSize={28}
                styles={{ separator: { marginInline: 6, minWidth: 8 } }}
                allowNextStepsSelect={false}
                onStepClick={(position) => go(WIZARD_STEPS[position])}
              >
                {WIZARD_STEPS.map((id) => (
                  <Stepper.Step key={id} label={stepLabel(id)} />
                ))}
              </Stepper>
            )}
            <VisuallyHidden role="status">
              {`${t('Step')} ${index + 1} ${t('of')} ${WIZARD_STEPS.length}: ${stepLabel(step)}`}
            </VisuallyHidden>
            {/* Keeps the window from jumping in height as the steps change. */}
            <div ref={bodyRef} style={{ minHeight: isMobile ? undefined : 320 }}>
              <StepSwitch step={index}>{body[step]}</StepSwitch>
            </div>
            <ModalFooter note={note}>
              {started !== null ? (
                <>
                  <Button variant="default" h={touch} onClick={onClose}>
                    {t('Close')}
                  </Button>
                  <Button
                    h={touch}
                    onClick={() => {
                      onClose();
                      navigate(`${ROUTES.WARRANTIES}?view=claims&claim=${started.key}`);
                    }}
                    data-log-id="warranties.wizard-open-claim"
                  >
                    {`${t('Open claim')} ${started.number}`}
                  </Button>
                </>
              ) : (
                <>
                  {previous === null ? (
                    <Button variant="default" h={touch} onClick={requestClose} disabled={busy}>
                      {t('Cancel')}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      h={touch}
                      onClick={() => go(previous)}
                      disabled={busy}
                    >
                      {t('Back')}
                    </Button>
                  )}
                  <Button
                    type="submit"
                    h={touch}
                    loading={busy}
                    data-log-id={
                      next === null ? 'warranties.wizard-save' : 'warranties.wizard-next'
                    }
                  >
                    {next === null ? confirmLabel(state) : t('Next')}
                  </Button>
                </>
              )}
            </ModalFooter>
          </Stack>
        </form>
      </Modal>
      <ConfirmDialog
        opened={confirmingClose}
        onClose={() => setConfirmingClose(false)}
        onConfirm={onClose}
        title={t('Discard this claim?')}
        confirmLabel={t('Discard')}
        cancelLabel={t('Keep editing')}
        confirmColor="red"
        zIndex={410}
      >
        {t('Nothing has been saved yet. What you filled in will be lost.')}
      </ConfirmDialog>
    </>
  );
};
