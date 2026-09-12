import React, { useState } from 'react';
import { t } from '@/shared/i18n/t';
import {
  Modal,
  Stack,
  Group,
  Text,
  SimpleGrid,
  Paper,
  SegmentedControl,
  Badge,
  Divider,
} from '@mantine/core';

import { useIsMobile } from '@/shared/hooks/useResponsive';
import { usePlatform, type OperatingSystem } from '@/shared/lib/platform';
import {
  SHORTCUT_REGISTRY,
  SHORTCUT_CATEGORY_TITLES,
  type ShortcutCategory,
  type ShortcutDefinition,
} from '@/shared/lib/shortcuts';
import { KbdAction } from '@/shared/components/KbdShortcut';

export interface KeyboardShortcutsModalProps {
  opened: boolean;
  onClose: () => void;
}

const CATEGORY_ORDER: ShortcutCategory[] = [
  'cashier',
  'cart',
  'navigation',
  'documents',
  'utilities',
];

export const KeyboardShortcutsModal = ({ opened, onClose }: KeyboardShortcutsModalProps) => {
  const isMobile = useIsMobile();
  const platform = usePlatform();

  // Allow user to switch between OS views, defaulting to detected OS
  const [selectedOS, setSelectedOS] = useState<OperatingSystem>(
    platform.isApple ? 'macos' : 'windows'
  );

  // Group registry items by category
  const categorizedShortcuts = React.useMemo(() => {
    const map: Record<ShortcutCategory, ShortcutDefinition[]> = {
      cashier: [],
      cart: [],
      navigation: [],
      documents: [],
      utilities: [],
    };

    Object.values(SHORTCUT_REGISTRY).forEach((shortcut) => {
      map[shortcut.category].push(shortcut);
    });

    return map;
  }, []);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {t('Cashier Keyboard Shortcuts')}
        </Text>
      }
      size="xl"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Text size="xs" c="dimmed" style={{ flex: 1, minWidth: 200 }}>
            {t(
              'Billing counter functions are keyboard-first for maximum cashier speed and muscle memory.'
            )}
          </Text>

          <Group gap="xs" align="center">
            <Text size="xs" fw={600} c="dimmed">
              {t('Platform')}:
            </Text>
            <SegmentedControl
              size="xs"
              value={selectedOS}
              onChange={(val) => setSelectedOS(val as OperatingSystem)}
              data={[
                { label: 'macOS (⌘)', value: 'macos' },
                { label: 'Windows (Ctrl)', value: 'windows' },
              ]}
              radius="var(--mantine-radius-default)"
            />
          </Group>
        </Group>

        <Stack gap="lg">
          {CATEGORY_ORDER.map((category) => {
            const items = categorizedShortcuts[category];
            if (!items || items.length === 0) return null;

            return (
              <Stack key={category} gap="xs">
                <Group gap="xs" align="center">
                  <Badge size="sm" variant="light" color="blue">
                    {items.length}
                  </Badge>
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    {t(SHORTCUT_CATEGORY_TITLES[category])}
                  </Text>
                  <Divider style={{ flex: 1 }} />
                </Group>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                  {items.map((sc) => (
                    <Paper
                      key={sc.id}
                      p="xs"
                      withBorder
                      radius="var(--mantine-radius-default)"
                      style={{
                        backgroundColor: 'var(--bg-hover)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text size="xs" fw={600} truncate>
                            {t(sc.title)}
                          </Text>
                          <Text size="3xs" c="dimmed" lineClamp={1}>
                            {t(sc.description)}
                          </Text>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          <KbdAction actionId={sc.id} platform={selectedOS} size="xs" />
                        </div>
                      </Group>
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Modal>
  );
};
