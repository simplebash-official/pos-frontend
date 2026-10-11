import { t } from '@/shared/i18n/t';
import { Box, Group, Select, Text } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { designSelectData } from '@/features/settings/lib/designOptions';
import type { DocumentKindSettings } from '@/features/settings/types';

interface DocumentDesignPickerProps {
  kind: DocumentKindSettings;
  /** The design currently shown. */
  value: string;
  onChange: (name: string) => void;
}

// A slim bar under the preview header: switch the design for this one print. The shop's own
// choice (Settings → Document Designs) is not changed.
export const DocumentDesignPicker = ({ kind, value, onChange }: DocumentDesignPickerProps) => {
  const isMobile = useIsMobile();
  return (
    <Box
      style={{
        flexShrink: 0,
        padding: isMobile ? '8px 12px' : '8px 20px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)',
      }}
    >
      <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
          {t('Design')}
        </Text>
        <Select
          aria-label={t('Design')}
          data={designSelectData(kind.templates)}
          value={value}
          onChange={(name) => {
            if (name) {
              onChange(name);
            }
          }}
          allowDeselect={false}
          size={isMobile ? 'md' : 'sm'}
          style={{ flex: isMobile ? '1 1 100%' : '0 1 340px', minWidth: 0 }}
        />
        <Text size="xs" c="dimmed">
          {t('For this print only')}
        </Text>
      </Group>
    </Box>
  );
};
