import { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Stack,
  Text,
  Paper,
  Group,
  Button,
  ActionIcon,
  Badge,
  Tooltip,
  Box,
  ThemeIcon,
  Center,
  Divider,
} from '@mantine/core';
import { IconPlayerPlay, IconTrash, IconClock, IconPlayerPause } from '@tabler/icons-react';

import { useHeldCarts } from '../hooks/useCart';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface HeldSalesDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export const HeldSalesDrawer = ({ opened, onClose }: HeldSalesDrawerProps) => {
  const { heldCarts, loadHeldCart, removeHeldCart } = useHeldCarts();
  const isMobile = useIsMobile();
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    if (opened) {
      const timer = setTimeout(() => {
        setNowMs(Date.now());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [opened]);

  const getAgeHours = (heldAt: string, currentNow: number) => {
    if (!currentNow) return 0;
    const elapsedMs = currentNow - new Date(heldAt).getTime();
    return elapsedMs / (1000 * 60 * 60);
  };

  const getAgeLabel = (heldAt: string, currentNow: number) => {
    if (!currentNow) return 'Just now';
    const elapsedMins = Math.floor((currentNow - new Date(heldAt).getTime()) / (1000 * 60));
    if (elapsedMins < 1) return 'Just now';
    if (elapsedMins < 60) return `${elapsedMins}m ago`;
    const hours = Math.floor(elapsedMins / 60);
    return `${hours}h ${elapsedMins % 60}m ago`;
  };

  const heldWithTotals = useMemo(
    () =>
      heldCarts.map((h) => {
        const subtotal = h.items.reduce((acc, i) => acc + i.totalCents, 0);
        const total = Math.max(0, subtotal - h.discountCents);
        return { ...h, subtotal, total };
      }),
    [heldCarts]
  );

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon size={40} color="orange" variant="light">
            <IconPlayerPause size={22} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="md" lh={1.2}>
              Parked / held sales
            </Text>
            <Text size="xs" c="dimmed" fw={500}>
              {heldCarts.length} parked · Ctrl+H to park the active cart
            </Text>
          </Box>
        </Group>
      }
      position="right"
      size={isMobile ? '100%' : 'md'}
    >
      <Stack gap="sm">
        {heldCarts.length === 0 ? (
          <Center py="xl">
            <Text c="dimmed" size="sm" ta="center">
              No sales currently parked. Press <b>Ctrl+H</b> to park the active cart.
            </Text>
          </Center>
        ) : (
          heldWithTotals.map((h) => {
            const ageHours = getAgeHours(h.heldAt, nowMs);
            const isStale = ageHours >= 2;
            const { total } = h;

            return (
              <Paper
                key={h.id}
                withBorder
                p={0}
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  borderLeft: isStale ? '4px solid var(--mantine-color-yellow-6)' : undefined,
                  overflow: 'hidden',
                }}
              >
                <Stack gap="xs" p="sm">
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                      <ThemeIcon
                        size={40}
                        color={isStale ? 'yellow' : 'blue'}
                        variant="light"
                        style={{ flexShrink: 0 }}
                      >
                        <IconPlayerPause size={20} />
                      </ThemeIcon>
                      <Text size="sm" fw={700} lineClamp={1} style={{ flex: 1, minWidth: 0 }}>
                        {h.label || h.customerName || 'Unlabeled Sale'}
                      </Text>
                    </Group>
                    <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                      {isStale && (
                        <Tooltip label="Held for over 2 hours">
                          <Badge size="xs" radius="xl" variant="light" color="yellow" fw={600}>
                            Stale (&gt;2h)
                          </Badge>
                        </Tooltip>
                      )}
                      <Text
                        size="xs"
                        c="dimmed"
                        style={{
                          display: 'flex',
                          flexWrap: 'nowrap',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <IconClock size={12} /> {getAgeLabel(h.heldAt, nowMs)}
                      </Text>
                    </Group>
                  </Group>

                  <Text size="xs" c="dimmed">
                    {h.items.length} item(s) · Total:{' '}
                    <Text span fw={700} c="var(--text-primary)" inherit>
                      {formatMoney(total)}
                    </Text>
                  </Text>
                </Stack>

                <Divider />

                <Group gap="xs" wrap="nowrap" p="sm">
                  <Button
                    variant="default"
                    leftSection={<IconPlayerPlay size={14} color="var(--mantine-color-blue-6)" />}
                    style={{ flex: 1, color: 'var(--mantine-color-blue-6)' }}
                    onClick={() => {
                      loadHeldCart(h.id);
                      onClose();
                    }}
                  >
                    Restore to cart
                  </Button>
                  <ActionIcon
                    variant="default"
                    size={36}
                    style={{ color: 'var(--mantine-color-red-6)' }}
                    onClick={() => removeHeldCart(h.id)}
                    title="Discard held sale"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            );
          })
        )}
      </Stack>
    </Drawer>
  );
};
