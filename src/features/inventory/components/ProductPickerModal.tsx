import { t } from '@/shared/i18n/t';
import { useState, useMemo } from 'react';
import {
  Modal,
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
  Skeleton,
} from '@mantine/core';
import { IconSearch, IconPackage, IconPlus, IconX } from '@tabler/icons-react';
import { useAllProducts } from '../hooks/useProducts';
import { useCategoryIcons, useCategoryLookup } from '../hooks/useCategories';
import { resolveCategoryIcon } from '../constants';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { SearchHighlight } from '@/shared/components/SearchHighlight';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import { PRODUCT_SEARCH_FIELDS } from '@/shared/lib/searchFields';

/** How many rows the picker draws at once. Beyond this the user should keep typing. */
const VISIBLE_RESULT_LIMIT = 50;

export interface ProductPickerModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (productKey: string) => void;
  /** Product keys to exclude from the list (already linked). */
  excludeKeys?: string[];
  title?: string;
}

export const ProductPickerModal = ({
  opened,
  onClose,
  onSelect,
  excludeKeys = [],
  title = 'Link a Product',
}: ProductPickerModalProps) => {
  const { data: products, isLoading } = useAllProducts({ enabled: opened });
  const { getCategory } = useCategoryLookup();
  const iconMap = useCategoryIcons();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState('');

  // Memoized on a signature rather than the array itself: `excludeKeys` defaults
  // to a fresh `[]` each render, which would otherwise rebuild the search index
  // on every keystroke.
  const excludeSignature = excludeKeys.join('|');
  const available = useMemo(() => {
    const excludeSet = new Set(excludeSignature ? excludeSignature.split('|') : []);
    return products.filter((p) => !excludeSet.has(p.key));
  }, [products, excludeSignature]);

  const { results: filtered, terms: searchTerms } = useEntitySearch(
    available,
    PRODUCT_SEARCH_FIELDS,
    search,
    null
  );

  const visible = useMemo(() => filtered.slice(0, VISIBLE_RESULT_LIMIT), [filtered]);

  const handleSelect = (productKey: string) => {
    onSelect(productKey);
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
        <Text fw={700} size="lg">
          {title}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
      padding="lg"
    >
      <Stack gap="md">
        {/* Search Bar */}
        <SearchHistoryInput
          namespace="inventory_picker"
          placeholder={t('Search by product name, SKU, or category…')}
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
          onValueChange={setSearch}
          autoFocus={!isMobile}
        />

        {/* Product List */}
        <ScrollArea.Autosize
          mah="60dvh"
          offsetScrollbars
          classNames={{ viewport: 'scrollarea-fluid-content' }}
        >
          <Stack gap="xs" pt={6} pb={6} px={4}>
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => (
                <Paper
                  key={`prod-skel-${i}`}
                  p="md"
                  radius="var(--mantine-radius-default)"
                  withBorder
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <Skeleton height={36} width={36} />
                      <div>
                        <Skeleton height={16} width={140} mb={4} />
                        <Skeleton height={12} width={90} />
                      </div>
                    </Group>
                    <Skeleton height={20} width={60} />
                  </Group>
                </Paper>
              ))
            ) : filtered.length === 0 ? (
              <Paper
                p="xl"
                withBorder
                radius="var(--mantine-radius-default)"
                bg="var(--mantine-color-body)"
              >
                <Center>
                  <Stack gap={6} align="center">
                    <IconPackage size={32} style={{ opacity: 0.3 }} />
                    <Text c="dimmed" size="sm" ta="center">
                      {products.length === excludeKeys.length
                        ? 'All available products are already linked.'
                        : 'No inventory items match your search criteria.'}
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              visible.map((p) => {
                const category = getCategory(p.categoryKey);
                const CatIcon = category
                  ? resolveCategoryIcon(iconMap, category.icon)
                  : IconPackage;
                const catColor = category?.color ?? 'blue';
                const isLowStock = p.stockQuantity <= p.minStockThreshold;

                return (
                  <Paper
                    key={p.key}
                    p="md"
                    radius="var(--mantine-radius-default)"
                    className="picker-card"
                    onClick={() => handleSelect(p.key)}
                  >
                    <Group
                      justify="space-between"
                      align="center"
                      wrap={isMobile ? 'wrap' : 'nowrap'}
                      gap="md"
                    >
                      {/* Left Icon & Info */}
                      <Group
                        gap="md"
                        wrap="nowrap"
                        style={{ minWidth: 0, flex: 1 }}
                        align="flex-start"
                      >
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
                            <SearchHighlight text={p.name} terms={searchTerms} />
                          </Text>

                          <Group gap={6} mt={6} wrap="wrap">
                            <Badge
                              size="xs"
                              variant="filled"
                              color="blue"
                              radius="var(--mantine-radius-default)"
                            >
                              <SearchHighlight text={p.sku} terms={searchTerms} />
                            </Badge>
                            <Badge
                              size="xs"
                              variant="light"
                              color={catColor}
                              radius="var(--mantine-radius-default)"
                            >
                              {p.subcategory}
                            </Badge>
                            <Badge
                              size="xs"
                              variant="subtle"
                              color={isLowStock ? 'red' : 'gray'}
                              radius="var(--mantine-radius-default)"
                            >
                              {p.stockQuantity} {t('in stock')}
                            </Badge>
                          </Group>
                        </div>
                      </Group>

                      {/* Right Price & Link Action */}
                      <Group gap="md" wrap="nowrap" style={{ flexShrink: 0 }} align="center">
                        <Box style={{ textAlign: 'left' }}>
                          <Text size="10px" c="dimmed" tt="uppercase" fw={700}>
                            {t('Default Cost')}
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
                            handleSelect(p.key);
                          }}
                        >
                          {t('Link')}
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
        <Group
          justify="space-between"
          align="center"
          pt="xs"
          style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
        >
          <Text size="xs" c="dimmed" fw={500}>
            {filtered.length > visible.length
              ? `Showing the closest ${visible.length} of ${filtered.length} matches — keep typing to narrow it down`
              : `Showing ${filtered.length} of ${available.length} available items`}
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
            {t('Cancel')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
