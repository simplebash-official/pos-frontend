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
  Skeleton,
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
import { fetchSuppliers } from '../api/suppliersApi';

export interface SupplierPickerModalProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (supplierKey: string) => void;
  /** Supplier keys to exclude from the list (already linked). */
  excludeKeys?: string[];
  title?: string;
}

export function SupplierPickerModal({
  opened,
  onClose,
  onSelect,
  excludeKeys = [],
  title = 'Link a Supplier',
}: SupplierPickerModalProps) {
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: queryKeys.suppliers.all,
    queryFn: () => fetchSuppliers(),
    enabled: opened,
  });

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const excludeSet = new Set(excludeKeys);
    return suppliers
      .filter((s) => !excludeSet.has(s.key))
      .filter((s) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.contactPerson.toLowerCase().includes(q) ||
          s.suppliedCategories.some((c) => c.toLowerCase().includes(q))
        );
      });
  }, [suppliers, excludeKeys, search]);

  const handleSelect = (supplierKey: string) => {
    onSelect(supplierKey);
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
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => (
                <Paper key={`sup-skel-${i}`} p="md" radius="var(--mantine-radius-default)" withBorder>
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <Skeleton height={36} width={36} radius="md" />
                      <div>
                        <Skeleton height={16} width={120} radius="xs" mb={4} />
                        <Skeleton height={12} width={80} radius="xs" />
                      </div>
                    </Group>
                    <Skeleton height={20} width={60} radius="xs" />
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
                    <IconBuildingStore size={32} style={{ opacity: 0.3 }} />
                    <Text c="dimmed" size="sm" ta="center">
                      {suppliers.length === excludeKeys.length
                        ? 'All available suppliers are already linked.'
                        : 'No suppliers match your search criteria.'}
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              filtered.map((s) => (
                <Paper
                  key={s.key}
                  p="md"
                  radius="var(--mantine-radius-default)"
                  className="picker-card"
                  onClick={() => handleSelect(s.key)}
                >
                  <Group justify="space-between" align="center" wrap="nowrap" gap="md">
                    {/* Left Icon & Info */}
                    <Group
                      gap="md"
                      wrap="nowrap"
                      style={{ minWidth: 0, flex: 1 }}
                      align="flex-start"
                    >
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
                            <Badge
                              key={cat}
                              size="xs"
                              variant="light"
                              color="blue"
                              radius="var(--mantine-radius-default)"
                            >
                              {cat}
                            </Badge>
                          ))}
                          {s.suppliedCategories.length > 3 && (
                            <Badge
                              size="xs"
                              variant="light"
                              color="gray"
                              radius="var(--mantine-radius-default)"
                            >
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
                        handleSelect(s.key);
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
        <Group
          justify="space-between"
          align="center"
          pt="xs"
          style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
        >
          <Text size="xs" c="dimmed" fw={500}>
            Showing {filtered.length} of {suppliers.length - excludeKeys.length} available vendors
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
