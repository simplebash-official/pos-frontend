import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  Paper,
  ThemeIcon,
  Badge,
  Loader,
  SimpleGrid,
  Box,
} from '@mantine/core';
import {
  IconCheck,
  IconArrowRight,
  IconAlertCircle,
  IconSparkles,
  IconUserCheck,
  IconDatabase,
  IconRefresh,
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import type { SetupSystemResult } from '../types';

export interface ProgressStepProps {
  loading: boolean;
  result: SetupSystemResult | null;
  error: string | null;
  onRetry: () => void;
  onComplete: () => void;
}

export const ProgressStep = ({
  loading,
  result,
  error,
  onRetry,
  onComplete,
}: ProgressStepProps) => {
  return (
    <Stack gap="xl">
      {/* Loading state */}
      {loading && (
        <Paper
          withBorder
          p="2.5rem"
          radius="md"
          style={{
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <Stack align="center" gap="lg" py="xl">
            <Badge
              size="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              leftSection={<IconSparkles size={14} />}
            >
              {t('Initial First-Run')}
            </Badge>

            <Loader size="xl" color="blue" type="dots" />

            <div>
              <Title
                order={2}
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                {t('Initializing Your POS System...')}
              </Title>
              <Text c="dimmed" size="md" mt="xs" maw={580} mx="auto" style={{ lineHeight: 1.6 }}>
                {t(
                  'Creating database tables, generating cryptographic keys, and configuring workstation signatures.'
                )}
              </Text>
            </div>

            <Paper
              withBorder
              p="lg"
              radius="md"
              maw={520}
              w="100%"
              mt="md"
              style={{
                textAlign: 'left',
                backgroundColor: 'var(--bg-app)',
              }}
            >
              <Stack gap="sm">
                <Group gap="sm">
                  <ThemeIcon color="teal" size={22} radius="xl" variant="light">
                    <IconCheck size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>
                    {t('Generating 25 relational SQLite tables')}
                  </Text>
                </Group>
                <Group gap="sm">
                  <ThemeIcon color="teal" size={22} radius="xl" variant="light">
                    <IconCheck size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>
                    {t('Creating cryptographic API authentication tokens')}
                  </Text>
                </Group>
                <Group gap="sm">
                  <Loader size={16} color="blue" />
                  <Text size="sm" fw={600} c="blue">
                    {t('Finalizing setup & administrator permissions...')}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Paper>
      )}

      {/* Error state */}
      {!loading && error && (
        <Paper
          withBorder
          p="2.5rem"
          radius="md"
          style={{
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <Stack align="center" gap="lg" py="xl" style={{ textAlign: 'center' }}>
            <ThemeIcon color="red" size={64} radius="xl" variant="light">
              <IconAlertCircle size={36} />
            </ThemeIcon>
            <div>
              <Title order={2} c="red.7" style={{ fontWeight: 800 }}>
                {t('Setup Failed')}
              </Title>
              <Text c="dimmed" size="sm" mt="xs" maw={520} mx="auto">
                {error}
              </Text>
            </div>

            <Button
              color="blue"
              size="lg"
              radius="md"
              leftSection={<IconRefresh size={20} />}
              onClick={onRetry}
            >
              {t('Try again')}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Success state */}
      {!loading && result && (
        <Stack gap="xl">
          <Box style={{ textAlign: 'center' }}>
            <Group justify="center" gap="xs" mb="sm">
              <Badge
                size="lg"
                color="teal"
                variant="filled"
                leftSection={<IconSparkles size={14} />}
              >
                {t('Setup Complete')}
              </Badge>
            </Group>
            <Title
              order={1}
              style={{
                fontSize: '2.4rem',
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              {t('Your POS System Is Ready!')}
            </Title>
            <Text c="dimmed" size="md" mt="sm" maw={620} mx="auto" style={{ lineHeight: 1.6 }}>
              {t(
                'Workstation installation record recorded. Database initialization was executed successfully.'
              )}
            </Text>
          </Box>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {/* Database Configuration Card */}
            <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
              <Group justify="space-between" mb="md">
                <ThemeIcon color="teal" variant="light" size={44} radius="md">
                  <IconDatabase size={24} />
                </ThemeIcon>
                <Badge color={result.sample_data_loaded ? 'blue' : 'teal'} variant="light" size="sm">
                  {result.sample_data_loaded
                    ? t('Demo Data Loaded (Ready for Testing)')
                    : t('Clean Production Database (0 Dummy Records)')}
                </Badge>
              </Group>
              <Text fw={700} size="md" mb={4}>
                {t('Database Configuration')}
              </Text>
              <Text size="xs" c="dimmed" mb="sm">
                {t('Database Mode')}
              </Text>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.5 }}>
                {result.sample_data_loaded
                  ? t('Products, categories, repair parts, and customer accounts populated.')
                  : t('All tables ready with clean slate for genuine store entries.')}
              </Text>
            </Paper>

            {/* Administrator Account Card */}
            <Paper p="xl" radius="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
              <Group justify="space-between" mb="md">
                <ThemeIcon color="blue" variant="light" size={44} radius="md">
                  <IconUserCheck size={24} />
                </ThemeIcon>
                <Badge color="blue" variant="filled" size="sm">
                  {t('Initial Administrator Account')}
                </Badge>
              </Group>
              <Text fw={700} size="md" mb={4}>
                {t('Administrator Credentials')}
              </Text>
              <Text size="xs" c="dimmed" mb={2}>
                {t('Admin Email')}:
              </Text>
              <Text fw={700} size="sm" c="blue">
                {result.admin_email}
              </Text>
              <Text size="xs" c="dimmed" mt="xs" style={{ lineHeight: 1.5 }}>
                {t(
                  'Your session will be authenticated automatically. You can also log in later using these credentials.'
                )}
              </Text>
            </Paper>
          </SimpleGrid>

          <Group justify="center" mt="xl">
            <Button
              size="xl"
              radius="md"
              color="blue"
              rightSection={<IconArrowRight size={22} />}
              onClick={onComplete}
              style={{ minWidth: 260 }}
            >
              {t('Launch Jana2U POS')}
            </Button>
          </Group>
        </Stack>
      )}
    </Stack>
  );
};
