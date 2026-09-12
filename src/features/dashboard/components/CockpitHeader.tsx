import { t } from '@/shared/i18n/t';
import { Group, Stack, Title, Text, Button, Paper, Box } from '@mantine/core';
import { IconReceipt, IconHammer, IconPrinter, IconPackage } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { getActionShortcut } from '@/shared/lib/shortcuts';
import { ModernClock } from '@/shared/components/ModernClock';

export interface CockpitHeaderProps {
  onRefresh?: () => void;
}

export const CockpitHeader = ({ onRefresh: _onRefresh }: CockpitHeaderProps) => {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const isMobile = useIsMobile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('Good morning');
    if (hour < 17) return t('Good afternoon');
    return t('Good evening');
  };

  const cashierName = user?.name || t('Store Cashier');

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
        {/* Top Row: Store Pulse & Live Time */}
        <Group
          justify="space-between"
          align={isMobile ? 'flex-start' : 'center'}
          wrap="wrap"
          gap="sm"
        >
          <div>
            <Title order={isMobile ? 3 : 2} fw={800} style={{ letterSpacing: '-0.02em' }}>
              {getGreeting()}, {cashierName.split(' ')[0]}!
            </Title>
            <Text size="xs" c="dimmed" mt={2}>
              {t('Welcome to your shop command center. Here is your operational pulse for today.')}
            </Text>
          </div>

          {/* Modern Clock */}
          <ModernClock id="cockpit-hero-clock" style={{ minWidth: isMobile ? '100%' : 'auto' }} />
        </Group>

        {/* Bottom Row: Quick Action Stations */}
        <Box pt="xs" style={{ borderTop: '1px solid var(--border)' }}>
          <Group gap="sm" wrap="wrap">
            <Button
              leftSection={<IconReceipt size={16} />}
              variant="filled"
              color="blue"
              size={isMobile ? 'md' : 'sm'}
              onClick={() => navigate(ROUTES.BILLING)}
              style={{
                minHeight: isMobile ? 44 : undefined,
                flex: isMobile ? '1 1 100%' : undefined,
              }}
            >
              {t('New Sale')}{' '}
              {isMobile ? '' : `(${getActionShortcut('completeCheckout').formattedPrimary})`}
            </Button>

            <Button
              leftSection={<IconHammer size={16} />}
              variant="light"
              color="orange"
              size={isMobile ? 'md' : 'sm'}
              onClick={() => navigate(ROUTES.REPAIRS)}
              style={{
                minHeight: isMobile ? 44 : undefined,
                flex: isMobile ? '1 1 45%' : undefined,
              }}
            >
              {t('Check-in Repair')}
            </Button>

            <Button
              leftSection={<IconPrinter size={16} />}
              variant="light"
              color="teal"
              size={isMobile ? 'md' : 'sm'}
              onClick={() => navigate(ROUTES.PRINT_JOBS)}
              style={{
                minHeight: isMobile ? 44 : undefined,
                flex: isMobile ? '1 1 45%' : undefined,
              }}
            >
              {t('New Print Job')}
            </Button>

            <Button
              leftSection={<IconPackage size={16} />}
              variant="light"
              color="indigo"
              size={isMobile ? 'md' : 'sm'}
              onClick={() => navigate(ROUTES.INVENTORY)}
              style={{
                minHeight: isMobile ? 44 : undefined,
                flex: isMobile ? '1 1 100%' : undefined,
              }}
            >
              {t('Receive Stock')}
            </Button>
          </Group>
        </Box>
      </Stack>
    </Paper>
  );
};
