import { PageHeader } from '@/shared/components/PageHeader';
import { Grid, Button, Group, Box } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useCart } from '../hooks/useCart';
import { CartItemList } from './CartItemList';
import { OrderSummary } from './OrderSummary';

export function BillingCounter() {
  const { items, add, clear } = useCart();

  const handleAddSampleItem = () => {
    const sampleId = String(Date.now());
    add({
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
            <Button
              color="red"
              variant="subtle"
              onClick={clear}
              disabled={items.length === 0}
            >
              Clear Cart
            </Button>
          </Group>
        }
      />

      <Grid>
        <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
          <CartItemList />
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
          <OrderSummary />
        </Grid.Col>
      </Grid>
    </Box>
  );
}

