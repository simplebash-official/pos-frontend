import { useEffect } from 'react';
import {
  Modal,
  TextInput,
  Select,
  SegmentedControl,
  NumberInput,
  Button,
  Group,
  Stack,
  Text,
  Paper,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQuery } from '@tanstack/react-query';
import { IconPrinter, IconUser, IconPhone, IconPercentage, IconCoin } from '@tabler/icons-react';
import { PrintJob, PrintJobInput, PrintJobType } from '../types';
import { fetchEmployees } from '@/features/employees/api/mockEmployees';
import { queryKeys } from '@/api/queryKeys';
import { JOB_STATUS, JOB_STATUS_LABELS, JobStatus } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
import { SplitType } from '@/features/employees/types';

interface PrintJobFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: PrintJobInput) => Promise<void>;
  jobToEdit?: PrintJob | null;
  loading?: boolean;
}

export function PrintJobFormModal({
  opened,
  onClose,
  onSubmit,
  jobToEdit,
  loading = false,
}: PrintJobFormModalProps) {
  const isEditing = Boolean(jobToEdit);

  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: fetchEmployees,
  });

  const form = useForm<PrintJobInput>({
    initialValues: {
      customerName: '',
      customerPhone: '',
      jobType: 'mug' as PrintJobType,
      quantity: 1,
      status: 'received' as JobStatus,
      estimatedCostCents: 0,
      materialCostCents: 0,
      assignedEmployeeId: '',
      assignedEmployeeName: '',
      splitType: 'fixed' as SplitType,
      splitValue: 0,
    },
    validate: {
      customerName: (val) => (val.trim() ? null : 'Customer name is required'),
      quantity: (val) => (val >= 1 ? null : 'Quantity must be at least 1'),
      estimatedCostCents: (val) => (val >= 0 ? null : 'Total cost must be 0 or greater'),
    },
  });

  useEffect(() => {
    if (jobToEdit) {
      form.setValues({
        customerName: jobToEdit.customerName,
        customerPhone: jobToEdit.customerPhone || '',
        jobType: jobToEdit.jobType,
        quantity: jobToEdit.quantity,
        status: jobToEdit.status,
        estimatedCostCents: jobToEdit.estimatedCostCents / 100, // convert cents to LKR
        materialCostCents: (jobToEdit.materialCostCents || 0) / 100,
        assignedEmployeeId: jobToEdit.assignedEmployeeId || '',
        assignedEmployeeName: jobToEdit.assignedEmployeeName || '',
        splitType: jobToEdit.splitType || 'fixed',
        splitValue:
          jobToEdit.splitType === 'fixed'
            ? (jobToEdit.splitValue || 0) / 100
            : jobToEdit.splitValue || 0,
      });
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
        'splitValue',
        emp.defaultSplitType === 'fixed' ? emp.defaultSplitValue / 100 : emp.defaultSplitValue
      );
    } else {
      form.setFieldValue('assignedEmployeeId', '');
      form.setFieldValue('assignedEmployeeName', '');
    }
  };

  // Real-time calculation of profit and employee split
  const estCostCents = Math.round((form.values.estimatedCostCents || 0) * 100);
  const matCostCents = Math.round((form.values.materialCostCents || 0) * 100);
  const calculatedProfitCents = Math.max(0, estCostCents - matCostCents);

  let calculatedEarningsCents = 0;
  const splitVal = form.values.splitValue || 0;
  if (form.values.assignedEmployeeId && splitVal > 0) {
    if (form.values.splitType === 'percentage') {
      calculatedEarningsCents = Math.round((calculatedProfitCents * splitVal) / 100);
    } else {
      const fixedCents = Math.round(splitVal * 100);
      calculatedEarningsCents = Math.min(calculatedProfitCents, fixedCents);
    }
  }

  const handleSubmit = async (values: PrintJobInput) => {
    const finalValues: PrintJobInput = {
      ...values,
      estimatedCostCents: Math.round(values.estimatedCostCents * 100),
      materialCostCents: Math.round((values.materialCostCents || 0) * 100),
      splitValue:
        values.splitType === 'fixed'
          ? Math.round((values.splitValue || 0) * 100)
          : values.splitValue || 0,
    };
    await onSubmit(finalValues);
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconPrinter size={20} color="var(--mantine-color-teal-6)" />
          <Text fw={700} size="lg">
            {isEditing ? `Edit Print Job ${jobToEdit?.ticketNumber}` : 'Create New Print Order'}
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
          <Paper
            p="sm"
            withBorder
            bg="var(--mantine-color-gray-0)"
            radius="var(--mantine-radius-default)"
          >
            <Stack gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                Pricing & Material Blank Costs (LKR)
              </Text>
              <Group grow align="flex-start">
                <NumberInput
                  label="Total Print Order Price (LKR)"
                  placeholder="e.g. 25000"
                  min={0}
                  prefix="LKR "
                  required
                  {...form.getInputProps('estimatedCostCents')}
                />

                <NumberInput
                  label="Blank Stock / Ink Cost (LKR)"
                  placeholder="e.g. 13000"
                  min={0}
                  prefix="LKR "
                  {...form.getInputProps('materialCostCents')}
                />
              </Group>

              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Estimated Print Net Profit:
                </Text>
                <Text size="sm" fw={800} c="green">
                  {formatMoney(calculatedProfitCents)}
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* Assigned Employee & Profit Split */}
          <Paper
            p="sm"
            withBorder
            bg="var(--mantine-color-indigo-0)"
            radius="var(--mantine-radius-default)"
          >
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} tt="uppercase" c="indigo">
                  Designer / Printer Assignment & Profit Split
                </Text>
                <Badge color="indigo" variant="light" size="xs">
                  Commission Payout
                </Badge>
              </Group>

              <Select
                label="Assign Designer / Machine Operator"
                placeholder="Select an employee for this print job..."
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
                      {...form.getInputProps('splitValue')}
                    />
                  </Group>

                  <Paper
                    p="xs"
                    withBorder
                    bg="var(--mantine-color-body)"
                    radius="var(--mantine-radius-default)"
                    mt="xs"
                  >
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
            <Button type="submit" color="teal" loading={loading}>
              {isEditing ? 'Update Print Job' : 'Create Print Job'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
