import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Modal, Stack, Text, Radio, Button, Group } from '@mantine/core';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { formatCentsRange, tiersWithRoom, type TierWithRoom } from '../lib/priceTiers';
import type { Product } from '../types';

export interface PriceTierPickerModalProps {
  opened: boolean;
  onClose: () => void;
  product: Product;
  /** Units of this product the current sale already holds, per selling price. */
  reservedByPrice: ReadonlyMap<number, number>;
  onSelect: (tier: TierWithRoom) => void;
}

/**
 * The tier a cashier is most likely to want: the oldest stock still free in
 * this sale, since that is what a sale should clear first.
 */
const oldestWithRoom = (tiers: TierWithRoom[]): TierWithRoom | undefined =>
  tiers
    .filter((tier) => tier.left > 0)
    .reduce<TierWithRoom | undefined>(
      (oldest, tier) =>
        oldest === undefined || tier.oldestReceivedAt < oldest.oldestReceivedAt ? tier : oldest,
      undefined
    );

/**
 * Asks which price a product is being sold at when it is in stock at more than
 * one (each delivery keeps its own price). Shows how many are left at each
 * price, with the oldest stock picked so Enter adds it straight away.
 */
export const PriceTierPickerModal = ({
  opened,
  onClose,
  product,
  reservedByPrice,
  onSelect,
}: PriceTierPickerModalProps) => {
  const isMobile = useIsMobile();
  const isAdmin = useIsAdmin();
  const tiers = tiersWithRoom(product.priceTiers, reservedByPrice);
  const [chosen, setChosen] = useState<string | null>(() => {
    const oldest = oldestWithRoom(tiers);
    return oldest === undefined ? null : String(oldest.sellingPriceCents);
  });
  const chosenTier = tiers.find((tier) => String(tier.sellingPriceCents) === chosen);

  const handleConfirm = () => {
    if (chosenTier === undefined || chosenTier.left <= 0) return;
    onSelect(chosenTier);
    onClose();
  };

  useAppShortcuts(
    [
      { key: 'Enter', handler: handleConfirm, ignoreInput: true },
      { key: 'Escape', handler: onClose, ignoreInput: true },
    ],
    opened
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {t('Which price for')} {product.name}?
        </Text>
      }
      size="sm"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('This item came in at different prices. Pick the one you are selling.')}
        </Text>

        <Radio.Group value={chosen} onChange={setChosen}>
          <Stack gap="xs">
            {tiers.map((tier) => (
              <Radio
                key={tier.sellingPriceCents}
                value={String(tier.sellingPriceCents)}
                disabled={tier.left <= 0}
                size="md"
                data-log-id="billing.pick-price"
                label={
                  <Stack gap={2}>
                    <Text fw={700} size="md">
                      {formatMoney(tier.sellingPriceCents)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {tier.left > 0
                        ? `${tier.left} ${t('left')}`
                        : t('All of these are already in this sale')}
                      {' · '}
                      {t('Received')} {formatDate(tier.oldestReceivedAt)}
                      {isAdmin &&
                        tier.minUnitCostCents !== undefined &&
                        tier.maxUnitCostCents !== undefined &&
                        ` · ${t('Cost')} ${formatCentsRange({
                          min: tier.minUnitCostCents,
                          max: tier.maxUnitCostCents,
                        })}`}
                    </Text>
                  </Stack>
                }
                styles={{
                  label: { paddingLeft: 8, minHeight: 44, display: 'flex', alignItems: 'center' },
                }}
              />
            ))}
          </Stack>
        </Radio.Group>

        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="default" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            color="blue"
            disabled={chosenTier === undefined || chosenTier.left <= 0}
            onClick={handleConfirm}
          >
            {t('Add to Sale')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
