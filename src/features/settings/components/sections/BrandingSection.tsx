import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectShopProfile, updateShopProfile } from '@/store/slices/settingsSlice';
import { SectionShell } from '../SectionShell';
import { LogoUpload } from '../LogoUpload';
import type { SectionProps } from './ShopProfileSection';

interface BrandingFormValues {
  logoBase64: string;
}

export const BrandingSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const shopProfile = useAppSelector(selectShopProfile);

  const form = useForm<BrandingFormValues>({
    initialValues: { logoBase64: shopProfile.logoBase64 },
  });

  const isDirty = form.isDirty();
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = () => {
    dispatch(updateShopProfile({ logoBase64: form.values.logoBase64 }));
    form.resetDirty();
    notifications.show({
      title: 'Settings Saved',
      message: 'Shop logo updated successfully.',
      color: 'green',
    });
  };

  return (
    <SectionShell
      title="Branding & Logo"
      description="The logo shown at the top of your printed invoices and receipts."
      isDirty={isDirty}
      onSave={handleSave}
      onCancel={() => form.reset()}
    >
      <LogoUpload
        value={form.values.logoBase64}
        onChange={(dataUrl) => form.setFieldValue('logoBase64', dataUrl)}
      />
    </SectionShell>
  );
};
