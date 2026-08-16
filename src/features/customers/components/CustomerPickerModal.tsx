import { useState, useMemo } from 'react';
import {
  Modal,
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
  Box,
  Skeleton,
  TextInput,
  SimpleGrid,
} from '@mantine/core';
import {
  IconSearch,
  IconUser,
  IconPhone,
  IconPlus,
  IconCheck,
  IconX,
  IconUserPlus,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { useAllCustomers, useCreateCustomer } from '../hooks/useCustomers';
import { Customer } from '../types';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { SearchHighlight } from '@/shared/components/SearchHighlight';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import { CUSTOMER_SEARCH_FIELDS } from '@/shared/lib/searchFields';

/** How many rows the picker draws at once. Beyond this the user should keep typing. */
const VISIBLE_RESULT_LIMIT = 50;

export interface CustomerPickerModalProps {
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

  // Phone and name are both weighted highest in CUSTOMER_SEARCH_FIELDS, so a
  // number typed with spaces or dashes still lands on the right customer.
  const { results: filtered, terms: searchTerms } = useEntitySearch(
    customers,
    CUSTOMER_SEARCH_FIELDS,
    search,
    null
  );

  const visible = useMemo(() => filtered.slice(0, VISIBLE_RESULT_LIMIT), [filtered]);

  const handleCreateQuickCustomer = async () => {
    const trimmedName = newName.trim();
    const trimmedPhone = newPhone.trim();

    if (!trimmedName || !trimmedPhone) {
      notifications.show({
        title: 'Please check the details',
        message: 'Both customer name and phone number are required.',
        color: 'red',
      });
      return;
    }

    if (trimmedName.length < 2) {
      notifications.show({
        title: 'Please check the details',
        message: 'Customer name must be at least 2 characters.',
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
        title: 'Customer Added',
        message: `Attached ${created.name} (${created.primaryPhone}) to current sale.`,
        color: 'blue',
      });

      setNewName('');
      setNewPhone('');
      setIsCreatingInline(false);
      setSearch('');
      onClose();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Could not create customer. Please try again.',
        color: 'red',
      });
    }
  };

  const isPhonePattern = /^[0-9+-\s]+$/.test(search.trim()) && search.trim().length >= 3;

  const handleClose = () => {
    setSearch('');
    setIsCreatingInline(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          Select / Attach Customer
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
      padding="lg"
    >
      <Stack gap="md">
        {/* Search & Actions Bar */}
        <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
          <SearchHistoryInput
            namespace="customers_picker"
            placeholder="Search by name, phone number, or email…"
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
            onValueChange={setSearch}
            wrapperStyle={{ flex: 1, minWidth: isMobile ? '100%' : undefined }}
            autoFocus={!isMobile}
          />
          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            {selectedCustomerId && (
              <Button
                variant="subtle"
                color="red"
                size="sm"
                onClick={() => {
                  onSelectCustomer(null);
                  handleClose();
                }}
              >
                Detach
              </Button>
            )}
            <Button
              variant="light"
              color="blue"
              size="sm"
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
              New Customer
            </Button>
          </Group>
        </Group>

        {/* Inline Quick Customer Creation Form */}
        {isCreatingInline && (
          <Paper
            p="md"
            radius="var(--mantine-radius-default)"
            withBorder
            bg="var(--mantine-color-body)"
          >
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  New Customer Details
                </Text>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  onClick={() => setIsCreatingInline(false)}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <TextInput
                  label="Customer Name"
                  placeholder="e.g. Nimal Perera"
                  size="sm"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.currentTarget.value)}
                  autoFocus={!isMobile}
                />
                <TextInput
                  label="Phone Number"
                  placeholder="e.g. 0771234567"
                  size="sm"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.currentTarget.value)}
                />
              </SimpleGrid>

              <Group justify="flex-end" mt="xs" gap="sm">
                <Button size="xs" variant="default" onClick={() => setIsCreatingInline(false)}>
                  Cancel
                </Button>
                <Button
                  size="xs"
                  color="blue"
                  loading={createCustomerMutation.isPending}
                  onClick={handleCreateQuickCustomer}
                >
                  Save & Attach Customer
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Customer List */}
        <ScrollArea.Autosize
          mah={isMobile ? '60dvh' : 440}
          offsetScrollbars
          classNames={{ viewport: 'scrollarea-fluid-content' }}
        >
          <Stack gap="xs" pt={4} pb={4} px={2}>
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => (
                <Paper
                  key={`cust-skel-${i}`}
                  p="md"
                  radius="var(--mantine-radius-default)"
                  withBorder
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <Skeleton height={36} width={36} />
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
              <Paper
                p="xl"
                withBorder
                radius="var(--mantine-radius-default)"
                bg="var(--mantine-color-body)"
              >
                <Center>
                  <Stack gap="xs" align="center">
                    <IconUser size={32} style={{ opacity: 0.3 }} />
                    <Text c="dimmed" size="sm" ta="center">
                      No customer found matching "{search}".
                    </Text>
                    <Button
                      size="xs"
                      variant="light"
                      color="blue"
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
                      mt="xs"
                    >
                      {search.trim()
                        ? `Add "${search.trim()}" as New Customer`
                        : 'Add New Customer'}
                    </Button>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              visible.map((cust) => {
                const isSelected = cust.id === selectedCustomerId;
                const hasDebt = cust.outstandingBalanceCents > 0;

                return (
                  <Paper
                    key={cust.id}
                    p="md"
                    radius="var(--mantine-radius-default)"
                    className="picker-card"
                    style={
                      isSelected
                        ? {
                            borderColor: 'var(--mantine-color-blue-5)',
                            backgroundColor: 'var(--mantine-color-blue-light)',
                          }
                        : undefined
                    }
                    onClick={() => {
                      onSelectCustomer(cust);
                      handleClose();
                    }}
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
                          <IconUser size={22} />
                        </ThemeIcon>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Text size="sm" fw={700} lineClamp={1}>
                            <SearchHighlight text={cust.name} terms={searchTerms} />
                          </Text>

                          <Group gap="xs" mt={4} wrap="wrap">
                            <Group gap={4}>
                              <IconPhone size={13} style={{ opacity: 0.6 }} />
                              <Text size="xs" fw={600} c="dimmed">
                                {cust.primaryPhone}
                              </Text>
                            </Group>
                            {cust.email && (
                              <>
                                <Text size="xs" c="dimmed">
                                  ·
                                </Text>
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                  {cust.email}
                                </Text>
                              </>
                            )}
                          </Group>

                          <Group gap={4} mt={6} wrap="wrap">
                            {hasDebt && (
                              <Badge
                                size="xs"
                                variant="light"
                                color="red"
                                radius="var(--mantine-radius-default)"
                              >
                                Balance: {formatMoney(cust.outstandingBalanceCents)}
                              </Badge>
                            )}
                            {cust.tags?.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                size="xs"
                                variant="light"
                                color="gray"
                                radius="var(--mantine-radius-default)"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {(cust.tags?.length || 0) > 3 && (
                              <Badge
                                size="xs"
                                variant="light"
                                color="gray"
                                radius="var(--mantine-radius-default)"
                              >
                                +{cust.tags.length - 3}
                              </Badge>
                            )}
                          </Group>
                        </div>
                      </Group>

                      {/* Right Action */}
                      <Box style={{ flexShrink: 0 }}>
                        {isSelected ? (
                          <Badge
                            size="sm"
                            variant="filled"
                            color="blue"
                            leftSection={<IconCheck size={12} />}
                            radius="var(--mantine-radius-default)"
                          >
                            Attached
                          </Badge>
                        ) : (
                          <Button
                            size="xs"
                            variant="light"
                            color="blue"
                            leftSection={<IconPlus size={14} />}
                            radius="var(--mantine-radius-default)"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCustomer(cust);
                              handleClose();
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
      </Stack>
    </Modal>
  );
};
