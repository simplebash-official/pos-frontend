import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Collapse,
  Group,
  Loader,
  Center,
  NumberInput,
  Paper,
  Progress,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPencil, IconMinus, IconPlus, IconX } from '@tabler/icons-react';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { formatMoney } from '@/shared/lib/money';
import { formatDate } from '@/shared/lib/date';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
import { useAdjustStock, useProductBatches, useUpdateStockBatch } from '../hooks/useProducts';
import type { BatchSource, Product, StockBatch } from '../types';

const SOURCE_LABELS: Record<BatchSource, string> = {
  purchase: 'Bought from supplier',
  opening: 'Starting stock',
  import: 'Imported',
  adjustment: 'Added by hand',
};

export interface StockBatchesPanelProps {
  product: Product;
  /** Called with the refreshed product after stock changes. */
  onProductChange: (product: Product) => void;
}

/**
 * A product's deliveries (stock batches), newest first, as one divided list:
 * when each came in, how many are left (with a bar), what it cost (Admin only)
 * and what it sells for. The price of a delivery can be changed here, units can
 * be taken out of one delivery, and new stock can be added as its own delivery
 * with its own price. The forms open inline under the row they belong to.
 */
export const StockBatchesPanel = ({ product, onProductChange }: StockBatchesPanelProps) => {
  const isMobile = useIsMobile();
  const isAdmin = useIsAdmin();
  const { data: batches, isLoading } = useProductBatches(product.key);
  const updateBatch = useUpdateStockBatch();
  const adjustStock = useAdjustStock();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editPriceCents, setEditPriceCents] = useState(0);
  const [takeOutKey, setTakeOutKey] = useState<string | null>(null);
  const [takeOutQty, setTakeOutQty] = useState<number | string>('');
  const [takeOutReason, setTakeOutReason] = useState('');
  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockInQty, setStockInQty] = useState<number | string>('');
  const [stockInCostCents, setStockInCostCents] = useState(0);
  const [stockInPriceCents, setStockInPriceCents] = useState(0);
  const [stockInReason, setStockInReason] = useState('');

  const startEdit = (batch: StockBatch) => {
    setEditingKey(batch.key);
    setEditPriceCents(batch.sellingPriceCents);
  };

  const savePrice = (batch: StockBatch) => {
    if (editPriceCents <= 0) return;
    updateBatch.mutate(
      { batchKey: batch.key, input: { sellingPriceCents: editPriceCents } },
      {
        onSuccess: () => {
          setEditingKey(null);
          notifications.show({
            title: t('Price updated'),
            message: `${t('These units now sell for')} ${formatMoney(editPriceCents)}`,
            color: 'green',
            icon: <IconCheck size={16} />,
          });
        },
      }
    );
  };

  const resetTakeOut = () => {
    setTakeOutKey(null);
    setTakeOutQty('');
    setTakeOutReason('');
  };

  const takeOut = (batch: StockBatch) => {
    const quantity = Number(takeOutQty);
    if (!quantity || quantity < 1 || quantity > batch.remainingQuantity || !takeOutReason.trim())
      return;
    adjustStock.mutate(
      {
        productKey: product.id,
        adjustment: {
          direction: 'out',
          delta: quantity,
          reason: takeOutReason.trim(),
          batchKey: batch.key,
        },
      },
      {
        onSuccess: (updated) => {
          onProductChange(updated);
          resetTakeOut();
        },
      }
    );
  };

  const resetStockIn = () => {
    setStockInOpen(false);
    setStockInQty('');
    setStockInCostCents(0);
    setStockInPriceCents(0);
    setStockInReason('');
  };

  const canStockIn =
    Number(stockInQty) >= 1 && stockInPriceCents > 0 && stockInReason.trim().length > 0;

  const stockIn = () => {
    if (!canStockIn) return;
    adjustStock.mutate(
      {
        productKey: product.id,
        adjustment: {
          direction: 'in',
          delta: Number(stockInQty),
          reason: stockInReason.trim(),
          unitCostCents: stockInCostCents,
          sellingPriceCents: stockInPriceCents,
        },
      },
      {
        onSuccess: (updated) => {
          onProductChange(updated);
          resetStockIn();
        },
      }
    );
  };

  const fieldSize = isMobile ? 'md' : 'sm';
  const actionSize = isMobile ? 44 : 'md';
  const rows = batches ?? [];

  return (
    <Stack gap="sm">
      <Text size="xs" c="dimmed">
        {t(
          'Each delivery keeps its own cost and selling price. Sales take the oldest stock first.'
        )}
      </Text>

      {isLoading ? (
        <Center py="sm">
          <Loader size="sm" />
        </Center>
      ) : rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('No stock has been received for this item yet.')}
        </Text>
      ) : (
        <Stack gap={0}>
          {rows.map((batch, index) => (
            <Box
              key={batch.key}
              py="sm"
              style={{ borderTop: index === 0 ? undefined : '1px solid var(--border)' }}
            >
              <Group justify="space-between" wrap="nowrap" align="flex-start" gap="sm">
                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={700}>
                    {batch.remainingQuantity} {t('left')}
                    <Text span size="xs" c="dimmed" fw={500}>
                      {' '}
                      {t('of')} {batch.receivedQuantity}
                    </Text>
                  </Text>
                  <Progress
                    value={
                      batch.receivedQuantity > 0
                        ? (batch.remainingQuantity / batch.receivedQuantity) * 100
                        : 0
                    }
                    size="xs"
                    color={batch.remainingQuantity > 0 ? 'blue' : 'gray'}
                    aria-hidden
                  />
                  <Text size="xs" c="dimmed">
                    {formatDate(batch.receivedAt)} · {t(SOURCE_LABELS[batch.source])}
                  </Text>
                  {isAdmin && batch.unitCostCents !== undefined && (
                    <Text size="xs" c="dimmed">
                      {t('Cost')} {formatMoney(batch.unitCostCents)}
                    </Text>
                  )}
                </Stack>

                <Group gap={2} wrap="nowrap">
                  <Text fw={800} size="sm" c="blue" mr={4} style={{ whiteSpace: 'nowrap' }}>
                    {formatMoney(batch.sellingPriceCents)}
                  </Text>
                  <Tooltip label={t('Change price')}>
                    <ActionIcon
                      variant="subtle"
                      size={actionSize}
                      onClick={() => {
                        resetTakeOut();
                        startEdit(batch);
                      }}
                      aria-label={t('Change price')}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  {batch.remainingQuantity > 0 && (
                    <Tooltip label={t('Take stock out')}>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size={actionSize}
                        onClick={() => {
                          setEditingKey(null);
                          setTakeOutKey(batch.key);
                        }}
                        aria-label={t('Take stock out')}
                      >
                        <IconMinus size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              </Group>

              <Collapse expanded={editingKey === batch.key}>
                <Group gap="xs" wrap="nowrap" align="flex-end" pt="xs">
                  <MoneyInput
                    valueCents={editPriceCents}
                    onChangeCents={setEditPriceCents}
                    size={fieldSize}
                    label={t('New selling price')}
                    style={{ flex: 1 }}
                    aria-label={t('New selling price')}
                  />
                  <ActionIcon
                    color="blue"
                    variant="light"
                    size={isMobile ? 44 : 'lg'}
                    onClick={() => savePrice(batch)}
                    loading={updateBatch.isPending}
                    disabled={editPriceCents <= 0}
                    aria-label={t('Save price')}
                  >
                    <IconCheck size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="default"
                    size={isMobile ? 44 : 'lg'}
                    onClick={() => setEditingKey(null)}
                    aria-label={t('Cancel')}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              </Collapse>

              <Collapse expanded={takeOutKey === batch.key}>
                <Stack gap={6} pt="xs">
                  <Group gap="xs" grow align="flex-start">
                    <NumberInput
                      label={t('How many to take out')}
                      min={1}
                      max={batch.remainingQuantity}
                      allowDecimal={false}
                      value={takeOutQty}
                      onChange={setTakeOutQty}
                      size={fieldSize}
                    />
                    <TextInput
                      label={t('Why?')}
                      placeholder={t('e.g. Damaged, Stock count correction')}
                      value={takeOutReason}
                      onChange={(e) => setTakeOutReason(e.currentTarget.value)}
                      size={fieldSize}
                    />
                  </Group>
                  <Group justify="flex-end" gap="sm">
                    <Button variant="default" size="xs" onClick={resetTakeOut}>
                      {t('Cancel')}
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => takeOut(batch)}
                      loading={adjustStock.isPending}
                      disabled={
                        !Number(takeOutQty) ||
                        Number(takeOutQty) > batch.remainingQuantity ||
                        !takeOutReason.trim()
                      }
                    >
                      {t('Take out')}
                    </Button>
                  </Group>
                </Stack>
              </Collapse>
            </Box>
          ))}
        </Stack>
      )}

      <Collapse expanded={stockInOpen}>
        <Paper p="sm" withBorder>
          <Stack gap={6}>
            <NumberInput
              label={t('Units to add')}
              min={1}
              allowDecimal={false}
              value={stockInQty}
              onChange={setStockInQty}
              size={fieldSize}
            />
            <Group gap="xs" grow align="flex-start" wrap="nowrap">
              <MoneyInput
                label={t('Cost each')}
                valueCents={stockInCostCents}
                onChangeCents={setStockInCostCents}
                size={fieldSize}
              />
              <MoneyInput
                label={t('Selling Price each')}
                valueCents={stockInPriceCents}
                onChangeCents={setStockInPriceCents}
                size={fieldSize}
              />
            </Group>
            <TextInput
              label={t('Why?')}
              placeholder={t('e.g. Found in store room')}
              value={stockInReason}
              onChange={(e) => setStockInReason(e.currentTarget.value)}
              size={fieldSize}
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" size="xs" onClick={resetStockIn}>
                {t('Cancel')}
              </Button>
              <Button
                size="xs"
                color="blue"
                onClick={stockIn}
                loading={adjustStock.isPending}
                disabled={!canStockIn}
              >
                {t('Add Stock')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Collapse>

      {!stockInOpen && (
        <Button
          variant="light"
          size={fieldSize}
          leftSection={<IconPlus size={16} />}
          onClick={() => setStockInOpen(true)}
        >
          {t('Add stock by hand')}
        </Button>
      )}
    </Stack>
  );
};
