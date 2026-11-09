import { Alert, Loader, Select } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { useProductSerials } from '@/features/inventory/hooks/useProductSerials';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import { formatDate } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';

/** Above the claim windows (400), which open over drawers; a list under its window cannot be picked from. */
const DROPDOWN_Z_INDEX = 401;

/** The replacement unit: an in-stock serial of the same product, or a price to take stock from. */
export const ReplacementPicker = ({
  productKey,
  serialized,
  serial,
  onSerial,
  priceCents,
  onPrice,
}: {
  /** The product being replaced; `undefined` when it was not sold from stock. */
  productKey: string | undefined;
  /** The faulty unit has a serial number, so the new one is picked by serial. */
  serialized: boolean;
  serial: string | null;
  onSerial: (serial: string | null) => void;
  priceCents: string | null;
  onPrice: (price: string | null) => void;
}) => {
  const isMobile = useIsMobile();
  const serials = useProductSerials(productKey, 'in_stock', { enabled: serialized });
  // The product read route takes the database id, so the product is found by key in the list.
  const products = useAllProducts({ enabled: productKey !== undefined && !serialized });
  const product = products.data.find((candidate) => candidate.key === productKey);

  if (productKey === undefined) {
    return (
      <Alert color="orange" icon={<IconInfoCircle size={16} />}>
        {t('This item was not sold from stock, so it cannot be swapped for a new one.')}
      </Alert>
    );
  }
  if (serialized) {
    if (serials.data === undefined) return <Loader size="sm" />;
    return (
      <Select
        label={t('Which new unit is the customer getting?')}
        placeholder={t('Scan or choose a serial number in stock')}
        data={serials.data.map((unit) => unit.serialNumber)}
        value={serial}
        onChange={onSerial}
        searchable
        nothingFoundMessage={t('No unit of this item is in stock')}
        size={isMobile ? 'md' : 'sm'}
        data-barcode-scanner="true"
        comboboxProps={{ withinPortal: true, zIndex: DROPDOWN_Z_INDEX }}
      />
    );
  }
  if (products.isLoading) return <Loader size="sm" />;
  if (product === undefined) {
    return (
      <Alert color="orange" icon={<IconInfoCircle size={16} />}>
        {t('This item is no longer in the catalogue, so it cannot be swapped for a new one.')}
      </Alert>
    );
  }
  return (
    <Select
      label={t('Take the new unit from stock sold at')}
      placeholder={t('Choose a price')}
      data={product.priceTiers.map((tier) => ({
        value: String(tier.sellingPriceCents),
        label: `${formatMoney(tier.sellingPriceCents)} · ${tier.quantity} ${t('left')}`,
      }))}
      value={priceCents}
      onChange={onPrice}
      nothingFoundMessage={t('No unit of this item is in stock')}
      size={isMobile ? 'md' : 'sm'}
      comboboxProps={{ withinPortal: true, zIndex: DROPDOWN_Z_INDEX }}
    />
  );
};

/** Tells the customer how long the new unit is covered: as long as the old one would have been. */
export const ReplacementEndsNote = ({ endsOn }: { endsOn: string | undefined }) => (
  <Alert color="blue" icon={<IconInfoCircle size={16} />} p="xs">
    {endsOn === undefined
      ? t('The new unit is covered for life, like the old one.')
      : `${t('The new unit is covered until')} ${formatDate(endsOn)}, ${t(
          'the same day as the old one.'
        )}`}
  </Alert>
);
