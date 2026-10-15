import { t } from '@/shared/i18n/t';
import { IconBoxSeam, IconCoin, IconReceipt2, IconTrendingUp } from '@tabler/icons-react';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
import { Figure, KpiStrip, KpiTile, RangeFigure } from '@/shared/components/drawer';
import { adminCostRange, profitRange, sellingPriceRange } from '../lib/priceTiers';
import { stockStatus } from '../lib/stockStatus';
import type { Product } from '../types';

const STATUS_COLOR = { out: 'red', low: 'orange', ok: 'green' } as const;

/** The four numbers that matter at a glance: stock, selling price, and for an Admin cost and profit. */
export const ItemKpiStrip = ({ product }: { product: Product }) => {
  const isAdmin = useIsAdmin();
  const status = stockStatus(product.stockQuantity, product.minStockThreshold);
  const range = { singleHint: t('per unit'), emptyHint: t('No stock') };

  return (
    <KpiStrip>
      <KpiTile icon={<IconBoxSeam size={16} />} color={STATUS_COLOR[status]} label={t('Stock')}>
        <Figure
          value={`${product.stockQuantity} ${t('units')}`}
          hint={`${t('Min Threshold:')} ${product.minStockThreshold}`}
          color={STATUS_COLOR[status]}
        />
      </KpiTile>
      <KpiTile icon={<IconCoin size={16} />} color="blue" label={t('Selling')}>
        <RangeFigure range={sellingPriceRange(product)} color="blue" {...range} />
      </KpiTile>
      {isAdmin && (
        <KpiTile icon={<IconReceipt2 size={16} />} color="gray" label={t('Cost')}>
          <RangeFigure range={adminCostRange(product)} color="gray" {...range} />
        </KpiTile>
      )}
      {isAdmin && (
        <KpiTile icon={<IconTrendingUp size={16} />} color="teal" label={t('Profit per unit')}>
          <RangeFigure range={profitRange(product)} color="teal" {...range} />
        </KpiTile>
      )}
    </KpiStrip>
  );
};
