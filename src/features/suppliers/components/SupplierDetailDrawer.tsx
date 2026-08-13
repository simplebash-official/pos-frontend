import { useState, useMemo } from 'react';
import {
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Divider,
  Button,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  Center,
  ScrollArea,
  Skeleton,
  Tabs,
  Grid,
  Collapse,
  Select,
  TextInput,
  NumberInput,
} from '@mantine/core';
import {
  IconBuildingStore,
  IconUser,
  IconMapPin,
  IconTag,
  IconMail,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconPlus,
  IconLink,
  IconUnlink,
  IconReceipt,
  IconPackage,
  IconTrendingUp,
  IconSearch,
  IconClock,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { Supplier } from '../types';
import { formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import {
  useProductsForSupplier,
  useUnlinkProduct,
  useLinkProduct,
  EnrichedLinkedProduct,
} from '@/features/supplier-products/hooks/useSupplierProducts';
import { usePurchasesBySupplier, useCreatePurchase } from '@/features/purchases/hooks/usePurchases';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { MoneyInput } from '@/shared/components/MoneyInput';
import { ProductPickerModal } from '@/features/inventory/components/ProductPickerModal';
import { ReceiveStockModal } from '@/features/purchases/components/ReceiveStockModal';
import { useIsMobile } from '@/shared/hooks/useResponsive';

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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>('products');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [receiveStockOpen, setReceiveStockOpen] = useState(false);

  // Inline Link Product Form state
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [linkProductKey, setLinkProductKey] = useState<string | null>(null);
  const [linkSupplierSku, setLinkSupplierSku] = useState('');
  const [linkCostCents, setLinkCostCents] = useState(0);
  const [linkNotes, setLinkNotes] = useState('');

  // Inline Quick Stock Intake Form state
  const [intakeFormOpen, setIntakeFormOpen] = useState(false);
  const [intakeProductKey, setIntakeProductKey] = useState<string | null>(null);
  const [intakeQuantity, setIntakeQuantity] = useState<number | ''>(1);
  const [intakeUnitCostCents, setIntakeUnitCostCents] = useState(0);
  const [intakeReferenceNo, setIntakeReferenceNo] = useState('');

  // Data Queries & Mutations
  const { data: linkedProducts = [], isLoading: loadingProducts } = useProductsForSupplier(
    supplier?.key
  );
  const { data: purchases = [], isLoading: loadingPurchases } = usePurchasesBySupplier(
    supplier?.key
  );
  const { data: allProducts = [] } = useAllProducts({ enabled: opened });

  const unlinkMutation = useUnlinkProduct();
  const linkMutation = useLinkProduct();
  const createPurchaseMutation = useCreatePurchase();

  // Reset helpers
  const resetLinkForm = () => {
    setLinkFormOpen(false);
    setLinkProductKey(null);
    setLinkSupplierSku('');
    setLinkCostCents(0);
    setLinkNotes('');
  };

  const resetIntakeForm = () => {
    setIntakeFormOpen(false);
    setIntakeProductKey(null);
    setIntakeQuantity(1);
    setIntakeUnitCostCents(0);
    setIntakeReferenceNo('');
  };

  const handleClose = () => {
    resetLinkForm();
    resetIntakeForm();
    setActiveTab('products');
    onClose();
  };

  // Summary Metrics
  const totalSpendCents = useMemo(() => {
    return purchases.reduce((acc, p) => acc + (p.totalCostCents || 0), 0);
  }, [purchases]);

  // Product options for Inline Link Form
  const linkedProductKeySet = useMemo(() => {
    return new Set(linkedProducts.map((lp) => lp.productKey));
  }, [linkedProducts]);

  const linkProductSelectOptions = useMemo(() => {
    return allProducts
      .filter((p) => !linkedProductKeySet.has(p.key))
      .map((p) => ({
        value: p.key,
        label: `${p.name} (${p.sku})`,
      }));
  }, [allProducts, linkedProductKeySet]);

  // Product options for Inline Intake Form
  const intakeProductSelectOptions = useMemo(() => {
    if (linkedProducts.length > 0) {
      return linkedProducts.map((lp) => ({
        value: lp.productKey,
        label: `${lp.product.name} (${lp.product.sku})`,
      }));
    }
    return allProducts.map((p) => ({
      value: p.key,
      label: `${p.name} (${p.sku})`,
    }));
  }, [linkedProducts, allProducts]);

  // Handle auto-populating cost price on product selection
  const handleLinkProductChange = (key: string | null) => {
    setLinkProductKey(key);
    if (key) {
      const prod = allProducts.find((p) => p.key === key);
      if (prod?.costPriceCents) {
        setLinkCostCents(prod.costPriceCents);
      }
    }
  };

  const handleIntakeProductChange = (key: string | null) => {
    setIntakeProductKey(key);
    if (key) {
      const lp = linkedProducts.find((p) => p.productKey === key);
      if (lp?.costPriceCents) {
        setIntakeUnitCostCents(lp.costPriceCents);
      } else {
        const prod = allProducts.find((p) => p.key === key);
        if (prod?.costPriceCents) {
          setIntakeUnitCostCents(prod.costPriceCents);
        }
      }
    }
  };

  // Actions
  const handleLinkFromPicker = (productKey: string) => {
    if (!supplier) return;
    linkMutation.mutate(
      { supplierKey: supplier.key, productKey },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Product Linked',
            message: 'Product has been linked to this supplier.',
            color: 'teal',
          });
        },
      }
    );
  };

  const handleLinkProductInline = () => {
    if (!supplier || !linkProductKey) return;
    linkMutation.mutate(
      {
        supplierKey: supplier.key,
        productKey: linkProductKey,
        supplierSku: linkSupplierSku.trim() || undefined,
        costPriceCents: linkCostCents > 0 ? linkCostCents : undefined,
        notes: linkNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Product Linked',
            message: 'Product has been linked to this supplier.',
            color: 'teal',
          });
          resetLinkForm();
        },
      }
    );
  };

  const handleRecordIntakeInline = () => {
    if (!supplier || !intakeProductKey || !intakeQuantity || Number(intakeQuantity) <= 0) return;
    createPurchaseMutation.mutate(
      {
        supplierKey: supplier.key,
        productKey: intakeProductKey,
        quantity: Number(intakeQuantity),
        unitCostCents: intakeUnitCostCents,
        date: new Date().toISOString(),
        referenceNo: intakeReferenceNo.trim() || undefined,
      },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Stock Received',
            message: 'Stock intake recorded successfully.',
            color: 'teal',
          });
          resetIntakeForm();
        },
      }
    );
  };

  const handleUnlink = (productKey: string) => {
    if (!supplier) return;
    unlinkMutation.mutate(
      { supplierKey: supplier.key, productKey },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Product Unlinked',
            message: 'Product has been removed from this supplier.',
            color: 'orange',
          });
        },
      }
    );
  };

  return (
    <>
      <DetailDrawer
        data={supplier}
        opened={opened}
        onClose={handleClose}
        title={
          <Group gap="xs">
            <ThemeIcon
              color="blue"
              variant="light"
              size="lg"
              radius="var(--mantine-radius-default)"
            >
              <IconBuildingStore size={20} />
            </ThemeIcon>
            <div>
              <Text fw={800} size="md">
                Supplier Profile
              </Text>
              <Text size="xs" c="dimmed">
                Vendor Specifications & Contacts
              </Text>
            </div>
          </Group>
        }
      >
        {(sup) => (
          <Stack gap="md" pt="xs">
            {/* Hero Identity Banner */}
            <Paper
              p="md"
              radius="var(--mantine-radius-default)"
              withBorder
              bg="var(--mantine-color-body)"
            >
              <Group justify="space-between" align="flex-start" mb="xs">
                <Badge color="blue" variant="filled" size="sm">
                  {sup.key}
                </Badge>
                <Badge
                  color={linkedProducts.length > 0 ? 'green' : 'gray'}
                  variant="light"
                  size="sm"
                >
                  {linkedProducts.length > 0 ? 'Active Supplier' : 'No Products Linked'}
                </Badge>
              </Group>

              <Text fw={800} size="lg" mb={4}>
                {sup.name}
              </Text>

              <Group
                gap="xs"
                mb={sup.email || sup.suppliedCategories.length > 0 ? 'xs' : 0}
                wrap="wrap"
              >
                <Group gap={6}>
                  <IconUser
                    size={15}
                    style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }}
                  />
                  <Text size="sm" fw={600} c="blue">
                    {sup.contactPerson}
                  </Text>
                  <Text size="xs" c="dimmed">
                    (Representative)
                  </Text>
                </Group>
                {sup.email && (
                  <Group gap={6}>
                    <IconMail size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
                    <Text size="xs" c="dimmed">
                      {sup.email}
                    </Text>
                  </Group>
                )}
              </Group>

              {sup.suppliedCategories.length > 0 && (
                <Group gap={6} mt="xs">
                  {sup.suppliedCategories.map((cat) => (
                    <Badge key={cat} color="gray" variant="outline" size="xs">
                      {cat}
                    </Badge>
                  ))}
                </Group>
              )}
            </Paper>

            {/* Financial & Activity Snapshot */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Activity & Spend Snapshot
            </Text>

            <Paper p="md" withBorder radius="var(--mantine-radius-default)">
              <Grid gap={0} align="flex-start">
                <Grid.Col
                  span={4}
                  pr="sm"
                  style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
                >
                  <Stack gap={2}>
                    <Group gap={4} wrap="nowrap">
                      <IconPackage
                        size={12}
                        style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }}
                      />
                      <Text size="xs" c="dimmed" tt="uppercase">
                        Products
                      </Text>
                    </Group>
                    <Group gap={4} align="baseline">
                      <Text fw={800} size="md" c="blue">
                        {loadingProducts ? '—' : linkedProducts.length}
                      </Text>
                      <Text size="xs" c="dimmed">
                        items
                      </Text>
                    </Group>
                  </Stack>
                </Grid.Col>

                <Grid.Col
                  span={4}
                  px="sm"
                  style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
                >
                  <Stack gap={2}>
                    <Group gap={4} wrap="nowrap">
                      <IconReceipt
                        size={12}
                        style={{ color: 'var(--mantine-color-teal-6)', flexShrink: 0 }}
                      />
                      <Text size="xs" c="dimmed" tt="uppercase">
                        Intakes
                      </Text>
                    </Group>
                    <Group gap={4} align="baseline">
                      <Text fw={800} size="md" c="teal">
                        {loadingPurchases ? '—' : purchases.length}
                      </Text>
                      <Text size="xs" c="dimmed">
                        orders
                      </Text>
                    </Group>
                  </Stack>
                </Grid.Col>

                <Grid.Col span={4} pl="sm">
                  <Stack gap={2}>
                    <Group gap={4} wrap="nowrap">
                      <IconTrendingUp
                        size={12}
                        style={{ color: 'var(--mantine-color-teal-6)', flexShrink: 0 }}
                      />
                      <Text size="xs" c="dimmed" tt="uppercase">
                        Total Spend
                      </Text>
                    </Group>
                    <Text fw={800} size="md" c="teal">
                      {loadingPurchases ? '—' : formatMoney(totalSpendCents)}
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>

            <Divider my="xs" />

            {/* Tabbed Relations & Activity Center */}
            <Tabs
              value={activeTab}
              onChange={(val) => {
                setActiveTab(val ?? 'products');
                resetLinkForm();
                resetIntakeForm();
              }}
              color="blue"
              mt="xs"
            >
              <Tabs.List>
                <Tabs.Tab
                  value="products"
                  rightSection={
                    <Badge size="xs" variant="light" color="gray" circle>
                      {linkedProducts.length}
                    </Badge>
                  }
                >
                  Products
                </Tabs.Tab>
                <Tabs.Tab
                  value="intake"
                  rightSection={
                    <Badge size="xs" variant="light" color="gray" circle>
                      {purchases.length}
                    </Badge>
                  }
                >
                  Stock Intake
                </Tabs.Tab>
                <Tabs.Tab value="details">Contact & Details</Tabs.Tab>
              </Tabs.List>
            </Tabs>

            {/* TAB 1: Linked Products */}
            {activeTab === 'products' && (
              <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      Linked Inventory Products
                    </Text>
                    <Group gap="xs">
                      <Tooltip label="Browse All Products" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          size="sm"
                          onClick={() => setPickerOpen(true)}
                        >
                          <IconSearch size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={linkFormOpen ? 'Cancel' : 'Link a product'} withArrow>
                        <ActionIcon
                          variant="light"
                          color={linkFormOpen ? 'gray' : 'blue'}
                          size="sm"
                          onClick={() => (linkFormOpen ? resetLinkForm() : setLinkFormOpen(true))}
                        >
                          <IconPlus
                            size={14}
                            style={{
                              transform: linkFormOpen ? 'rotate(45deg)' : 'none',
                              transition: 'transform 150ms ease',
                            }}
                          />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {/* Inline Link Form Collapse */}
                  <Collapse expanded={linkFormOpen}>
                    <Paper
                      p="sm"
                      withBorder
                      bg="var(--mantine-color-body)"
                      radius="var(--mantine-radius-default)"
                    >
                      <Stack gap="sm">
                        <Text size="xs" fw={700} c="blue" tt="uppercase">
                          Link Product to Supplier
                        </Text>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            Select Product *
                          </Text>
                          <Select
                            placeholder="Search product name or SKU"
                            data={linkProductSelectOptions}
                            value={linkProductKey}
                            onChange={handleLinkProductChange}
                            searchable
                            clearable
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <Grid gap="sm">
                          <Grid.Col span={6}>
                            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                              Supplier SKU (Optional)
                            </Text>
                            <TextInput
                              placeholder="e.g. SUP-1002"
                              value={linkSupplierSku}
                              onChange={(e) => setLinkSupplierSku(e.currentTarget.value)}
                              size={isMobile ? 'md' : 'sm'}
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                              Supplier Cost (Optional)
                            </Text>
                            <MoneyInput
                              valueCents={linkCostCents}
                              onChangeCents={setLinkCostCents}
                              size={isMobile ? 'md' : 'sm'}
                            />
                          </Grid.Col>
                        </Grid>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            Notes (Optional)
                          </Text>
                          <TextInput
                            placeholder="e.g. Minimum order quantity 10 units"
                            value={linkNotes}
                            onChange={(e) => setLinkNotes(e.currentTarget.value)}
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <Group justify="flex-end" gap="sm">
                          <Button variant="default" size="sm" onClick={resetLinkForm}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            color="blue"
                            onClick={handleLinkProductInline}
                            disabled={!linkProductKey}
                            loading={linkMutation.isPending}
                          >
                            Link Product
                          </Button>
                        </Group>
                      </Stack>
                    </Paper>
                  </Collapse>

                  {/* Products List / Empty State */}
                  {loadingProducts ? (
                    <Stack gap={6} py="xs">
                      <Skeleton height={48} radius="var(--mantine-radius-default)" />
                      <Skeleton height={48} radius="var(--mantine-radius-default)" />
                    </Stack>
                  ) : linkedProducts.length === 0 ? (
                    <Paper
                      p="md"
                      withBorder
                      radius="var(--mantine-radius-default)"
                      bg="var(--mantine-color-body)"
                    >
                      <Center py="sm">
                        <Stack gap={4} align="center">
                          <IconLink size={24} style={{ opacity: 0.4 }} />
                          <Text size="xs" c="dimmed" ta="center">
                            No products linked to this supplier yet.
                          </Text>
                          <Text
                            size="xs"
                            c="blue.6"
                            fw={700}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setLinkFormOpen(true)}
                          >
                            + Link an inventory item
                          </Text>
                        </Stack>
                      </Center>
                    </Paper>
                  ) : (
                    <ScrollArea.Autosize
                      mah="40dvh"
                      offsetScrollbars
                      classNames={{ viewport: 'scrollarea-fluid-content' }}
                    >
                      <Stack gap={6} pt={2} pb={2} px={1}>
                        {linkedProducts.map((lp: EnrichedLinkedProduct) => (
                          <Paper
                            key={lp.productKey}
                            p="xs"
                            withBorder
                            radius="var(--mantine-radius-default)"
                          >
                            <Group justify="space-between" align="center" wrap="nowrap">
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <Text size="sm" fw={700} lineClamp={1}>
                                  {lp.product.name}
                                </Text>
                                <Group gap={6} mt={2} wrap="wrap">
                                  <Badge size="xs" variant="filled" color="blue">
                                    {lp.product.sku}
                                  </Badge>
                                  <Badge size="xs" variant="light" color="gray">
                                    {lp.product.subcategory || lp.product.category}
                                  </Badge>
                                  {lp.costPriceCents ? (
                                    <Badge size="xs" variant="light" color="teal">
                                      Supplier Cost: {formatMoney(lp.costPriceCents)}
                                    </Badge>
                                  ) : (
                                    <Badge size="xs" variant="outline" color="gray">
                                      Default Cost: {formatMoney(lp.product.costPriceCents)}
                                    </Badge>
                                  )}
                                  {lp.supplierSku && (
                                    <Badge size="xs" variant="outline" color="blue">
                                      SKU: {lp.supplierSku}
                                    </Badge>
                                  )}
                                </Group>
                                {lp.notes && (
                                  <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
                                    {lp.notes}
                                  </Text>
                                )}
                              </div>
                              <Tooltip label="Unlink product" withArrow>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  size="sm"
                                  onClick={() => handleUnlink(lp.productKey)}
                                  loading={unlinkMutation.isPending}
                                >
                                  <IconUnlink size={14} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  )}
                </Stack>
              </Paper>
            )}

            {/* TAB 2: Stock Intake History */}
            {activeTab === 'intake' && (
              <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      Stock Intake History
                    </Text>
                    <Group gap="xs">
                      <Tooltip label="Advanced Receive Form" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="teal"
                          size="sm"
                          onClick={() => setReceiveStockOpen(true)}
                        >
                          <IconReceipt size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={intakeFormOpen ? 'Cancel' : 'Receive stock'} withArrow>
                        <ActionIcon
                          variant="light"
                          color={intakeFormOpen ? 'gray' : 'teal'}
                          size="sm"
                          onClick={() =>
                            intakeFormOpen ? resetIntakeForm() : setIntakeFormOpen(true)
                          }
                        >
                          <IconPlus
                            size={14}
                            style={{
                              transform: intakeFormOpen ? 'rotate(45deg)' : 'none',
                              transition: 'transform 150ms ease',
                            }}
                          />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>

                  {/* Inline Quick Intake Form Collapse */}
                  <Collapse expanded={intakeFormOpen}>
                    <Paper
                      p="sm"
                      withBorder
                      bg="var(--mantine-color-body)"
                      radius="var(--mantine-radius-default)"
                    >
                      <Stack gap="sm">
                        <Text size="xs" fw={700} c="teal" tt="uppercase">
                          Quick Stock Intake
                        </Text>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            Product *
                          </Text>
                          <Select
                            placeholder="Select product received"
                            data={intakeProductSelectOptions}
                            value={intakeProductKey}
                            onChange={handleIntakeProductChange}
                            searchable
                            clearable
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <Grid gap="sm">
                          <Grid.Col span={6}>
                            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                              Quantity Received *
                            </Text>
                            <NumberInput
                              placeholder="e.g. 20"
                              value={intakeQuantity}
                              onChange={(val) => setIntakeQuantity(val === '' ? '' : Number(val))}
                              min={1}
                              size={isMobile ? 'md' : 'sm'}
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                              Unit Cost *
                            </Text>
                            <MoneyInput
                              valueCents={intakeUnitCostCents}
                              onChangeCents={setIntakeUnitCostCents}
                              size={isMobile ? 'md' : 'sm'}
                            />
                          </Grid.Col>
                        </Grid>
                        <div>
                          <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                            Invoice / Reference No. (Optional)
                          </Text>
                          <TextInput
                            placeholder="e.g. INV-9021"
                            value={intakeReferenceNo}
                            onChange={(e) => setIntakeReferenceNo(e.currentTarget.value)}
                            size={isMobile ? 'md' : 'sm'}
                          />
                        </div>
                        <Group justify="flex-end" gap="sm">
                          <Button variant="default" size="sm" onClick={resetIntakeForm}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            color="teal"
                            onClick={handleRecordIntakeInline}
                            disabled={
                              !intakeProductKey || !intakeQuantity || Number(intakeQuantity) <= 0
                            }
                            loading={createPurchaseMutation.isPending}
                          >
                            Record Intake
                          </Button>
                        </Group>
                      </Stack>
                    </Paper>
                  </Collapse>

                  {/* Intake List / Empty State */}
                  {loadingPurchases ? (
                    <Stack gap={6} py="xs">
                      <Skeleton height={48} radius="var(--mantine-radius-default)" />
                      <Skeleton height={48} radius="var(--mantine-radius-default)" />
                    </Stack>
                  ) : purchases.length === 0 ? (
                    <Paper
                      p="md"
                      withBorder
                      radius="var(--mantine-radius-default)"
                      bg="var(--mantine-color-body)"
                    >
                      <Center py="sm">
                        <Stack gap={4} align="center">
                          <IconReceipt size={24} style={{ opacity: 0.4 }} />
                          <Text size="xs" c="dimmed" ta="center">
                            No stock intakes recorded for this supplier yet.
                          </Text>
                          <Text
                            size="xs"
                            c="teal.6"
                            fw={700}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setIntakeFormOpen(true)}
                          >
                            + Receive stock
                          </Text>
                        </Stack>
                      </Center>
                    </Paper>
                  ) : (
                    <ScrollArea.Autosize
                      mah="40dvh"
                      offsetScrollbars
                      classNames={{ viewport: 'scrollarea-fluid-content' }}
                    >
                      <Stack gap={6} pt={2} pb={2} px={1}>
                        {purchases.map((purchase) => (
                          <Paper
                            key={purchase.id}
                            p="xs"
                            withBorder
                            radius="var(--mantine-radius-default)"
                          >
                            <Group justify="space-between" align="center" wrap="nowrap">
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <Text size="sm" fw={700} lineClamp={1}>
                                  {purchase.product.name}
                                </Text>
                                <Group gap={6} mt={2} wrap="wrap">
                                  <Badge size="xs" variant="filled" color="blue">
                                    Qty: +{purchase.quantity}
                                  </Badge>
                                  <Badge size="xs" variant="light" color="teal">
                                    {formatMoney(purchase.totalCostCents)}
                                  </Badge>
                                  {purchase.unitCostCents && (
                                    <Badge size="xs" variant="outline" color="gray">
                                      Unit: {formatMoney(purchase.unitCostCents)}
                                    </Badge>
                                  )}
                                </Group>
                                <Text size="xs" c="dimmed" mt={4}>
                                  {formatDateTime(purchase.date)}{' '}
                                  {purchase.referenceNo && `• Ref: ${purchase.referenceNo}`}
                                </Text>
                              </div>
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    </ScrollArea.Autosize>
                  )}
                </Stack>
              </Paper>
            )}

            {/* TAB 3: Contact Details & Notes */}
            {activeTab === 'details' && (
              <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
                <Stack gap="md">
                  <div>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                      Contact Phone Numbers
                    </Text>
                    <PhoneDisplay
                      primaryPhone={sup.primaryPhone}
                      secondaryPhone={sup.secondaryPhone}
                      layout="stack"
                    />
                  </div>

                  <Divider color="var(--mantine-color-default-border)" />

                  <div>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                      Physical Location / Address
                    </Text>
                    <Group gap="xs" align="flex-start">
                      <IconMapPin
                        size={18}
                        style={{
                          color: 'var(--mantine-color-red-6)',
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      />
                      <Text size="sm" fw={500}>
                        {sup.address}
                      </Text>
                    </Group>
                  </div>

                  {sup.notes && (
                    <>
                      <Divider color="var(--mantine-color-default-border)" />
                      <div>
                        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                          Notes & Special Instructions
                        </Text>
                        <Paper
                          p="sm"
                          withBorder
                          bg="var(--mantine-color-body)"
                          radius="var(--mantine-radius-default)"
                        >
                          <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                            {sup.notes}
                          </Text>
                        </Paper>
                      </div>
                    </>
                  )}
                </Stack>
              </Paper>
            )}

            <Divider my="xs" />

            {/* System Metadata */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Metadata
            </Text>

            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconCalendar size={16} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    Registered On
                  </Text>
                </Group>
                <Text size="xs" fw={700}>
                  {formatDateTime(sup.createdAt)}
                </Text>
              </Group>

              <Group justify="space-between">
                <Group gap="xs">
                  <IconClock size={16} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    Last Updated
                  </Text>
                </Group>
                <Text size="xs" fw={700}>
                  {formatDateTime(sup.updatedAt)}
                </Text>
              </Group>

              <Group justify="space-between">
                <Group gap="xs">
                  <IconTag size={16} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    Supplier Key
                  </Text>
                </Group>
                <Text size="xs" fw={600} c="dimmed">
                  {sup.key}
                </Text>
              </Group>
            </Stack>

            <Divider my="xs" />

            {/* Action Buttons */}
            <Group justify="space-between" mt="md">
              <Button
                variant="light"
                color="red"
                size="sm"
                leftSection={<IconTrash size={16} />}
                onClick={() => onDelete(sup)}
              >
                Delete
              </Button>

              <Group gap="sm">
                <Button variant="default" size="sm" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  variant="filled"
                  color="blue"
                  size="sm"
                  leftSection={<IconEdit size={16} />}
                  onClick={() => onEdit(sup)}
                >
                  Edit Details
                </Button>
              </Group>
            </Group>
          </Stack>
        )}
      </DetailDrawer>

      <ProductPickerModal
        opened={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(productKey) => handleLinkFromPicker(productKey)}
        excludeKeys={linkedProducts.map((lp: EnrichedLinkedProduct) => lp.productKey)}
      />

      {supplier && (
        <ReceiveStockModal
          opened={receiveStockOpen}
          onClose={() => setReceiveStockOpen(false)}
          initialSupplierKey={supplier.key}
        />
      )}
    </>
  );
};
