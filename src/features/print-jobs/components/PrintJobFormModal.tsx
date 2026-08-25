import { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  NumberInput,
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
import { PrintJob, PrintJobInput } from '../types';
import { useAllEmployees } from '@/features/employees/hooks/useEmployees';
import { JOB_STATUS, JOB_STATUS_LABELS, JobStatus } from '@/constants';
import { formatMoney, toCents } from '@/shared/lib/money';
import { SplitType } from '@/features/employees/types';
import { PrintJobFormValues, fromPrintJob, toPrintJobInput } from '@/shared/lib/moneyFormUtils';
import { useIsMobile } from '@/shared/hooks/useResponsive';

interface PrintJobFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: PrintJobInput) => Promise<void>;
  jobToEdit?: PrintJob | null;
  loading?: boolean;
}

export const PrintJobFormModal = ({
  opened,
  onClose,
  onSubmit,
  jobToEdit,
  loading = false,
}: PrintJobFormModalProps) => {
  const isEditing = Boolean(jobToEdit);
  const isMobile = useIsMobile();

  const { data: employees = [] } = useAllEmployees();

  const form = useForm<PrintJobFormValues>({
    initialValues: fromPrintJob(null),
    validate: {
      customerName: (val) => (val.trim() ? null : 'Customer name is required'),
      quantity: (val) => (Number(val) >= 1 ? null : 'Quantity must be at least 1'),
      estimatedPriceRupees: (val) => {
        if (val === '' || val === undefined || val === null) {
          return 'Total price is required';
        }
        return Number(val) >= 0 ? null : 'Total price must be 0 or greater';
      },
      materialCostRupees: (val) =>
        val === '' || val === undefined || val === null || Number(val) >= 0
          ? null
          : 'Cost must be 0 or greater',
    },
  });

  useEffect(() => {
    if (opened) {
      form.setValues(fromPrintJob(jobToEdit));
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

  const handleSubmit = async (values: PrintJobFormValues) => {
    const payload = toPrintJobInput(values);
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
          {isEditing ? `Edit Print Job ${jobToEdit?.ticketNumber}` : 'Create New Print Order'}
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
              label="Customer Name"
              placeholder="e.g. Dhanushka Fernando"
              leftSection={<IconUser size={16} />}
              required
              {...form.getInputProps('customerName')}
            />

            <TextInput
              label="Customer Phone"
              placeholder="e.g. 0712345678"
              leftSection={<IconPhone size={16} />}
              {...form.getInputProps('customerPhone')}
            />
          </Group>

          {/* Print Specification */}
          <Group grow align="flex-start">
            <Select
              label="Print Item / Service Type"
              data={[
                { value: 'mug', label: 'Custom Mug Sublimation' },
                { value: 't-shirt', label: 'T-Shirt Printing' },
                { value: 'handbill', label: 'Handbill / Flyer Printing' },
                { value: 'banner', label: 'Flex Banner / Outdoor Display' },
                { value: 'custom', label: 'Custom Artwork & Merchandise' },
              ]}
              required
              {...form.getInputProps('jobType')}
            />

            <NumberInput
              label="Quantity (Units)"
              min={1}
              required
              {...form.getInputProps('quantity')}
            />
          </Group>

          <Group grow align="flex-start">
            <Select
              label="Job Order Status"
              data={Object.values(JOB_STATUS).map((status: JobStatus) => ({
                value: status,
                label: JOB_STATUS_LABELS[status],
              }))}
              required
              {...form.getInputProps('status')}
            />
          </Group>

          {/* Pricing & Cost */}
          <Paper p="sm" withBorder>
            <Stack gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                Pricing & Material Blank Costs (LKR)
              </Text>
              <Group grow align="flex-start">
                <NumberInput
                  label="Total Print Order Price (LKR)"
                  placeholder="e.g. 25000"
                  min={0}
                  prefix="Rs. "
                  required
                  {...form.getInputProps('estimatedPriceRupees')}
                />

                <NumberInput
                  label="Blank Stock / Ink Cost (LKR)"
                  placeholder="e.g. 13000"
                  min={0}
                  prefix="Rs. "
                  {...form.getInputProps('materialCostRupees')}
                />
              </Group>

              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Estimated Print Net Profit:
                </Text>
                <Text size="sm" fw={800} c="green">
                  {formatMoney(profitCents)}
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* Assigned Employee & Profit Split */}
          <Paper p="sm" withBorder>
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} tt="uppercase" c="blue">
                  Designer / Printer Assignment & Profit Split
                </Text>
                <Badge color="blue" variant="light" size="xs">
                  Commission Payout
                </Badge>
              </Group>

              <Select
                label="Assign Designer / Machine Operator"
                placeholder="Select an employee for this print job..."
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
                        Split Type
                      </Text>
                      <SegmentedToggle
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
                      Fixed split ({formatMoney(toCents(splitVal))}) exceeds the job net profit ({' '}
                      {formatMoney(toCents(profitRupees))}). Commission will be capped at the total
                      profit.
                    </Alert>
                  )}

                  <Paper p="xs" withBorder mt="xs">
                    <Group justify="space-between">
                      <Text size="xs" fw={600}>
                        Employee Commission Payout:
                      </Text>
                      <Text fw={800} size="md" c="blue">
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
            <Button type="submit" color="blue" loading={loading}>
              {isEditing ? 'Update Print Job' : 'Create Print Job'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
