import { useEffect } from 'react';
import { Box, Group, NumberInput, SimpleGrid, Switch, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectPrintSettings, updatePrintSettings } from '@/store/slices/settingsSlice';
import { SectionShell } from '../SectionShell';
import type { SectionProps } from './ShopProfileSection';

interface PrintingFormValues {
  receiptPaper: '80mm' | '58mm';
  invoiceCopies: 'customer' | 'customer+office';
  defaultDocumentForWalkIn: 'receipt' | 'invoice' | 'both' | 'none';
  defaultDocumentForAccountCustomer: 'receipt' | 'invoice' | 'both' | 'none';
  showLogoOnReceipt: boolean;
  showTaxColumn: boolean;
  receiptCopies: number;
}

export const PrintingSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const printSettings = useAppSelector(selectPrintSettings);

  const form = useForm<PrintingFormValues>({
    initialValues: {
      receiptPaper: printSettings.receiptPaper,
      invoiceCopies: printSettings.invoiceCopies,
      defaultDocumentForWalkIn: printSettings.defaultDocumentForWalkIn,
      defaultDocumentForAccountCustomer: printSettings.defaultDocumentForAccountCustomer,
      showLogoOnReceipt: printSettings.showLogoOnReceipt,
      showTaxColumn: printSettings.showTaxColumn,
      receiptCopies: printSettings.receiptCopies,
    },
    validate: {
      receiptCopies: (val) => (val >= 1 && val <= 5 ? null : 'Choose between 1 and 5 copies.'),
    },
  });

  const isDirty = form.isDirty();
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    dispatch(updatePrintSettings({ ...form.values }));
    form.resetDirty();
    notifications.show({
      title: 'Print Preferences Saved',
      message: 'Printing defaults updated.',
      color: 'green',
    });
  };

  return (
    <SectionShell
      title="Printing & Documents"
      description="Receipt paper size, copies, and what prints by default at checkout."
      isDirty={isDirty}
      onSave={handleSave}
      onCancel={() => form.reset()}
      saveLabel="Save Print Preferences"
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Box>
          <Text size="xs" fw={700} c="dimmed" mb={4}>
            THERMAL RECEIPT PAPER
          </Text>
          <SegmentedToggle
            fullWidth
            value={form.values.receiptPaper}
            onChange={(v) => form.setFieldValue('receiptPaper', v as '80mm' | '58mm')}
            data={[
              { label: '80mm Standard', value: '80mm' },
              { label: '58mm Compact', value: '58mm' },
            ]}
          />
        </Box>

        <Box>
          <Text size="xs" fw={700} c="dimmed" mb={4}>
            A4 INVOICE COPY MODE
          </Text>
          <SegmentedToggle
            fullWidth
            value={form.values.invoiceCopies}
            onChange={(v) =>
              form.setFieldValue('invoiceCopies', v as 'customer' | 'customer+office')
            }
            data={[
              { label: 'Customer Copy Only', value: 'customer' },
              { label: 'Customer + Office Copy', value: 'customer+office' },
            ]}
          />
        </Box>

        <Box>
          <Text size="xs" fw={700} c="dimmed" mb={4}>
            DEFAULT DOCUMENT (WALK-IN GUEST)
          </Text>
          <SegmentedToggle
            fullWidth
            value={form.values.defaultDocumentForWalkIn}
            onChange={(v) =>
              form.setFieldValue(
                'defaultDocumentForWalkIn',
                v as 'receipt' | 'invoice' | 'both' | 'none'
              )
            }
            data={[
              { label: 'Receipt', value: 'receipt' },
              { label: 'Invoice', value: 'invoice' },
              { label: 'Both', value: 'both' },
              { label: 'None', value: 'none' },
            ]}
          />
        </Box>

        <Box>
          <Text size="xs" fw={700} c="dimmed" mb={4}>
            DEFAULT DOCUMENT (ACCOUNT CUSTOMER)
          </Text>
          <SegmentedToggle
            fullWidth
            value={form.values.defaultDocumentForAccountCustomer}
            onChange={(v) =>
              form.setFieldValue(
                'defaultDocumentForAccountCustomer',
                v as 'receipt' | 'invoice' | 'both' | 'none'
              )
            }
            data={[
              { label: 'Receipt', value: 'receipt' },
              { label: 'Invoice', value: 'invoice' },
              { label: 'Both', value: 'both' },
              { label: 'None', value: 'none' },
            ]}
          />
        </Box>

        <NumberInput
          label="Receipt Copies"
          description="How many thermal receipts to print per sale"
          min={1}
          max={5}
          {...form.getInputProps('receiptCopies')}
        />

        <Box style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Group justify="space-between" align="center" style={{ width: '100%' }}>
            <div>
              <Text fw={600} size="sm">
                Show Logo on Receipt
              </Text>
              <Text size="xs" c="dimmed">
                Print your shop logo at the top of thermal receipts.
              </Text>
            </div>
            <Switch
              checked={form.values.showLogoOnReceipt}
              onChange={(e) => form.setFieldValue('showLogoOnReceipt', e.currentTarget.checked)}
            />
          </Group>
        </Box>

        <Box style={{ gridColumn: 'span 2' }}>
          <Group justify="space-between" align="center">
            <div>
              <Text fw={600} size="sm">
                Show Tax on Invoices
              </Text>
              <Text size="xs" c="dimmed">
                Show the VAT amount as a separate line on printed A4 invoices.
              </Text>
            </div>
            <Switch
              checked={form.values.showTaxColumn}
              onChange={(e) => form.setFieldValue('showTaxColumn', e.currentTarget.checked)}
            />
          </Group>
        </Box>
      </SimpleGrid>
    </SectionShell>
  );
};
