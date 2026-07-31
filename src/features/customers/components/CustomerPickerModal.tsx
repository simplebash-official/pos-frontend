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
  Divider,
} from '@mantine/core';
import {
  IconSearch,
  IconUser,
  IconPhone,
  IconCheck,
  IconPlus,
  IconUserPlus,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';

import { queryKeys } from '@/api/queryKeys';
import { fetchCustomers, createCustomer } from '../api/mockCustomers';
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
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const queryClient = useQueryClient();

  const { data: customers = [] } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: fetchCustomers,
  });

  // Phone search priority matching
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return customers;

    const phoneMatches: Customer[] = [];
    const nameMatches: Customer[] = [];

    for (const c of customers) {
      if (c.primaryPhone.includes(q) || (c.secondaryPhone && c.secondaryPhone.includes(q))) {
        phoneMatches.push(c);
      } else if (
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      ) {
        nameMatches.push(c);
      }
    }

    return [...phoneMatches, ...nameMatches];
  }, [customers, search]);

  const handleCreateQuickCustomer = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      notifications.show({
        title: 'Validation Error',
        message: 'Customer name and phone number are required',
        color: 'red',
      });
      return;
    }

    try {
      const created = await createCustomer({
        name: newName.trim(),
        contactPerson: newName.trim(),
        primaryPhone: newPhone.trim(),
        address: 'Walk-in / POS counter',
        tags: ['POS Retail'],
      });

      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });

      onSelectCustomer(created);
      notifications.show({
        title: 'Customer Created',
        message: `Attached ${created.name} (${created.primaryPhone})`,
        color: 'green',
      });

      // Reset inline form
      setNewName('');
      setNewPhone('');
      setIsCreatingInline(false);
      onClose();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to create customer',
        color: 'red',
      });
    }
  };

  const isPhonePattern = /^[0-9+-\s]+$/.test(search.trim()) && search.trim().length >= 3;

  return (
    <Modal
      opened={opened}
      onClose={() => {
        setIsCreatingInline(false);
        onClose();
      }}
      title={<Text fw={700}>Select / Attach Customer (F3)</Text>}
      size="md"
      radius="var(--mantine-radius-default)"
    >
      <Stack gap="md">
        <Group justify="space-between">
          <TextInput
            placeholder="Search by phone number or name..."
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

        {isCreatingInline ? (
          <Paper p="sm" withBorder radius="md" style={{ backgroundColor: 'var(--bg-hover)' }}>
            <Stack gap="xs">
              <Text size="xs" fw={700} c="blue">
                MINIMAL NEW CUSTOMER ENTRY
              </Text>
              <TextInput
                label="Customer Name"
                placeholder="e.g. Nimal Perera"
                size="sm"
                value={newName}
                onChange={(e) => setNewName(e.currentTarget.value)}
                autoFocus
              />
              <TextInput
                label="Phone Number"
                placeholder="e.g. 0771234567"
                size="sm"
                value={newPhone}
                onChange={(e) => setNewPhone(e.currentTarget.value)}
              />
              <Group justify="flex-end" mt="xs">
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  onClick={() => setIsCreatingInline(false)}
                >
                  Cancel
                </Button>
                <Button size="xs" color="blue" onClick={handleCreateQuickCustomer}>
                  Save & Attach Customer
                </Button>
              </Group>
            </Stack>
          </Paper>
        ) : (
          <ScrollArea.Autosize mah={340} offsetScrollbars>
            <Stack gap="xs">
              {filtered.length === 0 ? (
                <Center py="md">
                  <Text size="sm" c="dimmed">
                    No matching customer found for "{search}".
                  </Text>
                </Center>
              ) : (
                filtered.map((cust) => {
                  const isSelected = cust.id === selectedCustomerId;
                  const hasDebt = cust.outstandingBalanceCents > 0;

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
                            {hasDebt && (
                              <Badge size="xs" color="red" variant="filled">
                                Balance: {formatMoney(cust.outstandingBalanceCents)}
                              </Badge>
                            )}
                          </Group>
                          <Group gap="md" mt={4}>
                            <Text size="xs" c="dimmed">
                              <IconPhone
                                size={12}
                                style={{ verticalAlign: 'middle', marginRight: 2 }}
                              />
                              {cust.primaryPhone}
                            </Text>
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

              <Divider my="xs" />

              <Button
                variant="light"
                color="blue"
                size="sm"
                fullWidth
                leftSection={<IconUserPlus size={16} />}
                onClick={() => {
                  if (isPhonePattern) {
                    setNewPhone(search.trim());
                    setNewName('');
                  } else {
                    setNewName(search.trim());
                    setNewPhone('');
                  }
                  setIsCreatingInline(true);
                }}
              >
                + Create New Customer Inline
              </Button>
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Modal>
  );
}
