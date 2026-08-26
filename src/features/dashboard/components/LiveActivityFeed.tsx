import { Paper, Stack, Group, Text, Badge, ThemeIcon, Box } from '@mantine/core';
import {
  IconActivity,
  IconReceipt,
  IconHammer,
  IconPrinter,
  IconCoin,
  IconAlertTriangle,
  IconArrowUpRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ActivityEvent } from '../types';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface LiveActivityFeedProps {
  activities: ActivityEvent[];
}

export const LiveActivityFeed = ({ activities }: LiveActivityFeedProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'sale':
        return <IconReceipt size={16} />;
      case 'repair_update':
        return <IconHammer size={16} />;
      case 'print_new':
        return <IconPrinter size={16} />;
      case 'credit_payment':
        return <IconCoin size={16} />;
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
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconActivity size={20} />
            </ThemeIcon>
            <div>
              <Group gap="xs" align="center">
                <Text fw={800} size="md">
                  Live Shop Activity Stream
                </Text>
                <Badge color="blue" variant="light" size="sm">
                  Real-time Feed
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                Chronological transaction feed, stage changes, and inventory updates
              </Text>
            </div>
          </Group>
        </Group>

        {/* Chronological Event Stream */}
        <Stack gap="xs">
          {activities.map((act) => (
            <Paper
              key={act.id}
              p="sm"
              withBorder
              radius="md"
              bg="var(--mantine-color-body)"
              style={{
                cursor: 'pointer',
                borderColor: 'var(--border)',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
              }}
              onClick={() => navigate(act.linkTo)}
            >
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Group gap="sm" align="flex-start" style={{ flex: 1, minWidth: 220 }}>
                  <ThemeIcon color={act.color} variant="light" size="md" radius="md" mt={2}>
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
      </Stack>
    </Paper>
  );
};
