// Shown to the staff of a shop whose cloud access SimpleBash suspended: when and why, proof that
// the shop's data is still stored, what is paused versus still working, and who to contact. Fed
// by the 403 `ACCOUNT_SUSPENDED` answer (see lib/suspension.ts); with nothing to show it sends the
// visitor to the sign-in page rather than inventing content.

import {
  Anchor,
  Box,
  Button,
  Flex,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconCloudOff,
  IconDatabase,
  IconDeviceDesktop,
  IconPlayerPause,
} from '@tabler/icons-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { env } from '@/config/env';
import { t } from '@/shared/i18n/t';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { clearSuspension, readSuspension } from '../lib/suspension';

const formatWhen = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' });

const Stat = ({ label, value }: { label: string; value: number }) => (
  <Stack gap={2} align="center">
    <Text fz={28} fw={700} c="var(--text-primary)" data-testid={`retained-${label}`}>
      {value.toLocaleString()}
    </Text>
    <Text size="sm" c="dimmed">
      {label}
    </Text>
  </Stack>
);

export const AccountSuspendedPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const suspension = readSuspension();

  if (!suspension) return <Navigate to={ROUTES.LOGIN} replace />;

  const { shopName, suspendedAt, reason, retained } = suspension;
  const phoneDigits = env.supportWhatsapp.replace(/\D/g, '');

  const backToSignIn = () => {
    clearSuspension();
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <Flex direction={{ base: 'column', md: 'row' }} mih="100dvh" w="100%" bg="var(--bg-card)">
      <Stack
        justify="center"
        align="center"
        ta="center"
        gap="sm"
        p={{ base: 'xl', md: 64 }}
        w={{ base: '100%', md: '42%' }}
        style={{
          background:
            'linear-gradient(145deg, var(--mantine-color-blue-8), var(--mantine-color-blue-5))',
          color: '#fff',
        }}
      >
        <IconPlayerPause size={64} aria-hidden />
        <Title order={1} fz={{ base: 28, md: 40 }} style={{ color: 'inherit' }}>
          {t('Cloud access is suspended')}
        </Title>
        <Text fz="xl" fw={600} style={{ color: 'inherit' }}>
          {shopName}
        </Text>
        <Text fz="lg" style={{ color: 'inherit', opacity: 0.9 }}>
          {t('Suspended since')} {formatWhen(suspendedAt)}
        </Text>
      </Stack>

      <Stack
        justify="center"
        gap="lg"
        p={{ base: 'xl', md: 64 }}
        w={{ base: '100%', md: '58%' }}
        role="main"
      >
        <Box maw={560}>
          <Text fw={600} size="sm" mb={4}>
            {t('Reason')}
          </Text>
          <Text fz="lg" data-testid="suspension-reason">
            {reason}
          </Text>
        </Box>

        <Paper p="md" withBorder radius="md" maw={560}>
          <Group gap="xs" mb="xs" wrap="nowrap">
            <IconDatabase size={20} style={{ flexShrink: 0 }} />
            <Text fw={600}>{t('Your data is safe')}</Text>
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            {t(
              'Everything below is still stored. It all reappears as soon as your account is reactivated.'
            )}
          </Text>
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <Stat label={t('Bills')} value={retained.bills} />
            <Stat label={t('Products')} value={retained.products} />
            <Stat label={t('Customers')} value={retained.customers} />
            <Stat label={t('Staff')} value={retained.staff} />
          </SimpleGrid>
          {retained.lastBillAt !== null && (
            <Text size="sm" c="dimmed" ta="center" mt="md">
              {t('Last bill')}: {formatWhen(retained.lastBillAt)}
            </Text>
          )}
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 2 }} maw={560}>
          <Group align="flex-start" wrap="nowrap" gap="sm">
            <IconCloudOff size={22} style={{ flexShrink: 0 }} />
            <Stack gap={2}>
              <Text fw={600} size="sm">
                {t('Paused')}
              </Text>
              <Text size="sm" c="dimmed">
                {t('Signing in on the web and syncing between devices.')}
              </Text>
            </Stack>
          </Group>
          <Group align="flex-start" wrap="nowrap" gap="sm">
            <IconDeviceDesktop size={22} style={{ flexShrink: 0 }} />
            <Stack gap={2}>
              <Text fw={600} size="sm">
                {t('Still working')}
              </Text>
              <Text size="sm" c="dimmed">
                {t('The desktop app keeps working offline on your computer.')}
              </Text>
            </Stack>
          </Group>
        </SimpleGrid>

        <Box maw={560}>
          <Text fw={600} size="sm" mb={4}>
            {t('To restore access, contact SimpleBash')}
          </Text>
          <Stack gap={2}>
            <Anchor href={`mailto:${env.supportEmail}`}>{env.supportEmail}</Anchor>
            <Anchor href={`tel:+${phoneDigits}`}>
              {t('Call')} {env.supportWhatsapp}
            </Anchor>
            <Anchor href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer">
              WhatsApp {env.supportWhatsapp}
            </Anchor>
          </Stack>
        </Box>

        <Button onClick={backToSignIn} variant="light" size="md" maw={560}>
          {t('Back to sign in')}
        </Button>
      </Stack>
    </Flex>
  );
};
