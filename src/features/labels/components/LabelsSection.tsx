import { t } from '@/shared/i18n/t';
import { lazy, Suspense, useEffect, useState } from 'react';
import { ActionIcon, Badge, Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCopy, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLabelPrintSettings, setLabelPrintSettings } from '@/store/slices/settingsSlice';
import { SectionShell } from '@/features/settings/components/SectionShell';
import type { SectionProps } from '@/features/settings/components/sections/ShopProfileSection';
import { useDeleteLabelTemplate, useLabelTemplates } from '../hooks/useLabelTemplates';
import { draftFromSettings, settingsFromDraft, type SetupDraft } from '../lib/printSetupDraft';
import type { LabelTemplate } from '../types';
import type { LabelDesignerMode } from './LabelDesignerModal';
import { LabelPrintSetupFields } from './LabelPrintSetupFields';

const LabelDesignerModal = lazy(() =>
  import('./LabelDesignerModal').then((m) => ({ default: m.LabelDesignerModal }))
);

const sameDraft = (a: SetupDraft, b: SetupDraft): boolean =>
  a.templateKey === b.templateKey &&
  a.method === b.method &&
  a.printerName === b.printerName &&
  a.dpi === b.dpi;

interface DesignerTarget {
  mode: LabelDesignerMode;
  base: LabelTemplate | null;
}

/**
 * Settings → Label Printing: how labels print on this computer, and the label
 * designs (the ready-made ones plus the shop's own, which can be made, copied,
 * changed and deleted here).
 */
export const LabelsSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const saved = useAppSelector(selectLabelPrintSettings);
  const templatesQuery = useLabelTemplates();
  const deleteTemplate = useDeleteLabelTemplate();

  const [draft, setDraft] = useState<SetupDraft>(() => draftFromSettings(saved));
  const [designer, setDesigner] = useState<DesignerTarget | null>(null);
  const [toDelete, setToDelete] = useState<LabelTemplate | null>(null);

  const isDirty = !sameDraft(draft, draftFromSettings(saved));
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const completed = settingsFromDraft(draft);

  const handleSave = () => {
    if (completed === null) {
      notifications.show({
        title: t('Choose every option first'),
        message: t('Pick a design, how to print, and the printer detail.'),
        color: 'orange',
      });
      return;
    }
    dispatch(setLabelPrintSettings(completed));
    notifications.show({
      title: t('Label printing saved'),
      message: t('Your label settings were updated.'),
      color: 'green',
      icon: <IconCheck size={16} />,
    });
  };

  const handleDelete = () => {
    if (toDelete === null) return;
    deleteTemplate.mutate(toDelete.key, {
      onSuccess: () => setToDelete(null),
      onError: (error) => {
        setToDelete(null);
        notifications.show({
          title: t('Could not delete the design'),
          message: getErrorMessage(error),
          color: 'red',
        });
      },
    });
  };

  const templates = templatesQuery.data;
  const actionSize = isMobile ? 44 : 32;

  return (
    <>
      <SectionShell
        title={t('Label Printing')}
        description={t('Print barcode and QR stickers for your items, and design how they look.')}
        isDirty={isDirty}
        onSave={handleSave}
        onCancel={() => setDraft(draftFromSettings(saved))}
        saveLabel={t('Save Label Settings')}
      >
        <Stack gap="lg">
          <Stack gap="xs">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              {t('How labels print on this computer')}
            </Text>
            {templates === undefined ? (
              <Skeleton height={160} />
            ) : (
              <LabelPrintSetupFields draft={draft} onChange={setDraft} templates={templates} />
            )}
          </Stack>

          <Stack gap="xs">
            <Group justify="space-between">
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                tt="uppercase"
                style={{ letterSpacing: '0.05em' }}
              >
                {t('Label designs')}
              </Text>
              <Button
                size={isMobile ? 'sm' : 'compact-sm'}
                leftSection={<IconPlus size={14} />}
                onClick={() => setDesigner({ mode: 'new', base: null })}
              >
                {t('New design')}
              </Button>
            </Group>
            {templatesQuery.isError && (
              <Text size="sm" c="red">
                {getErrorMessage(templatesQuery.error)}
              </Text>
            )}
            {templates?.map((template) => (
              <Paper key={template.key} p="sm" withBorder>
                <Group justify="space-between" wrap="nowrap" gap="sm">
                  <div style={{ minWidth: 0 }}>
                    <Group gap="xs" wrap="nowrap">
                      <Text fw={600} size="sm" truncate>
                        {template.name}
                      </Text>
                      {template.builtIn && (
                        <Badge size="xs" variant="light" color="gray" tt="none">
                          {t('Ready-made')}
                        </Badge>
                      )}
                    </Group>
                    <Text size="xs" c="dimmed">
                      {template.widthMm} × {template.heightMm} mm
                    </Text>
                  </div>
                  <Group gap={6} wrap="nowrap">
                    <ActionIcon
                      variant="light"
                      size={actionSize}
                      aria-label={t('Make a copy of this design')}
                      onClick={() => setDesigner({ mode: 'copy', base: template })}
                    >
                      <IconCopy size={16} />
                    </ActionIcon>
                    {!template.builtIn && (
                      <>
                        <ActionIcon
                          variant="light"
                          color="blue"
                          size={actionSize}
                          aria-label={t('Edit this design')}
                          onClick={() => setDesigner({ mode: 'edit', base: template })}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          size={actionSize}
                          aria-label={t('Delete this design')}
                          onClick={() => setToDelete(template)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </>
                    )}
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </SectionShell>

      <Suspense fallback={null}>
        {designer !== null && (
          <LabelDesignerModal
            opened
            onClose={() => setDesigner(null)}
            mode={designer.mode}
            base={designer.base}
          />
        )}
      </Suspense>

      <ConfirmDialog
        opened={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title={t('Delete Label Design')}
        confirmLabel={t('Delete')}
        loading={deleteTemplate.isPending}
      >
        {toDelete?.name}:{' '}
        {t('This design will be deleted. Labels already printed are not affected.')}
      </ConfirmDialog>
    </>
  );
};
