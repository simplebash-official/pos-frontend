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
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconPhone, IconPercentage, IconCoin, IconId } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { Employee, EmployeeInput, SplitType } from '../types';
import { EmployeeFormValues, fromEmployee, toEmployeeInput } from '@/shared/lib/moneyFormUtils';
import { formatMoney, toCents } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';

interface EmployeeFormModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: EmployeeInput) => Promise<void>;
  employeeToEdit?: Employee | null;
  loading?: boolean;
}

export const EmployeeFormModal = ({
  opened,
  onClose,
  onSubmit,
  employeeToEdit,
  loading = false,
}: EmployeeFormModalProps) => {
  const isEditing = Boolean(employeeToEdit);
  const isMobile = useIsMobile();

  const form = useForm<EmployeeFormValues>({
    initialValues: fromEmployee(null),
    validate: {
      name: (val) => (val.trim().length >= 2 ? null : 'Full name is required (min 2 chars)'),
      phone: (val) =>
        /^[0-9+\s-]{9,15}$/.test(val.trim())
          ? null
          : 'Enter a valid phone number (e.g. 0771234567)',
      defaultSplitValueRupeesOrPercent: (val, values) => {
        if (val === undefined || val === null || val === '' || Number(val) < 0) {
          return 'Split value must be 0 or greater';
        }
        if (values.defaultSplitType === 'percentage' && Number(val) > 100) {
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
      centered
      fullScreen={isMobile}
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

          <Stack gap={6}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              Commission & Pay
            </Text>

            <Paper
              withBorder
              p="sm"
              radius="var(--mantine-radius-default)"
              bg="light-dark(var(--bg-card), var(--mantine-color-dark-7))"
              style={{ borderColor: 'var(--border)' }}
            >
              <Stack gap="sm">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap="sm" align="center" wrap="nowrap" style={{ minWidth: 0 }}>
                    <ThemeIcon
                      size={38}
                      radius="var(--mantine-radius-default)"
                      variant="light"
                      color="blue"
                      style={{ flexShrink: 0 }}
                    >
                      <IconCoin size={18} stroke={1.6} />
                    </ThemeIcon>
                    <div style={{ minWidth: 0 }}>
                      <Text size="sm" fw={700} c="var(--text-primary)" lh={1.3}>
                        How this employee gets paid
                      </Text>
                      <Text size="xs" c="dimmed" lh={1.3}>
                        Earnings come from a share of the profit on every job they complete.
                      </Text>
                    </div>
                  </Group>
                  <Badge color="blue" variant="light" size="xs" style={{ flexShrink: 0 }}>
                    No Fixed Salary
                  </Badge>
                </Group>

                <Group align="flex-end" grow>
                  <div>
                    <Text size="xs" fw={600} mb={4}>
                      Split Calculation Mode
                    </Text>
                    <SegmentedToggle
                      value={form.values.defaultSplitType}
                      onChange={(val) => form.setFieldValue('defaultSplitType', val as SplitType)}
                      data={[
                        {
                          label: (
                            <Group gap={4} justify="center" wrap="nowrap">
                              <IconPercentage size={14} style={{ flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap' }}>Percentage (%)</span>
                            </Group>
                          ),
                          value: 'percentage',
                        },
                        {
                          label: (
                            <Group gap={4} justify="center" wrap="nowrap">
                              <IconCoin size={14} style={{ flexShrink: 0 }} />
                              <span style={{ whiteSpace: 'nowrap' }}>Fixed (LKR)</span>
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

                <Paper
                  withBorder
                  px="sm"
                  py={7}
                  radius="var(--mantine-radius-default)"
                  bg="light-dark(rgba(18, 184, 134, 0.06), rgba(18, 184, 134, 0.12))"
                  style={{
                    borderColor: 'light-dark(rgba(18, 184, 134, 0.3), rgba(18, 184, 134, 0.4))',
                  }}
                >
                  <Group gap="xs" align="center" wrap="nowrap">
                    <ThemeIcon size={22} radius="xl" variant="light" color="teal">
                      <IconCoin size={13} />
                    </ThemeIcon>
                    <Text
                      size="xs"
                      c="light-dark(var(--mantine-color-teal-9), var(--mantine-color-teal-3))"
                    >
                      {form.values.defaultSplitType === 'percentage'
                        ? `Employee receives ${form.values.defaultSplitValueRupeesOrPercent || 0}% of the profit on every completed task assigned to them.`
                        : `Employee receives a flat ${formatMoney(toCents(Number(form.values.defaultSplitValueRupeesOrPercent || 0)))} payout for every job completed.`}
                    </Text>
                  </Group>
                </Paper>
              </Stack>
            </Paper>
          </Stack>

          <Select
            label="Employment Status"
            data={[
              { value: 'active', label: 'Active Staff' },
              { value: 'inactive', label: 'Inactive / Suspended' },
            ]}
            {...form.getInputProps('status')}
          />

          <Textarea
            label="Notes / Qualifications"
            placeholder="e.g. Specialized in Samsung & Apple display glass replacements..."
            rows={2}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="blue" loading={loading}>
              {isEditing ? 'Save Changes' : 'Register Employee'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
