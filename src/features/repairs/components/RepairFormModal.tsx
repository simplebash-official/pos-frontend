import { toEarningsRequest, useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import {
  Modal,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notify } from '@/shared/notify';
import { getErrorMessage } from '@/shared/lib/error';
import { PromisedDatePicker } from '@/shared/components/PromisedDatePicker';
import { IconArrowRight, IconBarcode, IconShieldCheck } from '@tabler/icons-react';
import { CustomerChoiceCard } from '@/features/customers/components/CustomerChoiceCard';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import { useNavigate } from 'react-router-dom';
import { RepairJob, RepairJobInput } from '../types';
import {
  isRework,
  itemsFromSaved,
  itemsProblem,
  toItemInputs,
  useRepairTotals,
  type ItemDraft,
} from '../lib/repairItems';
import { RepairItemsEditor } from './RepairItemsEditor';
import { RepairWarrantiesPanel } from './RepairWarrantiesPanel';
import { AssigneeSection } from '@/features/employees/components/AssigneeSection';
import { JOB_STATUS, JOB_STATUS_LABELS, JobStatus, ROUTES } from '@/constants';
import { billBlocker } from '../lib/billable';
import { RepairFormValues, fromRepairJob, toRepairInput } from '@/shared/lib/moneyFormUtils';
import { useIsMobile } from '@/shared/hooks/useResponsive';

interface RepairFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: RepairJobInput) => Promise<void>;
  jobToEdit?: RepairJob | null;
  loading?: boolean;
}

