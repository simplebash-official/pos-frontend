import { useMemo } from 'react';
import { Anchor, Box, Group, Paper, Stack, Text, TextInput, UnstyledButton } from '@mantine/core';
import { IconCheck, IconPackage } from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { SearchCombobox, type SearchComboboxItem } from '@/shared/components/SearchCombobox';
import { TablerIconPicker } from '@/shared/components/TablerIconPicker';
import { useValidCategories } from '@/features/inventory/hooks/useCategories';
import { CategoryColorPicker } from '@/features/inventory/components/CategoryManagerModal';
import { DEFAULT_CATEGORY_ICON } from '@/features/inventory/constants';
import {
  UNCATEGORIZED_CATEGORY_KEY,
  UNCATEGORIZED_SUBCATEGORY_KEY,
  type QuickAddCategory,
  type QuickAddSubcategory,
} from '@/features/inventory/lib/quickAddItem';

/** Starting picks for the icon and colour of a category made at the counter; both stay editable. */
const NEW_CATEGORY_START = { icon: 'Package', color: 'blue' } as const;

export interface QuickAddCategoryFieldsProps {
  category: QuickAddCategory | null;
  subcategory: QuickAddSubcategory | null;
  onChange: (category: QuickAddCategory | null, subcategory: QuickAddSubcategory | null) => void;
  errors: { category?: string; subcategory?: string };
  /** Only an Admin may make new categories and subcategories. */
  canCreate: boolean;
  disabled: boolean;
}

const sectionLabelStyle = { letterSpacing: '0.05em' } as const;

/**
 * Where the new item is filed. The built-in "Uncategorized" is one tap away for a cashier in a
 * hurry; an Admin can also pick an existing category, or make a new category or subcategory
 * without leaving the sale.
 */
export const QuickAddCategoryFields = ({
  category,
  subcategory,
  onChange,
  errors,
  canCreate,
  disabled,
}: QuickAddCategoryFieldsProps) => {
  const { data: valid, isLoading } = useValidCategories();

  const isUncategorized =
    category !== null &&
    category.kind === 'existing' &&
    category.key === UNCATEGORIZED_CATEGORY_KEY;

  const categoryItems = useMemo<SearchComboboxItem[]>(
    () =>
      valid
        .filter((c) => c.key !== UNCATEGORIZED_CATEGORY_KEY)
        .map((c) => ({ value: c.key, label: c.name })),
    [valid]
  );

  const subcategoryItems = useMemo<SearchComboboxItem[]>(() => {
    if (category === null || category.kind !== 'existing') return [];
    const chosen = valid.find((c) => c.key === category.key);
    return (chosen?.subcategories ?? []).map((s) => ({ value: s.key, label: s.name }));
  }, [valid, category]);

  const chooseUncategorized = () =>
    onChange(
      { kind: 'existing', key: UNCATEGORIZED_CATEGORY_KEY },
      { kind: 'existing', key: UNCATEGORIZED_SUBCATEGORY_KEY }
    );

  const chooseCategory = (key: string | null) => {
    if (key === null) {
      onChange(null, null);
      return;
    }
    const only = valid.find((c) => c.key === key)?.subcategories;
    // A category with a single subcategory has nothing left to choose.
    const next: QuickAddSubcategory | null =
      only !== undefined && only.length === 1 ? { kind: 'existing', key: only[0].key } : null;
    onChange({ kind: 'existing', key }, next);
  };

  return (
    <Stack gap="sm">
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={sectionLabelStyle}>
        {t('Where does it go?')}
      </Text>

      <UnstyledButton
        type="button"
        onClick={chooseUncategorized}
        disabled={disabled}
        aria-pressed={isUncategorized}
        data-testid="quick-add-uncategorized"
        style={{
          padding: '10px 12px',
          border: `1px solid ${isUncategorized ? 'var(--mantine-color-blue-6)' : 'var(--border)'}`,
          background: isUncategorized ? 'var(--mantine-color-blue-light)' : 'transparent',
          borderRadius: 'var(--mantine-radius-default)',
          minHeight: 44,
        }}
      >
        <Group gap="sm" wrap="nowrap" justify="space-between">
          <Group gap="sm" wrap="nowrap">
            <IconPackage size={20} />
            <Box>
              <Text size="sm" fw={600}>
                {t('Not sure? Put it in Uncategorized')}
              </Text>
              <Text size="xs" c="dimmed">
                {t('You can sort it into a category later from Inventory.')}
              </Text>
            </Box>
          </Group>
          {isUncategorized && <IconCheck size={18} color="var(--mantine-color-blue-6)" />}
        </Group>
      </UnstyledButton>

      {!isUncategorized && category !== null && category.kind === 'new' && (
        <NewCategoryCard
          category={category}
          subcategory={subcategory}
          onChange={onChange}
          errors={errors}
          disabled={disabled}
        />
      )}

      {!isUncategorized && (category === null || category.kind === 'existing') && (
        <>
          <SearchCombobox
            label={t('Category')}
            placeholder={t('Search or pick a category')}
            items={categoryItems}
            value={category !== null && category.kind === 'existing' ? category.key : null}
            onChange={chooseCategory}
            error={errors.category ?? null}
            loading={isLoading}
            disabled={disabled}
            emptyText={t('No categories match.')}
            create={
              canCreate
                ? {
                    labelFor: (typed) => `${t('+ Create category')} "${typed}"`,
                    emptyLabel: t('+ Create a new category'),
                    requiresName: false,
                    onCreate: (typed) =>
                      onChange(
                        {
                          kind: 'new',
                          name: typed,
                          icon: NEW_CATEGORY_START.icon,
                          color: NEW_CATEGORY_START.color,
                        },
                        { kind: 'new', name: '' }
                      ),
                  }
                : undefined
            }
            noCreateHint={canCreate ? undefined : t('To add a category, ask a manager.')}
          />

          {category !== null && category.kind === 'existing' && (
            <ExistingCategorySubcategory
              subcategory={subcategory}
              items={subcategoryItems}
              onChange={(next) => onChange(category, next)}
              error={errors.subcategory}
              canCreate={canCreate}
              disabled={disabled}
            />
          )}
        </>
      )}
    </Stack>
  );
};

