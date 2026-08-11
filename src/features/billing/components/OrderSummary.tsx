import { Paper, Title, Stack, Group, Text, Button, Box } from '@mantine/core';
import { IconPrinter } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { useCart } from '../hooks/useCart';

export const OrderSummary = () => {
  const { subtotalCents, discountCents, totalCents, items, setDiscount } = useCart();

  return (
    <Paper p="md" withBorder style={{ backgroundColor: 'var(--bg-app)' }}>
      <Title order={4} mb="md">
        Order Summary
      </Title>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm">Subtotal:</Text>
          <Text size="sm" fw={600}>
            {formatMoney(subtotalCents)}
          </Text>
        </Group>

        <Box my="xs">
          <MoneyInput
            label="Discount"
            size="sm"
            valueCents={discountCents}
            onChangeCents={(cents) => setDiscount(cents)}
          />
        </Box>

        <Group
          justify="space-between"
          mt="sm"
          pt="sm"
          style={{ borderTop: '2px solid var(--border-strong)' }}
        >
          <Title order={3}>Total:</Title>
          <Title order={3} c="blue">
            {formatMoney(totalCents)}
          </Title>
        </Group>

        <Button
          fullWidth
          size="md"
          mt="md"
          leftSection={<IconPrinter size={18} />}
          disabled={items.length === 0}
        >
          Complete Payment & Print Receipt
        </Button>
      </Stack>
    </Paper>
  );
};
