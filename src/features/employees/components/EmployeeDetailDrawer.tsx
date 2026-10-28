import { t } from '@/shared/i18n/t';
import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Center,
  Group,
  Paper,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconAddressBook,
  IconCalendarPlus,
  IconCalculator,
  IconClock,
  IconCoin,
  IconHammer,
  IconHistory,
  IconId,
  IconKey,
  IconLock,
  IconMail,
  IconPercentage,
  IconPhone,
  IconPrinter,
  IconReceipt,
  IconTrendingUp,
  IconUserCheck,
  IconUsersGroup,
  IconBriefcase,
  IconEdit,
} from '@tabler/icons-react';
import { Employee, EMPLOYEE_ROLE_LABELS, EmployeeEarningRecord } from '../types';
import { useEmployeeEarnings } from '../hooks/useEmployeeEarnings';
import { CreateLoginModal } from '@/features/users/components/CreateLoginModal';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { PERMISSIONS } from '@/constants/permissions';
import { formatDateTime } from '@/shared/lib/date';
import { formatMoney } from '@/shared/lib/money';
import { sumEmployeeEarnings } from '@/shared/calculations';
import { useJobEarnings } from '@/shared/hooks/useJobEarnings';
import {
  AnimatedTabs,
  DrawerAfter,
  DrawerCard,
  DrawerFooter,
  DrawerGrid,
  DrawerHero,
  DrawerMain,
  DrawerRail,
  Figure,
  FooterDelete,
  InfoRow,
  KpiStrip,
  KpiTile,
  ListRow,
  RichDrawer,
} from '@/shared/components/drawer';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';

type EmployeeTab = 'history' | 'rules' | 'login';

const ROLE_DESCRIPTION: Record<string, string> = {
  technician: 'Assigned to Hardware Diagnostics, Device Disassembly, and Component Repairs.',
  printer: 'Assigned to Graphic Design, Sublimation Printing, and Print Equipment Operations.',
  sales: 'Assigned to POS Terminal Counter Billing, Item Sales, and Customer Intake.',
};

