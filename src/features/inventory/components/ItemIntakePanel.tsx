import { t } from '@/shared/i18n/t';
import { Badge, Box, Button, Center, Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconPlus, IconReceipt } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { ReceiveStockModal } from '@/features/purchases/components/ReceiveStockModal';
import type { EnrichedStockPurchase } from '@/features/purchases/types';
import type { Product } from '../types';

export interface ItemIntakePanelProps {
  product: Product;
  purchases: EnrichedStockPurchase[];
  loading: boolean;
  /** Whether the Receive Stock window is open; the item's own "Receive stock" action opens it too. */
  formOpen: boolean;
  onFormOpenChange: (open: boolean) => void;
}

/** Every delivery of this item received from a supplier, and the way to record a new one. */
export const ItemIntakePanel = ({
  product,
  purchases,
  loading,
  formOpen,
  onFormOpenChange,
}: ItemIntakePanelProps) => {
  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={700}>
          {t('Stock received')}
        </Text>
        <Button
          variant="light"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => onFormOpenChange(true)}
        >
          {t('Receive stock')}
        </Button>
      </Group>

      {loading ? (
        <Stack gap={6}>
          <Skeleton height={52} />
          <Skeleton height={52} />
        </Stack>
      ) : purchases.length === 0 ? (
        <Center py="md">
          <Stack gap={6} align="center">
            <IconReceipt size={22} style={{ opacity: 0.4 }} />
            <Text size="sm" c="dimmed" ta="center">
              {t('No stock received yet.')}
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap={0}>
          {purchases.map((purchase, index) => (
            <Box
              key={purchase.id}
              py="xs"
              style={{ borderTop: index === 0 ? undefined : '1px solid var(--border)' }}
            >
              <Text size="sm" fw={700} lineClamp={1}>
                {purchase.supplier.name}
              </Text>
              <Group gap={6} mt={4}>
                <Badge size="xs" variant="filled" color="blue">
                  {t('Qty:')} {purchase.quantity}
                </Badge>
                <Badge size="xs" variant="light" color="teal">
                  {formatMoney(purchase.totalCostCents)}
                </Badge>
                <Badge size="xs" variant="light" color="blue">
                  {t('Sells at')} {formatMoney(purchase.sellingPriceCents)}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed" mt={4}>
                {formatDateTime(purchase.date)}
              </Text>
            </Box>
          ))}
        </Stack>
      )}

      <ReceiveStockModal
        opened={formOpen}
        onClose={() => onFormOpenChange(false)}
        initialProductKey={product.key}
      />
    </Stack>
  );
};
