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
  Box,
  ThemeIcon,
  Skeleton,
} from '@mantine/core';
import {
  IconSearch,
  IconUser,
  IconPhone,
  IconCheck,
  IconPlus,
  IconUserPlus,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { useAllCustomers, useCreateCustomer } from '../hooks/useCustomers';
import { Customer } from '../types';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';

interface CustomerPickerModalProps {
  opened: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer | null) => void;
  selectedCustomerId?: string | null;
}

export const CustomerPickerModal = ({
  opened,
  onClose,
  onSelectCustomer,
  selectedCustomerId,
}: CustomerPickerModalProps) => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const { data: customers = [], isLoading } = useAllCustomers({
    enabled: opened,
  });

  const createCustomerMutation = useCreateCustomer();

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
    const trimmedName = newName.trim();
    const trimmedPhone = newPhone.trim();

    if (!trimmedName || !trimmedPhone) {
      notifications.show({
        title: 'Validation Error',
        message: 'Customer name and phone number are required',
        color: 'red',
      });
      return;
    }

    if (trimmedName.length < 2) {
      notifications.show({
        title: 'Validation Error',
        message: 'Customer name must be at least 2 characters',
        color: 'red',
      });
      return;
    }

    try {
      const created = await createCustomerMutation.mutateAsync({
        name: trimmedName,
        primaryPhone: trimmedPhone,
        tags: ['POS Retail'],
      });

      onSelectCustomer(created);
      notifications.show({
        title: 'Customer Created',
        message: `Attached ${created.name} (${created.primaryPhone})`,
        color: 'teal',
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
      title={
        <Text fw={700} size="lg">
          Select / attach customer
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
      padding={0}
    >
      {/* Search Bar Section with Top & Bottom Border Dividers */}
      <Box
        px={isMobile ? 'sm' : 'lg'}
        py="md"
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Group justify="space-between" gap="md" wrap={isMobile ? 'wrap' : 'nowrap'}>
          <TextInput
            placeholder="Search by phone number or name..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: 1, minWidth: isMobile ? '100%' : undefined }}
            /* Autofocusing raises the soft keyboard over the very list being searched on mobile. */
            autoFocus={!isMobile}
          />
          <Group gap="xs" wrap="nowrap">
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
            <Button
              variant="light"
              size="xs"
              leftSection={<IconUserPlus size={14} />}
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
              New Customer
            </Button>
          </Group>
        </Group>
      </Box>

      <Box p="lg">
        {isCreatingInline ? (
          <Paper p="md" style={{ backgroundColor: 'var(--bg-hover)' }}>
            <Stack gap="xs">
              <Text size="xs" fw={700} c="var(--mantine-primary-color-filled)">
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
                <Button
                  size="xs"
                  loading={createCustomerMutation.isPending}
                  onClick={handleCreateQuickCustomer}
                >
                  Save & Attach Customer
                </Button>
              </Group>
            </Stack>
          </Paper>
        ) : (
          <ScrollArea.Autosize
            mah={isMobile ? '60vh' : 440}
            offsetScrollbars
            classNames={{ viewport: 'scrollarea-fluid-content' }}
          >
            <Stack gap="sm">
              {isLoading ? (
                Array.from({ length: 4 }, (_, i) => (
                  <Paper key={`cust-skel-${i}`} p="md">
                    <Group justify="space-between" align="center">
                      <Group gap="md">
                        <Skeleton height={36} width={36} circle />
                        <div>
                          <Skeleton height={16} width={120} mb={4} />
                          <Skeleton height={12} width={80} />
                        </div>
                      </Group>
                      <Skeleton height={20} width={60} />
                    </Group>
                  </Paper>
                ))
              ) : filtered.length === 0 ? (
                <Center py="xl">
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
                      p="md"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        borderColor: isSelected
                          ? 'var(--mantine-primary-color-filled)'
                          : 'var(--border)',
                        backgroundColor: isSelected
                          ? 'var(--mantine-primary-color-light)'
                          : 'var(--bg-card)',
                      }}
                      onClick={() => {
                        onSelectCustomer(cust);
                        onClose();
                      }}
                    >
                      <Group justify="space-between" align="center" wrap="nowrap">
                        <Group
                          gap="md"
                          align="center"
                          style={{ flex: 1, minWidth: 0 }}
                          wrap="nowrap"
                        >
                          <ThemeIcon
                            size={48}
                            variant="light"
                            style={{ minWidth: 48, flexShrink: 0 }}
                          >
                            <IconUser size={24} />
                          </ThemeIcon>

                          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                            <Group gap="xs" align="center">
                              <Text fw={700} size="sm" lineClamp={1}>
                                {cust.name}
                              </Text>
                              {hasDebt && (
                                <Badge size="xs" radius="xl" variant="light" color="red" fw={600}>
                                  Balance: {formatMoney(cust.outstandingBalanceCents)}
                                </Badge>
                              )}
                            </Group>
                            <Text size="xs" c="dimmed">
                              <IconPhone
                                size={12}
                                style={{ verticalAlign: 'middle', marginRight: 2 }}
                              />
                              {cust.primaryPhone}
                            </Text>
                          </Stack>
                        </Group>

                        <Box
                          style={{
                            width: isMobile ? 48 : 88,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected ? (
                            <ActionIcon variant="filled" radius="xl" size="sm">
                              <IconCheck size={14} />
                            </ActionIcon>
                          ) : (
                            <Button
                              size="xs"
                              leftSection={<IconPlus size={14} />}
                              fw={600}
                              fullWidth
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectCustomer(cust);
                                onClose();
                              }}
                            >
                              Select
                            </Button>
                          )}
                        </Box>
                      </Group>
                    </Paper>
                  );
                })
              )}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Box>
    </Modal>
  );
};
