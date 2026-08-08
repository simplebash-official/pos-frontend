import { createElement, useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  TextInput,
  TagsInput,
  Button,
  ActionIcon,
  Divider,
  Paper,
  Tooltip,
  ColorSwatch,
  CheckIcon,
  Skeleton,
} from '@mantine/core';
import { IconPlus, IconTrash, IconCategory, IconEdit, IconX, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  useCategories,
  useCategoryIcons,
  useCreateCategory,
  useUpdateCategory,
  useCreateSubcategory,
  useDeleteCategory,
  useDeleteSubcategory,
} from '../hooks/useCategories';
import { CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon } from '../constants';
import { Category } from '../types';
import { TablerIconPicker } from '@/shared/components/TablerIconPicker';
import {
  ExpandableCard,
  ExpandableCardGroup,
  ExpandableCardAction,
} from '@/shared/components/ExpandableCard';
import { ApiError } from '@/shared/types/common';

export interface CategoryManagerModalProps {
  opened: boolean;
  onClose: () => void;
}

function CategoryColorPicker({
  value,
  onChange,
  label = 'Color',
}: {
  value: string | null;
  onChange: (color: string) => void;
  label?: string;
}) {
  return (
    <Stack gap={4}>
      {label && (
        <Text size="xs" fw={500} c="dimmed">
          {label}
        </Text>
      )}
      <Group gap={6}>
        {CATEGORY_COLOR_OPTIONS.map((color) => (
          <Tooltip key={color} label={color} withArrow>
            <ColorSwatch
              color={`var(--mantine-color-${color}-6)`}
              size={38}
              radius="default"
              style={{ cursor: 'pointer' }}
              onClick={() => onChange(color)}
            >
              {value === color && <CheckIcon size={14} color="white" />}
            </ColorSwatch>
          </Tooltip>
        ))}
      </Group>
    </Stack>
  );
}

function AddSubcategoryRow({ categoryKey }: { categoryKey: string }) {
  const [name, setName] = useState('');
  const createSubcategory = useCreateSubcategory();

  const handleAdd = () => {
    if (!name.trim()) return;
    createSubcategory.mutate(
      { categoryKey, name: name.trim() },
      {
        onSuccess: () => setName(''),
        onError: (err) => {
          notifications.show({
            title: 'Could not add subcategory',
            message: (err as ApiError).message,
            color: 'red',
          });
        },
      }
    );
  };

  return (
    <Group gap="xs">
      <TextInput
        placeholder="New subcategory name"
        size="xs"
        style={{ flex: 1 }}
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        }}
      />
      <Button size="xs" variant="light" onClick={handleAdd} loading={createSubcategory.isPending}>
        Add
      </Button>
    </Group>
  );
}

function CategoryItem({
  category,
  onDeleteCategory,
  onDeleteSubcategory,
  onExpandCategory,
}: {
  category: Category;
  onDeleteCategory: (categoryKey: string) => void;
  onDeleteSubcategory: (categoryKey: string, subcategoryKey: string) => void;
  onExpandCategory: (categoryKey: string) => void;
}) {
  const iconMap = useCategoryIcons();
  const updateCategory = useUpdateCategory();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editIcon, setEditIcon] = useState<string | null>(category.icon);
  const [editColor, setEditColor] = useState<string | null>(category.color);
  const [editNameError, setEditNameError] = useState<string | undefined>();

  const catIconEl = createElement(resolveCategoryIcon(iconMap, category.icon), { size: 20 });

  const startEditing = () => {
    setEditName(category.name);
    setEditIcon(category.icon);
    setEditColor(category.color);
    setEditNameError(undefined);
    setIsEditing(true);
    onExpandCategory(category.key);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editIcon || !editColor) return;
    updateCategory.mutate(
      {
        categoryKey: category.key,
        updates: { name: editName.trim(), icon: editIcon, color: editColor },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          notifications.show({
            title: 'Category Updated',
            message: `Saved changes to ${editName.trim()}`,
            color: 'teal',
          });
        },
        onError: (err) => {
          const apiError = err as ApiError;
          if (apiError.code === 'CATEGORY_ALREADY_EXISTS') {
            setEditNameError(apiError.message);
          }
          notifications.show({
            title: 'Could not update category',
            message: apiError.message,
            color: 'red',
          });
        },
      }
    );
  };

  return (
    <ExpandableCard
      value={category.key}
      color={category.color}
      icon={catIconEl}
      title={category.name}
      subtitle={
        category.subcategories.length === 0
          ? 'No subcategories'
          : `${category.subcategories.length} subcategor${category.subcategories.length === 1 ? 'y' : 'ies'}`
      }
      actions={
        <>
          <ExpandableCardAction
            icon={<IconEdit size={16} />}
            tooltip="Edit category"
            color="blue"
            onClick={startEditing}
          />
          <ExpandableCardAction
            icon={<IconTrash size={16} />}
            tooltip="Delete category"
            color="red"
            onClick={() => onDeleteCategory(category.key)}
          />
        </>
      }
    >
      <Stack gap="sm" pt="xs">
        {isEditing && (
          <Paper p="sm" withBorder style={{ backgroundColor: 'var(--mantine-color-body)' }}>
            <Stack gap="xs">
              <Text size="xs" fw={600} c="dimmed">
                Edit Category Details
              </Text>
              <TextInput
                label="Category name"
                size="xs"
                value={editName}
                onChange={(e) => {
                  setEditName(e.currentTarget.value);
                  if (editNameError) setEditNameError(undefined);
                }}
                error={editNameError}
              />
              <Group align="flex-end" gap="md">
                <TablerIconPicker
                  value={editIcon}
                  onChange={setEditIcon}
                  fallbackIcon={DEFAULT_CATEGORY_ICON}
                  color={editColor}
                />
                <CategoryColorPicker value={editColor} onChange={setEditColor} />
              </Group>
              <Group justify="flex-end" gap="xs" mt="xs">
                <Button
                  size="xs"
                  variant="default"
                  leftSection={<IconX size={14} />}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="xs"
                  leftSection={<IconCheck size={14} />}
                  onClick={handleSaveEdit}
                  loading={updateCategory.isPending}
                  disabled={!editName.trim() || !editIcon || !editColor}
                >
                  Save Changes
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}

        <Stack gap={6}>
          <Text size="xs" fw={600} c="dimmed">
            Subcategories
          </Text>
          {category.subcategories.map((sub) => (
            <Paper
              key={sub.key}
              px="sm"
              py="xs"
              withBorder
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--mantine-color-default-hover)',
              }}
            >
              <Text size="xs" fw={500}>
                {sub.name}
              </Text>
              <Tooltip label="Delete subcategory" withArrow>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => onDeleteSubcategory(category.key, sub.key)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Paper>
          ))}
          <AddSubcategoryRow categoryKey={category.key} />
        </Stack>
      </Stack>
    </ExpandableCard>
  );
}