interface ExistingCategorySubcategoryProps {
  subcategory: QuickAddSubcategory | null;
  items: SearchComboboxItem[];
  onChange: (subcategory: QuickAddSubcategory | null) => void;
  error: string | undefined;
  canCreate: boolean;
  disabled: boolean;
}

const ExistingCategorySubcategory = ({
  subcategory,
  items,
  onChange,
  error,
  canCreate,
  disabled,
}: ExistingCategorySubcategoryProps) => {
  if (subcategory !== null && subcategory.kind === 'new') {
    return (
      <Stack gap={4}>
        <TextInput
          label={t('New subcategory')}
          placeholder={t('For example: Cases')}
          value={subcategory.name}
          onChange={(e) => onChange({ kind: 'new', name: e.currentTarget.value })}
          error={error}
          disabled={disabled}
          required
          data-autofocus
        />
        <Anchor component="button" type="button" size="xs" onClick={() => onChange(null)}>
          {t('Pick an existing subcategory instead')}
        </Anchor>
      </Stack>
    );
  }

  return (
    <SearchCombobox
      label={t('Subcategory')}
      placeholder={t('Search or pick a subcategory')}
      items={items}
      value={subcategory !== null ? subcategory.key : null}
      onChange={(key) => onChange(key === null ? null : { kind: 'existing', key })}
      error={error ?? null}
      disabled={disabled}
      emptyText={t('No subcategories match.')}
      create={
        canCreate
          ? {
              labelFor: (typed) => `${t('+ Create subcategory')} "${typed}"`,
              emptyLabel: t('+ Create a new subcategory'),
              requiresName: false,
              onCreate: (typed) => onChange({ kind: 'new', name: typed }),
            }
          : undefined
      }
      noCreateHint={canCreate ? undefined : t('To add a subcategory, ask a manager.')}
    />
  );
};

interface NewCategoryCardProps {
  category: Extract<QuickAddCategory, { kind: 'new' }>;
  subcategory: QuickAddSubcategory | null;
  onChange: (category: QuickAddCategory | null, subcategory: QuickAddSubcategory | null) => void;
  errors: { category?: string; subcategory?: string };
  disabled: boolean;
}

/** The small form for a category made on the spot: its name, look, and first subcategory. */
const NewCategoryCard = ({
  category,
  subcategory,
  onChange,
  errors,
  disabled,
}: NewCategoryCardProps) => (
  <Paper withBorder p="sm">
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={700}>
          {t('New category')}
        </Text>
        <Anchor component="button" type="button" size="xs" onClick={() => onChange(null, null)}>
          {t('Pick an existing category instead')}
        </Anchor>
      </Group>
      <TextInput
        label={t('Category name')}
        value={category.name}
        onChange={(e) => onChange({ ...category, name: e.currentTarget.value }, subcategory)}
        error={errors.category}
        disabled={disabled}
        required
      />
      <Group align="flex-end" gap="lg">
        <TablerIconPicker
          value={category.icon}
          onChange={(icon) => onChange({ ...category, icon }, subcategory)}
          fallbackIcon={DEFAULT_CATEGORY_ICON}
          color={category.color}
        />
        <CategoryColorPicker
          value={category.color}
          onChange={(color) => onChange({ ...category, color }, subcategory)}
        />
      </Group>
      <TextInput
        label={t('First subcategory')}
        placeholder={t('For example: Cases')}
        value={subcategory !== null && subcategory.kind === 'new' ? subcategory.name : ''}
        onChange={(e) => onChange(category, { kind: 'new', name: e.currentTarget.value })}
        error={errors.subcategory}
        disabled={disabled}
        required
      />
    </Stack>
  </Paper>
);