export interface EmployeeDetailDrawerProps {
  employee: Employee | null;
  opened: boolean;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

// Price and parts of the sample job; the server works out the profit and the commission.
const SAMPLE_PRICE_CENTS = 1_000_000;
const SAMPLE_MATERIAL_CENTS = 400_000;

const CommissionExample = ({ emp }: { emp: Employee }) => {
  const earnings = useJobEarnings({
    priceCents: SAMPLE_PRICE_CENTS,
    materialCostCents: SAMPLE_MATERIAL_CENTS,
    splitType: emp.defaultSplitType,
    splitValue: emp.defaultSplitValue,
  });
  const figures = earnings.data;
  return (
    <Text size="xs" c="dimmed" mt={2}>
      {figures === undefined
        ? t('Working out the figures...')
        : t(
            'A job priced at {price} with {parts} of parts leaves {profit} profit. This employee earns {commission}.'
          )
            .replace('{price}', formatMoney(SAMPLE_PRICE_CENTS))
            .replace('{parts}', formatMoney(SAMPLE_MATERIAL_CENTS))
            .replace('{profit}', formatMoney(figures.profitCents))
            .replace('{commission}', formatMoney(figures.commissionCents))}
      {figures !== undefined &&
        figures.capped &&
        ` ${t('A fixed commission is never more than the profit.')}`}
    </Text>
  );
};

export const EmployeeDetailDrawer = ({
  employee,
  opened,
  onClose,
  onEdit,
  onDelete,
}: EmployeeDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState<EmployeeTab>('history');
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
  const { totalEarnedCents, totalRevenueGeneratedCents } = sumEmployeeEarnings(safeEarnings);
  const totalJobsCompleted = safeEarnings.length;

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

  const loading = <Skeleton height={26} width={90} mt={2} />;

  return (
    <RichDrawer
      data={employee}
      opened={opened}
      onClose={handleClose}
      width="wide"
      title={{
        icon: <IconUserCheck size={20} />,
        text: t('Employee Profile & Commission'),
        subtitle: t('Staff details, assigned work & profit split earnings'),
      }}
      footer={(emp) => (
        <DrawerFooter
          start={
            <FooterDelete
              label={t('Delete')}
              hint={t('Delete Employee')}
              onClick={() => onDelete(emp)}
            />
          }
        >
          <Button variant="default" size="sm" onClick={handleClose}>
            {t('Close')}
          </Button>
          <Button
            variant="filled"
            color="blue"
            size="sm"
            leftSection={<IconEdit size={16} />}
            onClick={() => onEdit(emp)}
          >
            {t('Edit Details')}
          </Button>
        </DrawerFooter>
      )}
    >
      {(emp) => {
        const active = emp.status === 'active';
        const percentage = emp.defaultSplitType === 'percentage';
        const ruleText = percentage
          ? `${emp.defaultSplitValue}%`
          : formatMoney(emp.defaultSplitValue);
        const roleLabel = EMPLOYEE_ROLE_LABELS[emp.role] || emp.role;

        return (
          <DrawerGrid>
            <KpiStrip>
              <KpiTile icon={<IconCoin size={16} />} color="blue" label={t('Commission')}>
                {isEarningsLoading ? (
                  loading
                ) : (
                  <Figure value={formatMoney(totalEarnedCents)} hint={t('Earned')} color="blue" />
                )}
              </KpiTile>
              <KpiTile icon={<IconHammer size={16} />} color="gray" label={t('Work Done')}>
                {isEarningsLoading ? (
                  loading
                ) : (
                  <Figure value={String(totalJobsCompleted)} hint={t('jobs')} color="gray" />
                )}
              </KpiTile>
              <KpiTile icon={<IconTrendingUp size={16} />} color="teal" label={t('Revenue')}>
                {isEarningsLoading ? (
                  loading
                ) : (
                  <Figure
                    value={formatMoney(totalRevenueGeneratedCents)}
                    hint={t('Brought in')}
                    color="teal"
                  />
                )}
              </KpiTile>
              <KpiTile
                icon={percentage ? <IconPercentage size={16} /> : <IconCoin size={16} />}
                color={percentage ? 'blue' : 'teal'}
                label={t('Default Commission Rule')}
              >
                <Figure
                  value={ruleText}
                  hint={percentage ? t('of job profit') : t('per job')}
                  color={percentage ? 'blue' : 'teal'}
                />
              </KpiTile>
            </KpiStrip>

            <DrawerRail>
              <DrawerHero
                accent={active ? 'blue' : 'gray'}
                icon={<IconUserCheck size={32} />}
                status={{
                  color: active ? 'green' : 'gray',
                  label: active ? t('Active') : t('Inactive'),
                }}
                title={emp.name}
                subtitle={
                  <>
                    <Text size="sm" fw={700} c="var(--text-primary)">
                      {roleLabel}
                    </Text>
                    {emp.phone ? (
                      <Group gap={6} wrap="nowrap">
                        <IconPhone size={14} style={{ flexShrink: 0 }} />
                        {emp.phone}
                      </Group>
                    ) : null}
                    {emp.nicOrId ? (
                      <Group gap={6} wrap="nowrap">
                        <IconId size={14} style={{ flexShrink: 0 }} />
                        {t('NIC:')} {emp.nicOrId}
                      </Group>
                    ) : null}
                  </>
                }
              />

              <DrawerAfter>
                <DrawerCard label={t('Contact & Role')} icon={<IconAddressBook size={14} />}>
                  <Stack gap="sm">
                    <Box>
                      <Text size="xs" c="dimmed" fw={500} mb={4}>
                        {t('Contact Phone Number')}
                      </Text>
                      <PhoneDisplay primaryPhone={emp.phone} layout="stack" />
                    </Box>
                    <Text size="xs" c="dimmed">
                      {ROLE_DESCRIPTION[emp.role] ?? 'General shop duties and operational support.'}
                    </Text>
                    {emp.notes ? (
                      <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                        {emp.notes}
                      </Text>
                    ) : null}
                  </Stack>
                </DrawerCard>
              </DrawerAfter>

              <DrawerAfter>
                <DrawerCard label={t('Details')} icon={<IconClock size={14} />}>
                  <Stack gap="xs">
                    <InfoRow icon={<IconCalendarPlus size={16} />} label={t('Registered On')}>
                      {formatDateTime(emp.createdAt)}
                    </InfoRow>
                    <InfoRow icon={<IconClock size={16} />} label={t('Last Updated')}>
                      {formatDateTime(emp.updatedAt)}
                    </InfoRow>
                  </Stack>
                </DrawerCard>
              </DrawerAfter>
            </DrawerRail>

            <DrawerMain>
              <AnimatedTabs<EmployeeTab>
                value={activeTab}
                onChange={setActiveTab}
                tabs={[
                  {
                    value: 'history',
                    label: t('History'),
                    icon: <IconHistory size={16} />,
                    count: safeEarnings.length,
                  },
                  { value: 'rules', label: t('Split Rules'), icon: <IconPercentage size={16} /> },
                  { value: 'login', label: t('Login'), icon: <IconKey size={16} /> },
                ]}
              >
                {(value) => {
                  if (value === 'history') {
                    return (
                      <Stack gap="sm">
                        <Group justify="space-between" align="center" wrap="wrap">
                          <Text size="sm" fw={700}>
                            {t('Assigned Work & Earned Split')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {t('Showing')} {filteredEarnings.length} {t('of')} {safeEarnings.length}{' '}
                            {t('records')}
                          </Text>
                        </Group>

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

                        {isEarningsLoading ? (
                          <Stack gap={6} py="xs">
                            <Skeleton height={56} />
                            <Skeleton height={56} />
                          </Stack>
                        ) : filteredEarnings.length === 0 ? (
                          <Center py="md">
                            <Stack gap={6} align="center">
                              <IconReceipt size={24} style={{ opacity: 0.4 }} />
                              <Text size="sm" c="dimmed" ta="center">
                                {t('No work or commission records found for this filter.')}
                              </Text>
                            </Stack>
                          </Center>
                        ) : (
                          <ScrollArea.Autosize
                            mah="45dvh"
                            offsetScrollbars
                            classNames={{ viewport: 'scrollarea-fluid-content' }}
                          >
                            {filteredEarnings.map((rec: EmployeeEarningRecord, index) => {
                              const isRepair = rec.workType === 'repair';
                              const WorkIcon = isRepair ? IconHammer : IconPrinter;
                              const done = rec.status === 'completed';
                              return (
                                <ListRow
                                  key={rec.workId}
                                  index={index}
                                  first={index === 0}
                                  icon={
                                    <WorkIcon
                                      size={20}
                                      style={{
                                        color: `var(--mantine-color-${isRepair ? 'orange' : 'teal'}-6)`,
                                      }}
                                    />
                                  }
                                  title={`${rec.ticketOrInvoiceNumber} · ${rec.description}`}
                                  meta={
                                    <>
                                      <div>
                                        {formatDateTime(rec.createdAt)} · {t('Customer:')}{' '}
                                        {rec.customerName}
                                      </div>
                                      <div>
                                        {t('Total:')} {formatMoney(rec.totalAmountCents)}
                                        {rec.profitCents !== undefined && rec.profitCents > 0
                                          ? ` · ${t('Profit:')} ${formatMoney(rec.profitCents)}`
                                          : ''}
                                        {` · ${t('Split:')} ${
                                          rec.splitType === 'percentage'
                                            ? `${rec.splitValue}%`
                                            : formatMoney(rec.splitValue)
                                        }`}
                                      </div>
                                    </>
                                  }
                                  trailing={
                                    <>
                                      <Text size="md" fw={800} c="blue">
                                        {formatMoney(rec.earnedAmountCents)}
                                      </Text>
                                      <Text size="xs" fw={700} c={done ? 'green' : 'orange'}>
                                        {done ? t('Completed') : t('Pending')}
                                      </Text>
                                    </>
                                  }
                                />
                              );
                            })}
                          </ScrollArea.Autosize>
                        )}
                      </Stack>
                    );
                  }

                  if (value === 'rules') {
                    return (
                      <Stack gap="md">
                        <Box>
                          <Text size="sm" fw={700} mb={6}>
                            {t('Profit Split Configuration')}
                          </Text>
                          <Paper p="sm" bg="var(--bg-app)">
                            <Group gap="sm" align="flex-start" wrap="nowrap">
                              {percentage ? (
                                <IconPercentage
                                  size={22}
                                  style={{ color: 'var(--mantine-color-blue-6)' }}
                                />
                              ) : (
                                <IconCoin
                                  size={22}
                                  style={{ color: 'var(--mantine-color-teal-6)' }}
                                />
                              )}
                              <div style={{ flex: 1 }}>
                                <Text size="sm" fw={700}>
                                  {percentage
                                    ? `Percentage of Job Profit: ${emp.defaultSplitValue}%`
                                    : `Fixed Commission per Job: ${formatMoney(emp.defaultSplitValue)}`}
                                </Text>
                                <Text size="xs" c="dimmed" mt={4}>
                                  {percentage
                                    ? `When this employee completes an assigned repair or print order, their commission is automatically calculated as ${emp.defaultSplitValue}% of the net profit (job revenue minus material/parts cost).`
                                    : `When this employee completes an assigned job, they receive a guaranteed flat commission of ${formatMoney(emp.defaultSplitValue)} regardless of order size or material cost.`}
                                </Text>
                              </div>
                            </Group>
                          </Paper>
                        </Box>

                        <Box>
                          <Text size="sm" fw={700} mb={6}>
                            {t('Calculation Example')}
                          </Text>
                          <Paper p="sm" bg="var(--bg-app)">
                            <Group gap="xs" align="flex-start" wrap="nowrap">
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
                                  {t('Sample Job Scenario:')}
                                </Text>
                                <CommissionExample emp={emp} />
                              </div>
                            </Group>
                          </Paper>
                        </Box>
                      </Stack>
                    );
                  }

                  return emp.login ? (
                    <Stack gap="sm">
                      <Text size="sm" fw={700}>
                        {t('Login Account')}
                      </Text>
                      <Paper p="sm" bg="var(--bg-app)">
                        <Stack gap="xs">
                          <InfoRow icon={<IconMail size={16} />} label={t('Username')}>
                            {emp.login.username}
                          </InfoRow>
                          <InfoRow icon={<IconBriefcase size={16} />} label={t('Role')}>
                            {emp.login.role}
                          </InfoRow>
                          <InfoRow icon={<IconUsersGroup size={16} />} label={t('Status')}>
                            <Text span inherit c={emp.login.isActive ? 'green' : 'dimmed'}>
                              {emp.login.isActive ? t('Active') : t('Deactivated')}
                            </Text>
                          </InfoRow>
                        </Stack>
                      </Paper>
                    </Stack>
                  ) : (
                    <Center py="md">
                      <Stack gap={8} align="center">
                        <IconLock size={24} style={{ opacity: 0.4 }} />
                        <Text size="sm" c="dimmed" ta="center">
                          {t(
                            'This employee does not have a login yet. Create one so they can sign in to the app.'
                          )}
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
                            {t('Create Login')}
                          </Button>
                        </PermissionGuard>
                      </Stack>
                    </Center>
                  );
                }}
              </AnimatedTabs>
            </DrawerMain>

            <CreateLoginModal
              opened={createLoginOpen}
              onClose={() => setCreateLoginOpen(false)}
              employee={emp}
            />
          </DrawerGrid>
        );
      }}
    </RichDrawer>
  );
};
