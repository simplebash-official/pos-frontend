import { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  ThemeIcon,
  SegmentedControl,
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
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { UrgentActionItem, UrgentItemType } from '../types';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface UrgentActionCenterProps {
  items: UrgentActionItem[];
}

export const UrgentActionCenter = ({ items }: UrgentActionCenterProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState<string>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  const activeItems = items.filter((item) => !dismissedIds.has(item.id));

  const filteredItems = activeItems.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'repairs')
      return (
        item.type === 'pending_approval' ||
        item.type === 'overdue_repair' ||
        item.type === 'uncollected'
      );
    if (filter === 'stock') return item.type === 'stockout';
    if (filter === 'credit') return item.type === 'credit_overdue';
    return true;
  });

  const getItemIcon = (type: UrgentItemType) => {
    switch (type) {
      case 'stockout':
        return <IconPackage size={18} />;
      case 'pending_approval':
        return <IconPhone size={18} />;
      case 'overdue_repair':
        return <IconClockExclamation size={18} />;
      case 'uncollected':
        return <IconHammer size={18} />;
      case 'credit_overdue':
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
        {/* Header and Filter Tabs */}
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
                <Text fw={800} size="md">
                  Urgent Action Center
                </Text>
                <Badge color="red" variant="filled" size="sm">
                  {activeItems.length} Needs Attention
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                High-priority blockers, unapproved estimates, and critical stockouts needing your
                touch today
              </Text>
            </div>
          </Group>

          <SegmentedControl
            size="xs"
            value={filter}
            onChange={setFilter}
            data={[
              { label: `All (${activeItems.length})`, value: 'all' },
              { label: 'Repairs & Pickup', value: 'repairs' },
              { label: 'Stockouts', value: 'stock' },
              { label: 'Credit', value: 'credit' },
            ]}
            style={{ width: isMobile ? '100%' : 'auto' }}
          />
        </Group>

        {/* Action Items List */}
        {filteredItems.length === 0 ? (
          <Paper p="xl" withBorder bg="var(--mantine-color-body)" radius="md">
            <Stack align="center" gap="xs">
              <ThemeIcon color="green" variant="light" size={44} radius="xl">
                <IconCheck size={24} />
              </ThemeIcon>
              <Text fw={700} size="sm">
                All caught up!
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                There are no pending urgent alerts or overdue tasks in this category.
              </Text>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="sm">
            {filteredItems.map((item) => {
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
                        Dismiss
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
      </Stack>
    </Paper>
  );
};
