import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCloudCog } from '@tabler/icons-react';
import { SyncPanel } from './SyncPanel';

/**
 * The sync dashboard as a Settings page section.
 *
 * Same body as the drawer, so both surfaces always agree. The drawer is the
 * fast path during a sale; this is where someone goes to look deliberately.
 */
export const SyncSettingsSection = () => {
  return (
    <Paper p="lg" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon color="blue" variant="light">
            <IconCloudCog size={18} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={700} size="md">
              Sync &amp; Offline
            </Text>
            <Text size="xs" c="dimmed">
              What is stored on this device and what is waiting to reach the server
            </Text>
          </Stack>
        </Group>

        <SyncPanel />
      </Stack>
    </Paper>
  );
};
