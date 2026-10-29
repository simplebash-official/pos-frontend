import { useSettlement } from '@/features/purchases/hooks/useSettlement';
import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Badge, Box, Button, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import {
  IconAddressBook,
  IconBuildingStore,
  IconCalendarPlus,
  IconClock,
  IconCash,
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
import { useReceiptsBySupplier } from '@/features/purchases/hooks/usePurchases';
import { PaySupplierModal } from '@/features/purchases/components/PaySupplierModal';
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
  const { data: receipts, isLoading: loadingReceipts } = useReceiptsBySupplier(supplier?.key);
  const { data: allProducts = [] } = useAllProducts({ enabled: opened });
  const [payOpen, setPayOpen] = useState(false);

  // What is still owed on this supplier's bills, added up by the server.
  const owed = useSettlement(supplier ? supplier.key : '', 0, [], Boolean(supplier));
  const owedCents = owed.data === undefined ? 0 : owed.data.owedCents;

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
            variant="light"
            color="blue"
            size="sm"
            leftSection={<IconEdit size={16} />}
            onClick={() => onEdit(sup)}
          >
            {t('Edit Details')}
          </Button>
          <Button
            variant="filled"
            color="blue"
            size="sm"
            leftSection={<IconCash size={16} />}
            onClick={() => setPayOpen(true)}
          >
            {t('Pay Supplier')}
          </Button>
        </DrawerFooter>
      )}
    >
      {(sup) => {
        const linkedAny = linkedProducts.length > 0;
        const lastReceipt = receipts[0];

        return (
          <DrawerGrid>
            <KpiStrip>
              <KpiTile icon={<IconPackage size={16} />} color="blue" label={t('Products')}>
                <Figure value={String(linkedProducts.length)} hint={t('items')} color="blue" />
              </KpiTile>
              <KpiTile icon={<IconReceipt size={16} />} color="gray" label={t('Bills')}>
                <Figure value={String(receipts.length)} hint={t('received')} color="gray" />
              </KpiTile>
              <KpiTile
                icon={<IconCoin size={16} />}
                color={owedCents > 0 ? 'orange' : 'teal'}
                label={t('We owe')}
              >
                <Figure
                  value={formatMoney(owedCents)}
                  hint={owedCents > 0 ? t('on unpaid bills') : t('nothing owed')}
                  color={owedCents > 0 ? 'orange' : 'teal'}
                />
              </KpiTile>
              <KpiTile icon={<IconTruckDelivery size={16} />} color="gray" label={t('Last Bill')}>
                <Figure
                  value={lastReceipt ? formatDate(lastReceipt.date) : '—'}
                  hint={lastReceipt ? lastReceipt.receiptNumber : t('None yet')}
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
                    <Group gap={6} wrap="nowrap">
                      <div>
                        <Text component="span" fw={700} c="blue" inherit>
                          {sup.contactPerson}
                        </Text>{' '}
                        {t('(Representative)')}
                      </div>
                      {sup.contactPersons && sup.contactPersons.length > 1 && (
                        <Badge size="xs" variant="light" color="blue">
                          {`+${sup.contactPersons.length - 1} ${t('more')}`}
                        </Badge>
                      )}
                    </Group>
                    {sup.suppliedCategories.length > 0 ? (
                      <div>{sup.suppliedCategories.join(' · ')}</div>
                    ) : null}
                  </>
                }
              />

              <DrawerAfter>
                <DrawerCard label={t('Contact & Address')} icon={<IconAddressBook size={14} />}>
                  <Stack gap="sm">
                    {sup.contactPersons && sup.contactPersons.length > 0 ? (
                      <Stack gap="xs">
                        <Text
                          size="xs"
                          c="dimmed"
                          fw={600}
                          tt="uppercase"
                          style={{ letterSpacing: '0.04em' }}
                        >
                          {t('Contact Persons')}
                        </Text>
                        {sup.contactPersons.map((cp, idx) => (
                          <Paper
                            key={idx}
                            p="xs"
                            withBorder
                            radius="sm"
                            bg={idx === 0 ? 'var(--mantine-color-blue-light)' : undefined}
                            style={{
                              borderColor:
                                idx === 0
                                  ? 'var(--mantine-color-blue-light-border)'
                                  : 'var(--mantine-color-default-border)',
                            }}
                          >
                            <Stack gap={4}>
                              <Group justify="space-between" align="center" wrap="nowrap">
                                <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                                  <Text size="xs" fw={700} lineClamp={1}>
                                    {cp.name}
                                  </Text>
                                  {idx === 0 && (
                                    <Badge size="xs" variant="light" color="blue">
                                      {t('Primary')}
                                    </Badge>
                                  )}
                                </Group>
                              </Group>
                              <PhoneDisplay
                                primaryPhone={cp.phoneNumbers[0] ?? ''}
                                secondaryPhone={cp.phoneNumbers[1] ?? ''}
                                layout="stack"
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
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
                    )}
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
                    label: t('Bills'),
                    icon: <IconReceipt size={16} />,
                    count: receipts.length,
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
                      receipts={receipts}
                      loading={loadingReceipts}
                      onPay={() => setPayOpen(true)}
                    />
                  )
                }
              </AnimatedTabs>
            </DrawerMain>
            <PaySupplierModal
              opened={payOpen}
              onClose={() => setPayOpen(false)}
              supplierKey={sup.key}
              supplierName={sup.name}
            />
          </DrawerGrid>
        );
      }}
    </RichDrawer>
  );
};
