import { createElement } from 'react';
import {
  Badge,
  Button,
  CheckIcon,
  ColorSwatch,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconPalette, IconSparkles } from '@tabler/icons-react';
import { TablerIconPicker } from '@/shared/components/TablerIconPicker';
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

  const handleUpdate = (index: number, updates: Partial<DetectedCategory>) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], ...updates };
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

  const newCount = categories.filter((c) => !c.isExisting).length;
  const existingCount = categories.filter((c) => c.isExisting).length;

  return (
    <Stack gap="md">
      <Paper p="sm" withBorder bg="var(--mantine-color-body)">
        <Group justify="space-between" wrap="wrap" gap="sm">
          <div>
            <Group gap="xs">
              <Text fw={700} size="sm">
                {t('Detected Categories & Visual Styling')}
              </Text>
              <Badge color="blue" size="sm" variant="light">
                {categories.length} {t('Total')}
              </Badge>
              {newCount > 0 && (
                <Badge color="green" size="sm" variant="filled">
                  {newCount} {t('New Categories')}
                </Badge>
              )}
              {existingCount > 0 && (
                <Badge color="gray" size="sm" variant="light">
                  {existingCount} {t('Existing')}
                </Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" mt={4}>
              {t(
                'Customize icons and colors for imported categories. These will appear in the POS billing catalog and inventory manager.'
              )}
            </Text>
          </div>

          <Button
            size="xs"
            variant="default"
            leftSection={<IconPalette size={14} />}
            onClick={handleShuffleColors}
          >
            {t('Auto-assign Distinct Colors')}
          </Button>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="sm">
        {categories.map((cat, idx) => {
          const iconEl = createElement(resolveCategoryIcon(iconMap, cat.icon), { size: 24 });

          return (
            <Paper
              key={cat.name}
              p="md"
              withBorder
              radius="var(--mantine-radius-default)"
              bg="var(--mantine-color-body)"
            >
              <Stack gap="xs">
                <Group justify="space-between" align="flex-start">
                  <Group gap="sm">
                    <ThemeIcon
                      size={44}
                      radius="var(--mantine-radius-default)"
                      color={cat.color}
                      variant="light"
                    >
                      {iconEl}
                    </ThemeIcon>
                    <div>
                      <Text fw={700} size="sm">
                        {cat.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {cat.productCount} {cat.productCount === 1 ? t('item') : t('items')} ·{' '}
                        {cat.subcategories.length} {t('subcategories')}
                      </Text>
                    </div>
                  </Group>

                  <Badge
                    size="xs"
                    color={cat.isExisting ? 'gray' : 'green'}
                    variant={cat.isExisting ? 'light' : 'filled'}
                    leftSection={!cat.isExisting ? <IconSparkles size={10} /> : undefined}
                  >
                    {cat.isExisting ? t('In Catalog') : t('New')}
                  </Badge>
                </Group>

                {/* Subcategories tags */}
                {cat.subcategories.length > 0 && (
                  <Group gap={4}>
                    {cat.subcategories.map((sub) => (
                      <Badge key={sub} size="xs" variant="outline" color="gray">
                        {sub}
                      </Badge>
                    ))}
                  </Group>
                )}

                {/* Customization Controls */}
                <Group
                  justify="space-between"
                  align="center"
                  mt="xs"
                  pt="xs"
                  style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
                >
                  <TablerIconPicker
                    value={cat.icon}
                    onChange={(icon) => handleUpdate(idx, { icon })}
                    fallbackIcon={DEFAULT_CATEGORY_ICON}
                    color={cat.color}
                    label={t('Icon')}
                  />

                  <div>
                    <Text size="xs" fw={500} c="dimmed" mb={4}>
                      {t('Color')}
                    </Text>
                    <Group gap={4}>
                      {CATEGORY_COLOR_OPTIONS.map((c) => (
                        <Tooltip key={c} label={c} withArrow>
                          <ColorSwatch
                            color={`var(--mantine-color-${c}-6)`}
                            size={24}
                            radius="sm"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleUpdate(idx, { color: c })}
                          >
                            {cat.color === c && <CheckIcon size={12} color="white" />}
                          </ColorSwatch>
                        </Tooltip>
                      ))}
                    </Group>
                  </div>
                </Group>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
