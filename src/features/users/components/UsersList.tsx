import { t } from '@/shared/i18n/t';
import { useState } from 'react';
import { Badge, Button, Group, Text, ActionIcon, Tooltip, Stack } from '@mantine/core';
import { IconPlus, IconTrash, IconKey } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES, USER_ROLE_LABELS, type UserRole } from '@/constants/roles';
import { useUsers, useDeleteUser } from '../hooks/useUsers';
import { CreateLoginModal } from './CreateLoginModal';
import { SetPinModal } from './SetPinModal';
import type { UserAccount } from '../types';

/** Mirrors the backend's `manageable_roles` — the caller can only act on accounts in this set. */
const manageableRoles = (callerRole: UserRole): UserRole[] => {
  if (callerRole === USER_ROLES.ADMIN) return [USER_ROLES.MANAGER, USER_ROLES.STAFF];
  if (callerRole === USER_ROLES.MANAGER) return [USER_ROLES.STAFF];
  return [];
};

export const UsersList = () => {
  const callerRole = useAppSelector(selectUserRole);
  const allowedRoles = manageableRoles(callerRole);
  const { data: users = [], isLoading } = useUsers();
  const deleteMutation = useDeleteUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinTarget, setPinTarget] = useState<UserAccount | null>(null);

  // Only managers and admins ever approve register overrides, so only they carry a PIN.
  const canHavePin = callerRole === USER_ROLES.ADMIN || callerRole === USER_ROLES.MANAGER;
  const openPin = (target: UserAccount | null) => {
    setPinTarget(target);
    setPinOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    await deleteMutation.mutateAsync(userToDelete.id);
    notifications.show({
      title: 'Login Removed',
      message: `${userToDelete.name}'s login has been removed`,
      color: 'blue',
    });
    setUserToDelete(null);
  };

  const columns: Column<UserAccount>[] = [
    {
      key: 'name',
      header: 'Name',
      align: 'left',
      render: (u) => (
        <Text size="sm" fw={700}>
          {u.name}
        </Text>
      ),
    },
    {
      key: 'username',
      header: 'Username',
      align: 'left',
      render: (u) => (
        <Text size="sm" c="dimmed">
          {u.username}
        </Text>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      align: 'left',
      render: (u) => (
        <Badge size="xs" color="blue" variant="light">
          {USER_ROLE_LABELS[u.role]}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'left',
      render: (u) => (
        <Badge size="xs" color={u.isActive ? 'green' : 'gray'} variant="light">
          {u.isActive ? 'Active' : 'Deactivated'}
        </Badge>
      ),
    },
    {
      key: 'pin',
      header: 'PIN',
      align: 'left',
      render: (u) =>
        u.role === USER_ROLES.STAFF ? null : (
          <Badge size="xs" color={u.hasPin ? 'green' : 'gray'} variant="light">
            {u.hasPin ? t('Set') : t('Not set')}
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (u) => {
        if (!allowedRoles.includes(u.role)) return null;
        // Only an admin may set another person's PIN (the server refuses anyone else).
        const canSetPin = callerRole === USER_ROLES.ADMIN && u.role === USER_ROLES.MANAGER;
        return (
          <Group gap="xs" justify="flex-end" wrap="nowrap">
            {canSetPin && (
              <Tooltip label={t('Set PIN')} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => openPin(u)}
                  aria-label={t('Set PIN')}
                >
                  <IconKey size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label={t('Remove Login')} withArrow>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => setUserToDelete(u)}
                aria-label={t('Remove Login')}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        );
      },
    },
  ];

  return (
    <Stack gap="lg">
      <PageHeader
        title={t('Login Accounts')}
        description={t("People who can sign in to this app, and what they're allowed to do")}
        action={
          <Group gap="sm">
            {canHavePin && (
              <Button
                variant="default"
                leftSection={<IconKey size={16} />}
                onClick={() => openPin(null)}
              >
                {t('My PIN')}
              </Button>
            )}
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
              {t('Create Login')}
            </Button>
          </Group>
        }
      />

      {users.length === 0 && !isLoading ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          <IconKey size={20} style={{ verticalAlign: 'middle', opacity: 0.5 }} />{' '}
          {t(
            'No logins yet.\n                            Create one for a shop employee so they can sign in.'
          )}
        </Text>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          keyExtractor={(u) => u.id}
          loading={isLoading}
          selectable={false}
        />
      )}

      <CreateLoginModal opened={createOpen} onClose={() => setCreateOpen(false)} />
      <SetPinModal opened={pinOpen} onClose={() => setPinOpen(false)} target={pinTarget} />

      <ConfirmDialog
        opened={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={t('Remove Login')}
        confirmLabel={t('Remove Login')}
        confirmColor="red"
        loading={deleteMutation.isPending}
      >
        {userToDelete
          ? `Remove ${userToDelete.name}'s login? They will no longer be able to sign in.`
          : ''}
      </ConfirmDialog>
    </Stack>
  );
};
