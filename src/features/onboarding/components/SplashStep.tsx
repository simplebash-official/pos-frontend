import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  Badge,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Box,
  List,
} from '@mantine/core';
import {
  IconArrowRight,
  IconDatabase,
  IconFileText,
  IconShieldLock,
  IconSparkles,
  IconCheck,
  IconServer,
  IconCloud,
  IconDeviceDesktopAnalytics,
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { PRODUCT_NAME } from '@/config/branding';
import { isTauri } from '@/shared/lib/runtime';
import type { SetupStatus } from '../types';

export interface SplashStepProps {
  status?: SetupStatus | null;
  onNext: () => void;
}

export const SplashStep = ({ status, onNext }: SplashStepProps) => {
  const installedDate = status?.installed_at
    ? new Date(status.installed_at).toLocaleDateString(undefined, {
        dateStyle: 'long',
      })
    : new Date().toLocaleDateString(undefined, { dateStyle: 'long' });

  const shortId = status?.installation_id
    ? status.installation_id.slice(0, 8).toUpperCase()
    : 'POS-STATION';

  return (
    <Stack gap="xl">
      {/* Hero Welcome Header */}
      <Box>
        <Group gap="xs" mb="sm">
          <Badge
            size="md"
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
            leftSection={<IconSparkles size={14} />}
          >
            {isTauri() ? t('First-Time Installation') : t('Shop Onboarding')}
          </Badge>
          <Badge variant="outline" color="gray" size="md">
            v{status?.app_version || '0.7.0'}
          </Badge>
        </Group>

        <Title
          order={1}
          style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}
        >
          {t(`Welcome to ${PRODUCT_NAME}`)}
        </Title>
        <Text c="dimmed" size="md" mt="sm" maw={780} style={{ lineHeight: 1.6 }}>
          {isTauri()
            ? t(
                'The complete, offline-first point of sale, split-tender billing, repair tracking, and inventory management powerhouse.'
              )
            : t(
                'The complete cloud point of sale, split-tender billing, repair tracking, and inventory management powerhouse.'
              )}
        </Text>
      </Box>

      {/* Engine & Environment Verification Grid */}
      <Box>
        <Group justify="space-between" mb="md" wrap="wrap" gap="xs">
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" size="md" radius="md">
              <IconServer size={18} />
            </ThemeIcon>
            <Text fw={700} size="sm">
              {isTauri()
                ? `${t('Storage Engine')} & ${t('Document Server')}`
                : `${t('Cloud Engine')} & ${t('Multi-Tenant Store')}`}
            </Text>
          </Group>
          <Badge color="green" variant="light" size="sm">
            {t('Status: Ready for Configuration')}
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          {/* Engine 1: SQLite / MongoDB */}
          <Paper p="lg" radius="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" mb="xs">
              <ThemeIcon color="blue" variant="light" size={44} radius="md">
                <IconDatabase size={24} />
              </ThemeIcon>
              <Badge color="blue" variant="light" size="xs">
                {t('Storage Engine')}
              </Badge>
            </Group>

            <Text fw={700} size="md" mt="xs">
              {isTauri() ? 'SQLite (Embedded)' : 'MongoDB (Cloud)'}
            </Text>
            <Text size="xs" c="dimmed" mb="md">
              {isTauri() ? 'Port :8080 · 127.0.0.1' : 'Isolated Tenant Document Store'}
            </Text>

            <List
              size="xs"
              spacing={6}
              icon={
                <ThemeIcon color="teal" size={14} radius="xl" variant="light">
                  <IconCheck size={10} />
                </ThemeIcon>
              }
            >
              {isTauri() ? (
                <>
                  <List.Item>{t('Generating 25 relational SQLite tables')}</List.Item>
                  <List.Item>{t('Zero cloud lock-in: total data sovereignty')}</List.Item>
                </>
              ) : (
                <>
                  <List.Item>{t('Strict tenant isolation & partitioned namespaces')}</List.Item>
                  <List.Item>{t('High-availability cloud replica set storage')}</List.Item>
                </>
              )}
            </List>
          </Paper>

          {/* Engine 2: Typst Document Server / Cloud Document Bridge */}
          <Paper p="lg" radius="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" mb="xs">
              <ThemeIcon color="cyan" variant="light" size={44} radius="md">
                <IconFileText size={24} />
              </ThemeIcon>
              <Badge color="cyan" variant="light" size="xs">
                {t('Document Server')}
              </Badge>
            </Group>

            <Text fw={700} size="md" mt="xs">
              {isTauri() ? 'Typst Document Server' : 'Cloud Document Bridge'}
            </Text>
            <Text size="xs" c="dimmed" mb="md">
              {isTauri() ? 'Port :8090 · 127.0.0.1' : 'Serverless PDF & Receipt Generation'}
            </Text>

            <List
              size="xs"
              spacing={6}
              icon={
                <ThemeIcon color="teal" size={14} radius="xl" variant="light">
                  <IconCheck size={10} />
                </ThemeIcon>
              }
            >
              <List.Item>{t('Direct thermal 80mm & A4 invoice generation')}</List.Item>
              <List.Item>{t('Client-side high-DPI canvas previewer')}</List.Item>
            </List>
          </Paper>

          {/* Engine 3: Offline Vault / Multi-Device Cloud Sync */}
          <Paper p="lg" radius="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
            <Group justify="space-between" mb="xs">
              <ThemeIcon color="teal" variant="light" size={44} radius="md">
                {isTauri() ? <IconShieldLock size={24} /> : <IconCloud size={24} />}
              </ThemeIcon>
              <Badge color="teal" variant="light" size="xs">
                {isTauri() ? t('Security & Privacy') : t('Multi-Device')}
              </Badge>
            </Group>

            <Text fw={700} size="md" mt="xs">
              {isTauri() ? '100% Offline Vault' : 'Multi-Device Cloud Sync'}
            </Text>
            <Text size="xs" c="dimmed" mb="md">
              {isTauri() ? 'Local Machine Storage' : 'Real-time Synchronized Web Mesh'}
            </Text>

            <List
              size="xs"
              spacing={6}
              icon={
                <ThemeIcon color="teal" size={14} radius="xl" variant="light">
                  <IconCheck size={10} />
                </ThemeIcon>
              }
            >
              {isTauri() ? (
                <>
                  <List.Item>{t('Instant one-click database backups & export')}</List.Item>
                  <List.Item>{t('Role-based permissions (Admin, Cashier, Tech)')}</List.Item>
                </>
              ) : (
                <>
                  <List.Item>{t('Real-time sync across cashiers & technicians')}</List.Item>
                  <List.Item>{t('Role-based permissions (Admin, Cashier, Tech)')}</List.Item>
                </>
              )}
            </List>
          </Paper>
        </SimpleGrid>
      </Box>

      {/* Workstation / Cloud Registration Information Bar */}
      <Paper p="md" radius="md" withBorder style={{ backgroundColor: 'var(--bg-card)' }}>
        <Group justify="space-between" wrap="wrap" gap="sm">
          <Group gap="xs">
            <ThemeIcon color="blue" variant="light" size="md" radius="md">
              {isTauri() ? <IconSparkles size={18} /> : <IconDeviceDesktopAnalytics size={18} />}
            </ThemeIcon>
            <div>
              <Text fw={700} size="sm">
                {isTauri() ? t('Workstation Record') : t('Cloud Shop Instance')}
              </Text>
              <Text size="xs" c="dimmed">
                ID: {shortId} ·{' '}
                {isTauri()
                  ? `${t('Installed')}: ${installedDate} · ${status?.platform || 'Desktop'}`
                  : `${t('Initialized')}: ${installedDate} · Cloud Production`}
              </Text>
            </div>
          </Group>

          <Badge color="teal" variant="dot" size="md">
            {t('System Online & Healthy')}
          </Badge>
        </Group>
      </Paper>

      {/* Action Footer */}
      <Group justify="flex-end" mt="lg">
        <Button
          size="lg"
          radius="md"
          color="blue"
          rightSection={<IconArrowRight size={20} />}
          onClick={onNext}
        >
          {t('Continue to Feature Tour')}
        </Button>
      </Group>
    </Stack>
  );
};
