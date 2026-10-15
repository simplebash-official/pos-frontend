import { t } from '@/shared/i18n/t';
import { BRAND_NAME } from '@/config/branding';
import { useState } from 'react';
import { Box, Button, Drawer, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconEdit, IconPackage } from '@tabler/icons-react';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import type { Product } from '../types';
import { ItemActivityTabs, type ActivityTab } from './ItemActivityTabs';
import { ItemDetailsCard } from './ItemDetailsCard';
import { ItemHeroCard } from './ItemHeroCard';
import { ItemKpiStrip } from './ItemKpiStrip';
import { ItemStockCard } from './ItemStockCard';

export interface ItemDetailDrawerProps {
  /** The item to show; the drawer is closed while this is `null`. */
  product: Product | null;
  onClose: () => void;
  /** Called with the refreshed item after its stock changes. */
  onProductChange: (product: Product) => void;
  onEdit: (product: Product) => void;
}

/**
 * Item Specifications: a wide right-hand drawer. The left column says what the
 * item is and what it earns, the right column what is in stock and what has
 * happened to it. The two columns fold into one when the drawer is narrow.
 */
export const ItemDetailDrawer = ({
  product,
  onClose,
  onProductChange,
  onEdit,
}: ItemDetailDrawerProps) => {
  const isMobile = useIsMobile();
  const isAdmin = useIsAdmin();
  const [tab, setTab] = useState<ActivityTab>('movements');
  const [supplierFormOpen, setSupplierFormOpen] = useState(false);
  const [intakeFormOpen, setIntakeFormOpen] = useState(false);

  const handleClose = () => {
    setTab('movements');
    setSupplierFormOpen(false);
    setIntakeFormOpen(false);
    onClose();
  };

  const handleTabChange = (next: ActivityTab) => {
    setTab(next);
    setSupplierFormOpen(false);
    setIntakeFormOpen(false);
  };

  const receiveFromSupplier = () => {
    setTab('intake');
    setSupplierFormOpen(false);
    setIntakeFormOpen(true);
  };

  return (
    <Drawer
      opened={product !== null}
      onClose={handleClose}
      position="right"
      size={isMobile ? '100%' : 'xl'}
      classNames={{ content: 'item-drawer' }}
      title={
        <Group gap="xs">
          <ThemeIcon color="blue" variant="light" size="lg">
            <IconPackage size={20} />
          </ThemeIcon>
          <div>
            <Text fw={800} size="md">
              {t('Item Specifications')}
            </Text>
            <Text size="xs" c="dimmed">
              {t(`${BRAND_NAME} Main Inventory Detail`)}
            </Text>
          </div>
        </Group>
      }
    >
      {product && (
        <>
          <Box className="item-drawer-scroll">
            <Box className="item-drawer-grid">
              <ItemKpiStrip product={product} />

              <Stack gap="md" className="item-drawer-rail">
                <ItemHeroCard product={product} />
                <Box className="item-drawer-after">
                  <ItemDetailsCard product={product} />
                </Box>
              </Stack>

              <Stack gap="md" className="item-drawer-main">
                <ItemStockCard
                  product={product}
                  onProductChange={onProductChange}
                  onReceiveFromSupplier={isAdmin ? receiveFromSupplier : undefined}
                />
                <ItemActivityTabs
                  product={product}
                  tab={tab}
                  onTabChange={handleTabChange}
                  supplierFormOpen={supplierFormOpen}
                  onSupplierFormOpenChange={setSupplierFormOpen}
                  intakeFormOpen={intakeFormOpen}
                  onIntakeFormOpenChange={setIntakeFormOpen}
                />
              </Stack>
            </Box>
          </Box>

          <Group justify="flex-end" gap="sm" className="item-drawer-footer">
            <Button variant="default" size="sm" onClick={handleClose}>
              {t('Close')}
            </Button>
            <Button
              variant="filled"
              color="blue"
              size="sm"
              leftSection={<IconEdit size={16} />}
              onClick={() => onEdit(product)}
            >
              {t('Edit Item')}
            </Button>
          </Group>
        </>
      )}
    </Drawer>
  );
};
