import { toEarningsRequest, useJobEarnings } from '@/shared/hooks/useJobEarnings';
import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { IconUser, IconPhone } from '@tabler/icons-react';
import { PrintJob, PrintJobInput } from '../types';
import { AssigneeSection } from '@/features/employees/components/AssigneeSection';
import { JOB_STATUS, JOB_STATUS_LABELS, JobStatus } from '@/constants';
import { formatMoney } from '@/shared/lib/money';
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

  const [nestedOpen, setNestedOpen] = useState(false);

  const form = useForm<PrintJobFormValues>({
    initialValues: fromPrintJob(null),
    validate: {
      customerName: (val) => (val.trim() ? null : 'Customer name is required'),
      customerPhone: (val) =>
        /^[0-9+\s-]{9,15}$/.test(val.trim()) ? null : 'Enter a valid phone number',
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

  // Profit and commission are the server's figures for what is typed so far.
  const earnings = useJobEarnings(toEarningsRequest(form.values));
  const figures = earnings.data;
  const profitCents = figures === undefined ? 0 : figures.profitCents;
  const calculatedEarningsCents = figures === undefined ? 0 : figures.commissionCents;
  const isFixedSplitCapped = figures !== undefined && figures.capped;

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
      closeOnEscape={!nestedOpen}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Customer Details */}
          <Group grow align="flex-start">
            <TextInput
              label={t('Customer Name')}
              placeholder={t('e.g. Dhanushka Fernando')}
              leftSection={<IconUser size={16} />}
              required
              {...form.getInputProps('customerName')}
            />

            <TextInput
              label={t('Customer Phone')}
              placeholder={t('e.g. 0712345678')}
              leftSection={<IconPhone size={16} />}
              required
              {...form.getInputProps('customerPhone')}
            />
          </Group>

          {/* Print Specification */}
          <Group grow align="flex-start">
            <Select
              label={t('Print Item / Service Type')}
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
              label={t('Quantity (Units)')}
              min={1}
              required
              {...form.getInputProps('quantity')}
            />
          </Group>

          <Group grow align="flex-start">
            <Select
              label={t('Job Order Status')}
              data={Object.values(JOB_STATUS).map((status: JobStatus) => ({
                value: status,
                label: JOB_STATUS_LABELS[status],
              }))}
              required
              {...form.getInputProps('status')}
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
          </Group>

          {/* Pricing & Cost */}
          <Paper p="sm" withBorder>
            <Stack gap="xs">
              <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                {t('Pricing & Material Blank Costs (LKR)')}
              </Text>
              <Group grow align="flex-start">
                <NumberInput
                  label={t('Total Print Order Price (LKR)')}
                  placeholder={t('e.g. 25000')}
                  min={0}
                  prefix="Rs. "
                  required
                  {...form.getInputProps('estimatedPriceRupees')}
                />

                <NumberInput
                  label={t('Blank Stock / Ink Cost (LKR)')}
                  placeholder={t('e.g. 13000')}
                  min={0}
                  prefix="Rs. "
                  {...form.getInputProps('materialCostRupees')}
                />
              </Group>

              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('Estimated Print Net Profit:')}
                </Text>
                <Text size="sm" fw={800} c="green">
                  {formatMoney(profitCents)}
                </Text>
              </Group>
            </Stack>
          </Paper>

          <AssigneeSection
            heading={t('Designer / Printer Assignment & Profit Split')}
            label={t('Assign Designer / Machine Operator')}
            placeholder={t('Select an employee for this print job...')}
            profitNoun="job"
            values={form.values}
            onChange={(changes) => form.setValues(changes)}
            figures={{
              priced: true,
              hint: null,
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
              {isEditing ? 'Update Print Job' : 'Create Print Job'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
