import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Collapse,
  Group,
  Paper,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconLink, IconPlus, IconUnlink } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import {
  useLinkProduct,
  useUnlinkProduct,
  type EnrichedLinkedSupplier,
} from '@/features/supplier-products/hooks/useSupplierProducts';
import type { Product } from '../types';

export interface SupplierOption {
  value: string;
  label: string;
}

export interface ItemSuppliersPanelProps {
  product: Product;
  linked: EnrichedLinkedSupplier[];
  loading: boolean;
  supplierOptions: SupplierOption[];
  formOpen: boolean;
  onFormOpenChange: (open: boolean) => void;
}

/** Who supplies this item, and the form that links another supplier to it. */
export const ItemSuppliersPanel = ({
  product,
  linked,
  loading,
  supplierOptions,
  formOpen,
  onFormOpenChange,
}: ItemSuppliersPanelProps) => {
  const isMobile = useIsMobile();
  const fieldSize = isMobile ? 'md' : 'sm';
  const [supplierKey, setSupplierKey] = useState<string | null>(null);
  const [supplierSku, setSupplierSku] = useState('');
  const linkMutation = useLinkProduct();
  const unlinkMutation = useUnlinkProduct();

  const closeForm = () => {
    onFormOpenChange(false);
    setSupplierKey(null);
    setSupplierSku('');
  };

  const link = () => {
    if (!supplierKey) return;
    linkMutation.mutate(
      { supplierKey, productKey: product.key, supplierSku: supplierSku.trim() || undefined },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Supplier Linked',
            message: 'Supplier has been linked to this product.',
            color: 'teal',
          });
          closeForm();
        },
      }
    );
  };

  const unlink = (key: string) =>
    unlinkMutation.mutate(
      { supplierKey: key, productKey: product.key },
      {
        onSuccess: () => {
          notifications.show({
            title: 'Supplier Unlinked',
            message: 'Supplier has been removed from this product.',
            color: 'orange',
          });
        },
      }
    );

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={700}>
          {t('Linked Suppliers')}
        </Text>
        {!formOpen && (
          <Button
            variant="light"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={() => onFormOpenChange(true)}
          >
            {t('Link a supplier')}
          </Button>
        )}
      </Group>

      <Collapse expanded={formOpen}>
        <Paper p="md" bg="var(--bg-app)">
          <Stack gap="sm">
            <Select
              label={t('Supplier')}
              placeholder={t('Select supplier')}
              data={supplierOptions}
              value={supplierKey}
              onChange={setSupplierKey}
              searchable
              size={fieldSize}
            />
            <TextInput
              label={t('Supplier SKU / Ref (optional)')}
              placeholder={t('e.g. TPL-SCR-9981')}
              value={supplierSku}
              onChange={(e) => setSupplierSku(e.currentTarget.value)}
              size={fieldSize}
            />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" size="sm" onClick={closeForm}>
                {t('Cancel')}
              </Button>
              <Button
                size="sm"
                color="blue"
                onClick={link}
                disabled={!supplierKey}
                loading={linkMutation.isPending}
              >
                {t('Link Supplier')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Collapse>

      {loading ? (
        <Stack gap={6}>
          <Skeleton height={52} />
          <Skeleton height={52} />
        </Stack>
      ) : linked.length === 0 ? (
        <Center py="md">
          <Stack gap={6} align="center">
            <IconLink size={22} style={{ opacity: 0.4 }} />
            <Text size="sm" c="dimmed" ta="center">
              {t('No suppliers linked yet.')}
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap={0}>
          {linked.map((ls, index) => (
            <Group
              key={ls.supplierKey}
              justify="space-between"
              align="center"
              wrap="nowrap"
              py="xs"
              style={{ borderTop: index === 0 ? undefined : '1px solid var(--border)' }}
            >
              <Box style={{ minWidth: 0, flex: 1 }}>
                <Text size="sm" fw={700} lineClamp={1}>
                  {ls.supplier.name}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {ls.supplier.contactPerson} · {ls.supplier.primaryPhone}
                </Text>
                <Group gap={4} mt={4}>
                  {ls.costPriceCents && (
                    <Badge size="xs" variant="light" color="teal">
                      {t('Supplier Cost:')} {formatMoney(ls.costPriceCents)}
                    </Badge>
                  )}
                  {ls.supplierSku && (
                    <Badge size="xs" variant="outline" color="gray">
                      {t('SKU:')} {ls.supplierSku}
                    </Badge>
                  )}
                </Group>
                {ls.notes && (
                  <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
                    {ls.notes}
                  </Text>
                )}
              </Box>
              <Tooltip label={t('Unlink supplier')} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size={isMobile ? 44 : 'md'}
                  onClick={() => unlink(ls.supplierKey)}
                  loading={unlinkMutation.isPending}
                  aria-label={t('Unlink supplier')}
                >
                  <IconUnlink size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
