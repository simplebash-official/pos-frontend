import { Stack, Paper, Group, ThemeIcon, Text, Badge, Loader, Box } from '@mantine/core';
import {
  IconCheck,
  IconDatabase,
  IconShieldLock,
  IconBuildingStore,
  IconCpu,
  IconRocket,
  IconAlertCircle,
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import type { ProvisioningMilestone } from '../hooks/useProvisioningOrchestrator';

export interface ProvisioningMilestonesProps {
  milestones: ProvisioningMilestone[];
}

const getMilestoneIcon = (id: string, size = 18) => {
  switch (id) {
    case 'kernel':
      return <IconDatabase size={size} />;
    case 'security':
      return <IconShieldLock size={size} />;
    case 'catalog':
      return <IconBuildingStore size={size} />;
    case 'sidecars':
      return <IconCpu size={size} />;
    case 'ready':
      return <IconCheck size={size} />;
    case 'launch':
      return <IconRocket size={size} />;
    default:
      return <IconDatabase size={size} />;
  }
};

export const ProvisioningMilestones = ({ milestones }: ProvisioningMilestonesProps) => {
  return (
    <Stack gap="xs">
      {milestones.map((milestone) => {
        const isRunning = milestone.status === 'running';
        const isCompleted = milestone.status === 'completed';
        const isFailed = milestone.status === 'failed';

        return (
          <Paper
            key={milestone.id}
            withBorder
            p="md"
            radius="md"
            className={isRunning ? 'milestone-active-card' : undefined}
            style={{
              backgroundColor: isRunning
                ? 'light-dark(var(--mantine-color-blue-0), rgba(34, 139, 230, 0.12))'
                : 'var(--bg-card)',
              borderColor: isRunning
                ? 'var(--mantine-color-blue-5)'
                : isCompleted
                  ? 'light-dark(var(--mantine-color-teal-3), rgba(18, 184, 134, 0.3))'
                  : 'var(--border)',
              transition: 'all 0.25s ease',
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              {/* Left Icon & Info */}
              <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                {/* Status Icon */}
                {isCompleted ? (
                  <ThemeIcon
                    size={36}
                    radius="xl"
                    color="teal"
                    variant="filled"
                    className="check-pop-icon"
                  >
                    <IconCheck size={20} stroke={2.5} />
                  </ThemeIcon>
                ) : isRunning ? (
                  <Box style={{ position: 'relative', width: 36, height: 36 }}>
                    <ThemeIcon
                      size={36}
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan' }}
                    >
                      {getMilestoneIcon(milestone.id, 18)}
                    </ThemeIcon>
                  </Box>
                ) : isFailed ? (
                  <ThemeIcon size={36} radius="xl" color="red" variant="filled">
                    <IconAlertCircle size={20} />
                  </ThemeIcon>
                ) : (
                  <ThemeIcon size={36} radius="xl" color="gray" variant="light">
                    <Text size="xs" fw={700} ff="monospace">
                      {milestone.number}
                    </Text>
                  </ThemeIcon>
                )}

                {/* Milestone Text */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Group gap="xs" align="center">
                    <Text
                      size="sm"
                      fw={isRunning ? 700 : isCompleted ? 600 : 500}
                      c={isRunning ? 'blue' : isFailed ? 'red.6' : undefined}
                    >
                      {t(milestone.title)}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {t(milestone.description)}
                  </Text>
                </Box>
              </Group>

              {/* Right State Indicator Badge */}
              <Box style={{ flexShrink: 0 }}>
                {isCompleted && (
                  <Badge color="teal" variant="light" size="sm">
                    {t('Ready')}
                  </Badge>
                )}
                {isRunning && (
                  <Group gap={6} align="center">
                    <Loader size={14} color="blue" />
                    <Badge variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} size="sm">
                      {t('In Progress')}
                    </Badge>
                  </Group>
                )}
                {isFailed && (
                  <Badge color="red" variant="filled" size="sm">
                    {t('Failed')}
                  </Badge>
                )}
                {milestone.status === 'pending' && (
                  <Badge color="gray" variant="subtle" size="sm">
                    {t('Queued')}
                  </Badge>
                )}
              </Box>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
};
