import { t } from '@/shared/i18n/t';
import { useState, useMemo, useDeferredValue } from 'react';
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
  IconArrowLeft,
} from '@tabler/icons-react';
import { notify } from '@/shared/notify';

import { useAllCustomers, useCreateCustomer } from '../hooks/useCustomers';
import { Customer } from '../types';
import { formatMoney } from '@/shared/lib/money';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { SearchHighlight } from '@/shared/components/SearchHighlight';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import { CUSTOMER_SEARCH_FIELDS } from '@/shared/lib/searchFields';
import { PERMISSIONS } from '@/constants/permissions';
import { useHasPermission } from '@/shared/hooks/usePermissions';
import { findNameMatches, findPhoneMatch } from '../lib/customerMatch';
import { CustomerMatchPanel } from './CustomerMatchPanel';

/** How many rows the picker draws at once. Beyond this the user should keep typing. */
const VISIBLE_RESULT_LIMIT = 50;
/** How many look-alike customers the add form shows. */
const NAME_MATCH_LIMIT = 3;

export interface CustomerPickerModalProps {
  opened: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer | null) => void;
  selectedCustomerId?: string | null;
  /** Pass a higher value when this window opens over a side panel. */
  zIndex?: number;
}

export const CustomerPickerModal = ({
  opened,
  onClose,
  onSelectCustomer,
  selectedCustomerId,
  zIndex,
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
  const canCreate = useHasPermission(PERMISSIONS.CUSTOMERS_WRITE);

  // While adding, whatever is typed in either field is checked against the saved customers.
  const checkedName = useDeferredValue(newName);
  const checkedPhone = useDeferredValue(newPhone);
  const phoneMatch = useMemo(
    () => findPhoneMatch(customers, checkedPhone),
    [customers, checkedPhone]
  );
  const nameMatches = useMemo(
    () =>
      findNameMatches(customers, checkedName, NAME_MATCH_LIMIT + 1)
        .filter((customer) => customer.id !== phoneMatch?.id)
        .slice(0, NAME_MATCH_LIMIT),
    [customers, checkedName, phoneMatch]
  );

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
      notify.error({
        title: 'Please check the details',
        message: 'Both customer name and phone number are required.',
      });
      return;
    }

    if (trimmedName.length < 2) {
      notify.error({
        title: 'Please check the details',
        message: 'Customer name must be at least 2 characters.',
      });
      return;
    }

    // The panel already offers this customer; never save a second record for the same number.
    if (findPhoneMatch(customers, trimmedPhone) !== null) {
      return;
    }

    try {
      const created = await createCustomerMutation.mutateAsync({
        name: trimmedName,
        primaryPhone: trimmedPhone,
        tags: ['POS Retail'],
      });

      onSelectCustomer(created);
      notify.info({
        title: 'Customer Added',
        message: `Attached ${created.name} (${created.primaryPhone}) to current sale.`,
      });

      setNewName('');
      setNewPhone('');
      setIsCreatingInline(false);
      setSearch('');
      onClose();
    } catch {
      notify.error({
        title: 'Error',
        message: 'Could not create customer. Please try again.',
      });
    }
  };

  const isPhonePattern = /^[0-9+-\s]+$/.test(search.trim()) && search.trim().length >= 3;

  const handleClose = () => {
    setSearch('');
    setNewName('');
    setNewPhone('');
    setIsCreatingInline(false);
    onClose();
  };

  /** Opens the add form, carrying over what was typed in the search box. */
  const startCreating = () => {
    if (isPhonePattern) {
      setNewPhone(search.trim());
      setNewName('');
    } else {
      setNewName(search.trim());
      setNewPhone('');
    }
    setIsCreatingInline(true);
  };

  const chooseExisting = (customer: Customer) => {
    onSelectCustomer(customer);
    handleClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          {t('Select / Attach Customer')}
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
      padding="lg"
      zIndex={zIndex}
    >
      <Stack gap="md">
        {/* Search & Actions Bar: hidden while adding, the form has its own checks */}
        {!isCreatingInline && (
          <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
            <SearchHistoryInput
              namespace="customers_picker"
              placeholder={t('Search by name, phone number, or email…')}
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
                  variant="light"
                  color="red"
                  size="sm"
                  onClick={() => {
                    onSelectCustomer(null);
                    handleClose();
                  }}
                >
                  {t('Detach')}
                </Button>
              )}
            </Group>
          </Group>
        )}

        {!isCreatingInline && search.trim() === '' && (
          <Text size="xs" c="dimmed" mt={-8}>
            {t('Type a name or phone number to find the customer.')}
          </Text>
        )}

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
                  {t('New Customer Details')}
                </Text>
                <Button
                  size="compact-xs"
                  h={isMobile ? 44 : undefined}
                  variant="subtle"
                  color="gray"
                  leftSection={<IconArrowLeft size={14} />}
                  onClick={() => setIsCreatingInline(false)}
                >
                  {t('Back to search')}
                </Button>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                <TextInput
                  label={t('Customer Name')}
                  placeholder={t('e.g. Nimal Perera')}
                  size="sm"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.currentTarget.value)}
                  autoFocus={!isMobile}
                />
                <TextInput
                  label={t('Phone Number')}
                  placeholder={t('e.g. 0771234567')}
                  size="sm"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.currentTarget.value)}
                />
              </SimpleGrid>

              <CustomerMatchPanel
                phoneMatch={phoneMatch}
                nameMatches={nameMatches}
                onUse={chooseExisting}
              />

              <Group justify="flex-end" mt="xs" gap="sm">
                <Button
                  size="xs"
                  h={isMobile ? 44 : undefined}
                  variant="default"
                  onClick={() => setIsCreatingInline(false)}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  size="xs"
                  h={isMobile ? 44 : undefined}
                  color="blue"
                  disabled={phoneMatch !== null}
                  loading={createCustomerMutation.isPending}
                  onClick={handleCreateQuickCustomer}
                >
                  {t('Save and use this customer')}
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}

        {/* Customer List */}
        {!isCreatingInline && (
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
                        {t('No customer found matching "')}
                        {search}".
                      </Text>
                      {!canCreate && (
                        <Text c="dimmed" size="xs" ta="center">
                          {t('To add a customer, ask a manager.')}
                        </Text>
                      )}
                      {canCreate && (
                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          leftSection={<IconUserPlus size={14} />}
                          onClick={startCreating}
                          mt="xs"
                        >
                          {search.trim()
                            ? `Add "${search.trim()}" as New Customer`
                            : 'Add New Customer'}
                        </Button>
                      )}
                    </Stack>
                  </Center>
                </Paper>
              ) : (
                visible.map((cust) => {
                  const isSelected = cust.key === selectedCustomerId;
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
                                  {t('Balance:')} {formatMoney(cust.outstandingBalanceCents)}
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
                              {t('Attached')}
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
                              {t('Select')}
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

        {/* A name alone can be shared by two people, so adding stays possible after a search that
            found someone; the phone check in the form stops a real duplicate. */}
        {!isCreatingInline &&
          !isLoading &&
          canCreate &&
          search.trim() !== '' &&
          filtered.length > 0 && (
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              h={isMobile ? 44 : undefined}
              leftSection={<IconUserPlus size={14} />}
              onClick={startCreating}
            >
              {t('Not one of these? Add a new customer')}
            </Button>
          )}
      </Stack>
    </Modal>
  );
};
