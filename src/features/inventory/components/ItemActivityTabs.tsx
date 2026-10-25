import { t } from '@/shared/i18n/t';
import { useMemo, type ReactNode } from 'react';
import { IconBuildingStore, IconHistory, IconReceipt } from '@tabler/icons-react';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
import { AnimatedTabs, DrawerCard } from '@/shared/components/drawer';
import { useAllSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { useSuppliersForProduct } from '@/features/supplier-products/hooks/useSupplierProducts';
import { usePurchasesByProduct } from '@/features/purchases/hooks/usePurchases';
import { useProductMovements } from '../hooks/useProducts';
import type { Product } from '../types';
import { ItemIntakePanel } from './ItemIntakePanel';
import { ItemSuppliersPanel } from './ItemSuppliersPanel';
import { StockMovementList } from './StockMovementList';

export type ActivityTab = 'movements' | 'suppliers' | 'intake';

export interface ItemActivityTabsProps {
  product: Product;
  tab: ActivityTab;
  onTabChange: (tab: ActivityTab) => void;
  supplierFormOpen: boolean;
  onSupplierFormOpenChange: (open: boolean) => void;
  intakeFormOpen: boolean;
  onIntakeFormOpenChange: (open: boolean) => void;
}

/**
 * What has happened to this item: stock movements for everyone; for an Admin
 * also the suppliers linked to it and the deliveries received from them.
 */
export const ItemActivityTabs = ({
  product,
  tab,
  onTabChange,
  supplierFormOpen,
  onSupplierFormOpenChange,
  intakeFormOpen,
  onIntakeFormOpenChange,
}: ItemActivityTabsProps) => {
  const isAdmin = useIsAdmin();
  const { data: movements, isLoading: loadingMovements } = useProductMovements(product.id);
  const { data: linked, isLoading: loadingSuppliers } = useSuppliersForProduct(
    isAdmin ? product.key : undefined
  );
  const { data: purchases, isLoading: loadingPurchases } = usePurchasesByProduct(
    isAdmin ? product.key : undefined
  );
  const { data: allSuppliers } = useAllSuppliers({ enabled: isAdmin });

  const supplierOptions = useMemo(
    () =>
      allSuppliers.map((s) => ({
        value: s.key,
        label: s.contactPerson ? `${s.name} (${s.contactPerson})` : s.name,
      })),
    [allSuppliers]
  );

  if (!isAdmin) {
    return (
      <DrawerCard label={t('Movements')} icon={<IconHistory size={14} />}>
        <StockMovementList movements={movements} loading={loadingMovements} />
      </DrawerCard>
    );
  }

  const panels: Record<ActivityTab, ReactNode> = {
    movements: <StockMovementList movements={movements} loading={loadingMovements} />,
    suppliers: (
      <ItemSuppliersPanel
        product={product}
        linked={linked}
        loading={loadingSuppliers}
        supplierOptions={supplierOptions}
        formOpen={supplierFormOpen}
        onFormOpenChange={onSupplierFormOpenChange}
      />
    ),
    intake: (
      <ItemIntakePanel
        product={product}
        purchases={purchases}
        loading={loadingPurchases}
        formOpen={intakeFormOpen}
        onFormOpenChange={onIntakeFormOpenChange}
      />
    ),
  };

  return (
    <AnimatedTabs
      value={tab}
      onChange={onTabChange}
      tabs={[
        {
          value: 'movements',
          label: t('Movements'),
          icon: <IconHistory size={16} />,
          count: movements.length,
        },
        {
          value: 'suppliers',
          label: t('Suppliers'),
          icon: <IconBuildingStore size={16} />,
          count: linked.length,
        },
        {
          value: 'intake',
          label: t('Intake'),
          icon: <IconReceipt size={16} />,
          count: purchases.length,
        },
      ]}
    >
      {(value) => panels[value]}
    </AnimatedTabs>
  );
};
