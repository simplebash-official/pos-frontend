import { useState } from 'react';
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
import { usePurchasesBySupplier } from '@/features/purchases/hooks/usePurchases';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { ProductPickerModal } from '@/features/inventory/components/ProductPickerModal';
import { ReceiveStockModal } from '@/features/purchases/components/ReceiveStockModal';

export interface SupplierDetailDrawerProps {
  supplier: Supplier | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

export function SupplierDetailDrawer({
  supplier,
  opened,
  onClose,
  onEdit,
  onDelete,
}: SupplierDetailDrawerProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [receiveStockOpen, setReceiveStockOpen] = useState(false);

  const { data: linkedProducts, isLoading: loadingProducts } = useProductsForSupplier(
    supplier?.key
  );
  const { data: purchases, isLoading: loadingPurchases } = usePurchasesBySupplier(supplier?.key);
  const unlinkMutation = useUnlinkProduct();
  const linkMutation = useLinkProduct();

  const handleLink = (productKey: string) => {
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
        onClose={onClose}
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
            {/* Header Banner */}
            <Paper
              p="md"
              radius="var(--mantine-radius-default)"
              withBorder
              bg="var(--mantine-color-body)"
            >
              <Text fw={800} size="lg" mb={4}>
                {sup.name}
              </Text>
              <Group gap="xs" mb="xs">
                <IconUser size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
                <Text size="sm" fw={600} c="blue">
                  {sup.contactPerson}
                </Text>
                <Text size="xs" c="dimmed">
                  (Representative Contact)
                </Text>
              </Group>
              {sup.email && (
                <Group gap="xs">
                  <IconMail size={14} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    {sup.email}
                  </Text>
                </Group>
              )}
            </Paper>

            {/* Contact Numbers */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Contact Phone Numbers
            </Text>
            <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
              <PhoneDisplay
                primaryPhone={sup.primaryPhone}
                secondaryPhone={sup.secondaryPhone}
                layout="stack"
              />
            </Paper>

            {/* Address */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              Physical Location / Address
            </Text>
            <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
              <Group gap="xs" align="flex-start">
                <IconMapPin
                  size={18}
                  style={{ color: 'var(--mantine-color-red-6)', marginTop: 2 }}
                />
                <div>
                  <Text size="sm" fw={500}>
                    {sup.address}
                  </Text>
                </div>
              </Group>
            </Paper>

            {/* What They Supply Tags */}
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              What They Supply (Categories & Tags)
            </Text>
            <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
              <Group gap={6}>
                <IconTag size={16} style={{ opacity: 0.6 }} />
                {sup.suppliedCategories.map((cat) => (
                  <Badge
                    key={cat}
                    color="blue"
                    variant="light"
                    size="sm"
                    radius="var(--mantine-radius-default)"
                  >
                    {cat}
                  </Badge>
                ))}
              </Group>
            </Paper>

            {/* Linked Products */}
            <Group justify="space-between" align="center">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Linked Inventory Products{' '}
                {loadingProducts ? (
                  <Skeleton
                    height={14}
                    width={24}
                    style={{ display: 'inline-block', verticalAlign: 'middle' }}
                  />
                ) : (
                  <Text component="span" c="blue" fw={800}>
                    ({linkedProducts.length})
                  </Text>
                )}
              </Text>
              <Tooltip label="Link a product" withArrow>
                <ActionIcon
                  variant="light"
                  color="blue"
                  size="sm"
                  onClick={() => setPickerOpen(true)}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {loadingProducts ? (
              <Stack gap={6} py="xs">
                <Skeleton height={48} radius="var(--mantine-radius-default)" />
                <Skeleton height={48} radius="var(--mantine-radius-default)" />
              </Stack>
            ) : linkedProducts.length === 0 ? (
              <Paper
                p="sm"
                withBorder
                radius="var(--mantine-radius-default)"
                bg="var(--mantine-color-body)"
              >
                <Center py="xs">
                  <Stack gap={4} align="center">
                    <IconLink size={20} style={{ opacity: 0.4 }} />
                    <Text size="xs" c="dimmed" ta="center">
                      No products linked yet. Click + to link inventory items.
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              <ScrollArea.Autosize mah={320} offsetScrollbars>
                <Stack gap={6} pt={4} pb={4} px={2}>
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
                          <Group gap={6} mt={2}>
                            <Badge size="xs" variant="filled" color="blue">
                              {lp.product.sku}
                            </Badge>
                            <Badge size="xs" variant="light" color="gray">
                              {lp.product.subcategory}
                            </Badge>
                            {lp.costPriceCents && (
                              <Badge size="xs" variant="light" color="teal">
                                Cost: {formatMoney(lp.costPriceCents)}
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

            {/* Purchase History */}
            <Group justify="space-between" align="center" mt="sm">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Stock Purchase History{' '}
                {loadingPurchases ? (
                  <Skeleton
                    height={14}
                    width={24}
                    style={{ display: 'inline-block', verticalAlign: 'middle' }}
                  />
                ) : (
                  <Text component="span" c="blue" fw={800}>
                    ({purchases.length})
                  </Text>
                )}
              </Text>
              <Tooltip label="Receive Stock" withArrow>
                <ActionIcon
                  variant="light"
                  color="teal"
                  size="sm"
                  onClick={() => setReceiveStockOpen(true)}
                >
                  <IconPlus size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>

            {loadingPurchases ? (
              <Stack gap={6} py="xs">
                <Skeleton height={48} radius="var(--mantine-radius-default)" />
                <Skeleton height={48} radius="var(--mantine-radius-default)" />
              </Stack>
            ) : purchases.length === 0 ? (
              <Paper
                p="sm"
                withBorder
                radius="var(--mantine-radius-default)"
                bg="var(--mantine-color-body)"
              >
                <Center py="xs">
                  <Stack gap={4} align="center">
                    <IconReceipt size={20} style={{ opacity: 0.4 }} />
                    <Text size="xs" c="dimmed" ta="center">
                      No purchase history yet. Click + to receive stock.
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              <ScrollArea.Autosize mah={320} offsetScrollbars>
                <Stack gap={6} pt={4} pb={4} px={2}>
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
                          <Group gap={6} mt={2}>
                            <Badge size="xs" variant="filled" color="blue">
                              Qty: {purchase.quantity}
                            </Badge>
                            <Badge size="xs" variant="light" color="teal">
                              {formatMoney(purchase.totalCostCents)}
                            </Badge>
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

            {/* Notes */}
            {sup.notes && (
              <>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Notes & Special Instructions
                </Text>
                <Paper
                  p="sm"
                  withBorder
                  radius="var(--mantine-radius-default)"
                  style={{ backgroundColor: 'var(--mantine-color-body)' }}
                >
                  <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                    {sup.notes}
                  </Text>
                </Paper>
              </>
            )}

            <Divider my="xs" />

            {/* Metadata */}
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconCalendar size={14} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    Registered On
                  </Text>
                </Group>
                <Text size="xs" fw={600}>
                  {formatDateTime(sup.createdAt)}
                </Text>
              </Group>

              <Group justify="space-between">
                <Group gap="xs">
                  <IconCalendar size={14} style={{ opacity: 0.6 }} />
                  <Text size="xs" c="dimmed">
                    Last Updated
                  </Text>
                </Group>
                <Text size="xs" fw={600}>
                  {formatDateTime(sup.updatedAt)}
                </Text>
              </Group>
            </Stack>

            <Divider my="xs" />

            {/* Actions */}
            <Group justify="space-between" mt="sm">
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
                <Button variant="default" size="sm" onClick={onClose}>
                  Close
                </Button>
                <Button
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
        onSelect={(productKey) => handleLink(productKey)}
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
}
