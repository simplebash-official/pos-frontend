import { useEffect } from 'react';
import { Modal, TextInput, PasswordInput, Select, Button, Group, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconMail, IconLock, IconUserCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES, USER_ROLE_LABELS, type UserRole } from '@/constants/roles';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { useAllEmployees } from '@/features/employees/hooks/useEmployees';
import type { Employee } from '@/features/employees/types';
import { useCreateUser } from '../hooks/useUsers';

export interface CreateLoginModalProps {
  opened: boolean;
  onClose: () => void;
  /**
   * When provided (opened from the Employee drawer's Login tab), the
   * employee is fixed and only email/password/role are editable. When
   * absent (opened standalone from the Accounts list), an employee picker
   * is shown first — see `UsersList.tsx`.
   */
  employee?: Employee | null;
}

interface CreateLoginFormValues {
  employeeId: string;
  email: string;
  password: string;
  role: UserRole | '';
}

/** Mirrors the backend's `manageable_roles` — never offer a role the server would reject. */
const manageableRoles = (callerRole: UserRole): UserRole[] => {
  if (callerRole === USER_ROLES.ADMIN) return [USER_ROLES.MANAGER, USER_ROLES.STAFF];
  if (callerRole === USER_ROLES.MANAGER) return [USER_ROLES.STAFF];
  return [];
};

export const CreateLoginModal = ({ opened, onClose, employee }: CreateLoginModalProps) => {
  const isMobile = useIsMobile();
  const callerRole = useAppSelector(selectUserRole);
  const { data: allEmployees = [] } = useAllEmployees();
  const createMutation = useCreateUser();

  const roleOptions = manageableRoles(callerRole).map((role) => ({
    value: role,
    label: USER_ROLE_LABELS[role],
  }));

  // Standalone mode: only employees without a login yet can be picked.
  const availableEmployees = allEmployees.filter((e) => !e.login);

  const form = useForm<CreateLoginFormValues>({
    initialValues: { employeeId: employee?.id ?? '', email: '', password: '', role: '' },
    validate: {
      employeeId: (val) => (val ? null : 'Select an employee'),
      email: (val) => (/^\S+@\S+\.\S+$/.test(val.trim()) ? null : 'Enter a valid email address'),
      password: (val) => (val.length >= 8 ? null : 'Password must be at least 8 characters'),
      role: (val) => (val ? null : 'Select a role'),
    },
  });

  useEffect(() => {
    if (opened) {
      form.setValues({ employeeId: employee?.id ?? '', email: '', password: '', role: '' });
    } else {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, employee]);

  const selectedEmployee = employee ?? allEmployees.find((e) => e.id === form.values.employeeId);

  const handleSubmit = async (values: CreateLoginFormValues) => {
    const target = employee ?? allEmployees.find((e) => e.id === values.employeeId);
    if (!target || !values.role) return;

    await createMutation.mutateAsync({
      name: target.name,
      email: values.email.trim(),
      password: values.password,
      role: values.role,
      employeeKey: target.key,
    });
    notifications.show({
      title: 'Login Created',
      message: `${target.name} can now sign in with ${values.email.trim()}`,
      color: 'green',
      icon: <IconUserCheck size={16} />,
    });
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {employee ? `Create Login for ${employee.name}` : 'Create Login'}
        </Text>
      }
      size="md"
      centered
      fullScreen={isMobile}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {!employee && (
            <Select
              label="Employee"
              placeholder="Pick a shop employee to give a login to"
              data={availableEmployees.map((e) => ({ value: e.id, label: e.name }))}
              required
              {...form.getInputProps('employeeId')}
            />
          )}

          {selectedEmployee && (
            <Text size="xs" c="dimmed">
              This login will be linked to {selectedEmployee.name}&apos;s employee profile.
            </Text>
          )}

          <TextInput
            label="Login Email"
            placeholder="e.g. nimal@shop.lk"
            leftSection={<IconMail size={16} />}
            required
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="At least 8 characters"
            leftSection={<IconLock size={16} />}
            required
            {...form.getInputProps('password')}
          />

          <Select
            label="Role"
            placeholder="What can this login do?"
            data={roleOptions}
            required
            {...form.getInputProps('role')}
          />

          <Group justify="flex-end" mt="md" gap="sm">
            <Button variant="default" onClick={onClose} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" color="blue" loading={createMutation.isPending}>
              Create Login
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
