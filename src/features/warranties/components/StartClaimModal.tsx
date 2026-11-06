import { useMemo, useRef, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Box,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconInfoCircle,
  IconPhoto,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useUploadAttachment } from '@/features/attachments/hooks/useAttachments';
import { blobToBase64, shrinkImage } from '@/features/attachments/lib/shrinkImage';
import { useAllEmployees } from '@/features/employees/hooks/useEmployees';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import {
  useCreateWarrantyCondition,
  useOpenClaim,
  useWarrantyConditions,
} from '../hooks/useClaims';
import { NO_CHECKS } from '../lib/claimView';
import type { ManagerApproval, VoidChecks, Warranty, WarrantyClaim } from '../types';
import { ManagerApprovalModal } from './ManagerApprovalModal';
import { WarrantyStateDot } from './WarrantyStateDot';

const sectionLabel = (text: string) => (
  <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
    {text}
  </Text>
);

interface IntakeState {
  quantity: number;
  serialNumber: string;
  issue: string;
  checks: VoidChecks;
  conditions: string[];
  technicianKey: string | null;
  photos: File[];
}

const DEFAULT_STARTER_CONDITIONS = [
  'Physical damage / cracks',
  'Liquid damage',
  'Seal broken',
  'Opened or tampered with',
];

const EMPTY_STATE = (warranty: Warranty | null): IntakeState => ({
  quantity: 1,
  serialNumber: warranty?.serialNumber ?? '',
  issue: '',
  checks: NO_CHECKS,
  conditions: [],
  technicianKey: null,
  photos: [],
});

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const conditionsQuery = useWarrantyConditions();
  const createConditionMutation = useCreateWarrantyCondition();
  const [newConditionInput, setNewConditionInput] = useState('');

  const unclaimedUnits = Math.max(1, warranty.quantity - (warranty.claimedQuantity ?? 0));
  const isMultiUnit = warranty.quantity > 1;

  const availableOptions = useMemo(() => {
    const list: string[] = [];
    if (conditionsQuery.data && conditionsQuery.data.length > 0) {
      for (const item of conditionsQuery.data) {
        if (!list.includes(item.name)) list.push(item.name);
      }
    } else {
      for (const item of DEFAULT_STARTER_CONDITIONS) {
        if (!list.includes(item)) list.push(item);
      }
    }
    for (const item of value.conditions) {
      if (!list.includes(item)) list.push(item);
    }
    return list;
  }, [conditionsQuery.data, value.conditions]);

  const toggleCondition = (name: string) => {
    const nextConditions = value.conditions.includes(name)
      ? value.conditions.filter((c) => c !== name)
      : [...value.conditions, name];
    const nextChecks: VoidChecks = {
      physicalDamage: nextConditions.some((c) => /physical|crack|broken/i.test(c)),
      liquidDamage: nextConditions.some((c) => /liquid|water/i.test(c)),
      sealBroken: nextConditions.some((c) => /seal/i.test(c)),
      tampered: nextConditions.some((c) => /tamper|opened/i.test(c)),
    };
    onChange({
      ...value,
      conditions: nextConditions,
      checks: nextChecks,
    });
  };

  const handleAddCondition = () => {
    const trimmed = newConditionInput.trim();
    if (!trimmed) return;
    if (!value.conditions.includes(trimmed)) {
      const nextConditions = [...value.conditions, trimmed];
      const nextChecks: VoidChecks = {
        physicalDamage: nextConditions.some((c) => /physical|crack|broken/i.test(c)),
        liquidDamage: nextConditions.some((c) => /liquid|water/i.test(c)),
        sealBroken: nextConditions.some((c) => /seal/i.test(c)),
        tampered: nextConditions.some((c) => /tamper|opened/i.test(c)),
      };
      onChange({
        ...value,
        conditions: nextConditions,
        checks: nextChecks,
      });
      createConditionMutation.mutate(trimmed);
    }
    setNewConditionInput('');
  };

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
              {isMultiUnit && (
                <>
                  {' · '}
                  <Text
                    component="span"
                    fw={600}
                    c={(warranty.claimedQuantity ?? 0) > 0 ? 'orange' : 'dimmed'}
                  >
                    {(warranty.claimedQuantity ?? 0) > 0
                      ? `${warranty.claimedQuantity} of ${warranty.quantity} ${t('units claimed')}`
                      : `${warranty.quantity} ${t('units covered')}`}
                  </Text>
                </>
              )}
            </Text>
          </Box>
          <WarrantyStateDot state={warranty.state} size="xs" />
        </Group>
      </Paper>

      {isMultiUnit && (
        <Group grow align="flex-start" gap="sm">
          <NumberInput
            label={t('Units to claim')}
            description={`${unclaimedUnits} of ${warranty.quantity} ${t('units available to claim')}`}
            min={1}
            max={unclaimedUnits}
            step={1}
            value={value.quantity}
            onChange={(val) =>
              onChange({
                ...value,
                quantity: typeof val === 'number' && val >= 1 ? Math.min(val, unclaimedUnits) : 1,
              })
            }
            size={isMobile ? 'md' : 'sm'}
          />
          {warranty.serialNumber === undefined && (
            <TextInput
              label={t('Specific serial / IMEI (optional)')}
              placeholder={t('e.g. SN-098234')}
              description={t('If this unit has its own serial')}
              value={value.serialNumber}
              onChange={(event) => onChange({ ...value, serialNumber: event.currentTarget.value })}
              size={isMobile ? 'md' : 'sm'}
            />
          )}
        </Group>
      )}

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

      <Stack gap="xs">
        <Group justify="space-between" align="center">
          {sectionLabel(t('Condition checklist'))}
          <Text size="xs" c="dimmed">
            {t('Leave all empty if undamaged')}
          </Text>
        </Group>

        <Group gap="xs" wrap="wrap">
          {availableOptions.map((name) => {
            const isSelected = value.conditions.includes(name);
            return (
              <Button
                key={name}
                type="button"
                size="xs"
                variant={isSelected ? 'light' : 'default'}
                color={isSelected ? 'orange' : 'gray'}
                leftSection={isSelected ? <IconCheck size={14} /> : undefined}
                onClick={() => toggleCondition(name)}
                style={{
                  minHeight: 36,
                  borderColor: isSelected ? 'var(--mantine-color-orange-filled)' : undefined,
                  fontWeight: isSelected ? 600 : 500,
                }}
              >
                {t(name)}
              </Button>
            );
          })}
        </Group>

        <TextInput
          placeholder={t('+ Add new condition (e.g. Scratched lens) and press Enter')}
          value={newConditionInput}
          onChange={(event) => setNewConditionInput(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAddCondition();
            }
          }}
          rightSection={
            newConditionInput.trim() ? (
              <ActionIcon
                size="sm"
                variant="light"
                color="blue"
                onClick={handleAddCondition}
                aria-label={t('Add condition')}
              >
                <IconPlus size={14} />
              </ActionIcon>
            ) : null
          }
          size={isMobile ? 'md' : 'sm'}
        />

        {value.conditions.length > 0 ? (
          <Alert color="orange" icon={<IconAlertTriangle size={16} />} p="xs">
            {t(
              'This may mean the warranty does not cover the fault. Selecting an item flags the claim for manager review during inspection, rather than auto-rejecting it.'
            )}
          </Alert>
        ) : (
          <Alert color="blue" variant="light" icon={<IconInfoCircle size={16} />} p="xs">
            {t(
              'Ticking any item flags the claim for manager review during inspection; it does not automatically reject the claim.'
            )}
          </Alert>
        )}
      </Stack>

      <Stack gap="xs">
        {sectionLabel(t('Photos / Attachments (optional)'))}
        <Group gap="xs" wrap="wrap">
          {value.photos.map((file, idx) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <Box
                key={idx}
                style={{
                  position: 'relative',
                  width: 72,
                  height: 72,
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1px solid var(--mantine-color-default-border)',
                }}
              >
                <img
                  src={previewUrl}
                  alt={file.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <ActionIcon
                  size="xs"
                  color="red"
                  variant="filled"
                  style={{ position: 'absolute', top: 2, right: 2 }}
                  onClick={() => {
                    const next = [...value.photos];
                    next.splice(idx, 1);
                    onChange({ ...value, photos: next });
                  }}
                  aria-label={t('Remove photo')}
                >
                  <IconTrash size={12} />
                </ActionIcon>
              </Box>
            );
          })}
          <Button
            variant="default"
            size="xs"
            leftSection={<IconPhoto size={14} />}
            onClick={() => fileInputRef.current?.click()}
            style={{ height: 72, minWidth: 72 }}
          >
            {value.photos.length === 0 ? t('Add photos') : t('Add more')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.currentTarget.files ?? []);
              e.currentTarget.value = '';
              if (files.length > 0) {
                onChange({ ...value, photos: [...value.photos, ...files] });
              }
            }}
          />
        </Group>
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
 * on it, how many units, and (optionally) who will look at it. A warranty that has run out needs
 * a manager or owner to accept the claim; the server checks the PIN.
 */