export const RepairFormModal = ({
  opened,
  onClose,
  onSubmit,
  jobToEdit,
  loading = false,
}: RepairFormModalProps) => {
  const isEditing = Boolean(jobToEdit);
  const isMobile = useIsMobile();

  const form = useForm<RepairFormValues>({
    initialValues: fromRepairJob(null),
    validate: {
      customerName: (val, values) =>
        val.trim() !== '' && /^[0-9+\s-]{9,15}$/.test(values.customerPhone.trim())
          ? null
          : t('Choose the customer for this repair.'),
      deviceModel: (val) => (val.trim() ? null : 'Device model is required'),
      issueDescription: (val) => (val.trim() ? null : 'Issue description is required'),
    },
  });

  const [drafts, setDrafts] = useState<ItemDraft[]>([]);
  const [tried, setTried] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (opened) {
      form.setValues(fromRepairJob(jobToEdit));
      // Loading the job being edited into local state when the window opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDrafts(jobToEdit ? itemsFromSaved(jobToEdit.items) : []);
    } else {
      form.reset();
      setDrafts([]);
    }
    setTried(false);
    setNestedOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobToEdit, opened]);

  const kind = jobToEdit ? jobToEdit.kind : ({ kind: 'standard' } as const);
  const rework = isRework(kind);
  // A handed-back job's work no longer changes (the server refuses it too).
  const workLocked = jobToEdit?.status === 'delivered';
  const totals = useRepairTotals(drafts, rework);
  const workProblem = workLocked ? null : itemsProblem(drafts, kind, form.values.status, totals);
  const hasStockPart = drafts.some(
    (draft) => draft.kind === 'part' && draft.part.source === 'stock'
  );
  const navigate = useNavigate();

  // Profit and commission are the server's figures for what is typed so far.
  const split = toEarningsRequest({
    estimatedPriceRupees: '',
    materialCostRupees: '',
    assignedEmployeeId: form.values.assignedEmployeeId,
    splitType: form.values.splitType,
    splitValueRupeesOrPercent: form.values.splitValueRupeesOrPercent,
  });
  const priced = drafts.length > 0 && totals !== null && totals.costKnown;
  const earnings = useJobEarnings({
    ...split,
    priceCents: priced ? totals.totals.priceCents : null,
    materialCostCents: priced ? totals.totals.costCents : 0,
  });
  const figures = earnings.data;
  const profitCents = figures === undefined ? 0 : figures.profitCents;
  const calculatedEarningsCents = figures === undefined ? 0 : figures.commissionCents;
  const isFixedSplitCapped = figures !== undefined && figures.capped;

  // "Update & bill": what is typed is saved first, so the bill carries the saved price. A failed
  // save throws before we leave this screen.
  const billJobId =
    jobToEdit &&
    billBlocker({ kind: jobToEdit.kind, status: form.values.status, items: drafts }) === null
      ? jobToEdit.id
      : null;

  const handleSubmit = async (values: RepairFormValues, billAfterSave: string | null) => {
    setTried(true);
    if (workProblem !== null) {
      notify.error({
        title: t('Cannot save repair'),
        message: workProblem,
      });
      return;
    }
    const payload = toRepairInput(values, workLocked ? undefined : toItemInputs(drafts, rework));
    await onSubmit(payload);
    form.reset();
    onClose();
    if (billAfterSave !== null) navigate(`${ROUTES.BILLING}?billRepair=${billAfterSave}`);
  };

  // The Update Ticket button leaves a failed save to the page; this one must say it stayed here.
  const billAfterSave = (values: RepairFormValues, jobId: string) =>
    handleSubmit(values, jobId).catch((error: unknown) =>
      notify.error({
        title: t('Could not save the repair'),
        message: getErrorMessage(error),
      })
    );

  const statusOptions = Object.values(JOB_STATUS).map((status: JobStatus) => ({
    value: status,
    label: JOB_STATUS_LABELS[status],
    // A job with parts from stock is handed back by billing it, so its parts leave stock.
    disabled:
      status === 'delivered' && !rework && hasStockPart && jobToEdit?.status !== 'delivered',
  }));
  const priceHint = !priced
    ? drafts.length === 0
      ? t('Add the work to see profit')
      : t('Profit shows once saved')
    : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {isEditing ? `Edit Ticket ${jobToEdit?.ticketNumber}` : 'Create New Repair Ticket'}
        </Text>
      }
      size="xl"
      centered
      fullScreen={isMobile}
      closeOnEscape={!nestedOpen}
    >
      <form onSubmit={form.onSubmit((values) => handleSubmit(values, null))}>
        <Stack gap="md">
          {jobToEdit !== null &&
            jobToEdit !== undefined &&
            jobToEdit.kind.kind === 'warranty_rework' && (
              <Alert color="blue" icon={<IconShieldCheck size={16} />} p="sm">
                <Text size="sm" fw={700}>
                  {t('Warranty rework: free for the customer')}
                </Text>
                <Text size="sm">
                  {t('Redoing job')}{' '}
                  <Text component="span" fw={600}>
                    {jobToEdit.kind.originalTicketNumber}
                  </Text>{' '}
                  {t('under claim')}{' '}
                  <Anchor
                    component="button"
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (jobToEdit.kind.kind !== 'warranty_rework') return;
                      navigate(`${ROUTES.WARRANTIES}?view=claims&claim=${jobToEdit.kind.claimKey}`);
                    }}
                  >
                    {jobToEdit.kind.claimNumber}
                  </Anchor>
                  {'. '}
                  {t('Mark it delivered when it is handed back; parts used leave stock then.')}
                </Text>
              </Alert>
            )}
          {/* Customer Details */}
          <CustomerChoiceCard
            customer={
              form.values.customerName.trim() === ''
                ? null
                : { name: form.values.customerName, phone: form.values.customerPhone }
            }
            onChoose={() => {
              setPickerOpen(true);
              setNestedOpen(true);
            }}
            error={form.errors.customerName as string | undefined}
          />

          {/* Device & Issue */}
          <Group grow align="flex-start">
            <TextInput
              label={t('Device Model')}
              placeholder={t('e.g. iPhone 13 Pro / Asus ROG Laptop')}
              required
              {...form.getInputProps('deviceModel')}
            />

            <TextInput
              label={t('Serial number or IMEI')}
              placeholder={t('Optional. Its warranty is found by it later.')}
              leftSection={<IconBarcode size={16} />}
              data-barcode-scanner="true"
              {...form.getInputProps('serialNumber')}
            />
          </Group>

          <Select
            label={t('Ticket Status')}
            data={statusOptions}
            required
            description={
              !rework && hasStockPart && jobToEdit?.status !== 'delivered'
                ? t(
                    "Use 'Update & bill' below to hand it back: its parts from stock leave stock with the bill."
                  )
                : undefined
            }
            {...form.getInputProps('status')}
          />

          <Textarea
            label={t('Issue & Diagnosis Description')}
            placeholder={t('e.g. Broken OLED panel, battery drain issues...')}
            rows={2}
            required
            {...form.getInputProps('issueDescription')}
          />

          <PromisedDatePicker
            label={t('Promised ready by')}
            value={form.values.promisedReadyAt}
            onChange={(next) => form.setFieldValue('promisedReadyAt', next)}
            onNestedWindowChange={setNestedOpen}
          />

          {/* Work, parts and their warranties */}
          <RepairItemsEditor
            drafts={drafts}
            onChange={setDrafts}
            rework={rework}
            readOnly={workLocked}
            showProblems={tried}
            totals={totals}
            profit={{ priced, profitCents, hint: priceHint }}
            onNestedWindowChange={setNestedOpen}
          />
          {tried && workProblem !== null && (
            <Text size="sm" c="red" role="alert">
              {workProblem}
            </Text>
          )}

          {workLocked && jobToEdit !== null && jobToEdit !== undefined && !rework && (
            <RepairWarrantiesPanel repairKey={jobToEdit.id} onNestedWindowChange={setNestedOpen} />
          )}

          <AssigneeSection
            heading={t('Employee Assignment & Profit Split')}
            label={t('Assign Technician / Employee')}
            placeholder={t('Select an employee for this repair...')}
            profitNoun="repair"
            values={form.values}
            onChange={(changes) => form.setValues(changes)}
            figures={{
              priced,
              hint: priceHint,
              profitCents,
              payoutCents: calculatedEarningsCents,
              capped: isFixedSplitCapped,
            }}
            onNestedWindowChange={setNestedOpen}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={loading}>
              {t('Cancel')}
            </Button>
            <Button type="submit" color="blue" loading={loading}>
              {isEditing ? 'Update Ticket' : 'Create Repair Ticket'}
            </Button>
            {billJobId !== null && (
              <Button
                variant="light"
                color="blue"
                loading={loading}
                onClick={() => form.onSubmit((values) => billAfterSave(values, billJobId))()}
                rightSection={<IconArrowRight size={16} />}
              >
                {t('Update & bill')}
              </Button>
            )}
          </Group>
        </Stack>
      </form>
      <CustomerPickerModal
        opened={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setNestedOpen(false);
        }}
        onSelectCustomer={(customer) => {
          if (customer !== null) {
            form.setFieldValue('customerName', customer.name);
            form.setFieldValue('customerPhone', customer.primaryPhone);
          }
          setPickerOpen(false);
          setNestedOpen(false);
        }}
      />
    </Modal>
  );
};
