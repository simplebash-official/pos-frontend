import { createElement, useState } from 'react';
import {
  Modal,
  Stack,
  Accordion,
  Group,
  Text,
  Badge,
  TextInput,
  TagsInput,
  Button,
  ActionIcon,
  ThemeIcon,
  Divider,
  Paper,
  Tooltip,
  ColorSwatch,
  CheckIcon,
} from '@mantine/core';
import { IconPlus, IconTrash, IconCategory, IconEdit, IconX, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useCreateSubcategory,
  useDeleteCategory,
  useDeleteSubcategory,
} from '../hooks/useCategories';
import { CATEGORY_COLOR_OPTIONS, DEFAULT_CATEGORY_ICON, resolveCategoryIcon } from '../constants';
import { Category } from '../types';
import { TablerIconPicker } from '@/shared/components/TablerIconPicker';
import { useTablerIconMap } from '@/shared/lib/tablerIcons';
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
              size={26}
              style={{ cursor: 'pointer' }}
              onClick={() => onChange(color)}
            >
              {value === color && <CheckIcon size={11} color="white" />}
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
}: {
  category: Category;
  onDeleteCategory: (categoryKey: string) => void;
  onDeleteSubcategory: (categoryKey: string, subcategoryKey: string) => void;
}) {
  const iconMap = useTablerIconMap();
  const updateCategory = useUpdateCategory();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editIcon, setEditIcon] = useState<string | null>(category.icon);
  const [editColor, setEditColor] = useState<string | null>(category.color);

  const catIconEl = createElement(resolveCategoryIcon(iconMap, category.icon), { size: 16 });

  const startEditing = () => {
    setEditName(category.name);
    setEditIcon(category.icon);
    setEditColor(category.color);
    setIsEditing(true);
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
          notifications.show({
            title: 'Could not update category',
            message: (err as ApiError).message,
            color: 'red',
          });
        },
      }
    );
  };

  return (
    <Accordion.Item value={category.key}>
      <Accordion.Control>
        <Group justify="space-between" pr="sm" wrap="nowrap">
          <Group gap="xs">
            <ThemeIcon color={category.color} variant="light" size="md">
              {catIconEl}
            </ThemeIcon>
            <Text fw={600} size="sm">
              {category.name}
            </Text>
            <Badge size="xs" variant="light" color="gray">
              {category.subcategories.length} subcategories
            </Badge>
          </Group>
          <Group gap={4}>
            <Tooltip label="Edit category" withArrow>
              <ActionIcon
                variant="subtle"
                color="blue"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing();
                }}
              >
                <IconEdit size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete category" withArrow>
              <ActionIcon
                variant="subtle"
                color="red"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory(category.key);
                }}
              >
                <IconTrash size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          {isEditing && (
            <Paper p="sm" withBorder>
              <Stack gap="xs">
                <TextInput
                  label="Category name"
                  size="xs"
                  value={editName}
                  onChange={(e) => setEditName(e.currentTarget.value)}
                />
                <Group align="flex-end" gap="md">
                  <TablerIconPicker
                    value={editIcon}
                    onChange={setEditIcon}
                    fallbackIcon={DEFAULT_CATEGORY_ICON}
                  />
                  <CategoryColorPicker value={editColor} onChange={setEditColor} />
                </Group>
                <Group justify="flex-end" gap="xs">
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
                    Save
                  </Button>
                </Group>
              </Stack>
            </Paper>
          )}

          <Stack gap={6}>
            {category.subcategories.map((sub) => (
              <Group key={sub.key} justify="space-between">
                <Text size="xs">{sub.name}</Text>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={() => onDeleteSubcategory(category.key, sub.key)}
                >
                  <IconTrash size={12} />
                </ActionIcon>
              </Group>
            ))}
            <AddSubcategoryRow categoryKey={category.key} />
          </Stack>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
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

  const handleCreateCategory = () => {
    if (!newName.trim() || !newIcon || !newColor) return;
    createCategory.mutate(
      { name: newName.trim(), icon: newIcon, color: newColor, subcategories: newSubcategories },
      {
        onSuccess: () => {
          setNewName('');
          setNewSubcategories([]);
          notifications.show({
            title: 'Category Created',
            message: `${newName.trim()} added to the catalog`,
            color: 'green',
          });
        },
        onError: (err) => {
          notifications.show({
            title: 'Could not create category',
            message: (err as ApiError).message,
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
              onChange={(e) => setNewName(e.currentTarget.value)}
            />
            <Group align="flex-end" gap="lg">
              <TablerIconPicker
                value={newIcon}
                onChange={setNewIcon}
                fallbackIcon={DEFAULT_CATEGORY_ICON}
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
          <Text size="sm" c="dimmed" ta="center">
            Loading categories...
          </Text>
        ) : (
          <Accordion variant="separated">
            {categories.map((cat) => (
              <CategoryItem
                key={cat.key}
                category={cat}
                onDeleteCategory={handleDeleteCategory}
                onDeleteSubcategory={handleDeleteSubcategory}
              />
            ))}
            {categories.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                <IconCategory size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                No categories yet — add one above.
              </Text>
            )}
          </Accordion>
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
