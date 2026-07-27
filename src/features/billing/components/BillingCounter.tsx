import { PageHeader } from '@/shared/components/PageHeader';
import { Paper, Grid, Title, Text, Button, Group, Stack, Badge, Box } from '@mantine/core';
import { IconShoppingCart, IconPlus, IconTrash, IconPrinter } from '@tabler/icons-react';
import { useCartStore } from '@/stores/cartStore';
import { formatMoney } from '@/shared/lib/money';
import { MoneyInput } from '@/shared/components/MoneyInput';

export function BillingCounter() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    discountCents,
    setDiscountCents,
    getSubtotalCents,
    getTaxCents,
    getTotalCents,
    clearCart,
  } = useCartStore();

  const handleAddSampleItem = () => {
    const sampleId = String(Date.now());
    addItem({
      id: sampleId,
      productId: `prod-${sampleId}`,
      name: 'Sample Item #' + (items.length + 1),
      unitPriceCents: 1500, // Rs. 15.00
      quantity: 1,
      discountCents: 0,
    });
  };

  return (
    <Box>
      <PageHeader
        title="Billing Counter"
        description="Fast retail point-of-sale checkout and invoice creation"
        action={
          <Group>
            <Button
              leftSection={<IconPlus size={16} />}
              variant="outline"
              onClick={handleAddSampleItem}
            >
              Quick Add Item
            </Button>
            <Button color="red" variant="subtle" onClick={clearCart} disabled={items.length === 0}>
              Clear Cart
            </Button>
          </Group>
        }
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
          <Paper p="md" withBorder style={{ minHeight: 400 }}>
            <Group justify="space-between" mb="md">
              <Title order={4}>Current Cart ({items.length} items)</Title>
              <Badge color="blue">Active Session</Badge>
            </Group>

            {items.length === 0 ? (
              <Stack align="center" justify="center" py="xl" style={{ minHeight: 250 }}>
                <IconShoppingCart size={48} color="var(--mantine-color-gray-4)" />
                <Text c="dimmed" size="sm">
                  Cart is empty. Click "Quick Add Item" or scan a barcode to begin.
                </Text>
              </Stack>
            ) : (
              <Stack gap="sm">
                {items.map((item) => (
                  <Paper key={item.id} p="sm" withBorder style={{ backgroundColor: '#fafafa' }}>
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
                        <Button
                          size="xs"
                          variant="default"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Text size="sm" fw={600} style={{ minWidth: 24, textAlign: 'center' }}>
                          {item.quantity}
                        </Text>
                        <Button
                          size="xs"
                          variant="default"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Text size="sm" fw={700} style={{ minWidth: 80, textAlign: 'right' }}>
                          {formatMoney(item.totalCents)}
                        </Text>
                        <Button
                          size="xs"
                          color="red"
                          variant="subtle"
                          onClick={() => removeItem(item.id)}
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
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
          <Paper p="md" withBorder style={{ backgroundColor: '#fff' }}>
            <Title order={4} mb="md">
              Order Summary
            </Title>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm">Subtotal:</Text>
                <Text size="sm" fw={600}>
                  {formatMoney(getSubtotalCents())}
                </Text>
              </Group>

              <Group justify="space-between">
                <Text size="sm">Tax (8%):</Text>
                <Text size="sm" fw={600}>
                  {formatMoney(getTaxCents())}
                </Text>
              </Group>

              <Box my="xs">
                <MoneyInput
                  label="Discount"
                  size="sm"
                  valueCents={discountCents}
                  onChangeCents={setDiscountCents}
                />
              </Box>

              <Group justify="space-between" mt="sm" pt="sm" style={{ borderTop: '2px solid var(--mantine-color-gray-3)' }}>
                <Title order={3}>Total:</Title>
                <Title order={3} c="indigo">
                  {formatMoney(getTotalCents())}
                </Title>
              </Group>

              <Button
                fullWidth
                size="md"
                color="indigo"
                mt="md"
                leftSection={<IconPrinter size={18} />}
                disabled={items.length === 0}
              >
                Complete Payment & Print Receipt
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
