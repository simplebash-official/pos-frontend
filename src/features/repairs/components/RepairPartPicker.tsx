import { useState } from 'react';
import {
  Alert,
  Button,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconBarcode, IconInfoCircle } from '@tabler/icons-react';
import { fetchSerialByNumber } from '@/features/inventory/api/productsApi';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { useProductSerials } from '@/features/inventory/hooks/useProductSerials';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import type { PartDraft } from '../lib/repairItems';

type Source = 'stock' | 'outside';

export interface RepairPartPickerProps {
  opened: boolean;
  /** The part already on the row, to start from. */
  initial: PartDraft | null;
  /** A warranty rework charges nothing for its parts. */
  rework: boolean;
  onClose: () => void;
  onPick: (part: PartDraft) => void;
}

interface StockChoice {
  productKey: string | null;
  serialNumber: string | null;
  /** The chosen unit's or tier's price. */
  priceCents: number | null;
}

const NO_STOCK: StockChoice = { productKey: null, serialNumber: null, priceCents: null };

/**
 * Chooses the part a piece of repair work uses: a unit from stock (scanned by its serial number,
 * or an item and then its unit or price) or a part bought in for this job. The server prices and
 * costs a stock part again when the job is saved, and refuses one that is no longer in stock.
 */
export const RepairPartPicker = ({
  opened,
  initial,
  rework,
  onClose,
  onPick,
}: RepairPartPickerProps) => {
  const isMobile = useIsMobile();
  const [source, setSource] = useState<Source>(initial?.source === 'outside' ? 'outside' : 'stock');
  const [stock, setStock] = useState<StockChoice>(
    initial?.source === 'stock'
      ? {
          productKey: initial.productKey,
          serialNumber: initial.serialNumber ?? null,
          priceCents: initial.priceCents,
        }
      : NO_STOCK
  );
  const [scan, setScan] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [name, setName] = useState(initial?.source === 'outside' ? initial.name : '');
  const [price, setPrice] = useState<number | string>(
    initial?.source === 'outside' ? initial.priceRupees : ''
  );
  const [cost, setCost] = useState<number | string>(
    initial?.source === 'outside' ? initial.costRupees : ''
  );
  const [lookupError, setLookupError] = useState<string | null>(null);

  const products = useAllProducts({ enabled: opened && source === 'stock' });
  const product = products.data.find((candidate) => candidate.key === stock.productKey);
  const serials = useProductSerials(product?.key, 'in_stock', {
    enabled: product !== undefined && product.isSerialized,
  });

  const inStock = products.data.filter((candidate) =>
    candidate.isSerialized ? candidate.stockQuantity > 0 : candidate.priceTiers.length > 0
  );

  const chooseSerial = async (serialNumber: string | null) => {
    setLookupError(null);
    setStock({ ...stock, serialNumber, priceCents: null });
    if (serialNumber === null) return;
    try {
      const found = await fetchSerialByNumber(serialNumber);
      setStock({
        productKey: found.product.key,
        serialNumber,
        priceCents: found.sellingPriceCents,
      });
    } catch (error) {
      setLookupError(getErrorMessage(error));
    }
  };

  const runScan = async () => {
    const text = scan.trim();
    if (text === '') return;
    setScanning(true);
    setScanError(null);
    try {
      const found = await fetchSerialByNumber(text);
      setStock({
        productKey: found.product.key,
        serialNumber: found.serial.serialNumber,
        priceCents: found.sellingPriceCents,
      });
      setScan('');
    } catch (error) {
      setScanError(getErrorMessage(error));
    } finally {
      setScanning(false);
    }
  };

  const stockPart: PartDraft | null =
    product !== undefined && stock.priceCents !== null
      ? {
          source: 'stock',
          productKey: product.key,
          productName: product.name,
          serialNumber: product.isSerialized ? (stock.serialNumber ?? undefined) : undefined,
          sellingPriceCents: product.isSerialized ? undefined : stock.priceCents,
          priceCents: stock.priceCents,
          costCents: null,
        }
      : null;
  const outsideProblem =
    name.trim() === ''
      ? t('Say what the part is.')
      : (price !== '' && Number(price) < 0) || (cost !== '' && Number(cost) < 0)
        ? t('A part price or cost cannot be below zero.')
        : null;
  const ready = source === 'stock' ? stockPart !== null : outsideProblem === null;

  const pick = () => {
    if (source === 'stock') {
      if (stockPart !== null) onPick(stockPart);
      return;
    }
    if (outsideProblem !== null) return;
    onPick({
      source: 'outside',
      name: name.trim(),
      priceRupees: rework ? '' : price,
      costRupees: cost,
    });
  };

  const size = isMobile ? 'md' : 'sm';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {initial === null ? t('Add a part') : t('Change the part')}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <Stack gap="md">
        <SegmentedToggle
          fullWidth
          value={source}
          onChange={(value) => setSource(value as Source)}
          data={[
            { value: 'stock', label: t('From stock') },
            { value: 'outside', label: t('Bought in for this job') },
          ]}
          aria-label={t('Where does the part come from?')}
        />

        {source === 'stock' ? (
          <Stack gap="sm">
            <TextInput
              label={t('Scan a serial number')}
              placeholder={t('Scan or type it, then press Enter')}
              leftSection={<IconBarcode size={16} />}
              rightSection={scanning ? <Loader size="xs" /> : null}
              value={scan}
              onChange={(event) => setScan(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void runScan();
                }
              }}
              error={scanError}
              data-barcode-scanner="true"
              size={size}
            />
            <Select
              label={t('Or choose the item')}
              placeholder={
                products.isLoading ? t('Loading items…') : t('Search items that are in stock')
              }
              data={inStock.map((candidate) => ({
                value: candidate.key,
                label: `${candidate.name} · ${candidate.stockQuantity} ${t('in stock')}`,
              }))}
              value={stock.productKey}
              onChange={(productKey) => {
                setLookupError(null);
                setStock({ productKey, serialNumber: null, priceCents: null });
              }}
              searchable
              nothingFoundMessage={t('No item in stock matches')}
              size={size}
              comboboxProps={{ withinPortal: true }}
            />
            {product !== undefined && product.isSerialized && (
              <Select
                label={t('Which unit?')}
                placeholder={
                  serials.data === undefined ? t('Loading units…') : t('Choose a serial number')
                }
                data={(serials.data ?? []).map((unit) => unit.serialNumber)}
                value={stock.serialNumber}
                onChange={(serialNumber) => void chooseSerial(serialNumber)}
                searchable
                nothingFoundMessage={t('No unit of this item is in stock')}
                error={lookupError}
                size={size}
                comboboxProps={{ withinPortal: true }}
              />
            )}
            {product !== undefined && !product.isSerialized && (
              <Select
                label={t('Take it from stock sold at')}
                placeholder={t('Choose a price')}
                data={product.priceTiers.map((tier) => ({
                  value: String(tier.sellingPriceCents),
                  label: `${formatMoney(tier.sellingPriceCents)} · ${tier.quantity} ${t('left')}`,
                }))}
                value={stock.priceCents === null ? null : String(stock.priceCents)}
                onChange={(value) =>
                  setStock({ ...stock, priceCents: value === null ? null : Number(value) })
                }
                size={size}
                comboboxProps={{ withinPortal: true }}
              />
            )}
            {stockPart !== null && (
              <Alert color="blue" icon={<IconInfoCircle size={16} />} p="xs">
                {rework
                  ? t(
                      'Free for the customer under the warranty. It leaves stock when the job is handed back.'
                    )
                  : `${t('The customer pays')} ${formatMoney(stockPart.priceCents)} ${t(
                      'for this part. It leaves stock when the job is billed.'
                    )}`}
              </Alert>
            )}
          </Stack>
        ) : (
          <Stack gap="sm">
            <TextInput
              label={t('What is the part?')}
              placeholder={t('e.g. Charging port flex cable')}
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              maxLength={120}
              size={size}
              data-autofocus={isMobile ? undefined : true}
            />
            <SimpleGrid cols={2} spacing="sm">
              <NumberInput
                label={t('Customer pays')}
                placeholder="0"
                prefix="Rs. "
                min={0}
                thousandSeparator=","
                value={rework ? '' : price}
                onChange={setPrice}
                disabled={rework}
                size={size}
              />
              <NumberInput
                label={t('It cost the shop')}
                placeholder="0"
                prefix="Rs. "
                min={0}
                thousandSeparator=","
                value={cost}
                onChange={setCost}
                size={size}
              />
            </SimpleGrid>
            {rework && (
              <Text size="xs" c="dimmed">
                {t('A warranty rework is free, so the customer pays nothing for this part.')}
              </Text>
            )}
          </Stack>
        )}

        <Group justify="flex-end" mt="md" gap="sm">
          <Button variant="default" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button color="blue" onClick={pick} disabled={!ready} data-log-id="repairs.pick-part">
            {t('Use this part')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
