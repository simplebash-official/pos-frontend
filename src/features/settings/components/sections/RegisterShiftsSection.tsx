import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import { Alert, Badge, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCheck,
  IconDeviceDesktop,
  IconLayersLinked,
} from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectShopProfile, setShopProfile, updateShopProfile } from '@/store/slices/settingsSlice';
import { selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import { getErrorMessage } from '@/shared/lib/error';
import { SectionShell } from '../SectionShell';
import { getShopProfileApi, updateShopProfileApi } from '../../api/settingsApi';
import { useSessionList } from '@/features/billing/hooks/useRegisterSession';

export interface SectionProps {
  onDirtyChange: (dirty: boolean) => void;
}

export const RegisterShiftsSection = ({ onDirtyChange }: SectionProps) => {
  const dispatch = useAppDispatch();
  const shopProfile = useAppSelector(selectShopProfile);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = userRole === USER_ROLES.ADMIN;

  const [saving, setSaving] = useState(false);
  const [allowShared, setAllowShared] = useState<boolean>(
    shopProfile.allowSharedUserSessions ?? false
  );

  // Mid-shift Active Shift Guard: Query active open sessions shop-wide
  const { data: sessionListData } = useSessionList({ status: 'open' });
  const hasActiveShifts = (sessionListData?.sessions?.length ?? 0) > 0;

  // Sync with shop profile on initial load
  useEffect(() => {
    let isMounted = true;
    getShopProfileApi()
      .then((profile) => {
        if (!isMounted) return;
        dispatch(setShopProfile(profile));
        setAllowShared(profile.allowSharedUserSessions ?? false);
      })
      .catch((err) => {
        console.warn('Failed to load shop profile from server:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const persistedValue = shopProfile.allowSharedUserSessions ?? false;
  const isDirty = allowShared !== persistedValue;

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const switchDisabled = !isAdmin || hasActiveShifts || saving;

  const handleSave = async () => {
    if (switchDisabled && !isDirty) return;
    setSaving(true);
    try {
      const persisted = await updateShopProfileApi({
        allowSharedUserSessions: allowShared,
      });
      dispatch(updateShopProfile(persisted));
      setAllowShared(persisted.allowSharedUserSessions ?? false);
      notifications.show({
        title: t('Settings Saved'),
        message: t('Register shift mode updated successfully.'),
        color: 'teal',
      });
    } catch (err: unknown) {
      const status =
        (err as { statusCode?: number; status?: number; response?: { status?: number } })
          ?.statusCode ??
        (err as { status?: number })?.status ??
        (err as { response?: { status?: number } })?.response?.status;

      if (status === 409) {
        notifications.show({
          title: t('Cannot Change Mode'),
          message: getErrorMessage(
            err,
            t(
              'Cannot change register shift mode while shifts are active. Please close all open shifts in the shop first.'
            )
          ),
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
    setAllowShared(persistedValue);
  };

  return (
    <SectionShell
      title={t('Registers & Shifts')}
      description={t('Configure multi-device shift sharing and cash drawer isolation')}
      isDirty={isDirty}
      saving={saving}
      onSave={() => void handleSave()}
      onCancel={handleCancel}
      saveLabel={t('Save Changes')}
    >
      <Stack gap="lg">
        {/* Mid-shift Active Shift Guard Alert */}
        {hasActiveShifts && (
          <Alert
            icon={<IconAlertTriangle size={18} />}
            color="orange"
            variant="light"
            title={t('Active Shifts Detected')}
          >
            {t(
              'Cannot change register shift mode while shifts are active. Please close all open shifts in the shop first.'
            )}
          </Alert>
        )}

        {/* Non-Admin Informational Notice */}
        {!isAdmin && (
          <Group>
            <Badge size="md" variant="light" color="gray">
              {t('Admin Only: Only shop administrators can change this mode.')}
            </Badge>
          </Group>
        )}

        {/* Mode Selection Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {/* Card 1: Isolated Register Mode */}
          <Paper
            data-mode="isolated"
            withBorder
            p="md"
            radius="md"
            role="radio"
            aria-checked={!allowShared}
            tabIndex={switchDisabled ? -1 : 0}
            style={{
              backgroundColor: !allowShared ? 'var(--mantine-color-blue-light)' : 'var(--bg-app)',
              borderColor: !allowShared ? 'var(--mantine-color-blue-filled)' : 'var(--border)',
              borderWidth: !allowShared ? 2 : 1,
              cursor: switchDisabled ? 'not-allowed' : 'pointer',
              opacity: switchDisabled ? 0.65 : 1,
              transition: 'all 0.15s ease',
            }}
            onClick={() => {
              if (!switchDisabled) setAllowShared(false);
            }}
            onKeyDown={(e) => {
              if (!switchDisabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setAllowShared(false);
              }
            }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon
                    variant={!allowShared ? 'filled' : 'light'}
                    color="blue"
                    size="lg"
                    radius="md"
                  >
                    <IconDeviceDesktop size={20} />
                  </ThemeIcon>
                  <Text fw={700} size="sm">
                    {t('Isolated Register Mode (Default)')}
                  </Text>
                </Group>
                <Badge
                  variant={!allowShared ? 'filled' : 'light'}
                  color="blue"
                  size="sm"
                  style={{ flexShrink: 0 }}
                >
                  {t('Multi-Counter Standard')}
                </Badge>
              </Group>

              <Text size="sm" c="dimmed">
                {t(
                  'Each terminal has its own independent shift, physical cash drawer, and Z-report.'
                )}
              </Text>

              <Group justify="space-between" align="center" mt="xs">
                {!allowShared ? (
                  <Badge
                    size="sm"
                    color="blue"
                    variant="filled"
                    leftSection={<IconCheck size={12} />}
                  >
                    {t('Active Selection')}
                  </Badge>
                ) : (
                  <Badge size="xs" color="gray" variant="light">
                    {switchDisabled ? t('Isolated Mode') : t('Click to Select')}
                  </Badge>
                )}
              </Group>
            </Stack>
          </Paper>

          {/* Card 2: Shared Shift Mode */}
          <Paper
            data-mode="shared"
            withBorder
            p="md"
            radius="md"
            role="radio"
            aria-checked={allowShared}
            tabIndex={switchDisabled ? -1 : 0}
            style={{
              backgroundColor: allowShared ? 'var(--mantine-color-cyan-light)' : 'var(--bg-app)',
              borderColor: allowShared ? 'var(--mantine-color-cyan-filled)' : 'var(--border)',
              borderWidth: allowShared ? 2 : 1,
              cursor: switchDisabled ? 'not-allowed' : 'pointer',
              opacity: switchDisabled ? 0.65 : 1,
              transition: 'all 0.15s ease',
            }}
            onClick={() => {
              if (!switchDisabled) setAllowShared(true);
            }}
            onKeyDown={(e) => {
              if (!switchDisabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                setAllowShared(true);
              }
            }}
          >
            <Stack gap="sm">
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon
                    variant={allowShared ? 'filled' : 'light'}
                    color="cyan"
                    size="lg"
                    radius="md"
                  >
                    <IconLayersLinked size={20} />
                  </ThemeIcon>
                  <Text fw={700} size="sm">
                    {t('Shared Shift Mode')}
                  </Text>
                </Group>
                <Badge
                  variant={allowShared ? 'filled' : 'light'}
                  color="cyan"
                  size="sm"
                  style={{ flexShrink: 0 }}
                >
                  {t('Single-Counter Convenience')}
                </Badge>
              </Group>

              <Text size="sm" c="dimmed">
                {t(
                  "Secondary laptops or tablets share the counter's active shift and cash drawer float."
                )}
              </Text>

              <Group justify="space-between" align="center" mt="xs">
                {allowShared ? (
                  <Badge
                    size="sm"
                    color="cyan"
                    variant="filled"
                    leftSection={<IconCheck size={12} />}
                  >
                    {t('Active Selection')}
                  </Badge>
                ) : (
                  <Badge size="xs" color="gray" variant="light">
                    {switchDisabled ? t('Shared Mode') : t('Click to Select')}
                  </Badge>
                )}
              </Group>
            </Stack>
          </Paper>
        </SimpleGrid>
      </Stack>
    </SectionShell>
  );
};
