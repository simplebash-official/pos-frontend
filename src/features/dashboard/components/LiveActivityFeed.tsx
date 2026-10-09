import { useState, useMemo } from 'react';
import { t } from '@/shared/i18n/t';
import { Paper, Stack, Group, Text, Badge, ThemeIcon, Box, Pagination } from '@mantine/core';
import {
  IconActivity,
  IconReceipt,
  IconHammer,
  IconPrinter,
  IconAlertTriangle,
  IconArrowUpRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ActivityEvent } from '../types';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface LiveActivityFeedProps {
  activities: ActivityEvent[];
}

const PAGE_SIZE = 5;

export const LiveActivityFeed = ({ activities }: LiveActivityFeedProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(activities.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return activities.slice(start, start + PAGE_SIZE);
  }, [activities, currentPage]);

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'sale':
        return <IconReceipt size={16} />;
      case 'repair_update':
        return <IconHammer size={16} />;
      case 'print_new':
        return <IconPrinter size={16} />;
      case 'stock_alert':
        return <IconAlertTriangle size={16} />;
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
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconActivity size={20} />
            </ThemeIcon>
            <div>
              <Group gap="xs" align="center">
                <Text fw={700} size="md">
                  {t('Live Shop Activity Stream')}
                </Text>
                {activities.length > 0 && (
                  <Badge color="blue" variant="light" size="sm">
                    {activities.length} {t('Events')}
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {t('Chronological transaction feed, stage changes, and inventory updates')}
              </Text>
            </div>
          </Group>
        </Group>

        {/* Chronological Event Stream */}
        {activities.length === 0 ? (
          <Paper p="lg" withBorder bg="var(--mantine-color-body)" radius="md">
            <Stack align="center" gap="xs">
              <ThemeIcon color="gray" variant="light" size={40} radius="xl">
                <IconActivity size={22} />
              </ThemeIcon>
              <Text fw={700} size="sm">
                {t('No Activity Recorded Yet')}
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                {t(
                  'Transactions, ticket movements, print queue updates, and payments will stream live\n                                              here.'
                )}
              </Text>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="xs">
            {paginatedActivities.map((act) => (
              <Paper
                key={act.id}
                p="sm"
                withBorder
                radius="md"
                bg="var(--mantine-color-body)"
                className="dashboard-interactive-card"
                style={{
                  borderColor: 'var(--border)',
                }}
                onClick={() => navigate(act.linkTo)}
              >
                <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                  <Group gap="sm" align="flex-start" style={{ flex: 1, minWidth: 220 }}>
                    <ThemeIcon
                      color={act.type === 'stock_alert' ? 'red' : 'gray'}
                      variant="light"
                      size="md"
                      radius="md"
                      mt={2}
                    >
                      {getEventIcon(act.type)}
                    </ThemeIcon>

                    <Box style={{ flex: 1 }}>
                      <Text fw={700} size="sm">
                        {act.title}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        {act.description}
                      </Text>
                    </Box>
                  </Group>

                  <Group gap="xs">
                    <Badge size="xs" variant="outline" color="gray">
                      {act.timeAgo}
                    </Badge>
                    <ThemeIcon size="xs" color="gray" variant="subtle">
                      <IconArrowUpRight size={14} />
                    </ThemeIcon>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}

        {/* Pagination & Summary Footer */}
        {activities.length > 0 && (
          <Group justify="space-between" align="center" wrap="wrap" gap="sm" pt="xs">
            <Text size="xs" c="dimmed">
              {t('Showing')} {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, activities.length)} {t('of')} {activities.length}{' '}
              {t('activities')}
            </Text>
            {totalPages > 1 && (
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={setPage}
                size="sm"
                radius="md"
                withEdges={!isMobile}
                aria-label={t('Activity feed pagination')}
              />
            )}
          </Group>
        )}
      </Stack>
    </Paper>
  );
};
