// DISABLED, NOT DEAD — do not delete. This folder's engine was removed;
// this file is kept for a future sync backend. See src/features/sync/README.md.
import { Drawer, Group, ScrollArea, Text, ThemeIcon } from '@mantine/core';
import { IconCloudCog } from '@tabler/icons-react';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { SyncPanel } from './SyncPanel';

export interface SyncDrawerProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * The sync dashboard, mounted at shell level.
 *
 * A drawer rather than a route because the cashier will most want it in the
 * middle of a sale, exactly when the badge turns red — navigating to a
 * settings page would take the cart off screen.
 */
export const SyncDrawer = ({ opened, onClose }: SyncDrawerProps) => {
  const isMobile = useIsMobile();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={isMobile ? '100%' : 460}
      title={
        <Group gap="xs">
          <ThemeIcon variant="light" color="blue" size="md">
            <IconCloudCog size={18} />
          </ThemeIcon>
          <Text fw={600}>Sync &amp; offline</Text>
        </Group>
      }
      scrollAreaComponent={ScrollArea.Autosize}
      padding="md"
    >
      <SyncPanel />
    </Drawer>
  );
};
