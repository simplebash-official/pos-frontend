import { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  SegmentedControl,
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
import { useQuery } from '@tanstack/react-query';
import {
  IconHammer,
  IconUser,
  IconPhone,
  IconPercentage,
  IconCoin,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { RepairJob, RepairJobInput } from '../types';
import { fetchEmployees } from '@/features/employees/api/mockEmployees';
import { queryKeys } from '@/api/queryKeys';
import { JOB_STATUS, JOB_STATUS_LABELS, JobStatus } from '@/constants';
import { formatMoney, toCents } from '@/shared/lib/money';
import { SplitType } from '@/features/employees/types';
import { RepairFormValues, fromRepairJob, toRepairInput } from '@/shared/lib/moneyFormUtils';

interface RepairFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: RepairJobInput) => Promise<void>;
  jobToEdit?: RepairJob | null;
  loading?: boolean;
}

export function RepairFormModal({
  opened,
  onClose,
  onSubmit,
  jobToEdit,
  loading = false,
}: RepairFormModalProps) {
  const isEditing = Boolean(jobToEdit);

  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: fetchEmployees,
  });

  const form = useForm<RepairFormValues>({
    initialValues: fromRepairJob(null),
    validate: {
      customerName: (val) => (val.trim() ? null : 'Customer name is required'),
      customerPhone: (val) =>
        /^[0-9+\s-]{9,15}$/.test(val.trim()) ? null : 'Enter a valid phone number',
      deviceModel: (val) => (val.trim() ? null : 'Device model is required'),
      issueDescription: (val) => (val.trim() ? null : 'Issue description is required'),
      estimatedPriceRupees: (val) => (val >= 0 ? null : 'Price must be 0 or greater'),
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

  const handleEmployeeChange = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) {
      form.setFieldValue('assignedEmployeeId', emp.id);
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

  const estPriceRupees = form.values.estimatedPriceRupees || 0;
  const matCostRupees = form.values.materialCostRupees || 0;
  const profitRupees = Math.max(0, estPriceRupees - matCostRupees);

  const profitCents = toCents(profitRupees);
  let calculatedEarningsCents = 0;
  const splitVal = form.values.splitValueRupeesOrPercent || 0;
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
        <Group gap="xs">
          <IconHammer size={20} color="var(--mantine-color-orange-6)" />
          <Text fw={700} size="lg">
            {isEditing ? `Edit Ticket ${jobToEdit?.ticketNumber}` : 'Create New Repair Ticket'}
          </Text>
        </Group>
      }
      size="lg"
      radius="var(--mantine-radius-default)"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Customer Details */}
          <Group grow align="flex-start">
            <TextInput
              label="Customer Name"
              placeholder="e.g. Saman Perera"
              leftSection={<IconUser size={16} />}
              required
              {...form.getInputProps('customerName')}
            />

            <TextInput
              label="Customer Phone"
              placeholder="e.g. 0771234567"
              leftSection={<IconPhone size={16} />}
              required
              {...form.getInputProps('customerPhone')}
            />
          </Group>

          {/* Device & Issue */}
          <Group grow align="flex-start">
            <TextInput
              label="Device Model"
              placeholder="e.g. iPhone 13 Pro / Asus ROG Laptop"
              required
              {...form.getInputProps('deviceModel')}
            />

            <Select
              label="Ticket Status"
              data={Object.values(JOB_STATUS).map((status: JobStatus) => ({
                value: status,
                label: JOB_STATUS_LABELS[status],
              }))}
              required
              {...form.getInputProps('status')}
            />
          </Group>

          <Textarea
            label="Issue & Diagnosis Description"
            placeholder="e.g. Broken OLED panel, battery drain issues..."
            rows={2}
            required
            {...form.getInputProps('issueDescription')}
          />

          {/* Pricing & Cost */}
          <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
            <Stack gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                Pricing & Material Cost (LKR)
              </Text>
              <Group grow align="flex-start">
                <NumberInput
                  label="Repair Total Price (LKR)"
                  placeholder="e.g. 45000"
                  min={0}
                  prefix="Rs. "
                  required
                  {...form.getInputProps('estimatedPriceRupees')}
                />

                <NumberInput
                  label="Material / Spare Parts Cost (LKR)"
                  placeholder="e.g. 25000"
                  min={0}
                  prefix="Rs. "
                  {...form.getInputProps('materialCostRupees')}
                />
              </Group>

              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Estimated Repair Net Profit:
                </Text>
                <Text size="sm" fw={800} c="green">
                  {formatMoney(profitCents)}
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* Assigned Employee & Profit Split */}
          <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} tt="uppercase" c="indigo">
                  Employee Assignment & Profit Split
                </Text>
                <Badge color="indigo" variant="light" size="xs">
                  Commission Payout
                </Badge>
              </Group>

              <Select
                label="Assign Technician / Employee"
                placeholder="Select an employee for this repair..."
                data={[
                  { value: '', label: 'Unassigned (No Employee)' },
                  ...employees.map((e) => ({
                    value: e.id,
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
                        Split Type
                      </Text>
                      <SegmentedControl
                        value={form.values.splitType}
                        onChange={(val) => form.setFieldValue('splitType', val as SplitType)}
                        data={[
                          {
                            label: (
                              <Group gap={4} justify="center">
                                <IconPercentage size={14} />
                                <span>Percentage (%)</span>
                              </Group>
                            ),
                            value: 'percentage',
                          },
                          {
                            label: (
                              <Group gap={4} justify="center">
                                <IconCoin size={14} />
                                <span>Fixed (LKR)</span>
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
                      title="Fixed Commission Capped"
                      p="xs"
                    >
                      Fixed split (Rs. {splitVal.toLocaleString()}) exceeds the repair net profit
                      (Rs. {profitRupees.toLocaleString()}). Commission will be capped at the total
                      profit.
                    </Alert>
                  )}

                  <Paper p="xs" withBorder radius="var(--mantine-radius-default)" mt="xs">
                    <Group justify="space-between">
                      <Text size="xs" fw={600}>
                        Employee Commission Payout:
                      </Text>
                      <Text fw={800} size="md" c="indigo">
                        {formatMoney(calculatedEarningsCents)}
                      </Text>
                    </Group>
                  </Paper>
                </>
              )}
            </Stack>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="orange" loading={loading}>
              {isEditing ? 'Update Ticket' : 'Create Repair Ticket'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
