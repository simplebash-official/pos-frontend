import { Group, NumberInput, Paper, Select, Stack, Text } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import { JOB_STATUS, JOB_STATUS_LABELS, type JobStatus } from '@/constants';
import { CustomerChoiceCard } from '@/features/customers/components/CustomerChoiceCard';
import { CustomerPickerModal } from '@/features/customers/components/CustomerPickerModal';
import { AssigneeSection } from '@/features/employees/components/AssigneeSection';
import { DrawerCard } from '@/shared/components/drawer';
import { PromisedDatePicker } from '@/shared/components/PromisedDatePicker';
import { t } from '@/shared/i18n/t';
import { formatMoney } from '@/shared/lib/money';
import type { PrintJobEditor } from '../hooks/usePrintJobEditor';

/** The form's id, so the panel's pinned Save button can submit it from outside. */
export const PRINT_JOB_FORM_ID = 'print-job-form';

export interface PrintJobEditFormProps {
  editor: PrintJobEditor;
}

/** The print job form, laid out as cards on the side panel's canvas. */
export const PrintJobEditForm = ({ editor }: PrintJobEditFormProps) => {
  const { form, setNestedOpen, pickerOpen, setPickerOpen, profitCents, payoutCents, capped } =
    editor;

  return (
    <>
      <form id={PRINT_JOB_FORM_ID} onSubmit={form.onSubmit(editor.handleSubmit)}>
        <Stack gap="md">
          <DrawerCard label={t('Customer and order')} icon={<IconPrinter size={14} />}>
            <Stack gap="md">
              <CustomerChoiceCard
                customer={
                  form.values.customerKey === ''
                    ? null
                    : { name: form.values.customerName, phone: form.values.customerPhone }
                }
                onChoose={() => {
                  setPickerOpen(true);
                  setNestedOpen(true);
                }}
                required
                error={form.errors.customerKey as string | undefined}
              />

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
                <PromisedDatePicker
                  label={t('Promised ready by')}
                  value={form.values.promisedReadyAt}
                  onChange={(next) => form.setFieldValue('promisedReadyAt', next)}
                  onNestedWindowChange={setNestedOpen}
                />
              </Group>
            </Stack>
          </DrawerCard>

          <DrawerCard>
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
          </DrawerCard>

          <DrawerCard>
            <AssigneeSection
              heading={t('Designer / Printer Assignment & Profit Split')}
              label={t('Assign Designer / Machine Operator')}
              placeholder={t('Select an employee for this print job...')}
              profitNoun="job"
              values={form.values}
              onChange={(changes) => form.setValues(changes)}
              figures={{ priced: true, hint: null, profitCents, payoutCents, capped }}
              onNestedWindowChange={setNestedOpen}
            />
          </DrawerCard>
        </Stack>
      </form>

      {/* Outside the form: a window opened from here must not submit it. */}
      <CustomerPickerModal
        opened={pickerOpen}
        zIndex={400}
        onClose={() => {
          setPickerOpen(false);
          setNestedOpen(false);
        }}
        onSelectCustomer={(customer) => {
          if (customer !== null) {
            form.setFieldValue('customerKey', customer.key);
            form.setFieldValue('customerName', customer.name);
            form.setFieldValue('customerPhone', customer.primaryPhone);
          }
          setPickerOpen(false);
          setNestedOpen(false);
        }}
      />
    </>
  );
};
