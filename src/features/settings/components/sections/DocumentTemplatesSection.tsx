import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NumberInput, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notify } from '@/shared/notify';
import { queryKeys } from '@/api/queryKeys';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectShopProfile, setShopProfile } from '@/store/slices/settingsSlice';
import { getErrorMessage } from '@/shared/lib/error';
import { updateShopProfileApi } from '../../api/settingsApi';
import { useShopProfile } from '../../hooks/useShopProfile';
import { SectionShell } from '../SectionShell';
import type { SectionProps } from './ShopProfileSection';

interface DocumentTemplatesFormValues {
  defaultWarrantyText: string;
  defaultFooterText: string;
  receiptFooterText: string;
  jobReceiptTermsText: string;
  /** Empty when the shop prints no pickup warning. */
  uncollectedAfterDays: number | '';
}

const JOB_RECEIPT_TERMS_MAX = 600;
const UNCOLLECTED_DAYS_MAX = 365;

/**
 * The shop's standing text on printed documents: its general warranty policy (on invoices,
 * receipts and warranty cards), the quotation footer and the receipt's thank-you line. Saved to
 * the shop profile on the server, so every device prints the same words. A sale keeps the policy
 * it was made with.
 */
export const DocumentTemplatesSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { shopProfile: fetchedProfile } = useShopProfile();
  const storeProfile = useAppSelector(selectShopProfile);
  const shopProfile = fetchedProfile ?? storeProfile;
  const [saving, setSaving] = useState(false);

  const form = useForm<DocumentTemplatesFormValues>({
    initialValues: {
      defaultWarrantyText: shopProfile?.defaultWarrantyText ?? '',
      defaultFooterText: shopProfile?.defaultFooterText ?? '',
      receiptFooterText: shopProfile?.receiptFooterText ?? '',
      jobReceiptTermsText: shopProfile?.jobReceiptTermsText ?? '',
      uncollectedAfterDays: shopProfile?.uncollectedAfterDays ?? '',
    },
  });

  useEffect(() => {
    if (!shopProfile || form.isDirty()) return;
    const loaded: DocumentTemplatesFormValues = {
      defaultWarrantyText: shopProfile.defaultWarrantyText,
      defaultFooterText: shopProfile.defaultFooterText,
      receiptFooterText: shopProfile.receiptFooterText,
      jobReceiptTermsText: shopProfile.jobReceiptTermsText,
      uncollectedAfterDays: shopProfile.uncollectedAfterDays ?? '',
    };
    form.setInitialValues(loaded);
    form.setValues(loaded);
    form.resetDirty(loaded);
  }, [shopProfile]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDirty = form.isDirty();
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const persisted = await updateShopProfileApi({
        defaultWarrantyText: form.values.defaultWarrantyText.trim(),
        defaultFooterText: form.values.defaultFooterText.trim(),
        receiptFooterText: form.values.receiptFooterText.trim(),
        jobReceiptTermsText: form.values.jobReceiptTermsText.trim(),
        // The server reads 0 as "no warning".
        uncollectedAfterDays:
          form.values.uncollectedAfterDays === '' ? 0 : form.values.uncollectedAfterDays,
      });
      dispatch(setShopProfile(persisted));
      queryClient.setQueryData(queryKeys.settings.shopProfile(), persisted);
      const saved: DocumentTemplatesFormValues = {
        defaultWarrantyText: persisted.defaultWarrantyText,
        defaultFooterText: persisted.defaultFooterText,
        receiptFooterText: persisted.receiptFooterText,
        jobReceiptTermsText: persisted.jobReceiptTermsText,
        uncollectedAfterDays: persisted.uncollectedAfterDays ?? '',
      };
      form.setInitialValues(saved);
      form.setValues(saved);
      form.resetDirty(saved);
      notify.success({
        title: t('Settings Saved'),
        message: t('The text on your documents is saved.'),
      });
    } catch (error: unknown) {
      notify.error({
        title: t('Save Failed'),
        message: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      title={t('Document Templates')}
      description={t(
        'Standard text printed on invoices, receipts, warranty cards and job receipts.'
      )}
      isDirty={isDirty}
      saving={saving}
      onSave={() => void handleSave()}
      onCancel={() => form.reset()}
    >
      <Stack gap="md">
        <div>
          <Textarea
            label={t('Warranty policy')}
            description={t(
              'Printed on every invoice, receipt and warranty card. Each sale keeps the policy it was made with.'
            )}
            autosize
            minRows={4}
            maxRows={10}
            {...form.getInputProps('defaultWarrantyText')}
          />
          {!form.values.defaultWarrantyText.trim() && (
            <Text size="xs" c="orange" mt={4}>
              {t('Your documents will not show a warranty policy while this is empty.')}
            </Text>
          )}
        </div>

        <Textarea
          label={t('Quotation footer')}
          description={t('Printed at the bottom of every quotation.')}
          autosize
          minRows={2}
          maxRows={6}
          {...form.getInputProps('defaultFooterText')}
        />

        <TextInput
          label={t('Receipt thank-you line')}
          description={t('The last line of a printed receipt.')}
          {...form.getInputProps('receiptFooterText')}
        />

        <div>
          <Textarea
            label={t('Terms on the job receipt')}
            description={t(
              'Printed on the receipt the customer gets when you take in a repair or a print job.'
            )}
            autosize
            minRows={3}
            maxRows={8}
            maxLength={JOB_RECEIPT_TERMS_MAX}
            {...form.getInputProps('jobReceiptTermsText')}
          />
          <Text size="xs" c="dimmed" mt={4} ta="right">
            {form.values.jobReceiptTermsText.length} / {JOB_RECEIPT_TERMS_MAX}
          </Text>
        </div>

        <NumberInput
          label={t('Warn about uncollected items after (days)')}
          description={t(
            'The job receipt tells the customer to collect within this many days. Leave empty for no warning.'
          )}
          placeholder={t('No warning')}
          min={1}
          max={UNCOLLECTED_DAYS_MAX}
          allowDecimal={false}
          allowNegative={false}
          clampBehavior="strict"
          {...form.getInputProps('uncollectedAfterDays')}
        />
      </Stack>
    </SectionShell>
  );
};
