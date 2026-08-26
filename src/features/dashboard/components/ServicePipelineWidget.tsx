import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Progress,
  SimpleGrid,
  ThemeIcon,
  Button,
  Box,
} from '@mantine/core';
import { IconHammer, IconPrinter, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { PipelineStageCount } from '../types';
import { ROUTES } from '@/constants/routes';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface ServicePipelineWidgetProps {
  repairPipeline: PipelineStageCount[];
  printPipeline: PipelineStageCount[];
}

export const ServicePipelineWidget = ({
  repairPipeline,
  printPipeline,
}: ServicePipelineWidgetProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const totalRepairs = repairPipeline.reduce((sum, item) => sum + item.count, 0);
  const totalPrints = printPipeline.reduce((sum, item) => sum + item.count, 0);

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
      {/* Workshop Phone Repairs Pipeline */}
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
              <ThemeIcon color="orange" variant="light" size="lg" radius="md">
                <IconHammer size={20} />
              </ThemeIcon>
              <div>
                <Group gap="xs" align="center">
                  <Text fw={800} size="md">
                    Phone Repairs Workshop
                  </Text>
                  <Badge variant="outline" color="gray" size="sm">
                    {totalRepairs} Active Tickets
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  Live workflow pipeline across diagnosis and repair stages
                </Text>
              </div>
            </Group>

            <Button
              size="xs"
              variant="subtle"
              color="blue"
              rightSection={<IconArrowRight size={14} />}
              onClick={() => navigate(ROUTES.REPAIRS)}
            >
              Open Board
            </Button>
          </Group>

          {/* Modern Connected Workflow Cards */}
          <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="xs">
            {repairPipeline.map((stage, idx) => {
              const stageColor =
                stage.stage === 'ready'
                  ? 'teal'
                  : stage.stage === 'pending_approval'
                    ? 'orange'
                    : 'blue';

              const pct = totalRepairs > 0 ? Math.round((stage.count / totalRepairs) * 100) : 0;

              return (
                <Paper
                  key={stage.stage}
                  p="sm"
                  withBorder
                  bg="var(--mantine-color-body)"
                  style={{
                    cursor: 'pointer',
                    borderColor: 'var(--border)',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                  }}
                  onClick={() => navigate(ROUTES.REPAIRS)}
                >
                  <Stack gap="xs" justify="space-between" h="100%">
                    {/* Consistent Header Row */}
                    <Group justify="space-between" align="center" wrap="nowrap">
                      <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                        Step {idx + 1}
                      </Text>
                      <Text
                        size="3xs"
                        c="dimmed"
                        fw={600}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {pct}%
                      </Text>
                    </Group>

                    {/* Fixed Height Title Area */}
                    <Box style={{ minHeight: 34, display: 'flex', alignItems: 'center' }}>
                      <Text size="xs" fw={700} lineClamp={2} style={{ lineHeight: 1.25 }}>
                        {stage.label}
                      </Text>
                    </Box>

                    {/* Unified Metric */}
                    <div>
                      <Text size="xl" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {stage.count}
                        <Text component="span" size="xs" c="dimmed" fw={500} ml={4}>
                          tickets
                        </Text>
                      </Text>
                    </div>

                    {/* Bottom Progress Track */}
                    <Progress value={pct} color={stageColor} size={4} radius="xl" />
                  </Stack>
                </Paper>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* Print Shop Production Queue */}
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
              <ThemeIcon color="teal" variant="light" size="lg" radius="md">
                <IconPrinter size={20} />
              </ThemeIcon>
              <div>
                <Group gap="xs" align="center">
                  <Text fw={800} size="md">
                    Print Services Queue
                  </Text>
                  <Badge variant="outline" color="gray" size="sm">
                    {totalPrints} Production Orders
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  Mugs, t-shirts, documents, and promotional media
                </Text>
              </div>
            </Group>

            <Button
              size="xs"
              variant="subtle"
              color="blue"
              rightSection={<IconArrowRight size={14} />}
              onClick={() => navigate(ROUTES.PRINT_JOBS)}
            >
              View Queue
            </Button>
          </Group>

          {/* Modern Connected Workflow Cards */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
            {printPipeline.map((stage, idx) => {
              const isDelivered = stage.stage === 'delivered';
              const stageColor = isDelivered ? 'teal' : 'blue';
              const pct = totalPrints > 0 ? Math.round((stage.count / totalPrints) * 100) : 0;

              return (
                <Paper
                  key={stage.stage}
                  p="sm"
                  withBorder
                  bg="var(--mantine-color-body)"
                  style={{
                    cursor: 'pointer',
                    borderColor: 'var(--border)',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                  }}
                  onClick={() => navigate(ROUTES.PRINT_JOBS)}
                >
                  <Stack gap="xs" justify="space-between" h="100%">
                    {/* Consistent Header Row */}
                    <Group justify="space-between" align="center" wrap="nowrap">
                      <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                        Step {idx + 1}
                      </Text>
                      <Text
                        size="3xs"
                        c="dimmed"
                        fw={600}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {pct}%
                      </Text>
                    </Group>

                    {/* Fixed Height Title Area */}
                    <Box style={{ minHeight: 34, display: 'flex', alignItems: 'center' }}>
                      <Text size="xs" fw={700} lineClamp={2} style={{ lineHeight: 1.25 }}>
                        {stage.label}
                      </Text>
                    </Box>

                    {/* Unified Metric */}
                    <div>
                      <Text size="xl" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {stage.count}
                        <Text component="span" size="xs" c="dimmed" fw={500} ml={4}>
                          orders
                        </Text>
                      </Text>
                    </div>

                    {/* Bottom Progress Track */}
                    <Progress value={pct} color={stageColor} size={4} radius="xl" />
                  </Stack>
                </Paper>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Paper>
    </SimpleGrid>
  );
};
