import { useState, useMemo } from 'react';
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
  Skeleton,
  Tabs,
  SegmentedControl,
  Center,
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
  IconClock,
  IconBriefcase,
  IconTrendingUp,
  IconCalculator,
  IconTag,
  IconKey,
  IconMail,
  IconLock,
} from '@tabler/icons-react';
import { Employee, EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord } from '../types';
import { useEmployeeEarnings } from '../hooks/useEmployeeEarnings';
import { CreateLoginModal } from '@/features/users/components/CreateLoginModal';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { PERMISSIONS } from '@/constants/permissions';
import { formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { useIsMobile } from '@/shared/hooks/useResponsive';

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
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>('history');
  const [workTypeFilter, setWorkTypeFilter] = useState<'all' | 'repair' | 'print'>('all');
  const [createLoginOpen, setCreateLoginOpen] = useState(false);

  const {
    data: earnings = [],
    isLoading: loadingEarnings,
    isPending: pendingEarnings,
    isFetching: fetchingEarnings,
  } = useEmployeeEarnings(employee?.key);

  const isEarningsLoading = loadingEarnings || pendingEarnings || fetchingEarnings || !earnings;
  const safeEarnings = useMemo(() => earnings ?? [], [earnings]);

  // Summary Metrics
  const totalEarnedCents = safeEarnings.reduce((acc, curr) => acc + curr.earnedAmountCents, 0);
  const totalJobsCompleted = safeEarnings.length;
  const totalRevenueGeneratedCents = safeEarnings.reduce(
    (acc, curr) => acc + curr.totalAmountCents,
    0
  );

  // Filtered earnings list
  const filteredEarnings = useMemo(() => {
    if (workTypeFilter === 'all') return safeEarnings;
    return safeEarnings.filter((e) => e.workType === workTypeFilter);
  }, [safeEarnings, workTypeFilter]);

  const handleClose = () => {
    setActiveTab('history');
    setWorkTypeFilter('all');
    onClose();
  };

  return (
    <DetailDrawer
      data={employee}
      opened={opened}
      onClose={handleClose}
      size={isMobile ? '100%' : 'md'}
      title={
        <Group gap="xs">
          <ThemeIcon color="blue" variant="light" size="lg" radius="var(--mantine-radius-default)">
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
          {/* Hero Identity Banner */}
          <Paper
            p="md"
            radius="var(--mantine-radius-default)"
            withBorder
            bg="var(--mantine-color-body)"
          >
            <Group justify="space-between" align="flex-start" mb="xs">
              <Group gap={6} wrap="wrap">
                <Badge color="blue" variant="filled" size="sm">
                  {EMPLOYEE_ROLE_LABELS[emp.role] || emp.role}
                </Badge>
                <Badge color={emp.status === 'active' ? 'green' : 'gray'} variant="light" size="sm">
                  {emp.status === 'active' ? 'Active Staff' : 'Inactive'}
                </Badge>
              </Group>
              <Badge color="gray" variant="outline" size="sm">
                {emp.id}
              </Badge>
            </Group>

            <Text fw={800} size="lg" mb={4}>
              {emp.name}
            </Text>

            <Group gap="md" wrap="wrap" mb="xs">
              {emp.phone && (
                <Group gap={6}>
                  <IconPhone
                    size={14}
                    style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }}
                  />
                  <Text size="xs" fw={600} c="dimmed">
                    {emp.phone}
                  </Text>
                </Group>
              )}
              {emp.nicOrId && (
                <Group gap={6}>
                  <IconId size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
                  <Text size="xs" c="dimmed">
                    NIC: {emp.nicOrId}
                  </Text>
                </Group>
              )}
            </Group>

            {/* Commission Rule Highlight */}
            <Paper p="xs" withBorder radius="var(--mantine-radius-default)" bg="var(--bg-app)">
              <Group justify="space-between" align="center">
                <Group gap={6}>
                  <IconPercentage size={14} style={{ color: 'var(--mantine-color-blue-6)' }} />
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Default Commission Rule
                  </Text>
                </Group>
                <Badge
                  color={emp.defaultSplitType === 'percentage' ? 'blue' : 'teal'}
                  variant="light"
                  size="sm"
                >
                  {emp.defaultSplitType === 'percentage'
                    ? `${emp.defaultSplitValue}% Profit Share`
                    : `${formatMoney(emp.defaultSplitValue)} Fixed / Job`}
                </Badge>
              </Group>
            </Paper>
          </Paper>

          {/* Performance & Earnings Snapshot */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Performance & Earnings Snapshot
          </Text>

          <Paper p="md" withBorder radius="var(--mantine-radius-default)">
            <Grid gap={0} align="flex-start">
              <Grid.Col
                span={4}
                pr="sm"
                style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
              >
                <Stack gap={2}>
                  <Group gap={4} wrap="nowrap">
                    <IconCoin
                      size={12}
                      style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }}
                    />
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Commission
                    </Text>
                  </Group>
                  {isEarningsLoading ? (
                    <Skeleton height={20} width={60} mt={2} />
                  ) : (
                    <Text fw={800} size="md" c="blue">
                      {formatMoney(totalEarnedCents)}
                    </Text>
                  )}
                </Stack>
              </Grid.Col>

              <Grid.Col
                span={4}
                px="sm"
                style={{ borderRight: '1px solid var(--mantine-color-default-border)' }}
              >
                <Stack gap={2}>
                  <Group gap={4} wrap="nowrap">
                    <IconBriefcase
                      size={12}
                      style={{ color: 'var(--mantine-color-teal-6)', flexShrink: 0 }}
                    />
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Work Done
                    </Text>
                  </Group>
                  {isEarningsLoading ? (
                    <Skeleton height={20} width={40} mt={2} />
                  ) : (
                    <Group gap={4} align="baseline">
                      <Text fw={800} size="md" c="teal">
                        {totalJobsCompleted}
                      </Text>
                      <Text size="xs" c="dimmed">
                        jobs
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Grid.Col>

              <Grid.Col span={4} pl="sm">
                <Stack gap={2}>
                  <Group gap={4} wrap="nowrap">
                    <IconTrendingUp
                      size={12}
                      style={{ color: 'var(--mantine-color-teal-6)', flexShrink: 0 }}
                    />
                    <Text size="xs" c="dimmed" tt="uppercase">
                      Revenue
                    </Text>
                  </Group>
                  {isEarningsLoading ? (
                    <Skeleton height={20} width={60} mt={2} />
                  ) : (
                    <Text fw={800} size="md" c="teal">
                      {formatMoney(totalRevenueGeneratedCents)}
                    </Text>
                  )}
                </Stack>
              </Grid.Col>
            </Grid>
          </Paper>

          <Divider my="xs" />

          {/* Tabbed Navigation */}
          <Tabs
            value={activeTab}
            onChange={(val) => setActiveTab(val ?? 'history')}
            color="blue"
            mt="xs"
          >
            <Tabs.List grow>
              <Tabs.Tab
                value="history"
                rightSection={
                  <Badge size="xs" variant="light" color="gray" circle>
                    {safeEarnings.length}
                  </Badge>
                }
              >
                History
              </Tabs.Tab>
              <Tabs.Tab value="rules">Split Rules</Tabs.Tab>
              <Tabs.Tab value="login">Login</Tabs.Tab>
              <Tabs.Tab value="details">Details</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          {/* TAB 1: Commission & Work History */}
          {activeTab === 'history' && (
            <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
              <Stack gap="sm">
                <Group justify="space-between" align="center" wrap="wrap">
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    Assigned Work & Earned Split
                  </Text>
                  <Text size="xs" c="dimmed">
                    Showing {filteredEarnings.length} of {safeEarnings.length} records
                  </Text>
                </Group>

                {/* Work Type Filter */}
                <SegmentedControl
                  value={workTypeFilter}
                  onChange={(val) => setWorkTypeFilter(val as 'all' | 'repair' | 'print')}
                  data={[
                    { label: `All (${safeEarnings.length})`, value: 'all' },
                    {
                      label: `Repairs (${safeEarnings.filter((e) => e.workType === 'repair').length})`,
                      value: 'repair',
                    },
                    {
                      label: `Prints (${safeEarnings.filter((e) => e.workType === 'print').length})`,
                      value: 'print',
                    },
                  ]}
                  fullWidth
                  size="xs"
                />

                {/* Earnings List / Empty State */}
                {isEarningsLoading ? (
                  <Stack gap={6} py="xs">
                    <Skeleton height={56} radius="var(--mantine-radius-default)" />
                    <Skeleton height={56} radius="var(--mantine-radius-default)" />
                  </Stack>
                ) : filteredEarnings.length === 0 ? (
                  <Paper
                    p="md"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    bg="var(--mantine-color-body)"
                  >
                    <Center py="sm">
                      <Stack gap={4} align="center">
                        <IconReceipt size={24} style={{ opacity: 0.4 }} />
                        <Text size="xs" c="dimmed" ta="center">
                          No work or commission records found for this filter.
                        </Text>
                      </Stack>
                    </Center>
                  </Paper>
                ) : (
                  <ScrollArea.Autosize
                    mah="40dvh"
                    offsetScrollbars
                    classNames={{ viewport: 'scrollarea-fluid-content' }}
                  >
                    <Stack gap={6} pt={2} pb={2} px={1}>
                      {filteredEarnings.map((rec: EmployeeEarningRecord) => {
                        const WorkIcon = rec.workType === 'repair' ? IconHammer : IconPrinter;
                        const workColor = rec.workType === 'repair' ? 'orange' : 'teal';

                        return (
                          <Paper
                            key={rec.workId}
                            p="xs"
                            withBorder
                            radius="var(--mantine-radius-default)"
                          >
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                              <Group gap="xs" align="flex-start" style={{ minWidth: 0, flex: 1 }}>
                                <ThemeIcon
                                  size="md"
                                  color={workColor}
                                  variant="light"
                                  radius="var(--mantine-radius-default)"
                                  style={{ flexShrink: 0, marginTop: 2 }}
                                >
                                  <WorkIcon size={16} />
                                </ThemeIcon>

                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <Group gap="xs" align="center" wrap="wrap">
                                    <Badge size="xs" variant="filled" color={workColor}>
                                      {rec.ticketOrInvoiceNumber}
                                    </Badge>
                                    <Text size="xs" c="dimmed">
                                      {formatDateTime(rec.createdAt)}
                                    </Text>
                                  </Group>

                                  <Text size="sm" fw={700} lineClamp={1} mt={4}>
                                    {rec.description}
                                  </Text>
                                  <Text size="xs" c="dimmed" lineClamp={1}>
                                    Customer: {rec.customerName}
                                  </Text>

                                  <Group gap={6} mt={6} wrap="wrap">
                                    <Badge size="xs" variant="outline" color="gray">
                                      Total: {formatMoney(rec.totalAmountCents)}
                                    </Badge>
                                    {rec.profitCents !== undefined && rec.profitCents > 0 && (
                                      <Badge size="xs" variant="light" color="teal">
                                        Profit: {formatMoney(rec.profitCents)}
                                      </Badge>
                                    )}
                                    <Badge
                                      size="xs"
                                      variant="light"
                                      color={rec.splitType === 'percentage' ? 'blue' : 'teal'}
                                    >
                                      Split:{' '}
                                      {rec.splitType === 'percentage'
                                        ? `${rec.splitValue}%`
                                        : formatMoney(rec.splitValue)}
                                    </Badge>
                                  </Group>
                                </div>
                              </Group>

                              <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                                  Commission
                                </Text>
                                <Text size="md" fw={800} c="blue">
                                  {formatMoney(rec.earnedAmountCents)}
                                </Text>
                                <Badge
                                  size="xs"
                                  variant="light"
                                  color={rec.status === 'completed' ? 'green' : 'orange'}
                                >
                                  {rec.status === 'completed' ? 'Completed' : 'Pending'}
                                </Badge>
                              </Stack>
                            </Group>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </ScrollArea.Autosize>
                )}
              </Stack>
            </Paper>
          )}

          {/* TAB 2: Commission & Split Rules */}
          {activeTab === 'rules' && (
            <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
              <Stack gap="md">
                <div>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                    Profit Split Configuration
                  </Text>
                  <Paper
                    p="md"
                    withBorder
                    bg="var(--mantine-color-body)"
                    radius="var(--mantine-radius-default)"
                  >
                    <Group gap="sm" align="flex-start">
                      <ThemeIcon
                        size="lg"
                        color={emp.defaultSplitType === 'percentage' ? 'blue' : 'teal'}
                        variant="light"
                        radius="var(--mantine-radius-default)"
                      >
                        {emp.defaultSplitType === 'percentage' ? (
                          <IconPercentage size={20} />
                        ) : (
                          <IconCoin size={20} />
                        )}
                      </ThemeIcon>
                      <div style={{ flex: 1 }}>
                        <Text size="sm" fw={700}>
                          {emp.defaultSplitType === 'percentage'
                            ? `Percentage of Job Profit: ${emp.defaultSplitValue}%`
                            : `Fixed Commission per Job: ${formatMoney(emp.defaultSplitValue)}`}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {emp.defaultSplitType === 'percentage'
                            ? `When this employee completes an assigned repair or print order, their commission is automatically calculated as ${emp.defaultSplitValue}% of the net profit (job revenue minus material/parts cost).`
                            : `When this employee completes an assigned job, they receive a guaranteed flat commission of ${formatMoney(emp.defaultSplitValue)} regardless of order size or material cost.`}
                        </Text>
                      </div>
                    </Group>
                  </Paper>
                </div>

                <Divider color="var(--mantine-color-default-border)" />

                {/* Practical Example */}
                <div>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                    Calculation Example
                  </Text>
                  <Paper
                    p="sm"
                    withBorder
                    bg="var(--bg-app)"
                    radius="var(--mantine-radius-default)"
                  >
                    <Group gap="xs" align="flex-start">
                      <IconCalculator
                        size={18}
                        style={{
                          color: 'var(--mantine-color-blue-6)',
                          marginTop: 2,
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <Text size="xs" fw={600}>
                          Sample Job Scenario:
                        </Text>
                        <Text size="xs" c="dimmed" mt={2}>
                          {emp.defaultSplitType === 'percentage'
                            ? `On a repair job priced at Rs. 10,000 with Rs. 4,000 spare part cost (Rs. 6,000 profit), this employee earns ${formatMoney(
                                Math.round(600000 * (emp.defaultSplitValue / 100))
                              )} (${emp.defaultSplitValue}%).`
                            : `On any completed job assigned to this employee, they earn ${formatMoney(
                                emp.defaultSplitValue
                              )} fixed.`}
                        </Text>
                      </div>
                    </Group>
                  </Paper>
                </div>

                <Divider color="var(--mantine-color-default-border)" />

                {/* Role Overview */}
                <div>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                    Role & Assigned Department
                  </Text>
                  <Paper
                    p="sm"
                    withBorder
                    bg="var(--mantine-color-body)"
                    radius="var(--mantine-radius-default)"
                  >
                    <Group gap="xs">
                      <Badge color="blue" variant="light" size="sm">
                        {EMPLOYEE_ROLE_LABELS[emp.role] || emp.role}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {emp.role === 'technician'
                          ? 'Assigned to Hardware Diagnostics, Device Disassembly, and Component Repairs.'
                          : emp.role === 'printer'
                            ? 'Assigned to Graphic Design, Sublimation Printing, and Print Equipment Operations.'
                            : emp.role === 'sales'
                              ? 'Assigned to POS Terminal Counter Billing, Item Sales, and Customer Intake.'
                              : 'General shop duties and operational support.'}
                      </Text>
                    </Group>
                  </Paper>
                </div>
              </Stack>
            </Paper>
          )}

          {/* TAB 3: Login Access */}
          {activeTab === 'login' && (
            <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
              <Stack gap="md">
                {emp.login ? (
                  <div>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                      Login Account
                    </Text>
                    <Paper
                      p="md"
                      withBorder
                      bg="var(--mantine-color-body)"
                      radius="var(--mantine-radius-default)"
                    >
                      <Stack gap="xs">
                        <Group gap="xs">
                          <IconMail size={16} style={{ color: 'var(--mantine-color-blue-6)' }} />
                          <Text size="sm" fw={600}>
                            {emp.login.email}
                          </Text>
                        </Group>
                        <Group gap="xs" wrap="wrap">
                          <Badge color="blue" variant="light" size="sm">
                            {emp.login.role}
                          </Badge>
                          <Badge
                            color={emp.login.isActive ? 'green' : 'gray'}
                            variant="light"
                            size="sm"
                          >
                            {emp.login.isActive ? 'Active' : 'Deactivated'}
                          </Badge>
                        </Group>
                      </Stack>
                    </Paper>
                  </div>
                ) : (
                  <Paper
                    p="md"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    bg="var(--mantine-color-body)"
                  >
                    <Center py="sm">
                      <Stack gap={8} align="center">
                        <IconLock size={24} style={{ opacity: 0.4 }} />
                        <Text size="xs" c="dimmed" ta="center">
                          This employee does not have a login yet. Create one so they can sign in to
                          the app.
                        </Text>
                        <PermissionGuard
                          permissions={[PERMISSIONS.USERS_MANAGE, PERMISSIONS.USERS_MANAGE_STAFF]}
                          fallback={null}
                        >
                          <Button
                            variant="light"
                            color="blue"
                            size="xs"
                            leftSection={<IconKey size={14} />}
                            onClick={() => setCreateLoginOpen(true)}
                          >
                            Create Login
                          </Button>
                        </PermissionGuard>
                      </Stack>
                    </Center>
                  </Paper>
                )}
              </Stack>
            </Paper>
          )}

          {/* TAB 4: Contact & Staff Details */}
          {activeTab === 'details' && (
            <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
              <Stack gap="md">
                <div>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                    Contact Phone Number
                  </Text>
                  <PhoneDisplay primaryPhone={emp.phone} layout="stack" />
                </div>

                {emp.nicOrId && (
                  <>
                    <Divider color="var(--mantine-color-default-border)" />
                    <div>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                        National Identity Card (NIC) / Staff ID
                      </Text>
                      <Group gap="xs" align="center">
                        <IconId
                          size={18}
                          style={{
                            color: 'var(--mantine-color-blue-6)',
                            flexShrink: 0,
                          }}
                        />
                        <Text size="sm" fw={600}>
                          {emp.nicOrId}
                        </Text>
                      </Group>
                    </div>
                  </>
                )}

                {emp.notes && (
                  <>
                    <Divider color="var(--mantine-color-default-border)" />
                    <div>
                      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={6}>
                        Notes & Special Qualifications
                      </Text>
                      <Paper
                        p="sm"
                        withBorder
                        bg="var(--mantine-color-body)"
                        radius="var(--mantine-radius-default)"
                      >
                        <Text size="sm" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                          {emp.notes}
                        </Text>
                      </Paper>
                    </div>
                  </>
                )}
              </Stack>
            </Paper>
          )}

          <Divider my="xs" />

          {/* System Metadata */}
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Metadata
          </Text>

          <Stack gap="xs">
            <Group justify="space-between">
              <Group gap="xs">
                <IconCalendar size={16} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  Registered On
                </Text>
              </Group>
              <Text size="xs" fw={700}>
                {formatDateTime(emp.createdAt)}
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
                {formatDateTime(emp.updatedAt)}
              </Text>
            </Group>

            <Group justify="space-between">
              <Group gap="xs">
                <IconTag size={16} style={{ opacity: 0.6 }} />
                <Text size="xs" c="dimmed">
                  Staff ID
                </Text>
              </Group>
              <Text size="xs" fw={600} c="dimmed">
                {emp.id}
              </Text>
            </Group>
          </Stack>

          <Divider my="xs" />

          {/* Action Buttons */}
          <Group justify="space-between" mt="md">
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
              <Button variant="default" size="sm" onClick={handleClose}>
                Close
              </Button>
              <Button
                variant="filled"
                color="blue"
                size="sm"
                leftSection={<IconEdit size={16} />}
                onClick={() => onEdit(emp)}
              >
                Edit Details
              </Button>
            </Group>
          </Group>

          <CreateLoginModal
            opened={createLoginOpen}
            onClose={() => setCreateLoginOpen(false)}
            employee={emp}
          />
        </Stack>
      )}
    </DetailDrawer>
  );
};
