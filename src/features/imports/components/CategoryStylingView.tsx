import { createElement, useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  CheckIcon,
  Collapse,
  ColorSwatch,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconPalette,
  IconSearch,
  IconSparkles,
  IconX,
} from '@tabler/icons-react';
import { TablerIconPicker } from '@/shared/components/TablerIconPicker';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { t } from '@/shared/i18n/t';
import {
  CATEGORY_COLOR_OPTIONS,
  DEFAULT_CATEGORY_ICON,
  resolveCategoryIcon,
} from '@/features/inventory/constants';
import { useCategoryIcons } from '@/features/inventory/hooks/useCategories';
import type { DetectedCategory } from '../lib/categoryDetector';

export interface CategoryStylingViewProps {
  categories: DetectedCategory[];
  onChangeCategories: (categories: DetectedCategory[]) => void;
}

export function CategoryStylingView({ categories, onChangeCategories }: CategoryStylingViewProps) {
  const iconMap = useCategoryIcons();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleUpdate = (categoryName: string, updates: Partial<DetectedCategory>) => {
    const updated = categories.map((cat) =>
      cat.name === categoryName ? { ...cat, ...updates } : cat
    );
    onChangeCategories(updated);
  };

  const handleShuffleColors = () => {
    const updated = categories.map((cat, i) => {
      if (cat.isExisting) return cat;
      return {
        ...cat,
        color: CATEGORY_COLOR_OPTIONS[i % CATEGORY_COLOR_OPTIONS.length],
      };
    });
    onChangeCategories(updated);
  };

  const toggleExpand = (categoryName: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  const categoriesWithSubcategories = useMemo(
    () => categories.filter((c) => c.subcategories.length > 0),
    [categories]
  );

  const isAllExpanded =
    categoriesWithSubcategories.length > 0 &&
    categoriesWithSubcategories.every((c) => expandedCategories.has(c.name));

  const handleToggleExpandAll = () => {
    if (isAllExpanded) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(categoriesWithSubcategories.map((c) => c.name)));
    }
  };

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.subcategories.some((sub) => sub.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const newCount = categories.filter((c) => !c.isExisting).length;
  const existingCount = categories.filter((c) => c.isExisting).length;

  return (
    <Stack gap="sm">
      {/* Summary and Action Toolbar */}
      <Paper p="sm" withBorder bg="var(--mantine-color-body)">
        <Stack gap="xs">
          {/* Header Row: Title, Badges & Subtitle */}
          <div>
            <Group gap="xs" align="center" wrap="wrap">
              <Text fw={700} size="sm">
                {t('Detected Categories & Visual Styling')}
              </Text>
              <Badge color="blue" size="sm" variant="light">
                {categories.length} {t('Total')}
              </Badge>
              {newCount > 0 && (
                <Badge color="green" size="sm" variant="filled">
                  {newCount} {t('New')}
                </Badge>
              )}
              {existingCount > 0 && (
                <Badge color="gray" size="sm" variant="light">
                  {existingCount} {t('Existing')}
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" mt={2}>
              {t(
                'Customize icons and colors for imported categories. These will appear in the POS billing catalog and inventory manager.'
              )}
            </Text>
          </div>

          {/* Action & Filter Toolbar: Search on Left, Buttons on Right */}
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <TextInput
              placeholder={t('Search categories...')}
              leftSection={<IconSearch size={14} />}
              rightSection={
                searchQuery ? (
                  <IconX
                    size={14}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSearchQuery('')}
                  />
                ) : undefined
              }
              size="xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              style={{ flex: '1 1 200px', maxWidth: 280 }}
            />

            <Group gap="xs" wrap="nowrap">
              {categoriesWithSubcategories.length > 0 && (
                <Button
                  size="xs"
                  variant="default"
                  leftSection={
                    isAllExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
                  }
                  onClick={handleToggleExpandAll}
                >
                  {isAllExpanded ? t('Collapse All') : t('Expand All')}
                </Button>
              )}

              <Button
                size="xs"
                variant="default"
                leftSection={<IconPalette size={14} />}
                onClick={handleShuffleColors}
              >
                {t('Auto-assign Distinct Colors')}
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* Single-Column Full-Width Category Cards with Accordion Subcategories */}
      <ScrollArea.Autosize mah={isMobile ? '60vh' : 520} type="auto">
        <Stack gap="xs" style={{ width: '100%' }}>
          {filteredCategories.length === 0 ? (
            <Paper p="xl" withBorder style={{ textAlign: 'center' }}>
              <Text size="sm" c="dimmed">
                {t('No matching results found.')}
              </Text>
            </Paper>
          ) : (
            filteredCategories.map((cat) => {
              const iconEl = createElement(resolveCategoryIcon(iconMap, cat.icon), { size: 20 });
              const isExpanded = expandedCategories.has(cat.name);
              const hasSubcategories = cat.subcategories.length > 0;

              return (
                <Paper
                  key={cat.name}
                  withBorder
                  radius="var(--mantine-radius-default)"
                  bg="var(--mantine-color-body)"
                  style={{ width: '100%', overflow: 'hidden' }}
                >
                  {/* Category Main Row */}
                  <Group
                    justify="space-between"
                    align="center"
                    wrap="nowrap"
                    gap="sm"
                    p="xs"
                    px="sm"
                    style={{ minHeight: 52 }}
                  >
                    {/* Left: Category Icon & Visual Identity */}
                    <Group
                      gap="xs"
                      wrap="nowrap"
                      style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}
                    >
                      <ThemeIcon
                        size={36}
                        radius="var(--mantine-radius-default)"
                        color={cat.color}
                        variant="light"
                        style={{ flexShrink: 0 }}
                      >
                        {iconEl}
                      </ThemeIcon>
                      <div style={{ minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
                        <Group gap={6} wrap="nowrap" align="center">
                          <Tooltip
                            label={cat.name}
                            openDelay={300}
                            withArrow
                            disabled={cat.name.length < 24}
                          >
                            <Text fw={600} size="sm" truncate style={{ maxWidth: '100%' }}>
                              {cat.name}
                            </Text>
                          </Tooltip>
                          <Badge
                            size="xs"
                            color={cat.isExisting ? 'gray' : 'green'}
                            variant={cat.isExisting ? 'light' : 'filled'}
                            leftSection={!cat.isExisting ? <IconSparkles size={10} /> : undefined}
                            style={{ flexShrink: 0 }}
                          >
                            {cat.isExisting ? t('In Catalog') : t('New')}
                          </Badge>
                        </Group>
                        <Text size="xs" c="dimmed">
                          {cat.productCount} {cat.productCount === 1 ? t('item') : t('items')}
                        </Text>
                      </div>
                    </Group>

                    {/* Right: Customization Controls & Expand Chevron */}
                    <Group gap="xs" wrap="nowrap" align="center" style={{ flexShrink: 0 }}>
                      <TablerIconPicker
                        value={cat.icon}
                        onChange={(icon) => handleUpdate(cat.name, { icon })}
                        fallbackIcon={DEFAULT_CATEGORY_ICON}
                        color={cat.color}
                        label=""
                        showName={false}
                      />

                      <Group gap={4} wrap="nowrap">
                        {CATEGORY_COLOR_OPTIONS.map((c) => (
                          <Tooltip key={c} label={c} withArrow>
                            <ColorSwatch
                              color={`var(--mantine-color-${c}-6)`}
                              size={22}
                              radius="sm"
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleUpdate(cat.name, { color: c })}
                            >
                              {cat.color === c && <CheckIcon size={11} color="white" />}
                            </ColorSwatch>
                          </Tooltip>
                        ))}
                      </Group>

                      {hasSubcategories ? (
                        <Tooltip
                          label={
                            isExpanded
                              ? t('Collapse subcategories')
                              : `${t('Expand subcategories')} (${cat.subcategories.length})`
                          }
                          withArrow
                        >
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="sm"
                            aria-label={
                              isExpanded ? t('Collapse subcategories') : t('Expand subcategories')
                            }
                            onClick={() => toggleExpand(cat.name)}
                          >
                            {isExpanded ? (
                              <IconChevronUp size={16} />
                            ) : (
                              <IconChevronDown size={16} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Box style={{ width: 28 }} />
                      )}
                    </Group>
                  </Group>

                  {/* Collapsible Accordion Drawer for Subcategories */}
                  {hasSubcategories && (
                    <Collapse expanded={isExpanded}>
                      <Box
                        p="xs"
                        px="sm"
                        style={{
                          borderTop: '1px dashed var(--mantine-color-default-border)',
                          backgroundColor: 'var(--mantine-color-default-hover)',
                        }}
                      >
                        <Text size="xs" fw={600} c="dimmed" mb={6}>
                          {t('Subcategories discovered in file:')}
                        </Text>
                        <Group gap={6} wrap="wrap">
                          {cat.subcategories.map((sub) => (
                            <Badge key={sub} size="sm" variant="outline" color="gray">
                              {sub}
                            </Badge>
                          ))}
                        </Group>
                      </Box>
                    </Collapse>
                  )}
                </Paper>
              );
            })
          )}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
}