export function CategoryManagerModal({ opened, onClose }: CategoryManagerModalProps) {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const deleteSubcategory = useDeleteSubcategory();

  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState<string | null>('Package');
  const [newColor, setNewColor] = useState<string | null>('blue');
  const [newSubcategories, setNewSubcategories] = useState<string[]>([]);
  const [newNameError, setNewNameError] = useState<string | undefined>();

  const [expandedValues, setExpandedValues] = useState<string[]>([]);

  const handleExpandCategory = (key: string) => {
    setExpandedValues((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const handleCreateCategory = () => {
    if (!newName.trim() || !newIcon || !newColor) return;
    createCategory.mutate(
      { name: newName.trim(), icon: newIcon, color: newColor, subcategories: newSubcategories },
      {
        onSuccess: () => {
          setNewName('');
          setNewSubcategories([]);
          setNewNameError(undefined);
          notifications.show({
            title: 'Category Created',
            message: `${newName.trim()} added to the catalog`,
            color: 'green',
          });
        },
        onError: (err) => {
          const apiError = err as ApiError;
          if (apiError.code === 'CATEGORY_ALREADY_EXISTS') {
            setNewNameError(apiError.message);
          }
          notifications.show({
            title: 'Could not create category',
            message: apiError.message,
            color: 'red',
          });
        },
      }
    );
  };

  const handleDeleteCategory = (categoryKey: string) => {
    deleteCategory.mutate(categoryKey, {
      onError: (err) => {
        notifications.show({
          title: 'Could not delete category',
          message: (err as ApiError).message,
          color: 'red',
        });
      },
    });
  };

  const handleDeleteSubcategory = (categoryKey: string, subcategoryKey: string) => {
    deleteSubcategory.mutate(
      { categoryKey, subcategoryKey },
      {
        onError: (err) => {
          notifications.show({
            title: 'Could not delete subcategory',
            message: (err as ApiError).message,
            color: 'red',
          });
        },
      }
    );
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Manage Categories" size="lg" centered>
      <Stack gap="md">
        <Paper p="sm" withBorder>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">
            Add New Category
          </Text>
          <Stack gap="xs">
            <TextInput
              placeholder="Category name"
              value={newName}
              onChange={(e) => {
                setNewName(e.currentTarget.value);
                if (newNameError) setNewNameError(undefined);
              }}
              error={newNameError}
            />
            <Group align="flex-end" gap="lg">
              <TablerIconPicker
                value={newIcon}
                onChange={setNewIcon}
                fallbackIcon={DEFAULT_CATEGORY_ICON}
                color={newColor}
              />
              <CategoryColorPicker value={newColor} onChange={setNewColor} />
            </Group>
            <TagsInput
              placeholder="Initial subcategories (press Enter after each)"
              value={newSubcategories}
              onChange={setNewSubcategories}
            />
            <Group justify="flex-end">
              <Button
                size="sm"
                leftSection={<IconPlus size={14} />}
                onClick={handleCreateCategory}
                loading={createCategory.isPending}
                disabled={!newName.trim()}
              >
                Add Category
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Divider label="Existing Categories" labelPosition="center" />

        {isLoading ? (
          <Stack gap="xs">
            <Skeleton height={44} radius="var(--mantine-radius-default)" />
            <Skeleton height={44} radius="var(--mantine-radius-default)" />
            <Skeleton height={44} radius="var(--mantine-radius-default)" />
          </Stack>
        ) : (
          <ExpandableCardGroup value={expandedValues} onChange={setExpandedValues} multiple>
            {categories.map((cat) => (
              <CategoryItem
                key={cat.key}
                category={cat}
                onDeleteCategory={handleDeleteCategory}
                onDeleteSubcategory={handleDeleteSubcategory}
                onExpandCategory={handleExpandCategory}
              />
            ))}
            {categories.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                <IconCategory size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                No categories yet — add one above.
              </Text>
            )}
          </ExpandableCardGroup>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
