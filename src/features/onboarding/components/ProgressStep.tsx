import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  Paper,
  ThemeIcon,
  Badge,
  SimpleGrid,
  Box,
  Progress,
  Divider,
} from '@mantine/core';
import {
  IconArrowRight,
  IconAlertCircle,
  IconSparkles,
  IconUserCheck,
  IconDatabase,
  IconRefresh,
  IconCheck,
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { PRODUCT_NAME } from '@/config/branding';
import { isTauri } from '@/shared/lib/runtime';
import type { SetupSystemPayload, SetupSystemResult } from '../types';
import { useProvisioningOrchestrator } from '../hooks/useProvisioningOrchestrator';
import { ProvisioningMilestones } from './ProvisioningMilestones';
import { ProvisioningConsole } from './ProvisioningConsole';

export interface ProgressStepProps {
  payload?: SetupSystemPayload | null;
  loading: boolean;
  result: SetupSystemResult | null;
  error: string | null;
  onRetry: () => void;
  onComplete: () => void;
  onGoToLogin?: () => void;
}

export const ProgressStep = ({
  payload = null,
  loading,
  result,
  error,
  onRetry,
  onComplete,
  onGoToLogin,
}: ProgressStepProps) => {
  const { progress, currentStageText, milestones, logs, isFinished, fastForward } =
    useProvisioningOrchestrator({
      payload,
      isPending: loading,
      result,
      error,
    });

  const showFinishedView = isFinished && Boolean(result) && !error;

  return (
    <Stack gap="xl">
      {/* ========================================================================= */}
      {/* 1. Error State View                                                       */}
      {/* ========================================================================= */}
      {!loading && error && (
        <Stack gap="lg">
          <Paper
            withBorder
            p="2.5rem"
            radius="md"
            style={{
              backgroundColor: 'var(--bg-card)',
              textAlign: 'center',
            }}
          >
            <Stack align="center" gap="lg" py="md">
              <ThemeIcon color="red" size={64} radius="xl" variant="light">
                <IconAlertCircle size={36} />
              </ThemeIcon>
              <div>
                <Title order={2} c="red.7" style={{ fontWeight: 800 }}>
                  {t('Setup Failed')}
                </Title>
                <Text c="dimmed" size="sm" mt="xs" maw={560} mx="auto">
                  {error}
                </Text>
              </div>

              <Group gap="md">
                <Button
                  color="blue"
                  size="lg"
                  radius="md"
                  leftSection={<IconRefresh size={20} />}
                  onClick={onRetry}
                >
                  {t('Try again')}
                </Button>
                {onGoToLogin && (
                  <Button variant="default" size="lg" radius="md" onClick={onGoToLogin}>
                    {t('Go to Login')}
                  </Button>
                )}
              </Group>
            </Stack>
          </Paper>

          {/* Show console logs on error for debugging */}
          <Box>
            <Text size="xs" fw={700} tt="uppercase" c="red.6" mb="xs">
              {t('Terminal Error Log')}
            </Text>
            <ProvisioningConsole logs={logs} isFinished={false} />
          </Box>
        </Stack>
      )}

      {/* ========================================================================= */}
      {/* 2. Provisioning Pipeline & Workspace View (Always Visible)                */}
      {/* ========================================================================= */}
      {!error && (
        <Stack gap="lg">
          {/* Top Header Card with Dynamic Progress Bar */}
          <Paper
            withBorder
            p="xl"
            radius="md"
            style={{
              backgroundColor: 'var(--bg-card)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <Badge
                    size="md"
                    variant={showFinishedView ? 'filled' : 'gradient'}
                    color={showFinishedView ? 'teal' : undefined}
                    gradient={showFinishedView ? undefined : { from: 'blue', to: 'cyan' }}
                    leftSection={
                      showFinishedView ? <IconCheck size={14} /> : <IconSparkles size={14} />
                    }
                  >
                    {showFinishedView
                      ? isTauri()
                        ? t('SETUP VERIFIED & READY')
                        : t('SHOP VERIFIED & READY')
                      : isTauri()
                        ? t('WORKSTATION PROVISIONING')
                        : t('SHOP PROVISIONING')}
                  </Badge>
                  <Badge color={showFinishedView ? 'teal' : 'blue'} variant="light" size="md">
                    v0.7.0
                  </Badge>
                </Group>

                <Group gap="xs" align="baseline">
                  <Text
                    size="xl"
                    fw={900}
                    ff="monospace"
                    c={showFinishedView ? 'teal.6' : 'blue.6'}
                  >
                    {progress}%
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('completed')}
                  </Text>
                </Group>
              </Group>

              <Progress
                value={progress}
                size="md"
                radius="xl"
                color={showFinishedView ? 'teal' : 'blue'}
                animated={progress < 100}
                striped={progress < 100}
              />

              <Group justify="space-between" align="center" wrap="wrap">
                <Text size="sm" fw={600} c={showFinishedView ? 'teal.6' : 'blue.6'}>
                  {currentStageText}
                </Text>
                <Text size="xs" c="dimmed">
                  {payload?.load_sample_data
                    ? t('Mode: Quick-Start Demo Data')
                    : t('Mode: Clean Production Slate')}
                </Text>
              </Group>
            </Stack>
          </Paper>

          {/* 5-Stage Live Milestones Pipeline - Kept Visible Throughout */}
          <Box>
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              c="dimmed"
              mb="xs"
              style={{ letterSpacing: '0.05em' }}
            >
              {t('Provisioning Pipeline')}
            </Text>
            <ProvisioningMilestones milestones={milestones} />
          </Box>

          {/* Celebration & Launch Action Card (Smoothly expands below when finished) */}
          {showFinishedView && result && (
            <Stack gap="lg" className="celebration-banner">
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {/* Database Configuration Card */}
                <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
                  <Group justify="space-between" mb="md">
                    <ThemeIcon color="teal" variant="light" size={44} radius="md">
                      <IconDatabase size={24} />
                    </ThemeIcon>
                    <Badge
                      color={result.sample_data_loaded ? 'blue' : 'teal'}
                      variant="light"
                      size="sm"
                    >
                      {result.sample_data_loaded
                        ? t('Demo Data Loaded (Ready for Testing)')
                        : t('Clean Production Database (0 Dummy Records)')}
                    </Badge>
                  </Group>
                  <Text fw={700} size="md" mb={4}>
                    {t('Database Configuration')}
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">
                    {isTauri()
                      ? t('Database Engine: SQLite (Embedded)')
                      : t('Database Engine: MongoDB Cloud Store')}
                  </Text>
                  <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                    {result.sample_data_loaded
                      ? t('Products, categories, repair parts, and customer accounts populated.')
                      : isTauri()
                        ? t('All tables ready with clean slate for genuine store entries.')
                        : t('All collections ready with clean slate for genuine store entries.')}
                  </Text>
                </Paper>

                {/* Administrator Account Card */}
                <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
                  <Group justify="space-between" mb="md">
                    <ThemeIcon color="blue" variant="light" size={44} radius="md">
                      <IconUserCheck size={24} />
                    </ThemeIcon>
                    <Badge color="blue" variant="filled" size="sm">
                      {isTauri() ? t('Initial Administrator Account') : t('Shop Administrator Account')}
                    </Badge>
                  </Group>
                  <Text fw={700} size="md" mb={4}>
                    {t('Administrator Credentials')}
                  </Text>
                  <Text size="xs" c="dimmed" mb={2}>
                    {t('Admin Email')}:
                  </Text>
                  <Text fw={700} size="sm" c="blue">
                    {result.admin_email || result.user?.email || payload?.admin_email || '—'}
                  </Text>
                  <Text size="xs" c="dimmed" mt="xs" style={{ lineHeight: 1.5 }}>
                    {t(
                      'Your session will be authenticated automatically. You can also log in later using these credentials.'
                    )}
                  </Text>
                </Paper>
              </SimpleGrid>

              {/* Verified Checkpoints List */}
              <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
                <Group justify="space-around" wrap="wrap" gap="md">
                  <Group gap="xs">
                    <ThemeIcon color="teal" size={24} radius="xl" variant="light">
                      <IconCheck size={14} />
                    </ThemeIcon>
                    <Text size="xs" fw={600}>
                      {isTauri()
                        ? t('25 SQLite Tables Verified')
                        : t('Multi-Tenant Store Isolated')}
                    </Text>
                  </Group>
                  <Divider orientation="vertical" />
                  <Group gap="xs">
                    <ThemeIcon color="teal" size={24} radius="xl" variant="light">
                      <IconCheck size={14} />
                    </ThemeIcon>
                    <Text size="xs" fw={600}>
                      {t('Argon2id Security Active')}
                    </Text>
                  </Group>
                  <Divider orientation="vertical" />
                  <Group gap="xs">
                    <ThemeIcon color="teal" size={24} radius="xl" variant="light">
                      <IconCheck size={14} />
                    </ThemeIcon>
                    <Text size="xs" fw={600}>
                      {isTauri()
                        ? t('Typst Document Bridge Ready')
                        : t('Cloud Document Bridge Ready')}
                    </Text>
                  </Group>
                </Group>
              </Paper>

              {/* Launch Action Button */}
              <Group justify="center" mt="sm">
                <Button
                  size="xl"
                  radius="md"
                  color="blue"
                  rightSection={<IconArrowRight size={22} />}
                  onClick={onComplete}
                  style={{ minWidth: 280 }}
                >
                  {t(`Launch ${PRODUCT_NAME}`)}
                </Button>
              </Group>
            </Stack>
          )}

          {/* Real-time System Terminal Logs - Always Visible */}
          <Box>
            <Text
              size="xs"
              fw={700}
              tt="uppercase"
              c="dimmed"
              mb="xs"
              style={{ letterSpacing: '0.05em' }}
            >
              {t('System Diagnostics & Setup Logs')}
            </Text>
            <ProvisioningConsole
              logs={logs}
              isFinished={progress === 100}
              onFastForward={progress < 100 ? fastForward : undefined}
            />
          </Box>
        </Stack>
      )}
    </Stack>
  );
};
