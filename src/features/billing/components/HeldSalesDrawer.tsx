import { useState, useEffect } from 'react';
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
} from '@mantine/core';
import { IconPlayerPlay, IconTrash, IconClock, IconPlayerPause } from '@tabler/icons-react';

import { useCart } from '../hooks/useCart';
import { formatMoney } from '@/shared/lib/money';

export interface HeldSalesDrawerProps {
  opened: boolean;
  onClose: () => void;
}

export function HeldSalesDrawer({ opened, onClose }: HeldSalesDrawerProps) {
  const { heldCarts, loadHeldCart, removeHeldCart } = useCart();
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

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconPlayerPause size={20} color="var(--mantine-color-orange-6)" />
          <Text fw={700} size="md">
            Parked / Held Sales ({heldCarts.length})
          </Text>
        </Group>
      }
      position="right"
      size="md"
      radius="var(--mantine-radius-default)"
    >
      <Stack gap="md">
        {heldCarts.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="xl">
            No sales currently parked. Press <b>Ctrl+H</b> to park the active cart.
          </Text>
        ) : (
          heldCarts.map((h) => {
            const ageHours = getAgeHours(h.heldAt, nowMs);
            const isStale = ageHours >= 2;
            const subtotal = h.items.reduce((acc, i) => acc + i.totalCents, 0);
            const total = Math.max(0, subtotal - h.discountCents);

            return (
              <Paper
                key={h.id}
                p="sm"
                withBorder
                style={{
                  borderLeft: isStale ? '4px solid var(--mantine-color-amber-6)' : undefined,
                  backgroundColor: 'var(--bg-card)',
                }}
              >
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" fw={700}>
                      {h.label || h.customerName || 'Unlabeled Sale'}
                    </Text>
                    <Group gap={4}>
                      {isStale && (
                        <Tooltip label="Held for over 2 hours">
                          <Badge size="xs" color="amber" variant="filled">
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
                    {h.items.length} item(s) · Total: <b>{formatMoney(total)}</b>
                  </Text>

                  <Group justify="flex-end" gap="xs">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => removeHeldCart(h.id)}
                      title="Discard held sale"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                    <Button
                      size="xs"
                      color="blue"
                      leftSection={<IconPlayerPlay size={14} />}
                      onClick={() => {
                        loadHeldCart(h.id);
                        onClose();
                      }}
                    >
                      Restore to Cart
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            );
          })
        )}
      </Stack>
    </Drawer>
  );
}
