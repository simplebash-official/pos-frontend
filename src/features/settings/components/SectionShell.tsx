import { t } from '@/shared/i18n/t';
import { ReactNode } from 'react';
import { Box, Button, Divider, Group, Paper, Stack, Text } from '@mantine/core';

export interface SectionShellProps {
  title: string;
  description?: string;
  isDirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  children: ReactNode;
}

/**
 * Shared Paper/header/Save+Cancel chrome for every settings section, so each one gets identical
 * styling instead of hand-rolling its own. Save/Cancel sit in the top action bar next to the
 * title, not a footer, so they stay visible without scrolling on long sections.
 */
export const SectionShell = ({
  title,
  description,
  isDirty,
  saving = false,
  onSave,
  onCancel,
  saveLabel = 'Save Changes',
  children,
}: SectionShellProps) => {
  return (
    <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)', flex: 1 }}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
          <Box>
            <Text fw={700} size="lg">
              {title}
            </Text>
            {description && (
              <Text size="sm" c="dimmed" mt={2}>
                {description}
              </Text>
            )}
          </Box>
          <Group gap="sm" style={{ flexShrink: 0 }}>
            <Button variant="default" onClick={onCancel} disabled={!isDirty || saving}>
              {t('Cancel')}
            </Button>
            <Button color="blue" onClick={onSave} disabled={!isDirty} loading={saving}>
              {saveLabel}
            </Button>
          </Group>
        </Group>

        <Divider />

        {children}
      </Stack>
    </Paper>
  );
};
