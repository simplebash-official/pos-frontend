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
} from '@mantine/core';
import {
  IconSearch,
  IconBuildingStore,
  IconUser,
  IconPhone,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchSuppliers } from '@/features/suppliers/api/mockSuppliers';

export interface SupplierPickerModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (supplierId: string) => void;
  /** Supplier IDs to exclude from the list (already linked). */
  excludeIds?: string[];
  title?: string;
}

export function SupplierPickerModal({
  opened,
  onClose,
  onSelect,
  excludeIds = [],
  title = 'Link a Supplier',
}: SupplierPickerModalProps) {
  const { data: suppliers = [] } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: fetchSuppliers,
  });

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const excludeSet = new Set(excludeIds);
    return suppliers
      .filter((s) => !excludeSet.has(s.id))
      .filter((s) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          s.suppliedCategories.some((c) => c.toLowerCase().includes(q))
        );
      });
  }, [suppliers, excludeIds, search]);

  const handleSelect = (supplierId: string) => {
    onSelect(supplierId);
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
            <IconBuildingStore size={22} />
          </ThemeIcon>
          <div>
            <Text fw={800} size="md">
              {title}
            </Text>
            <Text size="xs" c="dimmed">
              Select a vendor to link with this inventory item
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
          placeholder="Search by vendor name, contact person, or category…"
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

        {/* Supplier List */}
        <ScrollArea.Autosize mah={440} offsetScrollbars>
          <Stack gap="xs" pt={6} pb={6} px={4}>
            {filtered.length === 0 ? (
              <Paper p="xl" withBorder radius="var(--mantine-radius-default)" bg="var(--mantine-color-body)">
                <Center>
                  <Stack gap={6} align="center">
                    <IconBuildingStore size={32} style={{ opacity: 0.3 }} />
                    <Text c="dimmed" size="sm" ta="center">
                      {suppliers.length === excludeIds.length
                        ? 'All available suppliers are already linked.'
                        : 'No suppliers match your search criteria.'}
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              filtered.map((s) => (
                <Paper
                  key={s.id}
                  p="md"
                  radius="var(--mantine-radius-default)"
                  className="picker-card"
                  onClick={() => handleSelect(s.id)}
                >
                  <Group justify="space-between" align="center" wrap="nowrap" gap="md">
                    {/* Left Icon & Info */}
                    <Group gap="md" wrap="nowrap" style={{ minWidth: 0, flex: 1 }} align="flex-start">
                      <ThemeIcon
                        color="blue"
                        variant="light"
                        size="xl"
                        radius="var(--mantine-radius-default)"
                        style={{ flexShrink: 0, marginTop: 2 }}
                      >
                        <IconBuildingStore size={22} />
                      </ThemeIcon>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Text size="sm" fw={700} lineClamp={1}>
                          {s.name}
                        </Text>

                        <Group gap="xs" mt={4} wrap="wrap">
                          <Group gap={4}>
                            <IconUser size={13} style={{ opacity: 0.6 }} />
                            <Text size="xs" fw={600} c="dimmed">
                              {s.contactPerson}
                            </Text>
                          </Group>

                          <Text size="xs" c="dimmed">
                            ·
                          </Text>

                          <Group gap={4}>
                            <IconPhone size={13} style={{ opacity: 0.6 }} />
                            <Text size="xs" fw={600} c="dimmed">
                              {s.primaryPhone}
                            </Text>
                          </Group>
                        </Group>

                        <Group gap={4} mt={6} wrap="wrap">
                          {s.suppliedCategories.slice(0, 3).map((cat) => (
                            <Badge key={cat} size="xs" variant="light" color="blue" radius="var(--mantine-radius-default)">
                              {cat}
                            </Badge>
                          ))}
                          {s.suppliedCategories.length > 3 && (
                            <Badge size="xs" variant="light" color="gray" radius="var(--mantine-radius-default)">
                              +{s.suppliedCategories.length - 3}
                            </Badge>
                          )}
                        </Group>
                      </div>
                    </Group>

                    {/* Right Link Action */}
                    <Button
                      size="xs"
                      variant="light"
                      color="blue"
                      leftSection={<IconPlus size={14} />}
                      radius="var(--mantine-radius-default)"
                      style={{ flexShrink: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(s.id);
                      }}
                    >
                      Link
                    </Button>
                  </Group>
                </Paper>
              ))
            )}
          </Stack>
        </ScrollArea.Autosize>

        {/* Footer */}
        <Group justify="space-between" align="center" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
          <Text size="xs" c="dimmed" fw={500}>
            Showing {filtered.length} of {suppliers.length - excludeIds.length} available vendors
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
