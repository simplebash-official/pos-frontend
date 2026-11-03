import { toEarningsRequest, useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import {
  Modal,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Paper,
  Badge,
  Alert,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import {
  IconUser,
  IconPhone,
  IconPercentage,
  IconCoin,
  IconAlertTriangle,
  IconBarcode,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { RepairJob, RepairJobInput } from '../types';
import {
  isRework,
  itemFromSaved,
  itemsProblem,
  toItemInputs,
  useRepairTotals,
  type ItemDraft,
} from '../lib/repairItems';
import { RepairItemsEditor } from './RepairItemsEditor';
import { RepairWarrantiesPanel } from './RepairWarrantiesPanel';
import { useAllEmployees } from '@/features/employees/hooks/useEmployees';
import { JOB_STATUS, JOB_STATUS_LABELS, JobStatus, ROUTES } from '@/constants';
import { formatMoney, toCents } from '@/shared/lib/money';
import { SplitType } from '@/features/employees/types';
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

  const { data: employees = [] } = useAllEmployees();

  const form = useForm<RepairFormValues>({
    initialValues: fromRepairJob(null),
    validate: {
      customerName: (val) => (val.trim() ? null : 'Customer name is required'),
      customerPhone: (val) =>
        /^[0-9+\s-]{9,15}$/.test(val.trim()) ? null : 'Enter a valid phone number',
      deviceModel: (val) => (val.trim() ? null : 'Device model is required'),
      issueDescription: (val) => (val.trim() ? null : 'Issue description is required'),
    },
  });

  const [drafts, setDrafts] = useState<ItemDraft[]>([]);
  const [tried, setTried] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);

  useEffect(() => {
    if (opened) {
      form.setValues(fromRepairJob(jobToEdit));
      // Loading the job being edited into local state when the window opens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDrafts(jobToEdit ? jobToEdit.items.map(itemFromSaved) : []);
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
  const workProblem = workLocked ? null : itemsProblem(drafts, kind, form.values.status);
  const hasStockPart = drafts.some((draft) => draft.part?.source === 'stock');
  const navigate = useNavigate();

  const handleEmployeeChange = (employeeKey: string) => {
    const emp = employees.find((e) => e.key === employeeKey);
    if (emp) {
      // The backend resolves `assignedEmployeeId` by business key, not the
      // local mirror id — see `employees::service::get_employee_by_key`.
      form.setFieldValue('assignedEmployeeId', emp.key);
      form.setFieldValue('assignedEmployeeName', emp.name);
      form.setFieldValue('splitType', emp.defaultSplitType);
      form.setFieldValue(
        'splitValueRupeesOrPercent',
        emp.defaultSplitType === 'fixed' ? emp.defaultSplitValue / 100 : emp.defaultSplitValue
      );
    } else {
      form.setFieldValue('assignedEmployeeId', '');
      form.setFieldValue('assignedEmployeeName', '');
    }
  };

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
  const splitVal = Number(form.values.splitValueRupeesOrPercent) || 0;

  const handleSubmit = async (values: RepairFormValues) => {
    setTried(true);
    if (workProblem !== null) return;
    const payload = toRepairInput(values, workLocked ? undefined : toItemInputs(drafts, rework));
    await onSubmit(payload);
    form.reset();
    onClose();
  };

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
      <form onSubmit={form.onSubmit(handleSubmit)}>
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
          <Group grow align="flex-start">
            <TextInput
              label={t('Customer Name')}
              placeholder={t('e.g. Saman Perera')}
              leftSection={<IconUser size={16} />}
              required
              {...form.getInputProps('customerName')}
            />

            <TextInput
              label={t('Customer Phone')}
              placeholder={t('e.g. 0771234567')}
              leftSection={<IconPhone size={16} />}
              required
              {...form.getInputProps('customerPhone')}
            />
          </Group>

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
                    'Bill this job to hand it back: its parts from stock leave stock with the bill.'
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

          <DateInput
            label={t('Promised ready by')}
            placeholder={t('Pick a date (optional)')}
            clearable
            popoverProps={{ width: 'target' }}
            value={form.values.promisedReadyAt ? new Date(form.values.promisedReadyAt) : null}
            onChange={(d: Date | string | null) => {
              if (!d) {
                form.setFieldValue('promisedReadyAt', null);
              } else if (typeof d === 'string') {
                form.setFieldValue('promisedReadyAt', d.slice(0, 10));
              } else {
                form.setFieldValue('promisedReadyAt', d.toISOString().split('T')[0]);
              }
            }}
          />

          {/* Work, parts and their warranties */}
          <RepairItemsEditor
            drafts={drafts}
            onChange={setDrafts}
            rework={rework}
            readOnly={workLocked}
            showProblems={tried}
            totals={totals}
            onNestedWindowChange={setNestedOpen}
          />
          {tried && workProblem !== null && drafts.length === 0 && (
            <Text size="sm" c="red" role="alert">
              {workProblem}
            </Text>
          )}

          {!rework && drafts.length > 0 && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('Estimated Repair Net Profit:')}
              </Text>
              <Text size="sm" fw={800} c={priced ? 'green' : 'dimmed'}>
                {priced ? formatMoney(profitCents) : priceHint}
              </Text>
            </Group>
          )}

          {workLocked && jobToEdit !== null && jobToEdit !== undefined && !rework && (
            <RepairWarrantiesPanel repairKey={jobToEdit.id} onNestedWindowChange={setNestedOpen} />
          )}

          {/* Assigned Employee & Profit Split */}
          <Paper p="sm" withBorder>
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} tt="uppercase" c="blue">
                  {t('Employee Assignment & Profit Split')}
                </Text>
                <Badge color="blue" variant="light" size="xs">
                  {t('Commission Payout')}
                </Badge>
              </Group>

              <Select
                label={t('Assign Technician / Employee')}
                placeholder={t('Select an employee for this repair...')}
                data={[
                  { value: '', label: 'Unassigned (No Employee)' },
                  ...employees.map((e) => ({
                    value: e.key,
                    label: `${e.name} (${e.role.toUpperCase()})`,
                  })),
                ]}
                value={form.values.assignedEmployeeId}
                onChange={(val) => handleEmployeeChange(val || '')}
              />

              {form.values.assignedEmployeeId && (
                <>
                  <Group align="flex-end" grow mt="xs">
                    <div>
                      <Text size="xs" fw={600} mb={4}>
                        {t('Split Type')}
                      </Text>
                      <SegmentedToggle
                        value={form.values.splitType}
                        onChange={(val) => form.setFieldValue('splitType', val as SplitType)}
                        data={[
                          {
                            label: (
                              <Group gap={4} justify="center" wrap="nowrap">
                                <IconPercentage size={14} style={{ flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap' }}>{t('Percentage (%)')}</span>
                              </Group>
                            ),
                            value: 'percentage',
                          },
                          {
                            label: (
                              <Group gap={4} justify="center" wrap="nowrap">
                                <IconCoin size={14} style={{ flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap' }}>{t('Fixed (LKR)')}</span>
                              </Group>
                            ),
                            value: 'fixed',
                          },
                        ]}
                        fullWidth
                        size="sm"
                      />
                    </div>

                    <NumberInput
                      label={
                        form.values.splitType === 'percentage'
                          ? 'Employee Split (%)'
                          : 'Fixed Commission (LKR)'
                      }
                      min={0}
                      max={form.values.splitType === 'percentage' ? 100 : 1000000}
                      {...form.getInputProps('splitValueRupeesOrPercent')}
                    />
                  </Group>

                  {isFixedSplitCapped && (
                    <Alert
                      color="orange"
                      icon={<IconAlertTriangle size={16} />}
                      title={t('Fixed Commission Capped')}
                      p="xs"
                    >
                      {t('Fixed split (')}
                      {formatMoney(toCents(splitVal))}
                      {t(') exceeds the repair net profit (')}
                      {formatMoney(profitCents)}
                      {t(
                        '). Commission will be capped at the total\n                                                                profit.'
                      )}
                    </Alert>
                  )}

                  <Paper p="xs" withBorder mt="xs">
                    <Group justify="space-between">
                      <Text size="xs" fw={600}>
                        {t('Employee Commission Payout:')}
                      </Text>
                      <Text fw={800} size="md" c={priced ? 'blue' : 'dimmed'}>
                        {priced ? formatMoney(calculatedEarningsCents) : priceHint}
                      </Text>
                    </Group>
                  </Paper>
                </>
              )}
            </Stack>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={loading}>
              {t('Cancel')}
            </Button>
            <Button type="submit" color="blue" loading={loading}>
              {isEditing ? 'Update Ticket' : 'Create Repair Ticket'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
