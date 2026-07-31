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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconPhone, IconPercentage, IconCoin, IconId } from '@tabler/icons-react';
import { Employee, EmployeeInput, SplitType } from '../types';
import {
  EmployeeFormValues,
  fromEmployee,
  toEmployeeInput,
} from '@/shared/lib/moneyFormUtils';

interface EmployeeFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: EmployeeInput) => Promise<void>;
  employeeToEdit?: Employee | null;
  loading?: boolean;
}

export function EmployeeFormModal({
  opened,
  onClose,
  onSubmit,
  employeeToEdit,
  loading = false,
}: EmployeeFormModalProps) {
  const isEditing = Boolean(employeeToEdit);

  const form = useForm<EmployeeFormValues>({
    initialValues: fromEmployee(null),
    validate: {
      name: (val) => (val.trim().length >= 2 ? null : 'Full name is required (min 2 chars)'),
      phone: (val) =>
        /^[0-9+\s-]{9,15}$/.test(val.trim())
          ? null
          : 'Enter a valid phone number (e.g. 0771234567)',
      defaultSplitValueRupeesOrPercent: (val, values) => {
        if (val === undefined || val === null || val < 0) {
          return 'Split value must be 0 or greater';
        }
        if (values.defaultSplitType === 'percentage' && val > 100) {
          return 'Percentage cannot exceed 100%';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (opened) {
      form.setValues(fromEmployee(employeeToEdit));
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeToEdit, opened]);

  const handleSubmit = async (values: EmployeeFormValues) => {
    const payload = toEmployeeInput(values);
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
          {isEditing ? `Edit Employee: ${employeeToEdit?.name}` : 'Register New Employee'}
        </Text>
      }
      size="lg"
      radius="var(--mantine-radius-default)"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group grow align="flex-start">
            <TextInput
              label="Employee Name"
              placeholder="e.g. Nimal Perera"
              leftSection={<IconUser size={16} />}
              required
              {...form.getInputProps('name')}
            />

            <TextInput
              label="Phone Number"
              placeholder="e.g. 0771234567"
              leftSection={<IconPhone size={16} />}
              required
              {...form.getInputProps('phone')}
            />
          </Group>

          <Group grow align="flex-start">
            <TextInput
              label="NIC / National ID Number"
              placeholder="e.g. 199283912011"
              leftSection={<IconId size={16} />}
              {...form.getInputProps('nicOrId')}
            />

            <Select
              label="Job Role / Category"
              data={[
                { value: 'technician', label: 'Repair Technician' },
                { value: 'printer', label: 'Print Designer / Machine Operator' },
                { value: 'sales', label: 'Sales & Billing Staff' },
                { value: 'general', label: 'General Employee' },
              ]}
              required
              {...form.getInputProps('role')}
            />
          </Group>

          <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                  Default Profit Split / Commission Rule
                </Text>
                <Badge color="indigo" variant="light" size="xs">
                  No Fixed Salary
                </Badge>
              </Group>

              <Group align="flex-end" grow>
                <div>
                  <Text size="xs" fw={600} mb={4}>
                    Split Calculation Mode
                  </Text>
                  <SegmentedControl
                    value={form.values.defaultSplitType}
                    onChange={(val) => form.setFieldValue('defaultSplitType', val as SplitType)}
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
                            <span>Fixed Amount (LKR)</span>
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
                    form.values.defaultSplitType === 'percentage'
                      ? 'Default Profit Split (%)'
                      : 'Fixed Commission per Work (LKR)'
                  }
                  placeholder={
                    form.values.defaultSplitType === 'percentage' ? 'e.g. 25' : 'e.g. 1500'
                  }
                  min={0}
                  max={form.values.defaultSplitType === 'percentage' ? 100 : 1000000}
                  leftSection={
                    form.values.defaultSplitType === 'percentage' ? (
                      <IconPercentage size={16} />
                    ) : (
                      <Text size="xs" fw={700}>
                        Rs.
                      </Text>
                    )
                  }
                  {...form.getInputProps('defaultSplitValueRupeesOrPercent')}
                />
              </Group>
              <Text size="xs" c="dimmed">
                {form.values.defaultSplitType === 'percentage'
                  ? `Employee receives ${form.values.defaultSplitValueRupeesOrPercent}% of the profit on every completed task assigned to them.`
                  : `Employee receives a flat Rs. ${Number(form.values.defaultSplitValueRupeesOrPercent || 0).toLocaleString()} payout for every job completed.`}
              </Text>
            </Stack>
          </Paper>

          <Group grow align="flex-start">
            <Select
              label="Employment Status"
              data={[
                { value: 'active', label: 'Active Staff' },
                { value: 'inactive', label: 'Inactive / Suspended' },
              ]}
              {...form.getInputProps('status')}
            />
          </Group>

          <Textarea
            label="Notes / Qualifications"
            placeholder="e.g. Specialized in Samsung & Apple display glass replacements..."
            rows={2}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="indigo" loading={loading}>
              {isEditing ? 'Save Changes' : 'Register Employee'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
