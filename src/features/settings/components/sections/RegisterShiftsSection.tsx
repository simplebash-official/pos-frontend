import { t } from '@/shared/i18n/t';
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
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
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconBuildingStore,
  IconCheck,
  IconDevices,
  IconLock,
  IconRefresh,
  IconShieldLock,
  IconUsers,
} from '@tabler/icons-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryKeys';
import { getActiveSessionsSummary } from '@/features/billing/api/sessionsApi';
import type { RegisterSession } from '@/features/billing/types';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { formatMoney } from '@/shared/lib/money';
import { DURATION, EASE, SPRING } from '@/shared/motion';
import type { ApiError } from '@/shared/types/common';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/authSlice';
import { selectShopProfile, setShopProfile } from '@/store/slices/settingsSlice';
import { updateShopProfileApi } from '../../api/settingsApi';
import { useShopProfile } from '../../hooks/useShopProfile';
import type { UpdateShopProfileInput } from '../../types';
import { SectionShell } from '../SectionShell';
import type { SectionProps } from './ShopProfileSection';

const STATUS_BADGE: Record<RegisterSession['status'], { color: string; label: string }> = {
  open: { color: 'teal', label: 'Open' },
  closing: { color: 'orange', label: 'Closing' },
  reopened: { color: 'grape', label: 'Reopened' },
  closed: { color: 'gray', label: 'Closed' },
};

interface RadioOptionCardProps {
  checked: boolean;
  disabled: boolean;
  color: 'teal' | 'cyan' | 'blue';
  title: string;
  subtitle: string;
  badge?: string;
  icon: ReactNode;
  bullets?: string[];
  dataAttr: Record<string, string>;
  reduceMotion: boolean;
  onSelect: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}

