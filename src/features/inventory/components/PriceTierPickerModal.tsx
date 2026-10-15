import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Group,
  Modal,
  Paper,
  Progress,
  Radio,
  Stack,
  Text,
} from '@mantine/core';
import { IconClockHour4 } from '@tabler/icons-react';
import { QuantityInput } from '@/shared/components/QuantityInput';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { useCategoryAccent } from '../hooks/useCategoryAccent';
import { formatCentsRange, tiersWithRoom, type TierWithRoom } from '../lib/priceTiers';
import { tierColor } from '../lib/tierColors';
import type { Product } from '../types';
import { CategoryIconTile } from './CategoryIconTile';

export interface PriceTierPickerModalProps {
  opened: boolean;
  onClose: () => void;
  product: Product;
  /** Units of this product the current sale already holds, per selling price. */
  reservedByPrice: ReadonlyMap<number, number>;
  onSelect: (tier: TierWithRoom, quantity: number) => void;
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

/** Quick quantities offered next to the stepper, when that many are left. */
const QUICK_QUANTITIES = [1, 5, 10] as const;

const SECTION_LABEL_STYLE = { letterSpacing: '0.05em' } as const;

/**
 * Asks which price a product is being sold at when it is in stock at more than
 * one (each delivery keeps its own price), and how many to sell at that price.
 * Each price carries the colour it has in the item's stock bar, with how many
 * are left; the oldest stock is picked so Enter adds it straight away.
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
  const accent = useCategoryAccent(product);
  const tiers = tiersWithRoom(product.priceTiers, reservedByPrice);
  const oldest = oldestWithRoom(tiers);
  const largestTier = Math.max(...tiers.map((tier) => tier.quantity));
  const [chosen, setChosen] = useState<string | null>(() =>
    oldest === undefined ? null : String(oldest.sellingPriceCents)
  );
  const [quantity, setQuantity] = useState<number | ''>(1);
  const chosenTier = tiers.find((tier) => String(tier.sellingPriceCents) === chosen);
  const maxQuantity = chosenTier === undefined ? 0 : chosenTier.left;

  const canAdd =
    chosenTier !== undefined &&
    chosenTier.left > 0 &&
    typeof quantity === 'number' &&
    quantity >= 1 &&
    quantity <= chosenTier.left;

  const handleChoose = (value: string) => {
    setChosen(value);
    const next = tiers.find((tier) => String(tier.sellingPriceCents) === value);
    // A smaller delivery cannot supply more than it has left.
    if (next !== undefined && typeof quantity === 'number' && quantity > next.left) {
      setQuantity(next.left);
    }
  };

  const handleConfirm = () => {
    if (!canAdd) return;
    onSelect(chosenTier, quantity);
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
          {t('Choose a price')}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="sm">
        <Paper
          p="sm"
          style={{
            background: `linear-gradient(135deg, var(--mantine-color-${accent}-light) 0%, var(--bg-card) 75%)`,
          }}
        >
          <Group wrap="nowrap" gap="md" align="center">
            <CategoryIconTile product={product} size={48} />
            <Box style={{ minWidth: 0 }}>
              <Text fw={800} size="lg" lh={1.2} lineClamp={2}>
                {product.name}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                {t('This item came in at different prices. Pick the one you are selling.')}
              </Text>
            </Box>
          </Group>
        </Paper>

        <Radio.Group value={chosen} onChange={handleChoose}>
          <Stack gap="xs">
            {tiers.map((tier) => {
              const isChosen = String(tier.sellingPriceCents) === chosen;
              const soldOut = tier.left <= 0;
              const color = tierColor(product.priceTiers, tier.sellingPriceCents);
              return (
                <Radio.Card
                  key={tier.sellingPriceCents}
                  value={String(tier.sellingPriceCents)}
                  disabled={soldOut}
                  radius="md"
                  p="sm"
                  data-log-id="billing.pick-price"
                  style={{
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: isChosen
                      ? 'var(--mantine-color-blue-filled)'
                      : 'var(--mantine-color-default-border)',
                    backgroundColor: isChosen
                      ? 'var(--mantine-color-blue-light)'
                      : 'var(--bg-card)',
                    boxShadow: isChosen ? '0 0 0 3px var(--mantine-color-blue-light)' : undefined,
                    opacity: soldOut ? 0.55 : 1,
                    minHeight: isMobile ? 44 : undefined,
                  }}
                >
                  <Group wrap="nowrap" align="flex-start" gap="sm">
                    <Radio.Indicator disabled={soldOut} mt={6} />
                    <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                      <Group justify="space-between" wrap="nowrap" gap="xs" align="center">
                        <Text fw={800} size="xl" c={color} lh={1.1}>
                          {formatMoney(tier.sellingPriceCents)}
                        </Text>
                        {tier === oldest && (
                          <Badge
                            size="sm"
                            variant="light"
                            color="blue"
                            leftSection={<IconClockHour4 size={12} />}
                          >
                            {t('Oldest stock')}
                          </Badge>
                        )}
                      </Group>

                      <Progress
                        value={(tier.left / largestTier) * 100}
                        color={color}
                        size="sm"
                        radius="xl"
                        aria-hidden
                      />

                      <Text size="xs" c="dimmed">
                        <Text span fw={700} c="var(--text-primary)">
                          {soldOut
                            ? t('All of these are already in this sale')
                            : `${tier.left} ${t('left')}`}
                        </Text>
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
                  </Group>
                </Radio.Card>
              );
            })}
          </Stack>
        </Radio.Group>

        <Stack gap={8}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={SECTION_LABEL_STYLE}>
            {t('How many?')}
          </Text>
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <QuantityInput
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={maxQuantity > 0 ? maxQuantity : undefined}
              allowDecimal={false}
              size={isMobile ? 'lg' : 'md'}
              aria-label={t('Quantity')}
              data-autofocus={isMobile ? undefined : true}
              onFocus={(event) => event.currentTarget.select()}
            />
            <Group gap={6}>
              {QUICK_QUANTITIES.filter((n) => n < maxQuantity).map((n) => (
                <Button
                  key={n}
                  variant={quantity === n ? 'filled' : 'light'}
                  color="blue"
                  size={isMobile ? 'md' : 'compact-md'}
                  onClick={() => setQuantity(n)}
                >
                  {n}
                </Button>
              ))}
              {maxQuantity > 0 && (
                <Button
                  variant={quantity === maxQuantity ? 'filled' : 'light'}
                  color="blue"
                  size={isMobile ? 'md' : 'compact-md'}
                  onClick={() => setQuantity(maxQuantity)}
                >
                  {t('All')} {maxQuantity}
                </Button>
              )}
            </Group>
          </Group>
          {maxQuantity > 0 && (
            <Text size="xs" c="dimmed">
              {t('Up to')} {maxQuantity} {t('at this price')}
            </Text>
          )}
        </Stack>

        <Paper p="sm" bg="var(--bg-app)">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Box>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={SECTION_LABEL_STYLE}>
                {t('Total')}
              </Text>
              {canAdd && (
                <Text size="xs" c="dimmed">
                  {quantity} × {formatMoney(chosenTier.sellingPriceCents)}
                </Text>
              )}
            </Box>
            <Text fw={800} size="2xl" c="blue" lh={1.1}>
              {canAdd ? formatMoney(chosenTier.sellingPriceCents * quantity) : '—'}
            </Text>
          </Group>
        </Paper>

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button color="blue" disabled={!canAdd} onClick={handleConfirm}>
            {t('Add to Sale')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
