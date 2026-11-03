import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Group,
  Modal,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useAllEmployees } from '@/features/employees/hooks/useEmployees';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { useOpenClaim } from '../hooks/useClaims';
import { NO_CHECKS, VOID_CHECK_KEYS, voidCheckLabel } from '../lib/claimView';
import type { ManagerApproval, VoidChecks, Warranty, WarrantyClaim } from '../types';
import { ManagerApprovalModal } from './ManagerApprovalModal';
import { WarrantyStateDot } from './WarrantyStateDot';

const sectionLabel = (text: string) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
    {text}
  </Text>
);

interface IntakeState {
  issue: string;
  checks: VoidChecks;
  technicianKey: string | null;
}

const EMPTY: IntakeState = { issue: '', checks: NO_CHECKS, technicianKey: null };

/** The item, what is wrong with it, what staff can see on it, and who will look at it. */
const IntakeFields = ({
  warranty,
  value,
  onChange,
  issueError,
}: {
  warranty: Warranty;
  value: IntakeState;
  onChange: (next: IntakeState) => void;
  issueError: string | null;
}) => {
  const isMobile = useIsMobile();
  const employees = useAllEmployees();
  const anyTicked = VOID_CHECK_KEYS.some((key) => value.checks[key]);
  return (
    <Stack gap="md">
      <Paper withBorder p="sm" bg="var(--bg-app)">
        <Group justify="space-between" wrap="nowrap" align="flex-start" gap="sm">
          <Box style={{ minWidth: 0 }}>
            <Text fw={700} lineClamp={2}>
              {warranty.itemName}
            </Text>
            <Text size="xs" c="dimmed" ff="monospace" style={{ overflowWrap: 'anywhere' }}>
              {warranty.serialNumber === undefined
                ? warranty.warrantyNumber
                : `${warranty.serialNumber} · ${warranty.warrantyNumber}`}
            </Text>
            <Text size="xs" c="dimmed">
              {warranty.customerName === undefined ? t('Walk-in customer') : warranty.customerName}
              {' · '}
              {warranty.invoiceNumber}
            </Text>
          </Box>
          <WarrantyStateDot state={warranty.state} size="xs" />
        </Group>
      </Paper>

      <Textarea
        label={t('What is wrong with it?')}
        placeholder={t('In the customer’s words, e.g. “Turns off after ten minutes”')}
        autosize
        minRows={3}
        maxLength={1000}
        value={value.issue}
        onChange={(event) => onChange({ ...value, issue: event.currentTarget.value })}
        error={issueError}
        size={isMobile ? 'md' : 'sm'}
        data-autofocus={isMobile ? undefined : true}
      />

      <Stack gap={6}>
        {sectionLabel(t('What do you see on it?'))}
        <Text size="xs" c="dimmed">
          {t(
            'Tick anything you can see now, in front of the customer. Leave all empty if it looks fine.'
          )}
        </Text>
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="xs">
          {VOID_CHECK_KEYS.map((key) => (
            <Checkbox.Card
              key={key}
              checked={value.checks[key]}
              onClick={() =>
                onChange({ ...value, checks: { ...value.checks, [key]: !value.checks[key] } })
              }
              p="sm"
              style={{
                minHeight: 44,
                borderColor: value.checks[key]
                  ? 'var(--mantine-color-orange-filled)'
                  : 'var(--mantine-color-default-border)',
                backgroundColor: value.checks[key]
                  ? 'var(--mantine-color-orange-light)'
                  : undefined,
              }}
            >
              <Group wrap="nowrap" gap="sm">
                <Checkbox.Indicator color="orange" />
                <Text size="sm" fw={600}>
                  {voidCheckLabel(key)}
                </Text>
              </Group>
            </Checkbox.Card>
          ))}
        </SimpleGrid>
        {anyTicked && (
          <Alert color="orange" icon={<IconAlertTriangle size={16} />} p="xs">
            {t('This may mean the warranty does not cover the fault. A manager decides later.')}
          </Alert>
        )}
      </Stack>

      <Select
        label={t('Who will look at it?')}
        placeholder={t('Choose later')}
        data={employees.data
          .filter((employee) => employee.status === 'active')
          .map((employee) => ({ value: employee.key, label: employee.name }))}
        value={value.technicianKey}
        onChange={(key) => onChange({ ...value, technicianKey: key })}
        clearable
        searchable
        size={isMobile ? 'md' : 'sm'}
        comboboxProps={{ withinPortal: true }}
      />
    </Stack>
  );
};

export interface StartClaimModalProps {
  /** The warranty to claim on; `null` while closed. */
  warranty: Warranty | null;
  onClose: () => void;
  onStarted: (claim: WarrantyClaim) => void;
}

/**
 * Takes a faulty item in under its warranty: what the customer says is wrong, what staff can see
 * on it, and (optionally) who will look at it. A warranty that has run out needs a manager or
 * owner to accept the claim; the server checks the PIN.
 */
export const StartClaimModal = ({ warranty, onClose, onStarted }: StartClaimModalProps) => {
  const isMobile = useIsMobile();
  const open = useOpenClaim();
  const [state, setState] = useState<IntakeState>(EMPTY);
  const [tried, setTried] = useState(false);

  const close = () => {
    setState(EMPTY);
    setTried(false);
    open.reset();
    onClose();
  };

  if (warranty === null) return null;

  const issueProblem = state.issue.trim() === '' ? t('Please say what is wrong with it.') : null;
  const expired = warranty.state === 'expired';
  const error = open.isError ? getErrorMessage(open.error) : null;

  const submit = (approval: ManagerApproval | undefined) => {
    setTried(true);
    if (issueProblem !== null) return;
    open.mutate(
      {
        warrantyKey: warranty.key,
        issueDescription: state.issue.trim(),
        voidChecks: state.checks,
        assignedEmployeeKey: state.technicianKey === null ? undefined : state.technicianKey,
        approval,
      },
      {
        onSuccess: (claim) => {
          setState(EMPTY);
          setTried(false);
          onStarted(claim);
        },
      }
    );
  };

  const fields = (
    <IntakeFields
      warranty={warranty}
      value={state}
      onChange={setState}
      issueError={tried ? issueProblem : null}
    />
  );

  if (expired) {
    return (
      <ManagerApprovalModal
        opened
        onClose={close}
        title={t('Start a claim on an ended warranty')}
        description={`${t('This warranty ended on')} ${formatDate(
          warranty.endsOn as string
        )}. ${t('A manager or owner can still accept the claim as a goodwill gesture.')}`}
        reasonLabel={t('Why is it being accepted?')}
        confirmLabel={t('Start the claim')}
        confirmColor="blue"
        blocker={issueProblem}
        loading={open.isPending}
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
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
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
            <Button variant="default" onClick={close} disabled={open.isPending}>
              {t('Cancel')}
            </Button>
            <Button type="submit" loading={open.isPending} data-log-id="warranties.start-claim">
              {t('Start the claim')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
