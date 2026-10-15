import { t } from '@/shared/i18n/t';
import { useMemo } from 'react';
import { Badge, Box, Paper, Tabs, Text } from '@mantine/core';
import { IconBuildingStore, IconHistory, IconReceipt } from '@tabler/icons-react';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
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

/** A count that lights up blue when there is something to see and stays grey when empty. */
const CountBadge = ({ count }: { count: number }) => (
  <Badge size="xs" variant="light" color={count > 0 ? 'blue' : 'gray'} circle>
    {count}
  </Badge>
);

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
  const isMobile = useIsMobile();
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
      <Paper p="md" bg="var(--bg-card)" shadow="xs">
        <Text size="sm" fw={700} mb="xs">
          {t('Movements')}
        </Text>
        <StockMovementList movements={movements} loading={loadingMovements} />
      </Paper>
    );
  }

  return (
    <Paper p={0} bg="var(--bg-card)" shadow="xs" style={{ overflow: 'hidden' }}>
      <Tabs
        value={tab}
        onChange={(value) => onTabChange((value ?? 'movements') as ActivityTab)}
        variant="pills"
        color="blue"
        keepMounted={false}
      >
        <Tabs.List
          grow
          style={{
            flexWrap: 'nowrap',
            gap: 6,
            padding: 'var(--mantine-spacing-xs)',
            background: 'var(--bg-app)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Tabs.Tab
            value="movements"
            leftSection={isMobile ? undefined : <IconHistory size={16} />}
            rightSection={<CountBadge count={movements.length} />}
          >
            {t('Movements')}
          </Tabs.Tab>
          <Tabs.Tab
            value="suppliers"
            leftSection={isMobile ? undefined : <IconBuildingStore size={16} />}
            rightSection={<CountBadge count={linked.length} />}
          >
            {t('Suppliers')}
          </Tabs.Tab>
          <Tabs.Tab
            value="intake"
            leftSection={isMobile ? undefined : <IconReceipt size={16} />}
            rightSection={<CountBadge count={purchases.length} />}
          >
            {t('Intake')}
          </Tabs.Tab>
        </Tabs.List>

        <Box p="md">
          <Tabs.Panel value="movements">
            <StockMovementList movements={movements} loading={loadingMovements} />
          </Tabs.Panel>
          <Tabs.Panel value="suppliers">
            <ItemSuppliersPanel
              product={product}
              linked={linked}
              loading={loadingSuppliers}
              supplierOptions={supplierOptions}
              formOpen={supplierFormOpen}
              onFormOpenChange={onSupplierFormOpenChange}
            />
          </Tabs.Panel>
          <Tabs.Panel value="intake">
            <ItemIntakePanel
              product={product}
              purchases={purchases}
              loading={loadingPurchases}
              supplierOptions={supplierOptions}
              formOpen={intakeFormOpen}
              onFormOpenChange={onIntakeFormOpenChange}
            />
          </Tabs.Panel>
        </Box>
      </Tabs>
    </Paper>
  );
};
