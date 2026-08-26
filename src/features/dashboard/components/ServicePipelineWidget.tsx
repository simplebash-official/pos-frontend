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
} from '@mantine/core';
import { IconHammer, IconPrinter, IconArrowRight, IconCircleCheck } from '@tabler/icons-react';
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

          {/* Multi-segment Progress Bar */}
          <Progress.Root size="lg" radius="xl">
            {repairPipeline.map((stage) => {
              const value = totalRepairs > 0 ? (stage.count / totalRepairs) * 100 : 0;
              const sectionColor =
                stage.stage === 'ready'
                  ? 'teal'
                  : stage.stage === 'pending_approval'
                    ? 'orange'
                    : 'blue';
              return (
                <Progress.Section key={stage.stage} value={value} color={sectionColor}>
                  <Progress.Label>{stage.count > 0 ? stage.count : ''}</Progress.Label>
                </Progress.Section>
              );
            })}
          </Progress.Root>

          {/* Stage Cards Grid */}
          <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing="xs">
            {repairPipeline.map((stage) => {
              const countColor =
                stage.stage === 'ready'
                  ? 'teal'
                  : stage.stage === 'pending_approval'
                    ? 'orange'
                    : undefined;

              return (
                <Paper
                  key={stage.stage}
                  p="xs"
                  withBorder
                  radius="md"
                  bg="var(--mantine-color-body)"
                  style={{
                    cursor: 'pointer',
                    borderColor: 'var(--border)',
                    textAlign: 'center',
                  }}
                  onClick={() => navigate(ROUTES.REPAIRS)}
                >
                  <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                    {stage.label}
                  </Text>
                  <Text
                    size="lg"
                    fw={800}
                    c={countColor}
                    mt={2}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {stage.count}
                  </Text>
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

          {/* Multi-segment Progress Bar */}
          <Progress.Root size="lg" radius="xl">
            {printPipeline.map((stage) => {
              const value = totalPrints > 0 ? (stage.count / totalPrints) * 100 : 0;
              const sectionColor =
                stage.stage === 'delivered' || stage.stage === 'ready' ? 'teal' : 'blue';
              return (
                <Progress.Section key={stage.stage} value={value} color={sectionColor}>
                  <Progress.Label>{stage.count > 0 ? stage.count : ''}</Progress.Label>
                </Progress.Section>
              );
            })}
          </Progress.Root>

          {/* Stage Cards Grid */}
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="xs">
            {printPipeline.map((stage) => (
              <Paper
                key={stage.stage}
                p="xs"
                withBorder
                radius="md"
                bg="var(--mantine-color-body)"
                style={{
                  cursor: 'pointer',
                  borderColor: 'var(--border)',
                  textAlign: 'center',
                }}
                onClick={() => navigate(ROUTES.PRINT_JOBS)}
              >
                <Group gap={4} justify="center">
                  {stage.stage === 'delivered' && (
                    <IconCircleCheck size={12} color="var(--mantine-color-teal-6)" />
                  )}
                  <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                    {stage.label}
                  </Text>
                </Group>
                <Text
                  size="lg"
                  fw={800}
                  c={stage.stage === 'delivered' ? 'teal' : undefined}
                  mt={2}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {stage.count}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Stack>
      </Paper>
    </SimpleGrid>
  );
};
