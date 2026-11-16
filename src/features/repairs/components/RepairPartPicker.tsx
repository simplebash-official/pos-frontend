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
import type { ProductWarranty } from '@/features/warranties';
import type { PartDraft } from '../lib/repairItems';

type Source = 'stock' | 'outside';

export interface RepairPartPickerProps {
  opened: boolean;
  /** The part already on the row, to start from. */
  initial: PartDraft | null;
  /** A warranty rework charges nothing for its parts. */
  rework: boolean;
  onClose: () => void;
  onPick: (part: PartDraft, warranty?: ProductWarranty) => void;
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
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSelectProduct = (productKey: string | null) => {
    setLookupError(null);
    setScanError(null);
    if (!productKey) {
      setStock(NO_STOCK);
      return;
    }
    const chosen = inStock.find((p) => p.key === productKey);
    if (chosen && !chosen.isSerialized && chosen.priceTiers.length === 1) {
      setStock({
        productKey,
        serialNumber: null,
        priceCents: chosen.priceTiers[0].sellingPriceCents,
      });
    } else {
      setStock({ productKey, serialNumber: null, priceCents: null });
    }
  };

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

  const handleScanOrSubmit = async (rawText: string) => {
    const text = rawText.trim();
    if (text === '') return;

    // 1. Check if the text matches a product SKU, barcode, or exact name
    const directMatch = inStock.find(
      (p) =>
        p.sku?.toLowerCase() === text.toLowerCase() ||
        p.barcode === text ||
        p.name.toLowerCase() === text.toLowerCase()
    );
    if (directMatch) {
      handleSelectProduct(directMatch.key);
      return;
    }

    // 2. Look up as a serial number
    setScanning(true);
    setScanError(null);
    try {
      const found = await fetchSerialByNumber(text);
      setStock({
        productKey: found.product.key,
        serialNumber: found.serial.serialNumber,
        priceCents: found.sellingPriceCents,
      });
      setSearchQuery('');
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
      if (stockPart !== null) onPick(stockPart, product?.warranty);
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
            <Select
              label={t('Part from stock')}
              placeholder={
                products.isLoading
                  ? t('Loading items…')
                  : t('Scan serial / barcode, or search item name...')
              }
              leftSection={<IconBarcode size={16} />}
              rightSection={scanning ? <Loader size="xs" /> : null}
              data={inStock.map((candidate) => {
                const priceInfo =
                  candidate.priceTiers.length === 1
                    ? ` · ${formatMoney(candidate.priceTiers[0].sellingPriceCents)}`
                    : candidate.priceTiers.length > 1
                      ? ` · ${t('from')} ${formatMoney(candidate.priceTiers[0].sellingPriceCents)}`
                      : '';
                return {
                  value: candidate.key,
                  label: `${candidate.name} · ${candidate.stockQuantity} ${t('in stock')}${priceInfo}`,
                };
              })}
              value={stock.productKey}
              onSearchChange={(query) => {
                setSearchQuery(query);
                setScanError(null);
                setLookupError(null);
              }}
              onChange={(productKey) => handleSelectProduct(productKey)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  const text = (event.currentTarget.value || searchQuery).trim();
                  if (text) {
                    void handleScanOrSubmit(text);
                  }
                }
              }}
              searchable
              clearable
              nothingFoundMessage={t('No item matches (press Enter to scan as serial/barcode)')}
              error={scanError || lookupError}
              data-barcode-scanner="true"
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
            {product !== undefined && !product.isSerialized && product.priceTiers.length > 1 && (
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
