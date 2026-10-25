import { t } from '@/shared/i18n/t';
import {
  ActionIcon,
  Button,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPackage, IconTrash } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { formatMoney } from '@/shared/lib/money';
import { priceText } from '@/features/inventory/lib/priceTiers';
import type { Product } from '@/features/inventory/types';
import { lineTotalCents, type LineState } from '../lib/receiptForm';

export interface ReceiptLineCardProps {
  /** 1-based position, so people can say "Product 2". */
  position: number;
  line: LineState;
  /** Looked up from the product list; `null` until a product is picked. */
  product: Product | null;
  onChange: (line: LineState) => void;
  onPickProduct: () => void;
  /** `null` when this is the only line, which cannot be removed. */
  onRemove: (() => void) | null;
  isMobile: boolean;
}

/** One product on the receipt: what arrived, what it cost, what it sells for. */
export const ReceiptLineCard = ({
  position,
  line,
  product,
  onChange,
  onPickProduct,
  onRemove,
  isMobile,
}: ReceiptLineCardProps) => {
  const fieldSize = isMobile ? 'md' : 'sm';
  const serialized = product !== null && product.isSerialized;
  const quantity = line.quantity === '' ? 0 : Number(line.quantity);

  return (
    <Paper p="md" withBorder>
      <Stack gap="sm">
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              {`${t('Product')} ${position}`}
            </Text>
            {product ? (
              <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                <IconPackage size={16} style={{ flexShrink: 0 }} />
                <Text size="sm" fw={600} lineClamp={1}>
                  {product.name}
                </Text>
              </Group>
            ) : null}
            {product ? (
              <Text size="xs" c="dimmed">
                {product.priceTiers.length > 0
                  ? `${t('Now selling at')} ${priceText(product)}. ${t('These units keep their own price.')}`
                  : t('What you will sell these units for.')}
              </Text>
            ) : null}
          </Stack>
          <Group gap={6} wrap="nowrap">
            {product ? (
              <ActionIcon
                variant="light"
                onClick={onPickProduct}
                size={isMobile ? 44 : 32}
                aria-label={t('Change product')}
              >
                <IconPackage size={16} />
              </ActionIcon>
            ) : null}
            {onRemove ? (
              <ActionIcon
                variant="light"
                color="red"
                onClick={onRemove}
                size={isMobile ? 44 : 32}
                aria-label={`${t('Remove')} ${t('Product')} ${position}`}
              >
                <IconTrash size={16} />
              </ActionIcon>
            ) : null}
          </Group>
        </Group>

        {product ? (
          <>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <NumberInput
                label={t('How many arrived')}
                value={line.quantity}
                onChange={(value) =>
                  onChange({ ...line, quantity: value === '' ? '' : Number(value) })
                }
                min={1}
                allowDecimal={false}
                size={fieldSize}
              />
              <MoneyInput
                label={t('Cost of each unit')}
                valueCents={line.unitCostCents}
                onChangeCents={(unitCostCents) => onChange({ ...line, unitCostCents })}
                size={fieldSize}
              />
              <MoneyInput
                label={t('Selling price each')}
                valueCents={line.sellingPriceCents}
                onChangeCents={(sellingPriceCents) => onChange({ ...line, sellingPriceCents })}
                size={fieldSize}
              />
            </SimpleGrid>

            {serialized && quantity > 0 ? (
              <Stack gap={6}>
                <Text size="sm" fw={500}>
                  {t('Serial numbers')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(
                    'This item is tracked by serial number. Enter the serial for each unit received.'
                  )}
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                  {Array.from({ length: quantity }).map((_, index) => (
                    <TextInput
                      key={index}
                      aria-label={`${t('Serial number for unit')} ${index + 1}`}
                      placeholder={`${t('Serial number for unit')} ${index + 1}`}
                      value={line.serialNumbers[index]}
                      onChange={(event) => {
                        const value = event.currentTarget.value;
                        const serialNumbers = [...line.serialNumbers];
                        serialNumbers[index] = value;
                        onChange({ ...line, serialNumbers });
                      }}
                      size={fieldSize}
                    />
                  ))}
                </SimpleGrid>
              </Stack>
            ) : null}

            <Text size="xs" c="dimmed" ta="right">
              {`${t('This product comes to')} ${formatMoney(lineTotalCents(line))}`}
            </Text>
          </>
        ) : (
          <Button
            variant="light"
            leftSection={<IconPackage size={16} />}
            onClick={onPickProduct}
            size={fieldSize}
          >
            {t('Pick the product')}
          </Button>
        )}
      </Stack>
    </Paper>
  );
};
