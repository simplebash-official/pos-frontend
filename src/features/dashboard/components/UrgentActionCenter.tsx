import { t } from '@/shared/i18n/t';
import { useMemo, useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  ThemeIcon,
  SegmentedControl,
  Select,
  Pagination,
  Box,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconPhone,
  IconPackage,
  IconHammer,
  IconClockExclamation,
  IconArrowRight,
  IconFileDollar,
  IconCheck,
  IconSortDescending,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { UrgentActionItem, UrgentItemType } from '../types';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface UrgentActionCenterProps {
  items: UrgentActionItem[];
}

export type UrgentSortOption = 'urgency' | 'days' | 'amount' | 'date';

const SEVERITY_WEIGHT: Record<'critical' | 'warning' | 'info', number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

const PAGE_SIZE = 5;

export const UrgentActionCenter = ({ items }: UrgentActionCenterProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<UrgentSortOption>('urgency');
  const [page, setPage] = useState<number>(1);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const handleFilterChange = (val: string) => {
    setFilter(val);
    setPage(1);
  };

  const handleSortChange = (val: string | null) => {
    if (val) {
      setSortBy(val as UrgentSortOption);
      setPage(1);
    }
  };

  const activeItems = useMemo(
    () => items.filter((item) => !dismissedIds.has(item.id)),
    [items, dismissedIds]
  );

  const filteredItems = useMemo(
    () =>
      activeItems.filter((item) => {
        if (filter === 'all') return true;
        if (filter === 'repairs')
          return (
            item.type === 'pending_approval' ||
            item.type === 'overdue_repair' ||
            item.type === 'due_soon_job' ||
            item.type === 'uncollected'
          );
        if (filter === 'stock') return item.type === 'stockout';
        if (filter === 'credit')
          return item.type === 'credit_overdue' || item.type === 'credit_due_soon';
        return true;
      }),
    [activeItems, filter]
  );

  // Sorted strictly in descending order across all modes,
  // with payment overdues ('credit_overdue') prioritized at the top.
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      // 1. Payment overdues always come to the top
      const isPaymentOverdueA = a.type === 'credit_overdue';
      const isPaymentOverdueB = b.type === 'credit_overdue';
      if (isPaymentOverdueA && !isPaymentOverdueB) return -1;
      if (!isPaymentOverdueA && isPaymentOverdueB) return 1;

      if (sortBy === 'urgency') {
        // 1. Severity weight descending (Critical > Warning > Info)
        const weightDiff = (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
        if (weightDiff !== 0) return weightDiff;

        // 2. Overdue / waiting duration descending (most overdue / waiting longest first)
        const daysA = a.daysWaiting ?? 0;
        const daysB = b.daysWaiting ?? 0;
        if (daysB !== daysA) return daysB - daysA;

        // 3. Amount descending
        const amtA = a.amountCents ?? 0;
        const amtB = b.amountCents ?? 0;
        if (amtB !== amtA) return amtB - amtA;

        // 4. Raw date descending (newest first)
        if (a.rawDate && b.rawDate) {
          return new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime();
        }
        return 0;
      }

      if (sortBy === 'days') {
        // Days waiting / overdue descending
        const daysA = a.daysWaiting ?? 0;
        const daysB = b.daysWaiting ?? 0;
        if (daysB !== daysA) return daysB - daysA;
        return (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
      }

      if (sortBy === 'amount') {
        // Amount descending
        const amtA = a.amountCents ?? 0;
        const amtB = b.amountCents ?? 0;
        if (amtB !== amtA) return amtB - amtA;
        return (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
      }

      if (sortBy === 'date') {
        // Date descending (newest first)
        const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
        const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return (SEVERITY_WEIGHT[b.severity] || 0) - (SEVERITY_WEIGHT[a.severity] || 0);
      }

      return 0;
    });
  }, [filteredItems, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedItems.slice(start, start + PAGE_SIZE);
  }, [sortedItems, currentPage]);

  // Nothing to act on: one quiet row instead of an empty card with filters.
  if (activeItems.length === 0) {
    return (
      <Paper
        p="md"
        withBorder
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon color="green" variant="light" size="md" radius="xl">
            <IconCheck size={16} />
          </ThemeIcon>
          <Text size="sm" fw={600}>
            {t('All caught up!')}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={1}>
            {t('Nothing needs your attention right now.')}
          </Text>
        </Group>
      </Paper>
    );
  }

  const getItemIcon = (type: UrgentItemType) => {
    switch (type) {
      case 'stockout':
        return <IconPackage size={18} />;
      case 'pending_approval':
        return <IconPhone size={18} />;
      case 'overdue_repair':
        return <IconClockExclamation size={18} />;
      case 'due_soon_job':
        return <IconClockExclamation size={18} />;
      case 'uncollected':
        return <IconHammer size={18} />;
      case 'credit_overdue':
      case 'credit_due_soon':
        return <IconFileDollar size={18} />;
    }
  };

  const getItemColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'red';
      case 'warning':
        return 'orange';
      case 'info':
        return 'blue';
    }
  };

  return (
    <Paper
      p={isMobile ? 'md' : 'lg'}
      withBorder
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <Stack gap="md">
        {/* Header and Filter/Sort Controls */}
        <Group
          justify="space-between"
          align={isMobile ? 'flex-start' : 'center'}
          wrap="wrap"
          gap="sm"
        >
          <Group gap="xs">
            <ThemeIcon color="red" variant="light" size="lg" radius="md">
              <IconAlertTriangle size={20} />
            </ThemeIcon>
            <div>
              <Group gap="xs" align="center">
                <Text fw={700} size="md">
                  {t('Urgent Action Center')}
                </Text>
                <Badge color="red" variant="filled" size="sm">
                  {activeItems.length} {t('Needs Attention')}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {t('Payments due, jobs to hand back, and low stock that needs you today')}
              </Text>
            </div>
          </Group>

          <Group
            gap="xs"
            wrap={isMobile ? 'wrap' : 'nowrap'}
            style={{ width: isMobile ? '100%' : 'auto' }}
          >
            <SegmentedControl
              size="xs"
              value={filter}
              onChange={handleFilterChange}
              data={[
                { label: `All (${activeItems.length})`, value: 'all' },
                { label: t('Repairs & Pickup'), value: 'repairs' },
                { label: t('Stockouts'), value: 'stock' },
                { label: t('Credit'), value: 'credit' },
              ]}
              style={{ width: isMobile ? '100%' : 'auto', flexShrink: 0 }}
            />

            <Select
              size="xs"
              value={sortBy}
              onChange={handleSortChange}
              data={[
                { value: 'urgency', label: t('Urgency (Highest First)') },
                { value: 'days', label: t('Days Overdue (Longest First)') },
                { value: 'amount', label: t('Amount (Highest First)') },
                { value: 'date', label: t('Date (Newest First)') },
              ]}
              leftSection={<IconSortDescending size={14} />}
              allowDeselect={false}
              style={{
                width: isMobile ? '100%' : 210,
                flexShrink: 0,
              }}
              aria-label={t('Sort urgent actions descending')}
            />
          </Group>
        </Group>

        {/* Action Items List */}
        {sortedItems.length === 0 ? (
          <Paper p="xl" withBorder bg="var(--mantine-color-body)" radius="md">
            <Stack align="center" gap="xs">
              <ThemeIcon color="green" variant="light" size={44} radius="xl">
                <IconCheck size={24} />
              </ThemeIcon>
              <Text fw={700} size="sm">
                {t('All caught up!')}
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                {t('There are no pending urgent alerts or overdue tasks in this category.')}
              </Text>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="sm">
            {paginatedItems.map((item) => {
              const color = getItemColor(item.severity);
              return (
                <Paper
                  key={item.id}
                  p="sm"
                  withBorder
                  radius="md"
                  className="dashboard-interactive-card"
                  style={{
                    backgroundColor: 'var(--mantine-color-body)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <Group
                    justify="space-between"
                    align={isMobile ? 'flex-start' : 'center'}
                    wrap="wrap"
                    gap="sm"
                  >
                    <Group gap="sm" align="flex-start" style={{ flex: 1, minWidth: 260 }}>
                      <ThemeIcon color={color} variant="light" size="lg" radius="md" mt={2}>
                        {getItemIcon(item.type)}
                      </ThemeIcon>

                      <Box style={{ flex: 1 }}>
                        <Group gap="xs" align="center" wrap="wrap">
                          <Text fw={700} size="sm">
                            {item.title}
                          </Text>
                          <Badge size="xs" color={color} variant="light">
                            {item.severity.toUpperCase()}
                          </Badge>
                          <Text size="3xs" c="dimmed">
                            · {item.timestamp}
                          </Text>
                        </Group>

                        <Text size="xs" c="dimmed" mt={2}>
                          {item.subtitle}
                        </Text>
                      </Box>
                    </Group>

                    {/* Action Triggers */}
                    <Group
                      gap="xs"
                      wrap="nowrap"
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        flexShrink: 0,
                      }}
                      justify="flex-end"
                    >
                      <Button
                        size="xs"
                        variant="default"
                        onClick={(e) => handleDismiss(item.id, e)}
                        style={{
                          width: isMobile ? undefined : 76,
                          minHeight: isMobile ? 44 : undefined,
                          flexShrink: 0,
                        }}
                      >
                        {t('Dismiss')}
                      </Button>
                      <Button
                        size="xs"
                        variant={item.severity === 'critical' ? 'light' : 'default'}
                        color={item.severity === 'critical' ? 'red' : undefined}
                        rightSection={<IconArrowRight size={14} />}
                        onClick={() => item.linkTo && navigate(item.linkTo)}
                        style={{
                          width: isMobile ? undefined : 155,
                          minHeight: isMobile ? 44 : undefined,
                          flexShrink: 0,
                        }}
                      >
                        {item.actionLabel}
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        )}

        {/* Pagination & Summary Footer */}
        {sortedItems.length > 0 && (
          <Group justify="space-between" align="center" wrap="wrap" gap="sm" pt="xs">
            <Text size="xs" c="dimmed">
              {t('Showing')} {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, sortedItems.length)} {t('of')} {sortedItems.length}{' '}
              {t('alerts')}
            </Text>
            {totalPages > 1 && (
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setPage}
                size={isMobile ? 'sm' : 'sm'}
                radius="md"
                withEdges={!isMobile}
                aria-label={t('Urgent actions pagination')}
              />
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
};
