import { useState, useMemo } from 'react';
import {
  Modal,
  TextInput,
  Stack,
  Group,
  Text,
  Paper,
  Button,
  Badge,
  ScrollArea,
  ActionIcon,
  Center,
} from '@mantine/core';
import { IconSearch, IconUser, IconPhone, IconCheck, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { fetchCustomers } from '../api/mockCustomers';
import { Customer } from '../types';
import { formatMoney } from '@/shared/lib/money';

interface CustomerPickerModalProps {
  opened: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer | null) => void;
  selectedCustomerId?: string | null;
}

export function CustomerPickerModal({
  opened,
  onClose,
  onSelectCustomer,
  selectedCustomerId,
}: CustomerPickerModalProps) {
  const [search, setSearch] = useState('');

  const { data: customers = [] } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: fetchCustomers,
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.primaryPhone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [customers, search]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>Select Customer for Billing</Text>}
      size="md"
      radius="var(--mantine-radius-default)"
    >
      <Stack gap="md">
        <Group justify="space-between">
          <TextInput
            placeholder="Search by name or phone number..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: 1 }}
            autoFocus
          />
          {selectedCustomerId && (
            <Button
              variant="subtle"
              color="red"
              size="xs"
              onClick={() => {
                onSelectCustomer(null);
                onClose();
              }}
            >
              Detach Customer
            </Button>
          )}
        </Group>

        <ScrollArea.Autosize mah={350}>
          <Stack gap="xs">
            {filtered.length === 0 ? (
              <Center py="xl">
                <Text size="sm" c="dimmed">
                  No matching customers found.
                </Text>
              </Center>
            ) : (
              filtered.map((cust) => {
                const isSelected = cust.id === selectedCustomerId;
                return (
                  <Paper
                    key={cust.id}
                    p="sm"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    style={{
                      cursor: 'pointer',
                      borderColor: isSelected
                        ? 'var(--mantine-color-blue-6)'
                        : 'var(--mantine-color-default-border)',
                      backgroundColor: isSelected
                        ? 'var(--mantine-color-blue-light)'
                        : 'var(--bg-card)',
                    }}
                    onClick={() => {
                      onSelectCustomer(cust);
                      onClose();
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <div>
                        <Group gap="xs">
                          <IconUser size={16} />
                          <Text fw={700} size="sm">
                            {cust.name}
                          </Text>
                        </Group>
                        <Group gap="md" mt={4}>
                          <Text size="xs" c="dimmed">
                            <IconPhone size={12} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                            {cust.primaryPhone}
                          </Text>
                          {cust.outstandingBalanceCents > 0 && (
                            <Badge size="xs" color="red" variant="light">
                              Due: {formatMoney(cust.outstandingBalanceCents)}
                            </Badge>
                          )}
                        </Group>
                      </div>

                      {isSelected ? (
                        <ActionIcon color="blue" variant="filled" radius="xl" size="sm">
                          <IconCheck size={14} />
                        </ActionIcon>
                      ) : (
                        <Button size="xs" variant="light" leftSection={<IconPlus size={14} />}>
                          Select
                        </Button>
                      )}
                    </Group>
                  </Paper>
                );
              })
            )}
          </Stack>
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
}
