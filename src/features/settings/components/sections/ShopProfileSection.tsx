import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import { SimpleGrid, TextInput, SegmentedControl, Text, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectShopProfile,
  selectAppLanguage,
  updateShopProfile,
  setShopProfile,
  setAppLanguage,
} from '@/store/slices/settingsSlice';
import { SectionShell } from '../SectionShell';
import { getShopProfileApi, updateShopProfileApi } from '../../api/settingsApi';

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
  const [saving, setSaving] = useState(false);

  const form = useForm<ShopProfileFormValues>({
    initialValues: {
      legalName: shopProfile.legalName || '',
      tradingName: shopProfile.tradingName || '',
      addressLine1: shopProfile.addressLines?.[0] || '',
      addressLine2: shopProfile.addressLines?.[1] || '',
      primaryPhone: shopProfile.primaryPhone || '',
      secondaryPhone: shopProfile.secondaryPhone || '',
      email: shopProfile.email || '',
      website: shopProfile.website || '',
    },
    validate: {
      tradingName: (val) => (val.trim() ? null : t('Enter your store or trading name.')),
      email: (val) =>
        !val.trim() || /^\S+@\S+\.\S+$/.test(val.trim())
          ? null
          : t('Enter a valid email address, like name@example.com.'),
    },
  });

  useEffect(() => {
    let isMounted = true;
    getShopProfileApi()
      .then((profile) => {
        if (!isMounted) return;
        dispatch(setShopProfile(profile));
        if (!form.isDirty()) {
          const freshValues: ShopProfileFormValues = {
            legalName: profile.legalName || '',
            tradingName: profile.tradingName || '',
            addressLine1: profile.addressLines?.[0] || '',
            addressLine2: profile.addressLines?.[1] || '',
            primaryPhone: profile.primaryPhone || '',
            secondaryPhone: profile.secondaryPhone || '',
            email: profile.email || '',
            website: profile.website || '',
          };
          form.setInitialValues(freshValues);
          form.setValues(freshValues);
          form.resetDirty();
        }
      })
      .catch((err) => {
        console.warn('Failed to load shop profile from server:', err);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const isDirty = form.isDirty();
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = async () => {
    const validation = form.validate();
    if (validation.hasErrors) return;

    setSaving(true);
    const updatedPayload = {
      legalName: form.values.legalName.trim(),
      tradingName: form.values.tradingName.trim(),
      addressLines: [form.values.addressLine1.trim(), form.values.addressLine2.trim()].filter(
        Boolean
      ),
      primaryPhone: form.values.primaryPhone.trim(),
      secondaryPhone: form.values.secondaryPhone.trim(),
      email: form.values.email.trim(),
      website: form.values.website.trim(),
    };

    try {
      const persisted = await updateShopProfileApi(updatedPayload);
      dispatch(updateShopProfile(persisted));
      const freshValues: ShopProfileFormValues = {
        legalName: persisted.legalName || '',
        tradingName: persisted.tradingName || '',
        addressLine1: persisted.addressLines?.[0] || '',
        addressLine2: persisted.addressLines?.[1] || '',
        primaryPhone: persisted.primaryPhone || '',
        secondaryPhone: persisted.secondaryPhone || '',
        email: persisted.email || '',
        website: persisted.website || '',
      };
      form.setInitialValues(freshValues);
      form.setValues(freshValues);
      form.resetDirty();
      notifications.show({
        title: t('Settings Saved'),
        message: t('Shop profile updated successfully.'),
        color: 'green',
      });
    } catch (error: unknown) {
      const errMessage =
        (error as { message?: string })?.message || t('Failed to save shop profile.');
      notifications.show({
        title: t('Save Failed'),
        message: errMessage,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title={t('Shop Profile')}
      description={t('Your business name, address and how customers can reach you.')}
      isDirty={isDirty}
      saving={saving}
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
