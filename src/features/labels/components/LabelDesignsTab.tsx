import { t } from '@/shared/i18n/t';
import { lazy, Suspense, useState } from 'react';
import { Box, Button, Group, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { IconAction } from '@/shared/components/drawer';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { useAppSelector } from '@/store/hooks';
import { selectLabelPrintSettings, selectShopProfile } from '@/store/slices/settingsSlice';
import { useDeleteLabelTemplate, useLabelTemplates } from '../hooks/useLabelTemplates';
import { buildLabelSample } from '../lib/labelSample';
import { FILL_COLUMN, LIST_FILL } from '../lib/listScroll';
import type { LabelTemplate } from '../types';
import { LabelCanvas } from './LabelCanvas';
import type { LabelDesignerMode } from './LabelDesignerModal';

const LabelDesignerModal = lazy(() =>
  import('./LabelDesignerModal').then((m) => ({ default: m.LabelDesignerModal }))
);

/** The room a thumbnail is drawn in, in screen pixels. */
const THUMB_WIDTH = 200;
const THUMB_HEIGHT = 120;

interface DesignerTarget {
  mode: LabelDesignerMode;
  base: LabelTemplate | null;
}

/** A design drawn to scale with example values; not interactive. */
const DesignThumbnail = ({ template, shopName }: { template: LabelTemplate; shopName: string }) => {
  const scale = Math.min(THUMB_WIDTH / template.widthMm, THUMB_HEIGHT / template.heightMm);
  return (
    <Box
      h={THUMB_HEIGHT + 24}
      p="xs"
      inert
      aria-hidden
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        borderRadius: 'var(--mantine-radius-default)',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <LabelCanvas
        label={template}
        elements={template.elements}
        selectedId={null}
        onSelect={() => undefined}
        onChange={() => undefined}
        onRemove={() => undefined}
        sample={buildLabelSample()}
        shopName={shopName}
        scale={scale}
      />
    </Box>
  );
};

/**
 * The label designs as a gallery: the ready-made ones (copy them to change
 * them) and the shop's own (edit, copy, delete), each drawn to scale.
 */
export const LabelDesignsTab = () => {
  const isMobile = useIsMobile();
  const shopProfile = useAppSelector(selectShopProfile);
  const settings = useAppSelector(selectLabelPrintSettings);
  const templatesQuery = useLabelTemplates();
  const deleteTemplate = useDeleteLabelTemplate();
  const [designer, setDesigner] = useState<DesignerTarget | null>(null);
  const [toDelete, setToDelete] = useState<LabelTemplate | null>(null);

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

  return (
    <Stack gap="md" style={isMobile ? undefined : FILL_COLUMN}>
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Text size="sm" c="dimmed" style={{ flex: 1, minWidth: 200 }}>
          {t('Ready-made designs cannot be changed: copy one to make it your own.')}
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
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
      {templatesQuery.isLoading && <Skeleton height={220} />}

      <Box style={isMobile ? undefined : LIST_FILL}>
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3, xl: 4 }} spacing="md">
          {templatesQuery.data?.map((template) => (
            <Paper key={template.key} p="sm" withBorder>
              <Stack gap="xs">
                <DesignThumbnail template={template} shopName={shopProfile.tradingName} />
                <Group justify="space-between" wrap="nowrap" gap="xs" align="flex-start">
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={600} size="sm" truncate>
                      {template.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {template.widthMm} × {template.heightMm} mm
                      {template.builtIn ? ` · ${t('Ready-made')}` : ''}
                      {settings?.templateKey === template.key
                        ? ` · ${t('Used on this computer')}`
                        : ''}
                    </Text>
                  </Box>
                  <Group gap={6} wrap="nowrap">
                    <IconAction
                      kind="neutral"
                      label={t('Make a copy of this design')}
                      icon={<IconCopy size={16} />}
                      onClick={() => setDesigner({ mode: 'copy', base: template })}
                    />
                    {!template.builtIn && (
                      <>
                        <IconAction
                          kind="edit"
                          label={t('Edit this design')}
                          icon={<IconEdit size={16} />}
                          onClick={() => setDesigner({ mode: 'edit', base: template })}
                        />
                        <IconAction
                          kind="danger"
                          label={t('Delete this design')}
                          icon={<IconTrash size={16} />}
                          onClick={() => setToDelete(template)}
                        />
                      </>
                    )}
                  </Group>
                </Group>
              </Stack>
            </Paper>
          ))}
        </SimpleGrid>
      </Box>

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
    </Stack>
  );
};
