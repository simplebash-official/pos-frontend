import { t } from '@/shared/i18n/t';
import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Box, Paper, Tabs, Text } from '@mantine/core';
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

const TAB_ORDER: ActivityTab[] = ['movements', 'suppliers', 'intake'];

/**
 * The number beside a tab name: on the active (blue) tab a white-tinted chip,
 * otherwise blue when there is something to see and grey when empty.
 */
const CountChip = ({ count, active }: { count: number; active: boolean }) => (
  <Box
    component="span"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 22,
      height: 22,
      padding: '0 6px',
      borderRadius: 11,
      fontSize: 12,
      fontWeight: 700,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
      background: active
        ? 'color-mix(in srgb, var(--mantine-color-white) 24%, transparent)'
        : count > 0
          ? 'var(--mantine-color-blue-light)'
          : 'var(--bg-active)',
      color: active
        ? 'var(--mantine-color-white)'
        : count > 0
          ? 'var(--mantine-color-blue-light-color)'
          : 'var(--text-secondary)',
    }}
  >
    {count}
  </Box>
);

/** The label of a tab, with the blue highlight that glides to whichever tab is active. */
const TabLabel = ({ active, children }: { active: boolean; children: ReactNode }) => (
  <>
    {active && (
      <motion.span
        layoutId="activity-tab-pill"
        className="activity-tab-pill"
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
      />
    )}
    <span className="activity-tab-label">{children}</span>
  </>
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

  const reduceMotion = useReducedMotion();
  // Slide the panel the way the tab bar moved; adjusted while rendering so it is right on the first frame.
  const index0 = TAB_ORDER.indexOf(tab);
  const [previousIndex, setPreviousIndex] = useState(index0);
  const [direction, setDirection] = useState<1 | -1>(1);
  if (index0 !== previousIndex) {
    setDirection(index0 > previousIndex ? 1 : -1);
    setPreviousIndex(index0);
  }

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
        supplierOptions={supplierOptions}
        formOpen={intakeFormOpen}
        onFormOpenChange={onIntakeFormOpenChange}
      />
    ),
  };
  const slide = reduceMotion ? 0 : 16;

  return (
    <Paper p={0} bg="var(--bg-card)" shadow="xs" style={{ overflow: 'hidden' }}>
      <Tabs
        value={tab}
        onChange={(value) => onTabChange((value ?? 'movements') as ActivityTab)}
        variant="pills"
        color="blue"
        classNames={{ root: 'activity-tabs' }}
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
            rightSection={<CountChip count={movements.length} active={tab === 'movements'} />}
          >
            <TabLabel active={tab === 'movements'}>{t('Movements')}</TabLabel>
          </Tabs.Tab>
          <Tabs.Tab
            value="suppliers"
            leftSection={isMobile ? undefined : <IconBuildingStore size={16} />}
            rightSection={<CountChip count={linked.length} active={tab === 'suppliers'} />}
          >
            <TabLabel active={tab === 'suppliers'}>{t('Suppliers')}</TabLabel>
          </Tabs.Tab>
          <Tabs.Tab
            value="intake"
            leftSection={isMobile ? undefined : <IconReceipt size={16} />}
            rightSection={<CountChip count={purchases.length} active={tab === 'intake'} />}
          >
            <TabLabel active={tab === 'intake'}>{t('Intake')}</TabLabel>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Box p="md" style={{ overflow: 'hidden' }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0, x: direction * slide }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * slide }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
          >
            {panels[tab]}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Paper>
  );
};
