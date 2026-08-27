import { t } from '@/shared/i18n/t';
import { useEffect } from 'react';
import { SimpleGrid, TextInput, SegmentedControl, Text, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectShopProfile,
  selectAppLanguage,
  updateShopProfile,
  setAppLanguage,
} from '@/store/slices/settingsSlice';
import { SectionShell } from '../SectionShell';

interface ShopProfileFormValues {
  legalName: string;
  tradingName: string;
  addressLine1: string;
  addressLine2: string;
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  website: string;
}

export interface SectionProps {
  onDirtyChange: (dirty: boolean) => void;
}

export const ShopProfileSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const shopProfile = useAppSelector(selectShopProfile);
  const appLanguage = useAppSelector(selectAppLanguage);

  const form = useForm<ShopProfileFormValues>({
    initialValues: {
      legalName: shopProfile.legalName,
      tradingName: shopProfile.tradingName,
      addressLine1: shopProfile.addressLines[0] || '',
      addressLine2: shopProfile.addressLines[1] || '',
      primaryPhone: shopProfile.primaryPhone,
      secondaryPhone: shopProfile.secondaryPhone,
      email: shopProfile.email,
      website: shopProfile.website,
    },
    validate: {
      legalName: (val) => (val.trim() ? null : "Enter your business's legal name."),
      primaryPhone: (val) =>
        val.trim() ? null : 'Enter a phone number customers can reach you on.',
      email: (val) =>
        !val.trim() || /^\S+@\S+\.\S+$/.test(val.trim())
          ? null
          : 'Enter a valid email address, like name@example.com.',
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
        legalName: form.values.legalName,
        tradingName: form.values.tradingName,
        addressLines: [form.values.addressLine1, form.values.addressLine2].filter(Boolean),
        primaryPhone: form.values.primaryPhone,
        secondaryPhone: form.values.secondaryPhone,
        email: form.values.email,
        website: form.values.website,
      })
    );
    form.resetDirty();
    notifications.show({
      title: 'Settings Saved',
      message: 'Shop profile updated successfully.',
      color: 'green',
    });
  };

  return (
    <SectionShell
      title={t('Shop Profile')}
      description={t('Your business name, address and how customers can reach you.')}
      isDirty={isDirty}
      onSave={handleSave}
      onCancel={() => form.reset()}
    >
      <Stack gap="xl">
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput label={t('Legal Business Name')} {...form.getInputProps('legalName')} />
          <TextInput
            label={t('Trading Name / Store Name')}
            {...form.getInputProps('tradingName')}
          />
          <TextInput label={t('Address Line 1')} {...form.getInputProps('addressLine1')} />
          <TextInput label={t('Address Line 2')} {...form.getInputProps('addressLine2')} />
          <TextInput label={t('Primary Phone')} {...form.getInputProps('primaryPhone')} />
          <TextInput label={t('Secondary Phone')} {...form.getInputProps('secondaryPhone')} />
          <TextInput label={t('Store Email')} {...form.getInputProps('email')} />
          <TextInput label={t('Website URL')} {...form.getInputProps('website')} />
        </SimpleGrid>

        <Stack gap="xs">
          <Text fw={500} size="sm">
            {t('System Language')}
          </Text>
          <Text c="dimmed" size="sm">
            {t('Change the language of the application interface.')}
          </Text>
          <SegmentedControl
            value={appLanguage}
            onChange={(val) => dispatch(setAppLanguage(val as 'en' | 'si'))}
            data={[
              { label: 'English', value: 'en' },
              { label: 'Sinhala', value: 'si' },
            ]}
            style={{ maxWidth: 300 }}
          />
        </Stack>
      </Stack>
    </SectionShell>
  );
};
