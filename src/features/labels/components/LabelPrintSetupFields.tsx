import { t } from '@/shared/i18n/t';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ActionIcon, Alert, Box, Group, Select, Stack, Text } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { getErrorMessage } from '@/shared/lib/error';
import { isTauri } from '@/shared/lib/platform';
import { listPrinters } from '@/shared/print/nativePrinters';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { queryKeys } from '@/api/queryKeys';
import { LABEL_DPI_OPTIONS, type LabelDpi, type LabelTemplate } from '../types';
import type { SetupDraft } from '../lib/printSetupDraft';

interface LabelPrintSetupFieldsProps {
  draft: SetupDraft;
  onChange: (draft: SetupDraft) => void;
  templates: LabelTemplate[];
}

const dpiLabel = (dpi: LabelDpi): string => {
  switch (dpi) {
    case 203:
      return t('Standard (203 dpi) — most label printers');
    case 300:
      return t('High detail (300 dpi)');
    case 600:
      return t('Extra fine (600 dpi)');
  }
};

/**
 * The choices that decide how labels leave this computer: which design, whether
 * to show the system print window or print straight to a label printer (desktop
 * app only), the printer, and its detail level. Shared by the print window's
 * first-time setup and Settings → Label Printing.
 */
export const LabelPrintSetupFields = ({
  draft,
  onChange,
  templates,
}: LabelPrintSetupFieldsProps) => {
  const isMobile = useIsMobile();
  const canPrintDirect = isTauri();
  const wantsPrinterList = canPrintDirect && draft.method === 'direct';
  const printers = useQuery({
    queryKey: [...queryKeys.labels.all, 'printers'],
    queryFn: listPrinters,
    enabled: wantsPrinterList,
    staleTime: 0,
  });

  const designData = useMemo(
    () => [
      {
        group: t('Ready-made designs'),
        items: templates.filter((x) => x.builtIn).map((x) => ({ value: x.key, label: x.name })),
      },
      {
        group: t('Your designs'),
        items: templates.filter((x) => !x.builtIn).map((x) => ({ value: x.key, label: x.name })),
      },
    ],
    [templates]
  );

  const methodData = [
    { label: t('Show the print window'), value: 'system' },
    ...(canPrintDirect ? [{ label: t('Print straight to the printer'), value: 'direct' }] : []),
  ];

  return (
    <Stack gap="md">
      <Select
        label={t('Label design')}
        description={t('How your labels look. You can make your own in Settings.')}
        placeholder={t('Choose a design')}
        data={designData}
        value={draft.templateKey}
        onChange={(value) => onChange({ ...draft, templateKey: value })}
        allowDeselect={false}
        comboboxProps={{ withinPortal: true }}
      />

      <Box>
        <Text size="sm" fw={500} mb={4}>
          {t('When you press Print')}
        </Text>
        <SegmentedToggle
          fullWidth
          orientation={isMobile ? 'vertical' : 'horizontal'}
          value={draft.method ?? ''}
          onChange={(value) =>
            onChange({
              ...draft,
              method: value === 'direct' ? 'direct' : 'system',
              printerName: value === 'direct' ? draft.printerName : null,
            })
          }
          data={methodData}
        />
        {!canPrintDirect && (
          <Text size="xs" c="dimmed" mt={4}>
            {t('Printing straight to a label printer is available in the desktop app.')}
          </Text>
        )}
      </Box>

      {wantsPrinterList && (
        <Box>
          <Group gap="xs" align="flex-end" wrap="nowrap">
            <Select
              style={{ flex: 1 }}
              label={t('Label printer')}
              placeholder={printers.isLoading ? t('Looking for printers…') : t('Choose a printer')}
              data={printers.data ?? []}
              value={draft.printerName}
              onChange={(value) => onChange({ ...draft, printerName: value })}
              allowDeselect={false}
              nothingFoundMessage={t('No printers found on this computer.')}
              comboboxProps={{ withinPortal: true }}
            />
            <ActionIcon
              variant="default"
              size={isMobile ? 44 : 36}
              aria-label={t('Look for printers again')}
              loading={printers.isFetching}
              onClick={() => void printers.refetch()}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
          {printers.isError && (
            <Alert color="red" mt="xs" variant="light">
              {getErrorMessage(printers.error)}
            </Alert>
          )}
        </Box>
      )}

      <Select
        label={t('Printer detail')}
        description={t(
          'If you are not sure, keep the first one. Check your printer box or settings.'
        )}
        placeholder={t('Choose the detail level')}
        data={LABEL_DPI_OPTIONS.map((dpi) => ({ value: String(dpi), label: dpiLabel(dpi) }))}
        value={draft.dpi === null ? null : String(draft.dpi)}
        onChange={(value) =>
          onChange({
            ...draft,
            dpi: LABEL_DPI_OPTIONS.find((option) => String(option) === value) ?? null,
          })
        }
        allowDeselect={false}
        comboboxProps={{ withinPortal: true }}
      />
    </Stack>
  );
};
