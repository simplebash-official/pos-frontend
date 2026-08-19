import { PageHeader } from '@/shared/components/PageHeader';
import {
  SimpleGrid,
  Paper,
  Title,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Table,
  Badge,
  Skeleton,
} from '@mantine/core';
import {
  IconReceipt,
  IconHammer,
  IconPrinter,
  IconScale,
  IconUserCheck,
  IconCoin,
  IconPercentage,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { formatMoney } from '@/shared/lib/money';
import { fetchEmployees, fetchAllEmployeeEarnings } from '@/features/employees/api/mockEmployees';
import { queryKeys } from '@/api/queryKeys';
import { EMPLOYEE_ROLE_LABELS } from '@/features/employees/types';

export const ReportsDashboard = () => {
  const {
    data: employees,
    isLoading: isLoadingEmployees,
    isPending: isPendingEmployees,
    isFetching: isFetchingEmployees,
  } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: fetchEmployees,
  });

  const {
    data: earnings,
    isLoading: isLoadingEarnings,
    isPending: isPendingEarnings,
    isFetching: isFetchingEarnings,
  } = useQuery({
    queryKey: queryKeys.employees.allEarnings(),
    queryFn: () => fetchAllEmployeeEarnings(),
  });

  const isLoading =
    isLoadingEmployees ||
    isLoadingEarnings ||
    isPendingEmployees ||
    isPendingEarnings ||
    isFetchingEmployees ||
    isFetchingEarnings ||
    !employees ||
    !earnings;

  const safeEmployees = employees ?? [];
  const safeEarnings = earnings ?? [];

  const totalCommissionsCents = safeEarnings.reduce((acc, curr) => acc + curr.earnedAmountCents, 0);
  const totalRevenueCents = 20750000; // LKR 207,500 total
  const estimatedGrossProfitCents = 7400000; // LKR 74,000 gross profit
  const netShopProfitCents = Math.max(0, estimatedGrossProfitCents - totalCommissionsCents);

  const stats = [
    {
      title: 'Total Revenue Today',
      valueCents: totalRevenueCents,
      icon: IconReceipt,
      color: 'blue',
    },
    { title: 'Repair Services Revenue', valueCents: 6300000, icon: IconHammer, color: 'orange' },
    { title: 'Print Jobs Revenue', valueCents: 4000000, icon: IconPrinter, color: 'teal' },
    {
      title: 'Employee Commission Splits',
      valueCents: totalCommissionsCents,
      icon: IconUserCheck,
      color: 'indigo',
    },
    {
      title: 'Net Shop Profit (After Splits)',
      valueCents: netShopProfitCents,
      icon: IconScale,
      color: 'green',
    },
  ];

  // Map employee performance for leaderboard
  const employeePerformance = safeEmployees.map((emp) => {
    const empEarnings = safeEarnings.filter((e) => e.employeeId === emp.id);
    const jobsCount = empEarnings.length;
    const revCents = empEarnings.reduce((acc, curr) => acc + curr.totalAmountCents, 0);
    const profitCents = empEarnings.reduce((acc, curr) => acc + curr.profitCents, 0);
    const earnedSplitCents = empEarnings.reduce((acc, curr) => acc + curr.earnedAmountCents, 0);
    const netShopContributionCents = Math.max(0, profitCents - earnedSplitCents);

    return {
      employee: emp,
      jobsCount,
      revCents,
      profitCents,
      earnedSplitCents,
      netShopContributionCents,
    };
  });

  return (
    <Stack gap="lg">
      <PageHeader
        title="Reports & Profit Intelligence"
        description="Unified financial intelligence across billing, repairs, print jobs, and employee profit split commissions"
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Paper key={stat.title} p="md" withBorder radius="var(--mantine-radius-default)">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  {stat.title}
                </Text>
                <ThemeIcon color={stat.color} variant="light" size="md">
                  <Icon size={18} />
                </ThemeIcon>
              </Group>

              <Group align="flex-end" gap="xs" mt={15}>
                {isLoading ? (
                  <Skeleton height={24} width={100} />
                ) : (
                  <Title order={4}>{formatMoney(stat.valueCents)}</Title>
                )}
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>

      {/* Employee Profit Split Leaderboard */}
      <Paper p="md" withBorder bg="var(--bg-card)" radius="var(--mantine-radius-default)">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <div>
              <Text fw={800} size="md" c="indigo">
                Employee Profit Split & Commission Breakdown
              </Text>
              <Text size="xs" c="dimmed">
                Track how much each employee earned vs net profit contribution to shop owner
              </Text>
            </div>
            <Badge color="indigo" variant="light" size="sm">
              No Fixed Salary • Profit Share
            </Badge>
          </Group>

          <Table
            striped
            highlightOnHover
            withTableBorder={false}
            verticalSpacing="sm"
            horizontalSpacing="md"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Employee Name & Role</Table.Th>
                <Table.Th ta="center">Default Split Rule</Table.Th>
                <Table.Th ta="right">Assigned Jobs</Table.Th>
                <Table.Th>Revenue Generated</Table.Th>
                <Table.Th>Employee Commission Payout</Table.Th>
                <Table.Th>Net Shop Owner Profit</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading
                ? Array.from({ length: 4 }, (_, i) => (
                    <Table.Tr key={`rep-skel-${i}`}>
                      <Table.Td>
                        <Skeleton height={16} width={120} mb={4} />
                        <Skeleton height={12} width={80} />
                      </Table.Td>
                      <Table.Td ta="center">
                        <Skeleton height={20} width={90} mx="auto" />
                      </Table.Td>
                      <Table.Td ta="right">
                        <Skeleton height={16} width={50} ms="auto" />
                      </Table.Td>
                      <Table.Td>
                        <Skeleton height={16} width={70} />
                      </Table.Td>
                      <Table.Td>
                        <Skeleton height={16} width={70} />
                      </Table.Td>
                      <Table.Td>
                        <Skeleton height={16} width={70} />
                      </Table.Td>
                    </Table.Tr>
                  ))
                : employeePerformance.map(
                    ({
                      employee,
                      jobsCount,
                      revCents,
                      earnedSplitCents,
                      netShopContributionCents,
                    }) => (
                      <Table.Tr key={employee.id}>
                        <Table.Td>
                          <div>
                            <Text size="sm" fw={700}>
                              {employee.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {EMPLOYEE_ROLE_LABELS[employee.role]}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td ta="center">
                          <Badge
                            size="xs"
                            variant="light"
                            color={employee.defaultSplitType === 'percentage' ? 'indigo' : 'teal'}
                          >
                            {employee.defaultSplitType === 'percentage' ? (
                              <Group gap={2}>
                                <IconPercentage size={12} />
                                <span>{employee.defaultSplitValue}% Profit</span>
                              </Group>
                            ) : (
                              <Group gap={2}>
                                <IconCoin size={12} />
                                <span>{formatMoney(employee.defaultSplitValue)} Fixed</span>
                              </Group>
                            )}
                          </Badge>
                        </Table.Td>
                        <Table.Td ta="right">
                          <Text size="sm" fw={600}>
                            {jobsCount} jobs
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {formatMoney(revCents)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={800} c="indigo">
                            {formatMoney(earnedSplitCents)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={800} c="green">
                            {formatMoney(netShopContributionCents)}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )
                  )}
            </Table.Tbody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
};
