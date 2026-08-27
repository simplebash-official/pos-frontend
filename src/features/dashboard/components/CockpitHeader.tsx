import { useState, useEffect } from 'react';
import { Group, Stack, Title, Text, Button, Paper, Box, ThemeIcon } from '@mantine/core';
import { IconReceipt, IconHammer, IconPrinter, IconPackage, IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface CockpitHeaderProps {
  onRefresh?: () => void;
}

export const CockpitHeader = ({ onRefresh: _onRefresh }: CockpitHeaderProps) => {
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);
  const isMobile = useIsMobile();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const cashierName = user?.name || 'Store Cashier';

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
              Welcome to your shop command center. Here is your operational pulse for today.
            </Text>
          </div>

          {/* Clock & Date Badge */}
          <Paper
            p="xs"
            px="md"
            withBorder
            radius="var(--mantine-radius-default)"
            bg="var(--mantine-color-body)"
            style={{ minWidth: isMobile ? '100%' : 'auto' }}
          >
            <Group gap="xs" justify={isMobile ? 'space-between' : 'flex-start'}>
              <ThemeIcon color="blue" variant="light" size="md">
                <IconClock size={16} />
              </ThemeIcon>
              <div>
                <Text size="sm" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {currentTime || '00:00:00'}
                </Text>
                <Text size="3xs" c="dimmed" fw={600} tt="uppercase">
                  {currentDate || 'Today'}
                </Text>
              </div>
            </Group>
          </Paper>
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
              New Sale {isMobile ? '' : '(F2)'}
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
              Check-in Repair
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
              New Print Job
            </Button>

            <Button
              leftSection={<IconPackage size={16} />}
              variant="light"
              color="blue"
              size={isMobile ? 'md' : 'sm'}
              onClick={() => navigate(ROUTES.INVENTORY)}
              style={{
                minHeight: isMobile ? 44 : undefined,
                flex: isMobile ? '1 1 100%' : undefined,
              }}
            >
              Receive Stock
            </Button>
          </Group>
        </Box>
      </Stack>
    </Paper>
  );
};
