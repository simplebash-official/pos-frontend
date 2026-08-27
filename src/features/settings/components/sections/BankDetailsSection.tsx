import { t } from '@/shared/i18n/t';
import { useEffect } from 'react';
import { Group, SimpleGrid, Switch, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectShopProfile,
  selectPrintSettings,
  updateShopProfile,
  updatePrintSettings,
} from '@/store/slices/settingsSlice';
import { SectionShell } from '../SectionShell';
import type { SectionProps } from './ShopProfileSection';

interface BankDetailsFormValues {
  bankName: string;
  bankBranch: string;
  accountName: string;
  accountNumber: string;
  showBankDetails: boolean;
}

export const BankDetailsSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const shopProfile = useAppSelector(selectShopProfile);
  const printSettings = useAppSelector(selectPrintSettings);

  const form = useForm<BankDetailsFormValues>({
    initialValues: {
      bankName: shopProfile.bankName,
      bankBranch: shopProfile.bankBranch,
      accountName: shopProfile.accountName,
      accountNumber: shopProfile.accountNumber,
      showBankDetails: printSettings.showBankDetails,
    },
    validate: {
      accountNumber: (val) =>
        !val.trim() || /^[0-9\s]+$/.test(val.trim())
          ? null
          : 'Enter an account number using only numbers.',
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
        bankName: form.values.bankName,
        bankBranch: form.values.bankBranch,
        accountName: form.values.accountName,
        accountNumber: form.values.accountNumber,
      })
    );
    dispatch(updatePrintSettings({ showBankDetails: form.values.showBankDetails }));
    form.resetDirty();
    notifications.show({
      title: 'Settings Saved',
      message: 'Bank account details updated successfully.',
      color: 'green',
    });
  };

  return (
    <SectionShell
      title={t('Bank Details')}
      description={t('These details print on invoices so customers know where to pay.')}
      isDirty={isDirty}
      onSave={handleSave}
      onCancel={() => form.reset()}
    >
      <Group justify="space-between" align="center">
        <div>
          <Text fw={600} size="sm">
            {t('Show Bank Details on Invoices')}
          </Text>
          <Text size="xs" c="dimmed">
            {t("Turn off if you don't want your bank details printed on invoices.")}
          </Text>
        </div>
        <Switch
          checked={form.values.showBankDetails}
          onChange={(e) => form.setFieldValue('showBankDetails', e.currentTarget.checked)}
        />
      </Group>

      {form.values.showBankDetails && !form.values.bankName.trim() && (
        <Text size="xs" c="orange">
          {t('Add your bank name so it appears on printed invoices.')}
        </Text>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput label={t('Bank Name')} {...form.getInputProps('bankName')} />
        <TextInput label={t('Branch')} {...form.getInputProps('bankBranch')} />
        <TextInput label={t('Account Name')} {...form.getInputProps('accountName')} />
        <TextInput label={t('Account Number')} {...form.getInputProps('accountNumber')} />
      </SimpleGrid>
    </SectionShell>
  );
};
