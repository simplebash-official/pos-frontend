import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import { Alert, Button, Group, Select, Skeleton, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { SectionShell } from '../SectionShell';
import { DocumentDesignPreviewModal } from '../DocumentDesignPreviewModal';
import {
  useDocumentTemplateSettings,
  useUpdateDocumentTemplates,
} from '../../hooks/useDocumentTemplates';
import {
  buildSelections,
  changedKinds,
  designSelectData,
  shownDesign,
} from '../../lib/designOptions';
import type { SectionProps } from './ShopProfileSection';

// Pick how invoices, receipts and credit notes look. The list comes from the document server, so a
// design added there appears here by itself. Saved for the whole shop: every device prints it.
export const DocumentDesignsSection = ({ onDirtyChange }: SectionProps) => {
  const isMobile = useIsMobile();
  const { data, isLoading, isError, refetch } = useDocumentTemplateSettings();
  const update = useUpdateDocumentTemplates();

  // Only what the admin changed; every other kind follows the saved choice, so there is no copy of
  // the server data to keep in sync.
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [previewName, setPreviewName] = useState<string | null>(null);

  const kinds = data?.kinds ?? [];
  const isDirty = changedKinds(kinds, edits).length > 0;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const handleSave = async () => {
    try {
      await update.mutateAsync(buildSelections(kinds, edits));
      setEdits({});
      notifications.show({
        title: t('Designs saved'),
        message: t('New prints use the designs you chose.'),
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: t('Could not save the designs'),
        message: getErrorMessage(error),
        color: 'red',
      });
    }
  };

  const previewTitle =
    kinds.flatMap((kind) => kind.templates).find((option) => option.name === previewName)?.title ??
    '';

  return (
    <SectionShell
      title={t('Document Designs')}
      description={t('Choose how your invoices, receipts and credit notes look when printed.')}
      isDirty={isDirty}
      saving={update.isPending}
      onSave={() => void handleSave()}
      onCancel={() => setEdits({})}
      saveLabel={t('Save Designs')}
    >
      {isLoading && (
        <Stack gap="md">
          <Skeleton height={56} />
          <Skeleton height={56} />
          <Skeleton height={56} />
        </Stack>
      )}

      {isError && (
        <Alert
          variant="light"
          color="orange"
          icon={<IconAlertCircle size={18} />}
          title={t('We could not load your designs')}
        >
          <Stack gap="sm" align="flex-start">
            <Text size="sm">{t('Check your connection and try again.')}</Text>
            <Button variant="default" onClick={() => void refetch()}>
              {t('Try again')}
            </Button>
          </Stack>
        </Alert>
      )}

      {data && (
        <Stack gap="md">
          {kinds.map((kind) => (
            <Group key={kind.kind} align="flex-end" gap="sm" wrap="wrap">
              <Select
                label={t(kind.label)}
                data={designSelectData(kind.templates)}
                value={shownDesign(kind, edits)}
                onChange={(value) => {
                  if (value) {
                    setEdits((current) => ({ ...current, [kind.kind]: value }));
                  }
                }}
                allowDeselect={false}
                size={isMobile ? 'md' : 'sm'}
                style={{ flex: '1 1 260px', minWidth: 0 }}
              />
              <Button
                variant="default"
                size={isMobile ? 'md' : 'sm'}
                onClick={() => setPreviewName(shownDesign(kind, edits))}
              >
                {t('Preview')}
              </Button>
            </Group>
          ))}
          <Text size="sm" c="dimmed">
            {t('Every device in your shop prints the design you pick here.')}
          </Text>
        </Stack>
      )}

      <DocumentDesignPreviewModal
        name={previewName}
        title={previewTitle}
        onClose={() => setPreviewName(null)}
      />
    </SectionShell>
  );
};
