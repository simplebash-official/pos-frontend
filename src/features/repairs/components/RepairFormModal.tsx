import { t } from '@/shared/i18n/t';
import { useEffect } from 'react';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import {
  IconUser,
  IconPhone,
  IconPercentage,
  IconCoin,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { RepairJob, RepairJobInput } from '../types';
import { useAllEmployees } from '@/features/employees/hooks/useEmployees';
import { JOB_STATUS, JOB_STATUS_LABELS, JobStatus } from '@/constants';
import { formatMoney, toCents } from '@/shared/lib/money';
import { SplitType } from '@/features/employees/types';
import { RepairFormValues, fromRepairJob, toRepairInput } from '@/shared/lib/moneyFormUtils';
import { useIsMobile } from '@/shared/hooks/useResponsive';

const STATUSES_REQUIRING_PRICE: JobStatus[] = ['ready', 'delivered'];

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
      estimatedPriceRupees: (val, values) => {
        const isEmpty = val === '' || val === undefined || val === null;
        if (isEmpty) {
          return STATUSES_REQUIRING_PRICE.includes(values.status)
            ? 'Enter the repair price before marking this ticket ready or delivered'
            : null;
        }
        return Number(val) >= 0 ? null : 'Price must be 0 or greater';
      },
      materialCostRupees: (val) =>
        val === '' || val === undefined || val === null || Number(val) >= 0
          ? null
          : 'Cost must be 0 or greater',
    },
  });

  useEffect(() => {
    if (opened) {
      form.setValues(fromRepairJob(jobToEdit));
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobToEdit, opened]);

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

  const estPriceRupees = Number(form.values.estimatedPriceRupees) || 0;
  const matCostRupees = Number(form.values.materialCostRupees) || 0;
  const profitRupees = Math.max(0, estPriceRupees - matCostRupees);

  const profitCents = toCents(profitRupees);
  let calculatedEarningsCents = 0;
  const splitVal = Number(form.values.splitValueRupeesOrPercent) || 0;
  const isFixedSplitCapped =
    form.values.splitType === 'fixed' && splitVal > profitRupees && profitRupees > 0;

  if (form.values.assignedEmployeeId && splitVal > 0) {
    if (form.values.splitType === 'percentage') {
      calculatedEarningsCents = Math.round((profitCents * splitVal) / 100);
    } else {
      const fixedCents = toCents(splitVal);
      calculatedEarningsCents = Math.min(profitCents, fixedCents);
    }
  }

  const handleSubmit = async (values: RepairFormValues) => {
    const payload = toRepairInput(values);
    await onSubmit(payload);
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {isEditing ? `Edit Ticket ${jobToEdit?.ticketNumber}` : 'Create New Repair Ticket'}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
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

            <Select
              label={t('Ticket Status')}
              data={Object.values(JOB_STATUS).map((status: JobStatus) => ({
                value: status,
                label: JOB_STATUS_LABELS[status],
              }))}
              required
              {...form.getInputProps('status')}
            />
          </Group>

          <Textarea
            label={t('Issue & Diagnosis Description')}
            placeholder={t('e.g. Broken OLED panel, battery drain issues...')}
            rows={2}
            required
            {...form.getInputProps('issueDescription')}
          />

          {/* Pricing & Cost */}
          <Paper p="sm" withBorder>
            <Stack gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                {t('Pricing & Material Cost (LKR)')}
              </Text>
              <Group grow align="flex-start">
                <NumberInput
                  label={t('Repair Total Price (LKR)')}
                  placeholder={t('e.g. 45000')}
                  min={0}
                  prefix="Rs. "
                  {...form.getInputProps('estimatedPriceRupees')}
                />

                <NumberInput
                  label={t('Material / Spare Parts Cost (LKR)')}
                  placeholder={t('e.g. 25000')}
                  min={0}
                  prefix="Rs. "
                  {...form.getInputProps('materialCostRupees')}
                />
              </Group>

              <Text size="xs" c="dimmed">
                {t('Leave the price blank until the device is diagnosed. You can add it later.')}
              </Text>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t('Estimated Repair Net Profit:')}
                </Text>
                <Text
                  size="sm"
                  fw={800}
                  c={form.values.estimatedPriceRupees === '' ? 'dimmed' : 'green'}
                >
                  {form.values.estimatedPriceRupees === ''
                    ? 'Set a price to see profit'
                    : formatMoney(profitCents)}
                </Text>
              </Group>
            </Stack>
          </Paper>

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
                      {formatMoney(toCents(profitRupees))}
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
                      <Text
                        fw={800}
                        size="md"
                        c={form.values.estimatedPriceRupees === '' ? 'dimmed' : 'blue'}
                      >
                        {form.values.estimatedPriceRupees === ''
                          ? 'Set a price to see payout'
                          : formatMoney(calculatedEarningsCents)}
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
