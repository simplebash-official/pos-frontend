import { useEffect } from 'react';
import { Group, SimpleGrid, Switch, Text, TextInput, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectShopProfile, updateShopProfile } from '@/store/slices/settingsSlice';
import { SectionShell } from '../SectionShell';
import type { SectionProps } from './ShopProfileSection';

interface TaxVatFormValues {
  isVatRegistered: boolean;
  businessRegNo: string;
  vatNo: string;
  vatRate: number;
}

export const TaxVatSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const shopProfile = useAppSelector(selectShopProfile);

  const form = useForm<TaxVatFormValues>({
    initialValues: {
      isVatRegistered: shopProfile.isVatRegistered,
      businessRegNo: shopProfile.businessRegNo,
      vatNo: shopProfile.vatNo,
      vatRate: shopProfile.vatRate * 100,
    },
    validate: {
      vatNo: (val, values) =>
        values.isVatRegistered && !val.trim()
          ? 'Enter your VAT registration number, or turn off VAT registration.'
          : null,
      vatRate: (val, values) =>
        values.isVatRegistered && (val < 0 || val > 100)
          ? 'Enter a tax rate between 0 and 100.'
          : null,
    },
  });

  const isDirty = form.isDirty();
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    dispatch(
      updateShopProfile({
        isVatRegistered: form.values.isVatRegistered,
        businessRegNo: form.values.businessRegNo,
        vatNo: form.values.vatNo,
        vatRate: form.values.vatRate / 100,
      })
    );
    form.resetDirty();
    notifications.show({
      title: 'Settings Saved',
      message: 'Tax & VAT settings updated successfully.',
      color: 'green',
    });
  };

  return (
    <SectionShell
      title="Tax & VAT"
      description="Turn this on if your shop is registered for VAT, so it appears on invoices."
      isDirty={isDirty}
      onSave={handleSave}
      onCancel={() => form.reset()}
    >
      <Group justify="space-between" align="center">
        <div>
          <Text fw={600} size="sm">
            VAT Registration
          </Text>
          <Text size="xs" c="dimmed">
            Enable if your shop is VAT registered to include tax columns on invoices.
          </Text>
        </div>
        <Switch
          checked={form.values.isVatRegistered}
          onChange={(e) => form.setFieldValue('isVatRegistered', e.currentTarget.checked)}
        />
      </Group>

      {form.values.isVatRegistered && (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <TextInput label="Business Reg No" {...form.getInputProps('businessRegNo')} />
          <TextInput label="VAT Registration Number" {...form.getInputProps('vatNo')} />
          <NumberInput
            label="VAT Rate (%)"
            suffix="%"
            min={0}
            max={100}
            {...form.getInputProps('vatRate')}
          />
        </SimpleGrid>
      )}
    </SectionShell>
  );
};
