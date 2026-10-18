import { t } from '@/shared/i18n/t';
import { type ReactNode, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  ColorInput,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertCircle,
  IconFileDescription,
  IconFileInvoice,
  IconReceipt,
  IconReceiptRefund,
} from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getErrorMessage } from '@/shared/lib/error';
import { CustomDesignsSyncLine } from '@/features/sync-status/components/CustomDesignsSyncLine';
import { SectionShell } from '../SectionShell';
import { DocumentDesignPreviewModal } from '../DocumentDesignPreviewModal';
import {
  useDocumentTemplateSettings,
  useUpdateDocumentTemplates,
} from '../../hooks/useDocumentTemplates';
import {
  NO_EDITS,
  buildRequest,
  defaultDesign,
  designSelectData,
  editsAreValid,
  hasChanges,
  hasUnavailableChoice,
  isOptionValueValid,
  shownDesign,
  shownFamily,
  shownOptionValue,
  type DesignEdits,
} from '../../lib/designOptions';
import type {
  DesignOption,
  DesignOptionValue,
  DocumentDesignFamily,
  DocumentKindSettings,
} from '../../types';
import type { SectionProps } from './ShopProfileSection';

const KIND_ICONS: Record<string, ReactNode> = {
  'a4-invoice': <IconFileInvoice size={18} />,
  'thermal-receipt': <IconReceipt size={18} />,
  'credit-note': <IconReceiptRefund size={18} />,
  quotation: <IconFileDescription size={18} />,
};

// Pick how invoices, receipts, credit notes and quotations look, and adjust the settings a design
// offers (a signature box, an accent colour…). The list comes from the document server, so a
// design made for this shop appears here by itself. Saved for the whole shop: every device prints it.
export const DocumentDesignsSection = ({ onDirtyChange }: SectionProps) => {
  const isMobile = useIsMobile();
  const { data, isLoading, isError, refetch } = useDocumentTemplateSettings();
  const update = useUpdateDocumentTemplates();

  // Only what the admin changed; every other kind and setting follows what is saved, so there is
  // no copy of the server data to keep in sync.
  const [edits, setEdits] = useState<DesignEdits>(NO_EDITS);
  const [preview, setPreview] = useState<DocumentDesignFamily | null>(null);

  const kinds = data?.kinds ?? [];
  const isDirty = hasChanges(kinds, edits);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const pickDesign = (kind: DocumentKindSettings, family: string) =>
    setEdits((current) => ({ ...current, designs: { ...current.designs, [kind.kind]: family } }));

  const setOption = (family: string, key: string, value: DesignOptionValue) =>
    setEdits((current) => ({
      ...current,
      options: { ...current.options, [family]: { ...current.options[family], [key]: value } },
    }));

  const handleSave = async () => {
    if (!editsAreValid(kinds, edits)) {
      notifications.show({
        title: t('Check the settings'),
        message: t('One of the settings is not valid yet.'),
        color: 'red',
      });
      return;
    }
    try {
      await update.mutateAsync(buildRequest(kinds, edits));
      setEdits(NO_EDITS);
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

  return (
    <SectionShell
      title={t('Document Designs')}
      description={t(
        'Choose how your invoices, receipts, credit notes and quotations look when printed.'
      )}
      isDirty={isDirty}
      saving={update.isPending}
      onSave={() => void handleSave()}
      onCancel={() => setEdits(NO_EDITS)}
      saveLabel={t('Save Designs')}
    >
      {isLoading && (
        <Stack gap="md">
          <Skeleton height={120} />
          <Skeleton height={120} />
          <Skeleton height={120} />
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
            <KindCard
              key={kind.kind}
              kind={kind}
              edits={edits}
              isMobile={isMobile}
              onPickDesign={(family) => pickDesign(kind, family)}
              onSetOption={setOption}
              onPreview={setPreview}
            />
          ))}
          <CustomDesignsSyncLine />
          <Text size="sm" c="dimmed">
            {t('Every device in your shop prints the design you pick here.')}
          </Text>
        </Stack>
      )}

      <DocumentDesignPreviewModal design={preview} onClose={() => setPreview(null)} />
    </SectionShell>
  );
};

interface KindCardProps {
  kind: DocumentKindSettings;
  edits: DesignEdits;
  isMobile: boolean;
  onPickDesign: (family: string) => void;
  onSetOption: (family: string, key: string, value: DesignOptionValue) => void;
  onPreview: (design: DocumentDesignFamily) => void;
}

