import { useState, type ReactNode } from 'react';
import {
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconInfoCircle } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { usePayees } from '@/features/billing/hooks/useCashLookups';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { useProductSerials } from '@/features/inventory/hooks/useProductSerials';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate, toIsoDate } from '@/shared/lib/date';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { useClaimStep, type ClaimStepInput } from '../hooks/useClaims';
import {
  DECISIONS,
  OUTCOMES,
  decisionHint,
  decisionLabel,
  outcomeLabel,
  type ClaimAction,
} from '../lib/claimView';
import type { ClaimDecision, SupplierOutcome, WarrantyClaim } from '../types';
import { ManagerApprovalModal } from './ManagerApprovalModal';

/** The steps that open a window here; a refund opens the credit-note window instead. */
export type DialogAction = Exclude<ClaimAction, 'refund'>;

export interface ClaimStepDialogProps {
  claim: WarrantyClaim;
  action: DialogAction;
  /** The end date of the claimed warranty (`undefined` for lifetime), shown for a replacement. */
  warrantyEndsOn: string | undefined;
  onClose: () => void;
}

/** A centred window with the house header and footer, for one claim step. */
const StepModal = ({
  title,
  confirmLabel,
  loading,
  error,
  onClose,
  onSubmit,
  disabled,
  children,
}: {
  title: string;
  confirmLabel: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: () => void;
  disabled: boolean;
  children: ReactNode;
}) => {
  const isMobile = useIsMobile();
  return (
    <Modal
      opened
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {title}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!disabled) onSubmit();
        }}
      >
        <Stack gap="md">
          {children}
          {error !== null && (
            <Text size="sm" c="red" role="alert">
              {error}
            </Text>
          )}
          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} disabled={loading}>
              {t('Cancel')}
            </Button>
            <Button type="submit" loading={loading} disabled={disabled}>
              {confirmLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

/** Radio cards: the one "choose one" look for a few options with a line of help each. */
const ChoiceCards = <T extends string>({
  value,
  onChange,
  options,
  label,
  hint,
}: {
  value: T | null;
  onChange: (value: T) => void;
  options: T[];
  label: (value: T) => string;
  hint: ((value: T) => string) | null;
}) => (
  <Radio.Group value={value} onChange={(next) => onChange(next as T)}>
    <Stack gap="xs">
      {options.map((option) => {
        const chosen = option === value;
        return (
          <Radio.Card
            key={option}
            value={option}
            p="sm"
            style={{
              minHeight: 44,
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: chosen
                ? 'var(--mantine-color-blue-filled)'
                : 'var(--mantine-color-default-border)',
              backgroundColor: chosen ? 'var(--mantine-color-blue-light)' : 'var(--bg-card)',
            }}
          >
            <Group wrap="nowrap" align="flex-start" gap="sm">
              <Radio.Indicator mt={2} />
              <Stack gap={2}>
                <Text fw={700} size="sm">
                  {label(option)}
                </Text>
                {hint !== null && (
                  <Text size="xs" c="dimmed">
                    {hint(option)}
                  </Text>
                )}
              </Stack>
            </Group>
          </Radio.Card>
        );
      })}
    </Stack>
  </Radio.Group>
);

const optional = (text: string): string | undefined =>
  text.trim() === '' ? undefined : text.trim();

/** The replacement unit: an in-stock serial of the same product, or a price to take stock from. */
const ReplacementPicker = ({
  claim,
  serial,
  onSerial,
  priceCents,
  onPrice,
}: {
  claim: WarrantyClaim;
  serial: string | null;
  onSerial: (serial: string | null) => void;
  priceCents: string | null;
  onPrice: (price: string | null) => void;
}) => {
  const isMobile = useIsMobile();
  const productKey = claim.productKey;
  const serialized = claim.serialNumber !== undefined;
  const serials = useProductSerials(productKey, 'in_stock', { enabled: serialized });
  // The product read route takes the database id, so the product is found by key in the list.
  const products = useAllProducts({ enabled: productKey !== undefined && !serialized });
  const product = products.data.find((candidate) => candidate.key === productKey);

  if (productKey === undefined) {
    return (
      <Alert color="orange" icon={<IconInfoCircle size={16} />}>
        {t('This item was not sold from stock, so it cannot be swapped for a new one.')}
      </Alert>
    );
  }
  if (serialized) {
    if (serials.data === undefined) return <Loader size="sm" />;
    return (
      <Select
        label={t('Which new unit is the customer getting?')}
        placeholder={t('Scan or choose a serial number in stock')}
        data={serials.data.map((unit) => unit.serialNumber)}
        value={serial}
        onChange={onSerial}
        searchable
        nothingFoundMessage={t('No unit of this item is in stock')}
        size={isMobile ? 'md' : 'sm'}
        data-barcode-scanner="true"
        comboboxProps={{ withinPortal: true }}
      />
    );
  }
  if (products.isLoading) return <Loader size="sm" />;
  if (product === undefined) {
    return (
      <Alert color="orange" icon={<IconInfoCircle size={16} />}>
        {t('This item is no longer in the catalogue, so it cannot be swapped for a new one.')}
      </Alert>
    );
  }
  return (
    <Select
      label={t('Take the new unit from stock sold at')}
      placeholder={t('Choose a price')}
      data={product.priceTiers.map((tier) => ({
        value: String(tier.sellingPriceCents),
        label: `${formatMoney(tier.sellingPriceCents)} · ${tier.quantity} ${t('left')}`,
      }))}
      value={priceCents}
      onChange={onPrice}
      nothingFoundMessage={t('No unit of this item is in stock')}
      size={isMobile ? 'md' : 'sm'}
      comboboxProps={{ withinPortal: true }}
    />
  );
};

/**
 * The window for one step of a claim after it was opened: inspect, decide (manager PIN), send to
 * or receive back from the supplier, finish (with the replacement unit), give back, or turn a
 * rejected claim into a paid repair. The server checks every step again.
 */
export const ClaimStepDialog = ({
  claim,
  action,
  warrantyEndsOn,
  onClose,
}: ClaimStepDialogProps) => {
  const isMobile = useIsMobile();
  const mutation = useClaimStep();
  const [notes, setNotes] = useState('');
  const [decision, setDecision] = useState<ClaimDecision | null>(null);
  const [supplierKey, setSupplierKey] = useState<string | null>(null);
  const [reference, setReference] = useState('');
  const [expectedBackOn, setExpectedBackOn] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<SupplierOutcome | null>(null);
  const [serial, setSerial] = useState<string | null>(null);
  const [priceCents, setPriceCents] = useState<string | null>(null);
  const suppliers = usePayees({ payeeType: 'supplier' }, action === 'sendToSupplier');

  const loading = mutation.isPending;
  const error = mutation.isError ? getErrorMessage(mutation.error) : null;
  const close = () => {
    mutation.reset();
    onClose();
  };
  const run = (step: ClaimStepInput) => mutation.mutate(step, { onSuccess: close });
  const key = claim.key;

  switch (action) {
    case 'inspect':
      return (
        <StepModal
          title={`${t('Inspect')} ${claim.claimNumber}`}
          confirmLabel={t('Save what was found')}
          loading={loading}
          error={error}
          onClose={close}
          disabled={notes.trim() === ''}
          onSubmit={() => run({ kind: 'inspect', key, inspectionNotes: notes.trim() })}
        >
          <Text size="sm" c="dimmed">
            {claim.itemName} · {claim.issueDescription}
          </Text>
          <Textarea
            label={t('What did you find?')}
            placeholder={t('e.g. Battery swollen, no liquid marks, seal intact')}
            autosize
            minRows={3}
            maxLength={1000}
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            size={isMobile ? 'md' : 'sm'}
          />
        </StepModal>
      );

    case 'decide':
      return (
        <ManagerApprovalModal
          opened
          onClose={close}
          title={`${t('Decide')} ${claim.claimNumber}`}
          description={
            claim.inspectionNotes === undefined
              ? claim.issueDescription
              : `${t('Found')}: ${claim.inspectionNotes}`
          }
          reasonLabel={t('Why this decision?')}
          confirmLabel={t('Save the decision')}
          confirmColor="blue"
          blocker={decision === null ? t('Choose what to do.') : null}
          loading={loading}
          error={error}
          onConfirm={(approval) => {
            if (decision !== null) run({ kind: 'decide', key, decision, approval });
          }}
        >
          <ChoiceCards
            value={decision}
            onChange={setDecision}
            options={DECISIONS}
            label={decisionLabel}
            hint={decisionHint}
          />
        </ManagerApprovalModal>
      );

    case 'sendToSupplier':
      return (
        <StepModal
          title={`${t('Send to the supplier')} · ${claim.claimNumber}`}
          confirmLabel={t('Mark as sent')}
          loading={loading}
          error={error}
          onClose={close}
          disabled={supplierKey === null}
          onSubmit={() => {
            if (supplierKey === null) return;
            run({
              kind: 'send',
              key,
              input: {
                supplierKey,
                reference: optional(reference),
                expectedBackOn: expectedBackOn === null ? undefined : expectedBackOn,
              },
            });
          }}
        >
          <Select
            label={t('Which supplier?')}
            placeholder={t('Choose a supplier')}
            data={
              suppliers.data === undefined
                ? []
                : suppliers.data.map((payee) => ({ value: payee.key, label: payee.name }))
            }
            disabled={suppliers.data === undefined}
            value={supplierKey}
            onChange={setSupplierKey}
            searchable
            nothingFoundMessage={t('No supplier matches')}
            size={isMobile ? 'md' : 'sm'}
            comboboxProps={{ withinPortal: true }}
          />
          <TextInput
            label={t('Their claim number (if they gave one)')}
            value={reference}
            onChange={(event) => setReference(event.currentTarget.value)}
            maxLength={80}
            size={isMobile ? 'md' : 'sm'}
          />
          <DateInput
            label={t('When did they say it will be back?')}
            placeholder={t('Not given')}
            value={expectedBackOn}
            onChange={(value) =>
              setExpectedBackOn(value === null ? null : dayjs(value).format('YYYY-MM-DD'))
            }
            minDate={toIsoDate(new Date())}
            valueFormat="DD MMM YYYY"
            clearable
            size={isMobile ? 'md' : 'sm'}
          />
        </StepModal>
      );

    case 'supplierReturn':
      return (
        <StepModal
          title={`${t('Back from the supplier')} · ${claim.claimNumber}`}
          confirmLabel={t('Mark as back')}
          loading={loading}
          error={error}
          onClose={close}
          disabled={outcome === null}
          onSubmit={() => {
            if (outcome !== null) {
              run({ kind: 'supplierReturn', key, outcome, note: optional(notes) });
            }
          }}
        >
          <ChoiceCards
            value={outcome}
            onChange={setOutcome}
            options={OUTCOMES}
            label={outcomeLabel}
            hint={null}
          />
          <Textarea
            label={t('Note (optional)')}
            autosize
            minRows={2}
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            size={isMobile ? 'md' : 'sm'}
          />
        </StepModal>
      );

    case 'resolve': {
      const replace = claim.decision === 'replace';
      const replacementMissing = replace && serial === null && priceCents === null;
      return (
        <StepModal
          title={
            replace
              ? `${t('Give a replacement')} · ${claim.claimNumber}`
              : `${t('Repair finished')} · ${claim.claimNumber}`
          }
          confirmLabel={replace ? t('Hand over the new unit') : t('Mark as repaired')}
          loading={loading}
          error={error}
          onClose={close}
          disabled={replacementMissing}
          onSubmit={() =>
            run({
              kind: 'resolve',
              key,
              resolutionNote: optional(notes),
              replacement: replace
                ? serial !== null
                  ? { serialNumber: serial }
                  : { sellingPriceCents: Number(priceCents) }
                : undefined,
            })
          }
        >
          {replace && (
            <>
              <ReplacementPicker
                claim={claim}
                serial={serial}
                onSerial={setSerial}
                priceCents={priceCents}
                onPrice={setPriceCents}
              />
              <Alert color="blue" icon={<IconInfoCircle size={16} />} p="xs">
                {warrantyEndsOn === undefined
                  ? t('The new unit is covered for life, like the old one.')
                  : `${t('The new unit is covered until')} ${formatDate(warrantyEndsOn)}, ${t(
                      'the same day as the old one.'
                    )}`}
              </Alert>
            </>
          )}
          {!replace && (
            <Text size="sm" c="dimmed">
              {t('The warranty carries on to the same end day once the item is repaired.')}
            </Text>
          )}
          <Textarea
            label={t('Note (optional)')}
            autosize
            minRows={2}
            maxLength={500}
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            size={isMobile ? 'md' : 'sm'}
          />
        </StepModal>
      );
    }

    case 'return':
      return (
        <ConfirmDialog
          opened
          onClose={close}
          onConfirm={() => run({ kind: 'return', key })}
          title={t('Give the item back?')}
          confirmLabel={t('Given back')}
          confirmColor="blue"
          loading={loading}
        >
          <Text size="sm">{t('Mark that the customer has taken the item.')}</Text>
          {error !== null && (
            <Text size="sm" c="red" role="alert" mt="xs">
              {error}
            </Text>
          )}
        </ConfirmDialog>
      );

    case 'rework':
      return (
        <ConfirmDialog
          opened
          onClose={close}
          onConfirm={() => run({ kind: 'rework', key })}
          title={t('Open a free rework job?')}
          confirmLabel={t('Open the rework job')}
          confirmColor="blue"
          loading={loading}
        >
          <Text size="sm">
            {t(
              'A repair job is opened to redo the work for free, for the same customer and device. The technician adds any parts used there, and hands it back from the repair screen.'
            )}
          </Text>
          {error !== null && (
            <Text size="sm" c="red" role="alert" mt="xs">
              {error}
            </Text>
          )}
        </ConfirmDialog>
      );

    case 'paidRepair':
      return (
        <ConfirmDialog
          opened
          onClose={close}
          onConfirm={() => run({ kind: 'paidRepair', key })}
          title={t('Make a paid repair job?')}
          confirmLabel={t('Make the repair job')}
          confirmColor="blue"
          loading={loading}
        >
          <Text size="sm">
            {t(
              'The fault is not covered. A repair job the customer pays for is made for this item.'
            )}
          </Text>
          {error !== null && (
            <Text size="sm" c="red" role="alert" mt="xs">
              {error}
            </Text>
          )}
        </ConfirmDialog>
      );
  }
};
