import { t } from '@/shared/i18n/t';
import { BRAND_NAME } from '@/config/branding';
import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconEdit, IconPackage, IconTags } from '@tabler/icons-react';
import {
  DrawerAfter,
  DrawerFooter,
  DrawerGrid,
  DrawerMain,
  DrawerRail,
  RichDrawer,
} from '@/shared/components/drawer';
import { useIsAdmin } from '@/shared/hooks/usePermissions';
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
  /** Opens the label printing window for this item. */
  onPrintLabel: (product: Product) => void;
}

/**
 * Item Specifications: a wide right-hand drawer. The left column says what the
 * item is and when it changed, the right column what is in stock and what has
 * happened to it. The two columns fold into one when the drawer is narrow.
 */
export const ItemDetailDrawer = ({
  product,
  onClose,
  onProductChange,
  onEdit,
  onPrintLabel,
}: ItemDetailDrawerProps) => {
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
    <RichDrawer
      data={product}
      opened={product !== null}
      onClose={handleClose}
      width="wide"
      title={{
        icon: <IconPackage size={20} />,
        text: t('Item Specifications'),
        subtitle: t(`${BRAND_NAME} Main Inventory Detail`),
      }}
      footer={(item) => (
        <DrawerFooter>
          <Button variant="default" size="sm" onClick={handleClose}>
            {t('Close')}
          </Button>
          <Button
            variant="default"
            size="sm"
            leftSection={<IconTags size={16} />}
            onClick={() => onPrintLabel(item)}
          >
            {t('Print Label')}
          </Button>
          <Button
            variant="filled"
            color="blue"
            size="sm"
            leftSection={<IconEdit size={16} />}
            onClick={() => onEdit(item)}
          >
            {t('Edit Item')}
          </Button>
        </DrawerFooter>
      )}
    >
      {(item) => (
        <DrawerGrid>
          <ItemKpiStrip product={item} />

          <DrawerRail>
            <ItemHeroCard product={item} />
            <DrawerAfter>
              <ItemDetailsCard product={item} />
            </DrawerAfter>
          </DrawerRail>

          <DrawerMain>
            <ItemStockCard
              product={item}
              onProductChange={onProductChange}
              onReceiveFromSupplier={isAdmin ? receiveFromSupplier : undefined}
            />
            <ItemActivityTabs
              product={item}
              tab={tab}
              onTabChange={handleTabChange}
              supplierFormOpen={supplierFormOpen}
              onSupplierFormOpenChange={setSupplierFormOpen}
              intakeFormOpen={intakeFormOpen}
              onIntakeFormOpenChange={setIntakeFormOpen}
            />
          </DrawerMain>
        </DrawerGrid>
      )}
    </RichDrawer>
  );
};