export const StartClaimModal = ({ warranty, onClose, onStarted }: StartClaimModalProps) => {
  const isMobile = useIsMobile();
  const open = useOpenClaim();
  const uploadAttachment = useUploadAttachment();
  const [state, setState] = useState<IntakeState>(EMPTY_STATE(warranty));
  const [tried, setTried] = useState(false);
  const [uploading, setUploading] = useState(false);

  const close = () => {
    setState(EMPTY_STATE(null));
    setTried(false);
    open.reset();
    onClose();
  };

  if (warranty === null) return null;

  const issueProblem = state.issue.trim() === '' ? t('Please say what is wrong with it.') : null;
  const expired = warranty.state === 'expired';
  const error = open.isError ? getErrorMessage(open.error) : null;
  const isBusy = open.isPending || uploading;

  const submit = (approval: ManagerApproval | undefined) => {
    setTried(true);
    if (issueProblem !== null) return;
    open.mutate(
      {
        warrantyKey: warranty.key,
        quantity: warranty.quantity > 1 ? state.quantity : undefined,
        serialNumber:
          warranty.serialNumber === undefined && state.serialNumber.trim()
            ? state.serialNumber.trim()
            : undefined,
        issueDescription: state.issue.trim(),
        voidChecks: state.checks,
        conditions: state.conditions,
        assignedEmployeeKey: state.technicianKey === null ? undefined : state.technicianKey,
        approval,
      },
      {
        onSuccess: async (claim) => {
          if (state.photos.length > 0) {
            setUploading(true);
            try {
              for (const file of state.photos) {
                const shrunk = await shrinkImage(file);
                if (shrunk) {
                  await uploadAttachment.mutateAsync({
                    ownerKind: 'warranty_claim',
                    ownerKey: claim.key,
                    fileName: file.name,
                    contentType: 'image/jpeg',
                    dataBase64: await blobToBase64(shrunk),
                  });
                }
              }
            } catch {
              // Non-fatal if photo attachment fails
            } finally {
              setUploading(false);
            }
          }
          setState(EMPTY_STATE(null));
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
