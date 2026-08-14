import { useEffect } from 'react';
import { Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectShopProfile, updateShopProfile } from '@/store/slices/settingsSlice';
import { SectionShell } from '../SectionShell';
import type { SectionProps } from './ShopProfileSection';

interface DocumentTemplatesFormValues {
  defaultWarrantyText: string;
  defaultFooterText: string;
  receiptFooterText: string;
}

export const DocumentTemplatesSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const shopProfile = useAppSelector(selectShopProfile);

  const form = useForm<DocumentTemplatesFormValues>({
    initialValues: {
      defaultWarrantyText: shopProfile.defaultWarrantyText,
      defaultFooterText: shopProfile.defaultFooterText,
      receiptFooterText: shopProfile.receiptFooterText,
    },
  });

  const isDirty = form.isDirty();
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = () => {
    dispatch(updateShopProfile({ ...form.values }));
    form.resetDirty();
    notifications.show({
      title: 'Settings Saved',
      message: 'Document templates updated successfully.',
      color: 'green',
    });
  };

  return (
    <SectionShell
      title="Document Templates"
      description="Standard text printed on invoices and receipts."
      isDirty={isDirty}
      onSave={handleSave}
      onCancel={() => form.reset()}
    >
      <Stack gap="md">
        <div>
          <Textarea
            label="Default Warranty & Terms Policy (A4 Invoice)"
            rows={4}
            {...form.getInputProps('defaultWarrantyText')}
          />
          {!form.values.defaultWarrantyText.trim() && (
            <Text size="xs" c="orange" mt={4}>
              Your invoices won't show any warranty terms while this is empty.
            </Text>
          )}
        </div>

        <Textarea
          label="A4 Invoice Footer Text"
          rows={2}
          {...form.getInputProps('defaultFooterText')}
        />

        <TextInput
          label="Thermal Receipt Footer Text"
          {...form.getInputProps('receiptFooterText')}
        />
      </Stack>
    </SectionShell>
  );
};
