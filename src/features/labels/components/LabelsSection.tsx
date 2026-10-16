import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectLabelPrintSettings, setLabelPrintSettings } from '@/store/slices/settingsSlice';
import { SectionShell } from '@/features/settings/components/SectionShell';
import type { SectionProps } from '@/features/settings/components/sections/ShopProfileSection';
import { useLabelTemplates } from '../hooks/useLabelTemplates';
import { draftFromSettings, settingsFromDraft, type SetupDraft } from '../lib/printSetupDraft';
import { LabelPrintSetupFields } from './LabelPrintSetupFields';

const sameDraft = (a: SetupDraft, b: SetupDraft): boolean =>
  a.templateKey === b.templateKey &&
  a.method === b.method &&
  a.printerName === b.printerName &&
  a.dpi === b.dpi;

/**
 * Settings → Label Printing: how labels print on this computer (kept per
 * computer, since printers are). Designs, the items that need labels and the
 * print history live on the Labels page, linked from here.
 */
export const LabelsSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const saved = useAppSelector(selectLabelPrintSettings);
  const templatesQuery = useLabelTemplates();

  const [draft, setDraft] = useState<SetupDraft>(() => draftFromSettings(saved));

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

  const templates = templatesQuery.data;

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

          <Paper p="md" withBorder>
            <Group justify="space-between" wrap="wrap" gap="sm">
              <div style={{ minWidth: 0, flex: 1 }}>
                <Text fw={600} size="sm">
                  {t('Label designs and print history')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(
                    'Make your own designs, see which items need labels and every print on the Labels page.'
                  )}
                </Text>
              </div>
              <Button
                component={Link}
                to={ROUTES.LABELS}
                variant="light"
                rightSection={<IconArrowRight size={16} />}
              >
                {t('Open Labels')}
              </Button>
            </Group>
          </Paper>
        </Stack>
      </SectionShell>
    </>
  );
};
