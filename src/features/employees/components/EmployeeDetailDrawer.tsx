import {
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Divider,
  Button,
  ThemeIcon,
  ScrollArea,
  Grid,
  Card,
  Table,
  Skeleton,
} from '@mantine/core';
import {
  IconUserCheck,
  IconPhone,
  IconId,
  IconEdit,
  IconTrash,
  IconCalendar,
  IconCoin,
  IconPercentage,
  IconHammer,
  IconPrinter,
  IconReceipt,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Employee, EMPLOYEE_ROLE_LABELS } from '../types';
import { fetchEmployeeEarnings } from '../api/mockEmployees';
import { queryKeys } from '@/api/queryKeys';
import { formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { DetailDrawer } from '@/shared/components/DetailDrawer';

export interface EmployeeDetailDrawerProps {
  employee: Employee | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export const EmployeeDetailDrawer = ({
  employee,
  opened,
  onClose,
  onEdit,
  onDelete,
}: EmployeeDetailDrawerProps) => {
  const {
    data: earnings = [],
    isLoading: loadingEarnings,
    isPending: pendingEarnings,
    isFetching: fetchingEarnings,
  } = useQuery({
    queryKey: queryKeys.employees.earnings(employee?.id || ''),
    queryFn: () => fetchEmployeeEarnings(employee?.id),
    enabled: Boolean(employee?.id),
  });

  const isEarningsLoading = loadingEarnings || pendingEarnings || fetchingEarnings || !earnings;
  const safeEarnings = earnings ?? [];

  const totalEarnedCents = safeEarnings.reduce((acc, curr) => acc + curr.earnedAmountCents, 0);
  const totalJobsCompleted = safeEarnings.length;
  const totalRevenueGeneratedCents = safeEarnings.reduce(
    (acc, curr) => acc + curr.totalAmountCents,
    0
  );

  return (
    <DetailDrawer
      data={employee}
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon
            color="indigo"
            variant="light"
            size="lg"
            radius="var(--mantine-radius-default)"
          >
            <IconUserCheck size={20} />
          </ThemeIcon>
          <div>
            <Text fw={800} size="md">
              Employee Profile & Commission
            </Text>
            <Text size="xs" c="dimmed">
              Staff details, assigned work & profit split earnings
            </Text>
          </div>
        </Group>
      }
    >
      {(emp) => (
        <Stack gap="md" pt="xs">
          {/* Header Banner */}
          <Paper
            p="md"
            radius="var(--mantine-radius-default)"
            withBorder
            bg="var(--mantine-color-body)"
          >
            <Group justify="space-between" align="flex-start">
              <div>
                <Text fw={800} size="lg" mb={4}>
                  {emp.name}
                </Text>
                <Group gap="xs">
                  <Badge color="indigo" variant="filled" size="sm">
                    {EMPLOYEE_ROLE_LABELS[emp.role] || emp.role}
                  </Badge>
                  <Badge
                    color={emp.status === 'active' ? 'green' : 'gray'}
                    variant="light"
                    size="sm"
                  >
                    {emp.status.toUpperCase()}
                  </Badge>
                </Group>
              </div>

              <Paper p="xs" withBorder bg="var(--mantine-color-indigo-light)">
                <Text size="xs" fw={700} c="indigo" tt="uppercase">
                  Default Profit Split Rule
                </Text>
                <Group gap={4} mt={2}>
                  {emp.defaultSplitType === 'percentage' ? (
                    <>
                      <IconPercentage
                        size={16}
                        style={{ color: 'var(--mantine-color-indigo-6)' }}
                      />
                      <Text fw={800} size="md" c="indigo">
                        {emp.defaultSplitValue}% of Profit
                      </Text>
                    </>
                  ) : (
                    <>
                      <IconCoin size={16} style={{ color: 'var(--mantine-color-teal-6)' }} />
                      <Text fw={800} size="md" c="teal">
                        {formatMoney(emp.defaultSplitValue)} Fixed
                      </Text>
                    </>
                  )}
                </Group>
              </Paper>
            </Group>
          </Paper>

          {/* KPI Earnings Cards */}
          <Grid>
            <Grid.Col span={4}>
              <Card withBorder padding="xs" radius="var(--mantine-radius-default)" ta="center">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Total Earned
                </Text>
                {isEarningsLoading ? (
                  <Skeleton height={20} width={60} mx="auto" mt={4} />
                ) : (
                  <Text fw={800} size="md" c="indigo">
                    {formatMoney(totalEarnedCents)}
                  </Text>
                )}
              </Card>
            </Grid.Col>

            <Grid.Col span={4}>
              <Card withBorder padding="xs" radius="var(--mantine-radius-default)" ta="center">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Work Done
                </Text>
                {isEarningsLoading ? (
                  <Skeleton height={20} width={50} mx="auto" mt={4} />
                ) : (
                  <Text fw={800} size="md">
                    {totalJobsCompleted} Jobs
                  </Text>
                )}
              </Card>
            </Grid.Col>

            <Grid.Col span={4}>
              <Card withBorder padding="xs" radius="var(--mantine-radius-default)" ta="center">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Revenue Done
                </Text>
                {isEarningsLoading ? (
                  <Skeleton height={20} width={60} mx="auto" mt={4} />
                ) : (
                  <Text fw={800} size="md" c="teal">
                    {formatMoney(totalRevenueGeneratedCents)}
                  </Text>
                )}
              </Card>
            </Grid.Col>
          </Grid>

          {/* Contact & Identifiers */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Contact & Identity Details
          </Text>
          <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
            <Stack gap="xs">
              <Group justify="space-between">
                <Group gap="xs">
                  <IconPhone size={16} style={{ opacity: 0.6 }} />
                  <Text size="sm" fw={600}>
                    Phone Number:
                  </Text>
                </Group>
                <Text size="sm">{emp.phone}</Text>
              </Group>

              {emp.nicOrId && (
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconId size={16} style={{ opacity: 0.6 }} />
                    <Text size="sm" fw={600}>
                      NIC / ID Number:
                    </Text>
                  </Group>
                  <Text size="sm">{emp.nicOrId}</Text>
                </Group>
              )}
            </Stack>
          </Paper>

          {/* Earnings & Assigned Work History */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Work & Earned Commission History ({earnings.length})
          </Text>
          {earnings.length === 0 ? (
            <Paper p="md" withBorder radius="var(--mantine-radius-default)" ta="center">
              <Text size="sm" c="dimmed">
                No recorded job earnings yet for this employee.
              </Text>
            </Paper>
          ) : (
            <ScrollArea.Autosize mah={300} offsetScrollbars>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Ticket / Work</Table.Th>
                    <Table.Th>Customer & Description</Table.Th>
                    <Table.Th>Job Total</Table.Th>
                    <Table.Th>Split Rule</Table.Th>
                    <Table.Th>Earned Split</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {earnings.map((rec) => {
                    const WorkIcon =
                      rec.workType === 'repair'
                        ? IconHammer
                        : rec.workType === 'print'
                          ? IconPrinter
                          : IconReceipt;
                    const workColor =
                      rec.workType === 'repair'
                        ? 'orange'
                        : rec.workType === 'print'
                          ? 'teal'
                          : 'blue';
                    return (
                      <Table.Tr key={rec.id}>
                        <Table.Td>
                          <Group gap={6} wrap="nowrap">
                            <ThemeIcon size="xs" color={workColor} variant="light">
                              <WorkIcon size={12} />
                            </ThemeIcon>
                            <Text size="xs" fw={700}>
                              {rec.ticketOrInvoiceNumber}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" fw={600} lineClamp={1}>
                            {rec.description}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {rec.customerName}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs">{formatMoney(rec.totalAmountCents)}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            size="xs"
                            variant="light"
                            color={rec.splitType === 'percentage' ? 'indigo' : 'teal'}
                          >
                            {rec.splitType === 'percentage'
                              ? `${rec.splitValue}%`
                              : formatMoney(rec.splitValue)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" fw={800} c="indigo">
                            {formatMoney(rec.earnedAmountCents)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea.Autosize>
          )}

          {/* Notes */}
          {emp.notes && (
            <>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                Notes & Qualifications
              </Text>
              <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
                <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                  {emp.notes}
                </Text>
              </Paper>
            </>
          )}

          <Divider my="xs" />

          {/* Metadata */}
          <Stack gap="xs">
            <Group justify="space-between">
              <Group gap="xs">
                <IconCalendar size={14} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  Registered On
                </Text>
              </Group>
              <Text size="xs" fw={600}>
                {formatDateTime(emp.createdAt)}
              </Text>
            </Group>
          </Stack>

          <Divider my="xs" />

          {/* Actions */}
          <Group justify="space-between" mt="sm">
            <Button
              variant="light"
              color="red"
              size="sm"
              leftSection={<IconTrash size={16} />}
              onClick={() => onDelete(emp)}
            >
              Delete
            </Button>

            <Group gap="sm">
              <Button variant="default" size="sm" onClick={onClose}>
                Close
              </Button>
              <Button
                color="indigo"
                size="sm"
                leftSection={<IconEdit size={16} />}
                onClick={() => onEdit(emp)}
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
