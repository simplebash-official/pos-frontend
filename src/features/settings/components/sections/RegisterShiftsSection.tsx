import { t } from '@/shared/i18n/t';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { motion, useReducedMotion } from 'framer-motion';
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconCash,
  IconCheck,
  IconUserCheck,
} from '@tabler/icons-react';
import { queryKeys } from '@/api/queryKeys';
import { USER_ROLES } from '@/constants/roles';
import { useActiveSessionsSummary } from '@/features/billing/hooks/useRegisterSession';
import { getErrorMessage } from '@/shared/lib/error';
import { formatMoney } from '@/shared/lib/money';
import { SPRING } from '@/shared/motion';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { selectShopProfile, setShopProfile } from '@/store/slices/settingsSlice';
import { updateShopProfileApi } from '../../api/settingsApi';
import { useShopProfile } from '../../hooks/useShopProfile';
import { SectionShell } from '../SectionShell';

export interface SectionProps {
  onDirtyChange: (dirty: boolean) => void;
}

interface ModeOption {
  value: boolean;
  dataMode: 'personal' | 'shared';
  title: string;
  badge: string;
  accent: 'blue' | 'cyan';
  summary: string;
  bullets: readonly string[];
}

export const RegisterShiftsSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === USER_ROLES.ADMIN;

  const {
    shopProfile: fetchedProfile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useShopProfile();
  const storeProfile = useAppSelector(selectShopProfile);
  const shopProfile = fetchedProfile ?? storeProfile;

  const { data: activeSummary, refetch: refetchSummary } = useActiveSessionsSummary();

  const [saving, setSaving] = useState(false);
  const [draftAllowShared, setDraftAllowShared] = useState<boolean | null>(null);

  const persistedValue = shopProfile ? shopProfile.allowSharedUserSessions : null;
  const selectedValue = draftAllowShared !== null ? draftAllowShared : persistedValue;
  const isDirty =
    draftAllowShared !== null && persistedValue !== null && draftAllowShared !== persistedValue;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const activeSessions = activeSummary?.activeSessions ?? [];
  const drawerBalanceTotalCents = activeSummary?.drawerBalanceTotalCents ?? 0;
  const hasActiveShifts = activeSessions.length > 0;
  const hasNonZeroDrawer = drawerBalanceTotalCents !== 0;
  const hasSwitchBlockers = hasActiveShifts || hasNonZeroDrawer;
  const switchDisabled = !isAdmin || persistedValue === null || hasSwitchBlockers || saving;

  const chooseMode = (nextValue: boolean) => {
    if (switchDisabled) return;
    setDraftAllowShared(nextValue === persistedValue ? null : nextValue);
  };

  const handleRadioKeyDown = (event: KeyboardEvent<HTMLDivElement>, currentValue: boolean) => {
    if (switchDisabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      chooseMode(currentValue);
    } else if (
      event.key === 'ArrowRight' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowUp'
    ) {
      event.preventDefault();
      chooseMode(!currentValue);
    }
  };

  const handleSave = async () => {
    if (selectedValue === null || switchDisabled || !isDirty) return;
    setSaving(true);
    try {
      const persisted = await updateShopProfileApi({
        allowSharedUserSessions: selectedValue,
      });
      dispatch(setShopProfile(persisted));
      queryClient.setQueryData(queryKeys.settings.shopProfile(), persisted);
      setDraftAllowShared(null);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.settings.shopProfile() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all }),
      ]);

      notifications.show({
        title: t('Settings Saved'),
        message: t('Register shift mode updated successfully.'),
        color: 'teal',
      });
    } catch (err: unknown) {
      const apiErr = err as {
        code?: string;
        statusCode?: number;
        status?: number;
        response?: { status?: number };
      };
      const status = apiErr?.statusCode ?? apiErr?.status ?? apiErr?.response?.status;
      const code = apiErr?.code;

      if (status === 409 || code === 'ACTIVE_SESSIONS_EXIST' || code === 'DRAWER_BALANCE_NONZERO') {
        void refetchSummary();
        const fallbackMsg =
          code === 'DRAWER_BALANCE_NONZERO'
            ? t('Drop all remaining cash from the drawer to the safe before switching shift mode.')
            : t(
                'Close every open, closing, or reopened shift before switching register shift mode.'
              );
        notifications.show({
          title: t('Cannot Change Mode'),
          message: getErrorMessage(err, fallbackMsg),
          color: 'red',
        });
      } else {
        notifications.show({
          title: t('Save Failed'),
          message: getErrorMessage(err, t('Failed to update register shift mode.')),
          color: 'red',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftAllowShared(null);
  };

  const modeOptions: readonly ModeOption[] = [
    {
      value: false,
      dataMode: 'personal',
      title: t('Personal Shifts'),
      badge: t('Per Person'),
      accent: 'blue',
      summary: t('Each staff member opens, sells from, and counts their own cash shift.'),
      bullets: [
        t('Best when cashiers carry separate tills or change floats'),
        t('Each person closes and counts only their own shift'),
      ],
    },
    {
      value: true,
      dataMode: 'shared',
      title: t('Shared Shop Shift'),
      badge: t('Whole Shop'),
      accent: 'cyan',
      summary: t('All staff and devices sell into one shared shop shift and one cash drawer.'),
      bullets: [
        t('Best when the whole shop shares one cash drawer across counters or phones'),
        t('Any permitted staff member or manager can count and close the shift'),
      ],
    },
  ];

  const statusLabel = (status: string) => {
    if (status === 'closing') return t('Closing');
    if (status === 'reopened') return t('Reopened');
    return t('Open');
  };

  return (
    <SectionShell
      title={t('Registers & Shifts')}
      description={t(
        'Choose whether each person runs their own register shift or everyone shares one shop cash drawer.'
      )}
      isDirty={isDirty}
      saving={saving}
      onSave={() => void handleSave()}
      onCancel={handleCancel}
      saveLabel={t('Save Changes')}
    >
      <Stack gap="lg">
        {hasActiveShifts && (
          <Alert
            icon={<IconAlertTriangle size={18} />}
            color="orange"
            variant="light"
            title={t('Close Active Shifts First')}
          >
            <Stack gap="xs">
              <Text size="sm">
                {t(
                  'All active shifts (open, closing, or reopened) must be closed before changing register shift mode.'
                )}
              </Text>
              <Group gap="xs" wrap="wrap">
                {activeSessions.map((session) => (
                  <Badge
                    key={session.key}
                    variant="outline"
                    color="orange"
                    size="sm"
                    styles={{ label: { textTransform: 'none' } }}
                  >
                    {`${session.sessionNumber} · ${session.cashierNameSnapshot} (${statusLabel(session.status)})`}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Alert>
        )}

        {hasNonZeroDrawer && (
          <Alert
            icon={<IconCash size={18} />}
            color="orange"
            variant="light"
            title={t('Drop Drawer Cash to Safe First')}
          >
            <Text size="sm">
              {`${t('Current cash across drawers:')} ${formatMoney(drawerBalanceTotalCents)}. ${t(
                'Drop remaining drawer cash to the safe during shift close so the closing float is 0 before switching modes.'
              )}`}
            </Text>
          </Alert>
        )}

        {!isAdmin && (
          <Group>
            <Badge size="md" variant="light" color="gray">
              {t('Admin Only: Only shop administrators can change this mode.')}
            </Badge>
          </Group>
        )}

        {persistedValue === null && isProfileLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Skeleton height={168} radius="md" />
            <Skeleton height={168} radius="md" />
          </SimpleGrid>
        ) : persistedValue === null ? (
          <Alert
            icon={<IconAlertTriangle size={18} />}
            color="red"
            variant="light"
            title={t('Unable to load register shift settings')}
          >
            <Group justify="space-between" align="center" gap="sm" wrap="wrap">
              <Text size="sm">
                {t('Could not fetch the current shop register mode from the server. Try again.')}
              </Text>
              <Button
                size="xs"
                variant="light"
                color="red"
                h={isMobile ? 44 : undefined}
                onClick={() => void refetchProfile()}
              >
                {t('Retry')}
              </Button>
            </Group>
          </Alert>
        ) : (
          <Box role="radiogroup" aria-label={t('Register Shift Mode')} style={{ width: '100%' }}>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {modeOptions.map((option) => {
                const isSelected = selectedValue === option.value;
                const Icon = option.value ? IconBuildingStore : IconUserCheck;

                return (
                  <motion.div
                    key={option.dataMode}
                    animate={reduceMotion ? undefined : { scale: isSelected ? 1 : 0.992 }}
                    transition={reduceMotion ? { duration: 0 } : SPRING}
                    style={{ display: 'flex' }}
                  >
                    <Paper
                      data-mode={option.dataMode}
                      withBorder
                      p={isMobile ? 'md' : 'lg'}
                      radius="md"
                      role="radio"
                      aria-checked={isSelected}
                      aria-disabled={switchDisabled}
                      tabIndex={switchDisabled ? -1 : 0}
                      onClick={() => chooseMode(option.value)}
                      onKeyDown={(e) => handleRadioKeyDown(e, option.value)}
                      style={{
                        width: '100%',
                        minHeight: 48,
                        backgroundColor: isSelected
                          ? `var(--mantine-color-${option.accent}-light)`
                          : 'var(--bg-card)',
                        borderColor: isSelected
                          ? `var(--mantine-color-${option.accent}-filled)`
                          : 'var(--border)',
                        borderWidth: isSelected ? 2 : 1,
                        cursor: switchDisabled ? 'not-allowed' : 'pointer',
                        opacity: switchDisabled && !isSelected ? 0.6 : 1,
                        transition: 'border-color 0.15s ease, background-color 0.15s ease',
                      }}
                    >
                      <Stack gap="sm" justify="space-between" style={{ height: '100%' }}>
                        <Stack gap="sm">
                          <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
                            <Group gap="xs" wrap="nowrap">
                              <ThemeIcon
                                variant={isSelected ? 'filled' : 'light'}
                                color={option.accent}
                                size="lg"
                                radius="md"
                              >
                                <Icon size={20} />
                              </ThemeIcon>
                              <Text fw={700} size="sm" style={{ color: 'var(--text-primary)' }}>
                                {option.title}
                              </Text>
                            </Group>
                            <Badge
                              variant={isSelected ? 'filled' : 'light'}
                              color={option.accent}
                              size="sm"
                              style={{ flexShrink: 0 }}
                            >
                              {option.badge}
                            </Badge>
                          </Group>

                          <Text size="sm" c="dimmed">
                            {option.summary}
                          </Text>

                          <Stack gap={4}>
                            {option.bullets.map((bullet) => (
                              <Text key={bullet} size="xs" c="dimmed">
                                • {bullet}
                              </Text>
                            ))}
                          </Stack>
                        </Stack>

                        <Group justify="space-between" align="center" pt="xs">
                          {isSelected ? (
                            <Badge
                              size="sm"
                              color={option.accent}
                              variant="filled"
                              leftSection={<IconCheck size={12} />}
                            >
                              {t('Active Selection')}
                            </Badge>
                          ) : (
                            <Badge size="xs" color="gray" variant="light">
                              {switchDisabled ? t('Locked while active') : t('Click to Select')}
                            </Badge>
                          )}
                        </Group>
                      </Stack>
                    </Paper>
                  </motion.div>
                );
              })}
            </SimpleGrid>
          </Box>
        )}

        <Paper
          withBorder
          p="md"
          radius="md"
          style={{ backgroundColor: 'var(--bg-app)', borderColor: 'var(--border)' }}
        >
          <Stack gap="xs">
            <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.04em' }}>
              {t('What changes')}
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <Stack gap={2}>
                <Text size="xs" fw={600} style={{ color: 'var(--text-primary)' }}>
                  {t('Opening a shift')}
                </Text>
                <Text size="xs" c="dimmed">
                  {selectedValue
                    ? t('First person opens one shift; every other counter joins automatically.')
                    : t('Each staff member starts their own shift when taking cash.')}
                </Text>
              </Stack>
              <Stack gap={2}>
                <Text size="xs" fw={600} style={{ color: 'var(--text-primary)' }}>
                  {t('Counting & closing')}
                </Text>
                <Text size="xs" c="dimmed">
                  {selectedValue
                    ? t('Any permitted cashier or manager can count and close the shop drawer.')
                    : t('Only the cashier who opened the shift (or manager) closes it.')}
                </Text>
              </Stack>
              <Stack gap={2}>
                <Text size="xs" fw={600} style={{ color: 'var(--text-primary)' }}>
                  {t('Mid-count lock')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(
                    'While cash is being counted, new sales and cash payouts pause until the count finishes or is cancelled.'
                  )}
                </Text>
              </Stack>
            </SimpleGrid>
          </Stack>
        </Paper>
      </Stack>
    </SectionShell>
  );
};
