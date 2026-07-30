import { useState, useMemo } from 'react';
import {
  Modal,
  TextInput,
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Button,
  ScrollArea,
  Center,
  ThemeIcon,
  ActionIcon,
  Box,
} from '@mantine/core';
import {
  IconSearch,
  IconPackage,
  IconPlus,
  IconX,
  IconDeviceMobile,
  IconShirt,
  IconPrinter,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchProducts } from '@/features/inventory/api/mockProducts';
import { formatMoney } from '@/shared/lib/money';

export interface ProductPickerModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (productId: string) => void;
  /** Product IDs to exclude from the list (already linked). */
  excludeIds?: string[];
  title?: string;
}

const CATEGORY_ICONS: Record<string, typeof IconDeviceMobile> = {
  'Phone Repairs': IconDeviceMobile,
  'Mug, T-Shirt & Print Customization': IconShirt,
  'General Printing': IconPrinter,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Phone Repairs': 'blue',
  'Mug, T-Shirt & Print Customization': 'grape',
  'General Printing': 'teal',
};

export function ProductPickerModal({
  opened,
  onClose,
  onSelect,
  excludeIds = [],
  title = 'Link a Product',
}: ProductPickerModalProps) {
  const { data: products = [] } = useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: fetchProducts,
  });

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const excludeSet = new Set(excludeIds);
    return products
      .filter((p) => !excludeSet.has(p.id))
      .filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q)
        );
      });
  }, [products, excludeIds, search]);

  const handleSelect = (productId: string) => {
    onSelect(productId);
    setSearch('');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        setSearch('');
        onClose();
      }}
      title={
        <Group gap="sm">
          <ThemeIcon color="blue" variant="light" size="lg" radius="var(--mantine-radius-default)">
            <IconPackage size={22} />
          </ThemeIcon>
          <div>
            <Text fw={800} size="md">
              {title}
            </Text>
            <Text size="xs" c="dimmed">
              Select an inventory item to link to this vendor
            </Text>
          </div>
        </Group>
      }
      size={720}
      radius="var(--mantine-radius-default)"
      padding="lg"
    >
      <Stack gap="md">
        {/* Search Bar */}
        <TextInput
          placeholder="Search by product name, SKU, or category…"
          leftSection={<IconSearch size={16} />}
          rightSection={
            search ? (
              <ActionIcon variant="subtle" size="sm" onClick={() => setSearch('')}>
                <IconX size={14} />
              </ActionIcon>
            ) : (
              <Badge size="xs" variant="light" color="blue">
                {filtered.length}
              </Badge>
            )
          }
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          autoFocus
          radius="var(--mantine-radius-default)"
        />

        {/* Product List */}
        <ScrollArea.Autosize mah={440} offsetScrollbars>
          <Stack gap="xs" pt={6} pb={6} px={4}>
            {filtered.length === 0 ? (
              <Paper p="xl" withBorder radius="var(--mantine-radius-default)" bg="var(--mantine-color-body)">
                <Center>
                  <Stack gap={6} align="center">
                    <IconPackage size={32} style={{ opacity: 0.3 }} />
                    <Text c="dimmed" size="sm" ta="center">
                      {products.length === excludeIds.length
                        ? 'All available products are already linked.'
                        : 'No inventory items match your search criteria.'}
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              filtered.map((p) => {
                const CatIcon = CATEGORY_ICONS[p.category] || IconPackage;
                const catColor = CATEGORY_COLORS[p.category] || 'blue';
                const isLowStock = p.stockQuantity <= p.minStockThreshold;

                return (
                  <Paper
                    key={p.id}
                    p="md"
                    radius="var(--mantine-radius-default)"
                    className="picker-card"
                    onClick={() => handleSelect(p.id)}
                  >
                    <Group justify="space-between" align="center" wrap="nowrap" gap="md">
                      {/* Left Icon & Info */}
                      <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }} align="flex-start">
                        <ThemeIcon
                          color={catColor}
                          variant="light"
                          size="xl"
                          radius="var(--mantine-radius-default)"
                          style={{ flexShrink: 0, marginTop: 2 }}
                        >
                          <CatIcon size={22} />
                        </ThemeIcon>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Text size="sm" fw={700} lineClamp={2} style={{ lineHeight: 1.3 }}>
                            {p.name}
                          </Text>

                          <Group gap={6} mt={6} wrap="wrap">
                            <Badge size="xs" variant="filled" color="blue" radius="var(--mantine-radius-default)">
                              {p.sku}
                            </Badge>
                            <Badge size="xs" variant="light" color={catColor} radius="var(--mantine-radius-default)">
                              {p.subcategory}
                            </Badge>
                            <Badge
                              size="xs"
                              variant="subtle"
                              color={isLowStock ? 'red' : 'gray'}
                              radius="var(--mantine-radius-default)"
                            >
                              {p.stockQuantity} in stock
                            </Badge>
                          </Group>
                        </div>
                      </Group>

                      {/* Right Price & Link Action */}
                      <Group gap="md" wrap="nowrap" style={{ flexShrink: 0 }} align="center">
                        <Box style={{ textAlign: 'right' }}>
                          <Text size="10px" c="dimmed" tt="uppercase" fw={700}>
                            Default Cost
                          </Text>
                          <Text size="sm" fw={800} c="blue">
                            {formatMoney(p.costPriceCents)}
                          </Text>
                        </Box>

                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          leftSection={<IconPlus size={14} />}
                          radius="var(--mantine-radius-default)"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(p.id);
                          }}
                        >
                          Link
                        </Button>
                      </Group>
                    </Group>
                  </Paper>
                );
              })
            )}
          </Stack>
        </ScrollArea.Autosize>

        {/* Footer */}
        <Group justify="space-between" align="center" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <Text size="xs" c="dimmed" fw={500}>
            Showing {filtered.length} of {products.length - excludeIds.length} available items
          </Text>

          <Button
            variant="default"
            size="xs"
            onClick={() => {
              setSearch('');
              onClose();
            }}
            radius="var(--mantine-radius-default)"
          >
            Cancel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
