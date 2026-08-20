import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Divider,
  Button,
  ThemeIcon,
  Alert,
  Grid,
  Box,
  Tabs,
  ScrollArea,
  Center,
  Tooltip,
} from '@mantine/core';
import {
  IconUser,
  IconMapPin,
  IconTag,
  IconMail,
  IconEdit,
  IconTrash,
  IconClock,
  IconAlertCircle,
  IconReceipt,
  IconTools,
} from '@tabler/icons-react';
import { Customer } from '../types';
import { formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { fetchInvoices } from '@/features/billing/api/invoicesApi';
import { fetchRepairs } from '@/features/repairs/api/repairsApi';
import { queryKeys } from '@/api/queryKeys';

export interface CustomerDetailDrawerProps {
  customer: Customer | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export const CustomerDetailDrawer = ({
  customer,
  opened,
  onClose,
  onEdit,
  onDelete,
}: CustomerDetailDrawerProps) => {
  const [historyTab, setHistoryTab] = useState<'invoices' | 'repairs' | 'notes'>('invoices');

  const { data: allInvoices = [] } = useQuery({
    queryKey: queryKeys.billing.invoices(),
    queryFn: fetchInvoices,
    enabled: opened && !!customer,
  });

  const customerInvoices = useMemo(() => {
    if (!customer) return [];
    return allInvoices
      .filter(
        (inv) =>
          inv.customerId === customer.id ||
          (customer.primaryPhone && inv.customerPhone === customer.primaryPhone) ||
          (inv.customerName && inv.customerName.toLowerCase() === customer.name.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customer, allInvoices]);

  const { data: allRepairs = [] } = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: fetchRepairs,
    enabled: opened && !!customer,
  });

  const customerRepairs = useMemo(() => {
    if (!customer) return [];
    return allRepairs
      .filter(
        (r) =>
          (customer.primaryPhone && r.customerPhone === customer.primaryPhone) ||
          (r.customerName && r.customerName.toLowerCase() === customer.name.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customer, allRepairs]);

  return (
    <DetailDrawer
      data={customer}
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon color="blue" variant="light" size="lg">
            <IconUser size={20} />
          </ThemeIcon>
          <div>
            <Text fw={800} size="md">
              Customer Specifications
            </Text>
            <Text size="xs" c="dimmed">
              JANA2U Client & Account Detail
            </Text>
          </div>
        </Group>
      }
    >
      {(c) => (
        <Stack gap="md" pt="xs">
          {/* Title Banner */}
          <Paper
            p="md"
            withBorder
            radius="var(--mantine-radius-default)"
            bg="var(--mantine-color-body)"
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap" mb={4}>
              <Text fw={800} size="lg" style={{ wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
                {c.name || 'Unnamed Customer'}
              </Text>

              <Badge
                color={c.outstandingBalanceCents > 0 ? 'red' : 'teal'}
                variant="light"
                size="sm"
                style={{ flexShrink: 0 }}
              >
                {c.outstandingBalanceCents > 0 ? 'Outstanding Due' : 'In Good Standing'}
              </Badge>
            </Group>

            {c.contactPerson ? (
              <Text size="xs" c="dimmed" mb={c.tags && c.tags.length > 0 ? 'xs' : 0}>
                Primary Contact:{' '}
                <Text component="span" fw={600} c="var(--text-primary)">
                  {c.contactPerson}
                </Text>
              </Text>
            ) : null}

            {c.tags && c.tags.length > 0 && (
              <Group gap={6} wrap="wrap">
                {c.tags.map((tag) => (
                  <Badge key={tag} color="blue" variant="light" size="xs">
                    {tag}
                  </Badge>
                ))}
              </Group>
            )}
          </Paper>

          {/* Financial Snapshot */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Financial Snapshot
          </Text>

          <Paper p="md" withBorder>
            <Grid gap={0} align="center">
              <Grid.Col
                span={6}
                pr="md"
                style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
              >
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    Total Purchases
                  </Text>
                  <Text fw={800} size="md" c="blue">
                    {formatMoney(c.totalPurchasesCents || 0)}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6} pl="md">
                <Stack gap={2}>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    Balance Due
                  </Text>
                  <Group gap="xs" align="center" wrap="nowrap">
                    <Text fw={800} size="md" c={c.outstandingBalanceCents > 0 ? 'red' : 'teal'}>
                      {formatMoney(c.outstandingBalanceCents || 0)}
                    </Text>
                    <Badge
                      color={c.outstandingBalanceCents > 0 ? 'red' : 'teal'}
                      size="xs"
                      variant="light"
                      style={{ flexShrink: 0 }}
                    >
                      {c.outstandingBalanceCents > 0 ? 'Due' : 'Clear'}
                    </Badge>
                  </Group>
                </Stack>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Debt Alert if customer owes balance */}
          {c.outstandingBalanceCents > 0 && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Outstanding Balance Notice"
              color="red"
              radius="var(--mantine-radius-default)"
            >
              This client has an outstanding balance of{' '}
              <strong>{formatMoney(c.outstandingBalanceCents)}</strong>. Outstanding debt must be
              settled before this profile can be deleted.
            </Alert>
          )}

          {/* Contact & Location Details */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={4}>
            Contact & Address
          </Text>

          <Paper p="md" withBorder>
            <Stack gap="sm">
              <Box>
                <Text size="xs" c="dimmed" fw={500} mb={4}>
                  Contact Numbers
                </Text>
                <PhoneDisplay
                  primaryPhone={c.primaryPhone}
                  secondaryPhone={c.secondaryPhone}
                  layout="stack"
                />
              </Box>

              {c.address ? (
                <>
                  <Divider color="var(--mantine-color-default-border)" />
                  <Box>
                    <Text size="xs" c="dimmed" fw={500} mb={4}>
                      Physical Location / Address
                    </Text>
                    <Group gap="xs" align="flex-start">
                      <IconMapPin
                        size={16}
                        style={{ color: 'var(--status-error)', marginTop: 2, flexShrink: 0 }}
                      />
                      <Text size="sm" fw={500}>
                        {c.address}
                      </Text>
                    </Group>
                  </Box>
                </>
              ) : null}

              {c.email ? (
                <>
                  <Divider color="var(--mantine-color-default-border)" />
                  <Box>
                    <Text size="xs" c="dimmed" fw={500} mb={4}>
                      Email Address
                    </Text>
                    <Group gap="xs" align="center">
                      <IconMail size={16} style={{ opacity: 0.6, flexShrink: 0 }} />
                      <Text size="sm">{c.email}</Text>
                    </Group>
                  </Box>
                </>
              ) : null}
            </Stack>
          </Paper>

          {/* History Tabs: Invoices / Repairs / Notes */}
          <Tabs
            value={historyTab}
            onChange={(val) =>
              setHistoryTab((val ?? 'invoices') as 'invoices' | 'repairs' | 'notes')
            }
            color="amber"
            mt="xs"
          >
            <Tabs.List grow>
              <Tabs.Tab
                value="invoices"
                rightSection={
                  <Badge size="xs" variant="light" color="gray" circle>
                    {customerInvoices.length}
                  </Badge>
                }
              >
                Invoices
              </Tabs.Tab>
              <Tabs.Tab
                value="repairs"
                rightSection={
                  <Badge size="xs" variant="light" color="gray" circle>
                    {customerRepairs.length}
                  </Badge>
                }
              >
                Repairs
              </Tabs.Tab>
              {c.notes ? <Tabs.Tab value="notes">Notes</Tabs.Tab> : null}
            </Tabs.List>
          </Tabs>

          <Paper p="sm" withBorder>
            {historyTab === 'invoices' &&
              (customerInvoices.length === 0 ? (
                <Center py="md">
                  <Stack gap={4} align="center">
                    <IconReceipt size={20} style={{ opacity: 0.4 }} />
                    <Text size="xs" c="dimmed" ta="center">
                      No sales or invoices recorded for this customer.
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <ScrollArea.Autosize
                  mah="30dvh"
                  type="hover"
                  scrollbarSize={6}
                  classNames={{ viewport: 'scrollarea-fluid-content' }}
                  w="100%"
                >
                  <Stack gap={6} w="100%">
                    {customerInvoices.map((inv) => (
                      <Paper
                        key={inv.id}
                        p="xs"
                        withBorder
                        radius="var(--mantine-radius-default)"
                        w="100%"
                      >
                        <Group justify="space-between" align="center" wrap="nowrap" w="100%">
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Group gap="xs" align="center">
                              <Text size="sm" fw={700}>
                                #{inv.invoiceNumber}
                              </Text>
                              <Badge
                                size="xs"
                                variant={inv.isCredit ? 'light' : 'filled'}
                                color={inv.isCredit ? 'amber' : 'teal'}
                              >
                                {inv.isCredit ? 'Credit' : 'Paid'}
                              </Badge>
                            </Group>
                            <Text size="xs" c="dimmed" mt={2}>
                              {formatDateTime(inv.createdAt)} · {inv.items.length} item(s)
                            </Text>
                          </div>
                          <Text size="sm" fw={700} ta="right" style={{ flexShrink: 0 }}>
                            {formatMoney(inv.totalCents)}
                          </Text>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea.Autosize>
              ))}

            {historyTab === 'repairs' &&
              (customerRepairs.length === 0 ? (
                <Center py="md">
                  <Stack gap={4} align="center">
                    <IconTools size={20} style={{ opacity: 0.4 }} />
                    <Text size="xs" c="dimmed" ta="center">
                      No repair tickets found for this customer.
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <ScrollArea.Autosize
                  mah="30dvh"
                  type="hover"
                  scrollbarSize={6}
                  classNames={{ viewport: 'scrollarea-fluid-content' }}
                  w="100%"
                >
                  <Stack gap={6} w="100%">
                    {customerRepairs.map((rep) => (
                      <Paper
                        key={rep.id}
                        p="xs"
                        withBorder
                        radius="var(--mantine-radius-default)"
                        w="100%"
                      >
                        <Group justify="space-between" align="center" wrap="nowrap" w="100%">
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Group gap="xs" align="center">
                              <Text size="sm" fw={700}>
                                #{rep.ticketNumber}
                              </Text>
                              <Badge size="xs" variant="light" color="blue">
                                {rep.deviceModel}
                              </Badge>
                            </Group>
                            <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
                              {rep.issueDescription}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {formatDateTime(rep.createdAt)}
                            </Text>
                          </div>
                          {rep.estimatedCostCents !== undefined ? (
                            <Text size="sm" fw={700} ta="right" style={{ flexShrink: 0 }}>
                              {formatMoney(rep.estimatedCostCents)}
                            </Text>
                          ) : (
                            <Text
                              size="xs"
                              c="dimmed"
                              fs="italic"
                              ta="right"
                              style={{ flexShrink: 0 }}
                            >
                              Pending diagnosis
                            </Text>
                          )}
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea.Autosize>
              ))}

            {historyTab === 'notes' && (
              <Box p="xs">
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {c.notes || 'No notes available.'}
                </Text>
              </Box>
            )}
          </Paper>

          <Divider my="xs" />

          {/* Metadata */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Metadata
          </Text>

          <Stack gap="xs">
            <Group justify="space-between">
              <Group gap="xs">
                <IconClock size={16} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  Registered On
                </Text>
              </Group>
              <Text size="xs" fw={700}>
                {formatDateTime(c.createdAt || '')}
              </Text>
            </Group>

            <Group justify="space-between">
              <Group gap="xs">
                <IconClock size={16} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  Last Updated
                </Text>
              </Group>
              <Text size="xs" fw={700}>
                {formatDateTime(c.updatedAt || '')}
              </Text>
            </Group>

            <Group justify="space-between">
              <Group gap="xs">
                <IconTag size={16} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  Client Key
                </Text>
              </Group>
              <Text size="xs" fw={600} c="dimmed">
                {c.key}
              </Text>
            </Group>
          </Stack>

          <Divider my="xs" />

          {/* Actions */}
          <Group justify="space-between" align="center" wrap="nowrap" mt="sm">
            <Button variant="default" size="sm" onClick={onClose}>
              Close
            </Button>

            <Group gap="xs" wrap="nowrap">
              <Tooltip label="Delete Customer Profile" withArrow>
                <Button
                  variant="light"
                  color="red"
                  size="sm"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => onDelete(c)}
                >
                  Delete
                </Button>
              </Tooltip>
              <Button
                variant="filled"
                color="blue"
                size="sm"
                leftSection={<IconEdit size={16} />}
                onClick={() => onEdit(c)}
              >
                Edit Details
              </Button>
            </Group>
          </Group>
        </Stack>
      )}
    </DetailDrawer>
  );
};
