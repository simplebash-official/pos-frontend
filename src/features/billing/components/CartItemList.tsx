import { Paper, Title, Text, Button, Group, Stack, Badge, Box } from '@mantine/core';
import { IconShoppingCart, IconTrash } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { useCart } from '../hooks/useCart';

export function CartItemList() {
  const { items, updateQty, remove } = useCart();

  return (
    <Paper p="md" withBorder style={{ minHeight: 400 }}>
      <Group justify="space-between" mb="md">
        <Title order={4}>Current Cart ({items.length} items)</Title>
        <Badge color="blue">Active Session</Badge>
      </Group>

      {items.length === 0 ? (
        <Stack align="center" justify="center" py="xl" style={{ minHeight: 250 }}>
          <IconShoppingCart size={48} color="var(--text-muted)" />
          <Text c="dimmed" size="sm">
            Cart is empty. Click "Quick Add Item" or scan a barcode to begin.
          </Text>
        </Stack>
      ) : (
        <Stack gap="sm">
          {items.map((item) => (
            <Paper key={item.id} p="sm" withBorder style={{ backgroundColor: 'var(--bg-hover)' }}>
              <Group justify="space-between">
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="sm">
                    {item.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatMoney(item.unitPriceCents)} each
                  </Text>
                </Box>

                <Group gap="xs">
                  <QuantityInput
                    value={item.quantity}
                    onChange={(val) => updateQty(item.id, typeof val === 'number' ? val : 1)}
                    min={1}
                    size="xs"
                  />
                  <Text size="sm" fw={700} style={{ minWidth: 80, textAlign: 'right' }}>
                    {formatMoney(item.totalCents)}
                  </Text>
                  <Button
                    size="xs"
                    color="red"
                    variant="subtle"
                    aria-label="Remove item"
                    onClick={() => remove(item.id)}
                  >
                    <IconTrash size={14} />
                  </Button>
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
}
