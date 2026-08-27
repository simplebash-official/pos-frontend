import { t } from '@/shared/i18n/t';
import { Modal, Stack, Group, Text, Kbd, SimpleGrid, Paper } from '@mantine/core';

import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface KeyboardShortcutsModalProps {
  opened: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'F1 / Esc', description: 'Focus scan bar (returns focus from anywhere)' },
  { key: 'F2', description: 'Proceed to payment / Complete sale' },
  { key: 'F3', description: 'Attach customer / Walk-in search' },
  { key: 'F4', description: 'Switch catalog to Jobs (repairs & print jobs)' },
  { key: 'F6', description: 'Cycle payment method forward' },
  { key: 'F11', description: 'Toggle Focus Mode (hides navigation rail)' },
  { key: 'Ctrl + G', description: 'Switch catalog to Goods' },
  { key: 'Ctrl + D', description: 'Apply order-level discount' },
  { key: 'Ctrl + H', description: 'Park / Hold current sale' },
  { key: 'Ctrl + Shift + H', description: 'Open held sales list' },
  { key: 'Ctrl + Shift + S', description: 'Open sync & offline panel' },
  { key: 'Ctrl + P', description: 'Reprint last receipt' },
  { key: 'D', description: 'Apply line item discount on selected row' },
  { key: 'Delete', description: 'Remove line item' },
  { key: 'Plus (+) / Minus (-)', description: 'Adjust selected line quantity' },
  { key: 'Up / Down Arrows', description: 'Navigate line items / catalog grid selection' },
  { key: 'Enter', description: 'Confirm payment / Add single search result' },
  { key: '?', description: 'Open keyboard shortcuts map' },
];

export const KeyboardShortcutsModal = ({ opened, onClose }: KeyboardShortcutsModalProps) => {
  const isMobile = useIsMobile();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {t('Cashier Keyboard Shortcuts')}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          {t(
            'Billing counter functions are keyboard-first for maximum cashier speed and muscle memory.'
          )}
        </Text>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
          {SHORTCUTS.map((sc) => (
            <Paper
              key={sc.key}
              p="xs"
              withBorder
              radius="var(--mantine-radius-default)"
              style={{ backgroundColor: 'var(--bg-hover)' }}
            >
              <Group justify="space-between" align="center">
                <Text size="xs" fw={600} style={{ flex: 1 }}>
                  {sc.description}
                </Text>
                <Kbd size="xs">{sc.key}</Kbd>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      </Stack>
    </Modal>
  );
};
