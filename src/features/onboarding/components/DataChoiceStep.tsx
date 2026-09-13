import { useState } from 'react';
import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  SimpleGrid,
  Paper,
  ThemeIcon,
  Badge,
  TextInput,
  PasswordInput,
  Box,
  Alert,
  List,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconRocket,
  IconDatabase,
  IconDatabaseOff,
  IconCheck,
  IconUser,
  IconLock,
  IconMail,
  IconInfoCircle,
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import type { SetupSystemPayload } from '../types';

export interface DataChoiceStepProps {
  onSubmit: (payload: SetupSystemPayload) => void;
  onPrev: () => void;
  loading: boolean;
}

export const DataChoiceStep = ({ onSubmit, onPrev, loading }: DataChoiceStepProps) => {
  const [loadSampleData, setLoadSampleData] = useState<boolean>(true);
  const [adminName, setAdminName] = useState<string>('System Administrator');
  const [adminEmail, setAdminEmail] = useState<string>('admin@pos.com');
  const [adminPassword, setAdminPassword] = useState<string>('admin@1234');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    if (!adminEmail || !/^\S+@\S+\.\S+$/.test(adminEmail)) {
      setError(t('Please enter a valid administrator email address.'));
      return;
    }
    if (!adminPassword || adminPassword.length < 6) {
      setError(t('Administrator password must be at least 6 characters long.'));
      return;
    }

    onSubmit({
      load_sample_data: loadSampleData,
      admin_name: adminName.trim() || undefined,
      admin_email: adminEmail.trim(),
      admin_password: adminPassword,
    });
  };

  return (
    <Stack gap="xl">
      <Box>
        <Title
          order={1}
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          {t('Choose Your Database Setup')}
        </Title>
        <Text c="dimmed" size="md" mt="xs" maw={780} style={{ lineHeight: 1.6 }}>
          {t(
            'Decide whether to populate demo data for testing or start with a clean production database for your store.'
          )}
        </Text>
      </Box>

      {/* Choice Cards */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Option 1: Demo Data */}
        <Paper
          withBorder
          p="xl"
          radius="md"
          onClick={() => setLoadSampleData(true)}
          style={{
            cursor: 'pointer',
            borderWidth: 2,
            borderColor: loadSampleData
              ? 'var(--mantine-color-blue-6)'
              : 'var(--border)',
            backgroundColor: loadSampleData
              ? 'var(--mantine-color-blue-light)'
              : 'var(--bg-card)',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
        >
          <Group justify="space-between" mb="md">
            <ThemeIcon
              color="blue"
              variant={loadSampleData ? 'filled' : 'light'}
              size={46}
              radius="md"
            >
              <IconDatabase size={24} />
            </ThemeIcon>
            <Badge color="blue" variant="filled" size="sm">
              {t('Recommended for Testing')}
            </Badge>
          </Group>

          <Group gap="xs" mb={6}>
            <Text fw={700} size="lg">
              {t('Load Sample / Demo Data')}
            </Text>
            {loadSampleData && (
              <ThemeIcon color="blue" size={20} radius="xl">
                <IconCheck size={14} />
              </ThemeIcon>
            )}
          </Group>

          <Text size="sm" c="dimmed" mb="md" style={{ lineHeight: 1.5 }}>
            {t(
              'Populates realistic products, repair components, suppliers, sample customers, and stock quantities so you can test all features right away.'
            )}
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
            <List.Item>{t('Sample retail & repair inventory with barcodes')}</List.Item>
            <List.Item>{t('Sample categories, subcategories & suppliers')}</List.Item>
            <List.Item>{t('Sample customers with credit balances')}</List.Item>
          </List>
        </Paper>

        {/* Option 2: Clean Database */}
        <Paper
          withBorder
          p="xl"
          radius="md"
          onClick={() => setLoadSampleData(false)}
          style={{
            cursor: 'pointer',
            borderWidth: 2,
            borderColor: !loadSampleData
              ? 'var(--mantine-color-teal-6)'
              : 'var(--border)',
            backgroundColor: !loadSampleData
              ? 'var(--mantine-color-teal-light)'
              : 'var(--bg-card)',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
        >
          <Group justify="space-between" mb="md">
            <ThemeIcon
              color="teal"
              variant={!loadSampleData ? 'filled' : 'light'}
              size={46}
              radius="md"
            >
              <IconDatabaseOff size={24} />
            </ThemeIcon>
            <Badge color="teal" variant="light" size="sm">
              {t('For Live Store')}
            </Badge>
          </Group>

          <Group gap="xs" mb={6}>
            <Text fw={700} size="lg">
              {t('Clean Database (Empty Tables)')}
            </Text>
            {!loadSampleData && (
              <ThemeIcon color="teal" size={20} radius="xl">
                <IconCheck size={14} />
              </ThemeIcon>
            )}
          </Group>

          <Text size="sm" c="dimmed" mb="md" style={{ lineHeight: 1.5 }}>
            {t(
              'Creates all 25 database tables completely clean with zero sample records. Perfect when setting up a genuine store for production.'
            )}
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
            <List.Item>{t('All 25 relational tables generated empty')}</List.Item>
            <List.Item>{t('0 sample products, 0 dummy invoices')}</List.Item>
            <List.Item>{t('Ready for genuine stock entry & import')}</List.Item>
          </List>
        </Paper>
      </SimpleGrid>

      {/* Administrator Credentials Setup */}
      <Paper withBorder p="xl" radius="md" style={{ backgroundColor: 'var(--bg-card)' }}>
        <Group justify="space-between" mb="md">
          <div>
            <Group gap="xs">
              <ThemeIcon color="blue" variant="light" size="md" radius="md">
                <IconUser size={18} />
              </ThemeIcon>
              <Text fw={700} size="md">
                {t('Initial Administrator Account')}
              </Text>
            </Group>
            <Text size="xs" c="dimmed" mt={4}>
              {t(
                'Every POS requires an administrator account to log in, configure store settings, and manage staff.'
              )}
            </Text>
          </div>
        </Group>

        {error && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="red"
            variant="light"
            mb="md"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Alert>
        )}

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
          <TextInput
            label={t('Admin Full Name')}
            leftSection={<IconUser size={16} />}
            value={adminName}
            onChange={(e) => setAdminName(e.currentTarget.value)}
            placeholder="Store Owner / Manager"
          />
          <TextInput
            label={t('Admin Email')}
            leftSection={<IconMail size={16} />}
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.currentTarget.value)}
            placeholder="admin@pos.com"
            required
          />
          <PasswordInput
            label={t('Admin Password')}
            leftSection={<IconLock size={16} />}
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.currentTarget.value)}
            placeholder="admin@1234"
            required
          />
        </SimpleGrid>

        <Text size="xs" c="dimmed" mt="md">
          {t(
            'Default credentials: admin@pos.com / admin@1234 (You can customize these now or change them later in Settings).'
          )}
        </Text>
      </Paper>

      {/* Navigation Footer */}
      <Group justify="space-between" mt="lg">
        <Button
          variant="default"
          size="lg"
          radius="md"
          leftSection={<IconArrowLeft size={20} />}
          onClick={onPrev}
          disabled={loading}
        >
          {t('Back')}
        </Button>
        <Button
          color="blue"
          size="lg"
          radius="md"
          loading={loading}
          rightSection={<IconRocket size={20} />}
          onClick={handleSubmit}
        >
          {t('Initialize Database & Continue')}
        </Button>
      </Group>
    </Stack>
  );
};
