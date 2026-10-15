import { t } from '@/shared/i18n/t';
import { useMemo, useState } from 'react';
import { Box, Button, Divider, Group, Stack, Text } from '@mantine/core';
import {
  IconAddressBook,
  IconBuildingStore,
  IconCalendarPlus,
  IconClock,
  IconCoin,
  IconEdit,
  IconMail,
  IconMapPin,
  IconPackage,
  IconReceipt,
  IconTruckDelivery,
} from '@tabler/icons-react';
import { Supplier } from '../types';
import { formatDate, formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { useProductsForSupplier } from '@/features/supplier-products/hooks/useSupplierProducts';
import { usePurchasesBySupplier } from '@/features/purchases/hooks/usePurchases';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import {
  AnimatedTabs,
  CopyIconButton,
  DrawerAfter,
  DrawerCard,
  DrawerFooter,
  DrawerGrid,
  DrawerHero,
  DrawerMain,
  DrawerRail,
  Figure,
  FooterDelete,
  InfoRow,
  KpiStrip,
  KpiTile,
  RichDrawer,
} from '@/shared/components/drawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { SupplierIntakePanel } from './SupplierIntakePanel';
import { SupplierProductsPanel } from './SupplierProductsPanel';

type SupplierTab = 'products' | 'intake';

export interface SupplierDetailDrawerProps {
  supplier: Supplier | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export const SupplierDetailDrawer = ({
  supplier,
  opened,
  onClose,
  onEdit,
  onDelete,
}: SupplierDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState<SupplierTab>('products');

  const { data: linkedProducts = [], isLoading: loadingProducts } = useProductsForSupplier(
    supplier?.key
  );
  const { data: purchases = [], isLoading: loadingPurchases } = usePurchasesBySupplier(
    supplier?.key
  );
  const { data: allProducts = [] } = useAllProducts({ enabled: opened });

  const totalSpendCents = useMemo(
    () => purchases.reduce((acc, p) => acc + (p.totalCostCents || 0), 0),
    [purchases]
  );

  const handleClose = () => {
    setActiveTab('products');
    onClose();
  };

  return (
    <RichDrawer
      data={supplier}
      opened={opened}
      onClose={handleClose}
      width="wide"
      title={{
        icon: <IconBuildingStore size={20} />,
        text: t('Supplier Profile'),
        subtitle: t('Supplier Specifications & Contacts'),
      }}
      footer={(sup) => (
        <DrawerFooter
          start={
            <FooterDelete
              label={t('Delete')}
              hint={t('Delete Supplier')}
              onClick={() => onDelete(sup)}
            />
          }
        >
          <Button variant="default" size="sm" onClick={handleClose}>
            {t('Close')}
          </Button>
          <Button
            variant="filled"
            color="blue"
            size="sm"
            leftSection={<IconEdit size={16} />}
            onClick={() => onEdit(sup)}
          >
            {t('Edit Details')}
          </Button>
        </DrawerFooter>
      )}
    >
      {(sup) => {
        const linkedAny = linkedProducts.length > 0;
        const lastPurchase = purchases[0];

        return (
          <DrawerGrid>
            <KpiStrip>
              <KpiTile icon={<IconPackage size={16} />} color="blue" label={t('Products')}>
                <Figure value={String(linkedProducts.length)} hint={t('items')} color="blue" />
              </KpiTile>
              <KpiTile icon={<IconReceipt size={16} />} color="gray" label={t('Intakes')}>
                <Figure value={String(purchases.length)} hint={t('orders')} color="gray" />
              </KpiTile>
              <KpiTile icon={<IconCoin size={16} />} color="teal" label={t('Total Spend')}>
                <Figure
                  value={formatMoney(totalSpendCents)}
                  hint={t('across all intakes')}
                  color="teal"
                />
              </KpiTile>
              <KpiTile icon={<IconTruckDelivery size={16} />} color="gray" label={t('Last Intake')}>
                <Figure
                  value={lastPurchase ? formatDate(lastPurchase.date) : '—'}
                  hint={lastPurchase ? `${t('Qty: +')}${lastPurchase.quantity}` : t('None yet')}
                  color="gray"
                />
              </KpiTile>
            </KpiStrip>

            <DrawerRail>
              <DrawerHero
                accent="blue"
                icon={<IconBuildingStore size={32} />}
                status={{
                  color: linkedAny ? 'green' : 'gray',
                  label: linkedAny ? t('Active Supplier') : t('No Products Linked'),
                }}
                title={sup.name}
                subtitle={
                  <>
                    <div>
                      <Text component="span" fw={700} c="blue" inherit>
                        {sup.contactPerson}
                      </Text>{' '}
                      {t('(Representative)')}
                    </div>
                    {sup.suppliedCategories.length > 0 ? (
                      <div>{sup.suppliedCategories.join(' · ')}</div>
                    ) : null}
                  </>
                }
              />

              <DrawerAfter>
                <DrawerCard label={t('Contact & Address')} icon={<IconAddressBook size={14} />}>
                  <Stack gap="sm">
                    <Box>
                      <Text size="xs" c="dimmed" fw={500} mb={4}>
                        {t('Contact Phone Numbers')}
                      </Text>
                      <PhoneDisplay
                        primaryPhone={sup.primaryPhone}
                        secondaryPhone={sup.secondaryPhone}
                        layout="stack"
                      />
                    </Box>
                    <Divider />
                    <InfoRow icon={<IconMapPin size={16} />} label={t('Address')} stacked>
                      {sup.address}
                    </InfoRow>
                    {sup.email ? (
                      <>
                        <Divider />
                        <InfoRow icon={<IconMail size={16} />} label={t('Email Address')} stacked>
                          <Group gap={2} wrap="nowrap" justify="flex-start">
                            <span style={{ minWidth: 0, wordBreak: 'break-all' }}>{sup.email}</span>
                            <CopyIconButton value={sup.email} label={t('Copy email')} />
                          </Group>
                        </InfoRow>
                      </>
                    ) : null}
                    {sup.notes ? (
                      <>
                        <Divider />
                        <Box>
                          <Text size="xs" c="dimmed" fw={500} mb={4}>
                            {t('Notes & Special Instructions')}
                          </Text>
                          <Text size="xs" style={{ whiteSpace: 'pre-wrap' }}>
                            {sup.notes}
                          </Text>
                        </Box>
                      </>
                    ) : null}
                  </Stack>
                </DrawerCard>
              </DrawerAfter>

              <DrawerAfter>
                <DrawerCard label={t('Details')} icon={<IconClock size={14} />}>
                  <Stack gap="xs">
                    <InfoRow icon={<IconCalendarPlus size={16} />} label={t('Registered On')}>
                      {formatDateTime(sup.createdAt)}
                    </InfoRow>
                    <InfoRow icon={<IconClock size={16} />} label={t('Last Updated')}>
                      {formatDateTime(sup.updatedAt)}
                    </InfoRow>
                  </Stack>
                </DrawerCard>
              </DrawerAfter>
            </DrawerRail>

            <DrawerMain>
              <AnimatedTabs<SupplierTab>
                value={activeTab}
                onChange={setActiveTab}
                tabs={[
                  {
                    value: 'products',
                    label: t('Products'),
                    icon: <IconPackage size={16} />,
                    count: linkedProducts.length,
                  },
                  {
                    value: 'intake',
                    label: t('Intake'),
                    icon: <IconReceipt size={16} />,
                    count: purchases.length,
                  },
                ]}
              >
                {(value) =>
                  value === 'products' ? (
                    <SupplierProductsPanel
                      supplier={sup}
                      linked={linkedProducts}
                      loading={loadingProducts}
                      allProducts={allProducts}
                    />
                  ) : (
                    <SupplierIntakePanel
                      supplier={sup}
                      purchases={purchases}
                      loading={loadingPurchases}
                      linked={linkedProducts}
                      allProducts={allProducts}
                    />
                  )
                }
              </AnimatedTabs>
            </DrawerMain>
          </DrawerGrid>
        );
      }}
    </RichDrawer>
  );
};
