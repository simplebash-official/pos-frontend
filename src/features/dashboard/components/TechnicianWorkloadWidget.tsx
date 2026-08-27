import { t } from '@/shared/i18n/t';
import { Paper, Stack, Group, Text, Badge, Progress, ThemeIcon, Box } from '@mantine/core';
import { IconUserCheck, IconTool, IconUser } from '@tabler/icons-react';
import { TechnicianWorkload } from '../types';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface TechnicianWorkloadWidgetProps {
  technicians: TechnicianWorkload[];
}

export const TechnicianWorkloadWidget = ({ technicians }: TechnicianWorkloadWidgetProps) => {
  const isMobile = useIsMobile();

  const getStatusColor = (status: TechnicianWorkload['status']) => {
    switch (status) {
      case 'available':
        return 'teal';
      case 'busy':
        return 'gray';
      case 'overloaded':
        return 'red';
    }
  };

  const getCapacityColor = (pct: number) => {
    if (pct < 50) return 'blue';
    if (pct < 80) return 'orange';
    return 'red';
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
            <ThemeIcon color="indigo" variant="light" size="lg" radius="md">
              <IconUserCheck size={20} />
            </ThemeIcon>
            <div>
              <Text fw={800} size="md">
                {t('Technician Workload & Floor Capacity')}
              </Text>
              <Text size="xs" c="dimmed">
                {t('Live bench capacity, assigned repair tickets, and current tasks')}
              </Text>
            </div>
          </Group>
        </Group>

        {/* Technician Cards */}
        {technicians.length === 0 ? (
          <Paper p="lg" withBorder bg="var(--mantine-color-body)" radius="md">
            <Stack align="center" gap="xs">
              <ThemeIcon color="gray" variant="light" size={40} radius="xl">
                <IconUser size={22} />
              </ThemeIcon>
              <Text fw={700} size="sm">
                {t('No Active Technicians On Duty')}
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                {t(
                  'Technicians registered in staff profiles will appear here with live repair capacity.'
                )}
              </Text>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="xs">
            {technicians.map((tech) => {
              const statusColor = getStatusColor(tech.status);
              const capacityColor = getCapacityColor(tech.capacityPercentage);

              return (
                <Paper
                  key={tech.employeeKey}
                  p="sm"
                  withBorder
                  radius="md"
                  bg="var(--mantine-color-body)"
                  className="dashboard-interactive-card"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between" align="center" wrap="wrap">
                      <Group gap="xs">
                        <ThemeIcon color="blue" variant="light" radius="md" size={36}>
                          <IconUser size={20} />
                        </ThemeIcon>

                        <div>
                          <Group gap="xs" align="center">
                            <Text fw={700} size="sm">
                              {tech.name}
                            </Text>
                            <Badge size="xs" color={statusColor} variant="light">
                              {tech.status.toUpperCase()}
                            </Badge>
                          </Group>
                          <Text size="3xs" c="dimmed">
                            {tech.role}
                          </Text>
                        </div>
                      </Group>

                      <Group gap="md">
                        <div>
                          <Text size="3xs" c="dimmed" fw={700} tt="uppercase" ta="right">
                            {t('Active Jobs')}
                          </Text>
                          <Text
                            size="sm"
                            fw={800}
                            ta="right"
                            style={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {tech.activeJobsCount} {t('active (')}
                            {tech.completedTodayCount} {t('done today)')}
                          </Text>
                        </div>
                      </Group>
                    </Group>

                    {/* Current Active Task Pill */}
                    {tech.currentTask && (
                      <Paper p={6} px="xs" withBorder bg="var(--bg-card)">
                        <Group gap={6}>
                          <ThemeIcon color="gray" size="xs" variant="transparent">
                            <IconTool size={12} />
                          </ThemeIcon>
                          <Text size="3xs" fw={600} c="dimmed">
                            {t('Working on:')}
                          </Text>
                          <Text size="3xs" fw={700}>
                            {tech.currentTask}
                          </Text>
                        </Group>
                      </Paper>
                    )}

                    {/* Capacity Bar */}
                    <Box>
                      <Group justify="space-between" mb={2}>
                        <Text size="3xs" c="dimmed" fw={600}>
                          {t('Bench Capacity')}
                        </Text>
                        <Text size="3xs" fw={700} c={capacityColor === 'red' ? 'red' : 'dimmed'}>
                          {tech.capacityPercentage}%
                        </Text>
                      </Group>
                      <Progress
                        value={tech.capacityPercentage}
                        color={capacityColor}
                        size="sm"
                        radius="xl"
                      />
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