export const KindCard = ({
  kind,
  edits,
  isMobile,
  onPickDesign,
  onSetOption,
  onPreview,
}: KindCardProps) => {
  const shown = shownFamily(kind, edits);
  const isStandard = shown !== null && shown.family === defaultDesign(kind);
  // The saved choice is gone and the admin has not picked another yet.
  const mustChoose = hasUnavailableChoice(kind) && shown === null;

  return (
    <Paper withBorder p="md" style={{ backgroundColor: 'var(--bg-app)' }}>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" gap="sm">
          <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
            <ThemeIcon variant="light" color="blue" size="lg" radius="md">
              {KIND_ICONS[kind.kind]}
            </ThemeIcon>
            <Text fw={700} truncate>
              {t(kind.label)}
            </Text>
          </Group>
          {shown !== null && (
            <Badge variant="light" color={isStandard ? 'gray' : 'blue'} style={{ flexShrink: 0 }}>
              {isStandard ? t('Standard design') : t('Your design')}
            </Badge>
          )}
        </Group>

        {mustChoose && (
          <Alert
            variant="light"
            color="orange"
            icon={<IconAlertCircle size={18} />}
            title={t('The design you chose is no longer available')}
          >
            <Text size="sm">
              {t('Printing this document is paused until you choose a design and save.')}
            </Text>
          </Alert>
        )}

        <Group align="flex-end" gap="sm" wrap="wrap">
          <Select
            label={t('Design')}
            placeholder={t('Choose a design')}
            data={designSelectData(kind.families)}
            value={shownDesign(kind, edits)}
            onChange={(value) => {
              if (value) onPickDesign(value);
            }}
            allowDeselect={false}
            size={isMobile ? 'md' : 'sm'}
            style={{ flex: '1 1 260px', minWidth: 0 }}
          />
          <Button
            variant="default"
            size={isMobile ? 'md' : 'sm'}
            disabled={shown === null}
            onClick={() => shown && onPreview(shown)}
          >
            {t('Preview')}
          </Button>
        </Group>

        {shown !== null && (
          <Text size="xs" c="dimmed">
            {`${t('Version')} ${shown.version}${shown.options.length > 0 ? ` · ${t('You can adjust this design below.')}` : ''}`}
          </Text>
        )}

        {shown !== null && shown.options.length > 0 && (
          <OptionsForm
            kind={kind}
            design={shown}
            edits={edits}
            isMobile={isMobile}
            onSetOption={onSetOption}
          />
        )}
      </Stack>
    </Paper>
  );
};

interface OptionsFormProps {
  kind: DocumentKindSettings;
  design: DocumentDesignFamily;
  edits: DesignEdits;
  isMobile: boolean;
  onSetOption: (family: string, key: string, value: DesignOptionValue) => void;
}

const OptionsForm = ({ kind, design, edits, isMobile, onSetOption }: OptionsFormProps) => (
  <Paper withBorder p="sm" style={{ backgroundColor: 'var(--bg-card)' }}>
    <Stack gap="sm">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {t('Settings for this design')}
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" verticalSpacing="md">
        {design.options.map((option) => (
          <OptionControl
            key={option.key}
            option={option}
            value={shownOptionValue(kind, design.family, option, edits)}
            isMobile={isMobile}
            onChange={(value) => onSetOption(design.family, option.key, value)}
          />
        ))}
      </SimpleGrid>
    </Stack>
  </Paper>
);

interface OptionControlProps {
  option: DesignOption;
  value: DesignOptionValue;
  isMobile: boolean;
  onChange: (value: DesignOptionValue) => void;
}

const OptionControl = ({ option, value, isMobile, onChange }: OptionControlProps) => {
  const size = isMobile ? 'md' : 'sm';
  const invalid = !isOptionValueValid(option, value);

  switch (option.type) {
    case 'toggle':
      return (
        <Switch
          label={option.label}
          size={isMobile ? 'md' : 'sm'}
          checked={value === true}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
      );
    case 'select':
      return (
        <Select
          label={option.label}
          size={size}
          data={(option.choices ?? []).map((choice) => ({
            value: choice.value,
            label: choice.label,
          }))}
          value={typeof value === 'string' ? value : null}
          onChange={(next) => {
            if (next) onChange(next);
          }}
          allowDeselect={false}
        />
      );
    case 'color':
      return (
        <ColorInput
          label={option.label}
          size={size}
          format="hex"
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          error={invalid ? t('Use a colour like #1A2B3C.') : undefined}
        />
      );
    case 'text':
      return (
        <TextInput
          label={option.label}
          size={size}
          maxLength={option.maxLength}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.currentTarget.value)}
          description={`${typeof value === 'string' ? value.length : 0} / ${option.maxLength ?? 0}`}
        />
      );
  }
};