const RadioOptionCard = ({
  checked,
  disabled,
  color,
  title,
  subtitle,
  badge,
  icon,
  bullets,
  dataAttr,
  reduceMotion,
  onSelect,
  onKeyDown,
}: RadioOptionCardProps) => (
  <motion.div
    whileTap={disabled || reduceMotion ? undefined : { scale: 0.99 }}
    transition={SPRING}
    style={{ display: 'flex' }}
  >
    <Box
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : checked ? 0 : -1}
      onClick={() => {
        if (!disabled) onSelect();
      }}
      onKeyDown={onKeyDown}
      p="md"
      {...dataAttr}
      style={{
        flex: 1,
        minHeight: 44,
        borderRadius: 'var(--mantine-radius-md)',
        border: checked ? `2px solid var(--mantine-color-${color}-6)` : '1px solid var(--border)',
        backgroundColor: checked ? `var(--mantine-color-${color}-light)` : 'var(--bg-app)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.72 : 1,
        outline: 'none',
        transition: 'border-color 150ms ease, background-color 150ms ease',
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <ThemeIcon variant={checked ? 'filled' : 'light'} color={color} size={36} radius="md">
              {icon}
            </ThemeIcon>
            <Box>
              <Group gap={6} wrap="wrap">
                <Text fw={700} size="sm">
                  {title}
                </Text>
                {badge && (
                  <Badge size="xs" variant="light" color={color}>
                    {badge}
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed" mt={2}>
                {subtitle}
              </Text>
            </Box>
          </Group>

          {checked && (
            <ThemeIcon size={22} radius="xl" color={color} variant="filled" aria-hidden="true">
              <IconCheck size={13} />
            </ThemeIcon>
          )}
        </Group>

        {bullets && bullets.length > 0 && (
          <Stack gap={4} pt={4}>
            {bullets.map((line) => (
              <Text key={line} size="xs" c="dimmed" lh={1.4}>
                • {line}
              </Text>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  </motion.div>
);

const handlePairRadioKeyDown = (
  e: KeyboardEvent<HTMLDivElement>,
  currentValue: boolean,
  targetValue: boolean,
  disabled: boolean,
  onChange: (value: boolean) => void
) => {
  if (disabled) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    onChange(targetValue);
    return;
  }
  if (
    e.key === 'ArrowRight' ||
    e.key === 'ArrowDown' ||
    e.key === 'ArrowLeft' ||
    e.key === 'ArrowUp'
  ) {
    e.preventDefault();
    const nextValue = !currentValue;
    onChange(nextValue);
    const cards = e.currentTarget.parentElement?.querySelectorAll<HTMLElement>('[role="radio"]');
    const targetCard = cards?.[nextValue ? 1 : 0];
    targetCard?.focus();
  }
};

interface BlockerBannersProps {
  activeSessions: RegisterSession[];
  drawerBalanceCents: number;
  allowStaffEditableWhileDrawerBlocked: boolean;
}

const BlockerBanners = ({
  activeSessions,
  drawerBalanceCents,
  allowStaffEditableWhileDrawerBlocked,
}: BlockerBannersProps) => {
  const hasActiveShifts = activeSessions.length > 0;
  const hasNonZeroDrawer = drawerBalanceCents !== 0;

  if (!hasActiveShifts && !hasNonZeroDrawer) return null;

  return (
    <Stack gap="sm">
      {hasActiveShifts && (
        <Alert
          color="orange"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title={t('Close Active Shifts First')}
        >
          <Stack gap="xs">
            <Text size="xs">
              {t(
                'You have active register shifts right now. Close all open, closing, or reopened shifts before changing shift mode or staff multi-device access.'
              )}
            </Text>
            <Stack gap={4}>
              {activeSessions.map((s) => {
                const statusMeta = STATUS_BADGE[s.status];
                return (
                  <Group key={s.key} gap="xs" wrap="wrap">
                    <Text size="xs" fw={700} ff="monospace">
                      {s.sessionNumber}
                    </Text>
                    <Badge size="xs" variant="light" color={statusMeta.color}>
                      {t(statusMeta.label)}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {s.cashierNameSnapshot} · {s.terminalId}
                    </Text>
                  </Group>
                );
              })}
            </Stack>
          </Stack>
        </Alert>
      )}

      {hasNonZeroDrawer && (
        <Alert
          color="yellow"
          variant="light"
          icon={<IconAlertTriangle size={18} />}
          title={t('Drop Drawer Cash to Safe First')}
        >
          <Stack gap={4}>
            <Text size="xs">
              {t('There is still')}{' '}
              <Text span fw={700}>
                {formatMoney(drawerBalanceCents)}
              </Text>{' '}
              {t(
                'remaining across register drawers. Drop remaining drawer cash to the safe before switching between Personal Shifts and Shared Shop Shift.'
              )}
            </Text>
            {allowStaffEditableWhileDrawerBlocked && (
              <Text size="xs" fw={600} c="blue">
                {t(
                  'Staff multi-device access can still be updated below without emptying drawers.'
                )}
              </Text>
            )}
          </Stack>
        </Alert>
      )}
    </Stack>
  );
};

interface HowItOperatesSummaryProps {
  allowShared: boolean;
  allowStaffMulti: boolean;
}

const HowItOperatesSummary = ({ allowShared, allowStaffMulti }: HowItOperatesSummaryProps) => {
  const color = allowShared ? 'cyan' : allowStaffMulti ? 'blue' : 'teal';
  const badgeText = allowShared
    ? t('Shared Shop Shift · Multi-Device')
    : allowStaffMulti
      ? t('Personal · Staff Multi-Device')
      : t('Personal · Staff Single-Device Lock');

  const points = allowShared
    ? [
        t('One live shift and cash drawer is shared across the entire shop.'),
        t('All Staff, Managers, and Admins join the active shop shift from any device.'),
        t('Any cashier or manager can run a blind count to close the shop shift.'),
      ]
    : allowStaffMulti
      ? [
          t('Each user opens, rings up, and counts their own separate personal shift and drawer.'),
          t(
            'Staff, Managers, and Admins can all sign in across multiple devices on their open shift.'
          ),
          t('Sales and drawer totals remain separated by user for clear accountability.'),
        ]
      : [
          t('Each user opens, rings up, and counts their own separate personal shift and drawer.'),
          t('Admins and Managers can sign in and work across multiple devices anytime.'),
          t(
            'Staff members are locked to the device where their shift is open until that shift is closed.'
          ),
        ];

  return (
    <Paper p="md" withBorder bg="var(--bg-app)" radius="md">
      <Stack gap="xs">
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Text fw={700} size="sm">
            {t('What changes')} · {t('How your shop operates now')}
          </Text>
          <Badge variant="light" color={color} size="sm">
            {badgeText}
          </Badge>
        </Group>
        <Stack gap={4}>
          {points.map((point) => (
            <Text key={point} size="xs" c="dimmed" lh={1.45}>
              • {point}
            </Text>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export const RegisterShiftsSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion() === true;

  const authUser = useAppSelector(selectAuthUser);
  const isAdmin = authUser?.role === 'admin';

  const {
    shopProfile: fetchedProfile,
    isError: profileError,
    refetch: refetchProfile,
  } = useShopProfile();
  const storeProfile = useAppSelector(selectShopProfile);
  const shopProfile = fetchedProfile ?? storeProfile;

  const persistedAllowShared = shopProfile ? shopProfile.allowSharedUserSessions : null;
  const persistedStaffMulti = shopProfile ? shopProfile.allowStaffMultiDeviceSessions : null;

  const [draftAllowShared, setDraftAllowShared] = useState<boolean | null>(null);
  const [draftStaffMulti, setDraftStaffMulti] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedAllowShared = draftAllowShared !== null ? draftAllowShared : persistedAllowShared;
  const selectedStaffMulti = draftStaffMulti !== null ? draftStaffMulti : persistedStaffMulti;

  const { data: activeSummary } = useQuery({
    queryKey: queryKeys.billing.sessions.activeSummary(),
    queryFn: getActiveSessionsSummary,
    refetchOnWindowFocus: true,
  });

  const activeSessions = activeSummary?.activeSessions ?? [];
  const drawerBalanceCents = activeSummary?.drawerBalanceTotalCents ?? 0;
  const hasActiveShifts = activeSessions.length > 0;
  const hasNonZeroDrawer = drawerBalanceCents !== 0;

  const modeChanged =
    selectedAllowShared !== null &&
    persistedAllowShared !== null &&
    selectedAllowShared !== persistedAllowShared;
  const staffPolicyChanged =
    selectedAllowShared === false &&
    selectedStaffMulti !== null &&
    persistedStaffMulti !== null &&
    selectedStaffMulti !== persistedStaffMulti;
  const isDirty = modeChanged || staffPolicyChanged;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const modeSwitchDisabled =
    !isAdmin ||
    persistedAllowShared === null ||
    persistedStaffMulti === null ||
    saving ||
    hasActiveShifts ||
    hasNonZeroDrawer;

  // Option 1: Changing Staff Multi-Device Access requires 0 active shifts,
  // but does NOT require $0 drawer balance while remaining in Personal Shifts.
  const staffPolicyDisabled =
    !isAdmin ||
    persistedAllowShared === null ||
    persistedStaffMulti === null ||
    saving ||
    hasActiveShifts;

  const handleSave = async () => {
    if (!isDirty || selectedAllowShared === null || selectedStaffMulti === null) return;

    const payload: UpdateShopProfileInput = modeChanged
      ? selectedAllowShared
        ? { allowSharedUserSessions: true }
        : {
            allowSharedUserSessions: false,
            allowStaffMultiDeviceSessions: selectedStaffMulti,
          }
      : { allowStaffMultiDeviceSessions: selectedStaffMulti };

    setSaving(true);
    try {
      const persisted = await updateShopProfileApi(payload);
      dispatch(setShopProfile(persisted));
      queryClient.setQueryData(queryKeys.settings.shopProfile(), persisted);
      setDraftAllowShared(null);
      setDraftStaffMulti(null);

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.settings.shopProfile() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.drawerState() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all }),
      ]);

      notifications.show({
        title: t('Register Shift Policy Updated'),
        message: persisted.allowSharedUserSessions
          ? t('Your shop now runs on one Shared Shop Shift across all counters and devices.')
          : persisted.allowStaffMultiDeviceSessions
            ? t('Personal Shifts active. Staff can now sign in across multiple devices.')
            : t(
                'Personal Shifts active. Staff with an open shift are locked to that opening device.'
              ),
        color: 'teal',
      });
    } catch (err: unknown) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.billing.sessions.activeSummary() });
      const apiErr = err as Partial<ApiError>;
      let message = apiErr?.message || t('Could not update register shift settings.');
      if (apiErr?.code === 'ACTIVE_SESSIONS_EXIST') {
        message = t('Close all active register shifts before changing shift settings.');
      } else if (apiErr?.code === 'DRAWER_BALANCE_NONZERO') {
        message = t('Drop remaining cash in register drawers to Rs. 0.00 before switching modes.');
      }
      notifications.show({
        title: t('Cannot Change Mode'),
        message,
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftAllowShared(null);
    setDraftStaffMulti(null);
  };

  return (
    <SectionShell
      title={t('Registers & Shifts')}
      description={t('Personal or shop-wide shifts, cash drawer scope, and multi-device access')}
      isDirty={isDirty}
      saving={saving}
      onSave={handleSave}
      onCancel={handleCancel}
    >
      <Stack gap="lg">
        {!isAdmin && (
          <Alert
            color="gray"
            variant="light"
            icon={<IconShieldLock size={18} />}
            title={t('Admin Only')}
          >
            <Text size="xs">
              {t(
                'Only shop Administrators can change register shift modes or staff multi-device access.'
              )}
            </Text>
          </Alert>
        )}

        {(persistedAllowShared === null || persistedStaffMulti === null) && !profileError && (
          <Stack gap="md">
            <SimpleGrid cols={isMobile ? 1 : 2} spacing="md">
              <Skeleton height={136} radius="md" />
              <Skeleton height={136} radius="md" />
            </SimpleGrid>
            <Skeleton height={96} radius="md" />
          </Stack>
        )}

        {profileError && (persistedAllowShared === null || persistedStaffMulti === null) && (
          <Alert
            color="red"
            variant="light"
            icon={<IconAlertCircle size={18} />}
            title={t('Unable to load register shift settings')}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="sm" mt={4}>
              <Text size="xs">
                {t('Check your connection to load the current shop register configuration.')}
              </Text>
              <Button
                size="xs"
                variant="light"
                color="red"
                leftSection={<IconRefresh size={14} />}
                onClick={() => void refetchProfile()}
              >
                {t('Retry')}
              </Button>
            </Group>
          </Alert>
        )}

        {selectedAllowShared !== null && selectedStaffMulti !== null && (
          <>
            <BlockerBanners
              activeSessions={activeSessions}
              drawerBalanceCents={drawerBalanceCents}
              allowStaffEditableWhileDrawerBlocked={
                !hasActiveShifts && hasNonZeroDrawer && selectedAllowShared === false
              }
            />

            <Stack gap="xs">
              <Text fw={700} size="sm">
                {t('Shift Ownership & Cash Drawer Mode')}
              </Text>
              <SimpleGrid
                cols={isMobile ? 1 : 2}
                spacing="md"
                role="radiogroup"
                aria-label={t('Shift Ownership & Cash Drawer Mode')}
              >
                <RadioOptionCard
                  checked={selectedAllowShared === false}
                  disabled={modeSwitchDisabled}
                  color="teal"
                  title={t('Personal Shifts')}
                  subtitle={t('Separate shift and cash drawer per user')}
                  icon={<IconUsers size={20} />}
                  bullets={[
                    t('Each cashier opens, rings up, and closes their own personal shift'),
                    t('Admins & Managers can always sign in across multiple devices'),
                  ]}
                  dataAttr={{ 'data-mode': 'personal' }}
                  reduceMotion={reduceMotion}
                  onSelect={() => setDraftAllowShared(false)}
                  onKeyDown={(e) =>
                    handlePairRadioKeyDown(
                      e,
                      selectedAllowShared,
                      false,
                      modeSwitchDisabled,
                      setDraftAllowShared
                    )
                  }
                />

                <RadioOptionCard
                  checked={selectedAllowShared === true}
                  disabled={modeSwitchDisabled}
                  color="cyan"
                  title={t('Shared Shop Shift')}
                  subtitle={t('One shared shift and cash drawer for the whole shop')}
                  icon={<IconBuildingStore size={20} />}
                  bullets={[
                    t('All counters and users ring up into one live shop shift'),
                    t(
                      'Everyone shares access across all devices with shop-wide cash drawer continuity'
                    ),
                  ]}
                  dataAttr={{ 'data-mode': 'shared' }}
                  reduceMotion={reduceMotion}
                  onSelect={() => setDraftAllowShared(true)}
                  onKeyDown={(e) =>
                    handlePairRadioKeyDown(
                      e,
                      selectedAllowShared,
                      true,
                      modeSwitchDisabled,
                      setDraftAllowShared
                    )
                  }
                />
              </SimpleGrid>
            </Stack>

            <AnimatePresence mode="wait" initial={false}>
              {selectedAllowShared === false ? (
                <motion.div
                  key="personal-staff-policy"
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: DURATION.fast, ease: EASE }
                  }
                >
                  <Paper p="md" withBorder radius="md" bg="var(--bg-card)">
                    <Stack gap="sm">
                      <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                        <Box style={{ flex: 1, minWidth: 220 }}>
                          <Group gap="xs" wrap="wrap">
                            <Text fw={700} size="sm">
                              {t('Staff Multi-Device Access')}
                            </Text>
                            <Badge size="xs" variant="light" color="blue">
                              {t('Admin & Manager: Multi-Device')}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed" mt={2}>
                            {t(
                              'Decide whether Staff cashiers must remain on one device while a shift is open, or can switch across devices freely.'
                            )}
                          </Text>
                        </Box>
                      </Group>

                      <SimpleGrid
                        cols={isMobile ? 1 : 2}
                        spacing="sm"
                        role="radiogroup"
                        aria-label={t('Staff Multi-Device Access')}
                      >
                        <RadioOptionCard
                          checked={selectedStaffMulti === false}
                          disabled={staffPolicyDisabled}
                          color="teal"
                          title={t('Single Device Lock')}
                          subtitle={t(
                            'Staff are locked to the device where their shift is currently open'
                          )}
                          icon={<IconLock size={18} />}
                          dataAttr={{ 'data-staff-policy': 'locked' }}
                          reduceMotion={reduceMotion}
                          onSelect={() => setDraftStaffMulti(false)}
                          onKeyDown={(e) =>
                            handlePairRadioKeyDown(
                              e,
                              selectedStaffMulti,
                              false,
                              staffPolicyDisabled,
                              setDraftStaffMulti
                            )
                          }
                        />

                        <RadioOptionCard
                          checked={selectedStaffMulti === true}
                          disabled={staffPolicyDisabled}
                          color="blue"
                          title={t('Allow Across Devices')}
                          subtitle={t(
                            'Staff can sign in across phones, tablets, or counters on their open personal shift'
                          )}
                          icon={<IconDevices size={18} />}
                          dataAttr={{ 'data-staff-policy': 'multi' }}
                          reduceMotion={reduceMotion}
                          onSelect={() => setDraftStaffMulti(true)}
                          onKeyDown={(e) =>
                            handlePairRadioKeyDown(
                              e,
                              selectedStaffMulti,
                              true,
                              staffPolicyDisabled,
                              setDraftStaffMulti
                            )
                          }
                        />
                      </SimpleGrid>
                    </Stack>
                  </Paper>
                </motion.div>
              ) : (
                <motion.div
                  key="shared-shop-context"
                  initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={
                    reduceMotion ? { duration: 0 } : { duration: DURATION.fast, ease: EASE }
                  }
                >
                  <Alert
                    color="cyan"
                    variant="light"
                    icon={<IconBuildingStore size={18} />}
                    title={t('Everyone Shares One Shift Across All Devices')}
                  >
                    <Text size="xs">
                      {t(
                        'All Staff, Managers, and Admins join the single active shop shift from any signed-in device, so separate per-staff device locks do not apply.'
                      )}
                    </Text>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <HowItOperatesSummary
              allowShared={selectedAllowShared}
              allowStaffMulti={selectedStaffMulti}
            />
          </>
        )}
      </Stack>
    </SectionShell>
  );
};
