import { useState, useMemo } from 'react';
import {
  Button,
  Badge,
  Group,
  Text,
  Paper,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  ActionIcon,
} from '@mantine/core';
import {
  IconPlus,
  IconUserCheck,
  IconUser,
  IconPhone,
  IconEdit,
  IconTrash,
  IconEye,
  IconCheck,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { EntityListPage } from '@/shared/components/EntityListPage';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Employee, EmployeeInput, EMPLOYEE_ROLE_LABELS } from '../types';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  deleteEmployees,
  fetchAllEmployeeEarnings,
} from '../api/mockEmployees';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeDetailDrawer } from './EmployeeDetailDrawer';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';
import { RoleGuard } from '@/shared/components/RoleGuard';
import { USER_ROLES } from '@/constants/roles';

export function EmployeeList() {
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: fetchEmployees,
  });

  useQuery({
    queryKey: queryKeys.employees.allEarnings(),
    queryFn: () => fetchAllEmployeeEarnings(),
  });

  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [selectedEmployeeForDrawer, setSelectedEmployeeForDrawer] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (newEmp) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.allEarnings() });
      notifications.show({
        title: 'Employee Registered',
        message: `Saved ${newEmp.name} to employee directory`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<EmployeeInput> }) =>
      updateEmployee(id, input),
    onSuccess: (updatedEmp) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.allEarnings() });
      notifications.show({
        title: 'Employee Updated',
        message: `Updated details for ${updatedEmp.name}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.allEarnings() });
      notifications.show({
        title: 'Employee Deleted',
        message: 'Employee record removed successfully',
        color: 'blue',
      });
      if (selectedEmployeeForDrawer?.id === employeeToDelete?.id) {
        setSelectedEmployeeForDrawer(null);
      }
      setEmployeeToDelete(null);
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deleteEmployees,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.allEarnings() });
      notifications.show({
        title: 'Employees Deleted',
        message: 'Selected employee records removed successfully',
        color: 'blue',
      });
    },
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        (e.nicOrId && e.nicOrId.toLowerCase().includes(q));

      const matchesRole = !selectedRole || e.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [employees, search, selectedRole]);

  const handleOpenAddModal = () => {
    setEmployeeToEdit(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (values: EmployeeInput) => {
    if (employeeToEdit) {
      await updateMutation.mutateAsync({ id: employeeToEdit.id, input: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleConfirmDelete = async () => {
    if (employeeToDelete) {
      await deleteMutation.mutateAsync(employeeToDelete.id);
    }
  };

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee Name',
      align: 'left',
      width: '25%',
      render: (e) => (
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon variant="light" color="indigo" size="sm">
            <IconUser size={14} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700}>
              {e.name}
            </Text>
          </div>
        </Group>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      align: 'left',
      width: '20%',
      render: (e) => (
        <Badge size="xs" color="indigo" variant="light">
          {EMPLOYEE_ROLE_LABELS[e.role]}
        </Badge>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      align: 'left',
      width: '20%',
      render: (e) => (
        <Group gap={4}>
          <IconPhone size={14} style={{ opacity: 0.6 }} />
          <Text size="xs">{e.phone}</Text>
        </Group>
      ),
    },
    {
      key: 'split',
      header: 'Default Split Rule',
      align: 'center',
      width: '18%',
      render: (e) => (
        <RoleGuard
          allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.CASHIER]}
          fallback={<Text size="xs" c="dimmed">Restricted</Text>}
        >
          <Badge size="xs" color={e.defaultSplitType === 'percentage' ? 'indigo' : 'teal'} variant="light">
            {e.defaultSplitType === 'percentage'
              ? `${e.defaultSplitValue}% Profit`
              : formatMoney(e.defaultSplitValue)}
          </Badge>
        </RoleGuard>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      width: '17%',
      render: (e) => (
        <Group gap={4} justify="flex-end" onClick={(ev) => ev.stopPropagation()}>
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setSelectedEmployeeForDrawer(e)}>
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => handleOpenEditModal(e)}>
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => setEmployeeToDelete(e)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const kpiCards = (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Active Staff Members
              </Text>
              <Text fw={800} size="xl">
                {employees.filter((e) => e.status === 'active').length}
              </Text>
            </div>
            <ThemeIcon variant="light" color="indigo" size="lg">
              <IconUserCheck size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  );

  return (
    <>
      <EntityListPage
        title="Employee Directory & Commission Splits"
        description="Staff profiles, technician assignments, and job profit commission splits"
        action={
          <Button leftSection={<IconPlus size={16} />} color="indigo" onClick={handleOpenAddModal}>
            Register New Employee
          </Button>
        }
        kpiCards={kpiCards}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search staff by name, phone, or NIC..."
        filterTags={['technician', 'printer', 'sales', 'general']}
        selectedTag={selectedRole}
        onSelectTag={setSelectedRole}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      >
        {viewMode === 'table' ? (
          <DataTable
            data={filteredEmployees}
            columns={columns}
            keyExtractor={(e) => e.id}
            loading={isLoading}
            onRowClick={(e) => setSelectedEmployeeForDrawer(e)}
            onDeleteSelected={(ids) => deleteBatchMutation.mutateAsync(ids)}
          />
        ) : (
          <Grid gap="md">
            {filteredEmployees.map((emp) => (
              <Grid.Col key={emp.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card
                  withBorder
                  p="md"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedEmployeeForDrawer(emp)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedEmployeeForDrawer(emp);
                    }
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                      <Group gap="xs">
                        <ThemeIcon variant="light" color="indigo" size="md">
                          <IconUser size={18} />
                        </ThemeIcon>
                        <div>
                          <Text size="sm" fw={700}>
                            {emp.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {emp.phone}
                          </Text>
                        </div>
                      </Group>

                      {/* Primary signal badge */}
                      <Badge color="indigo" variant="light" size="sm">
                        {EMPLOYEE_ROLE_LABELS[emp.role]}
                      </Badge>
                    </Group>

                    <Paper p="xs" withBorder bg="var(--bg-app)" mt="xs">
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Default Split:
                        </Text>
                        <Text size="xs" fw={700}>
                          {emp.defaultSplitType === 'percentage'
                            ? `${emp.defaultSplitValue}% Profit`
                            : formatMoney(emp.defaultSplitValue)}
                        </Text>
                      </Group>
                    </Paper>

                    <Group justify="flex-end" gap="xs" mt="xs" onClick={(ev) => ev.stopPropagation()}>
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleOpenEditModal(emp)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => setEmployeeToDelete(emp)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </EntityListPage>

      {/* Form Modal */}
      <EmployeeFormModal
        opened={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        employeeToEdit={employeeToEdit}
      />

      {/* Detail Drawer */}
      <EmployeeDetailDrawer
        employee={selectedEmployeeForDrawer}
        opened={Boolean(selectedEmployeeForDrawer)}
        onClose={() => setSelectedEmployeeForDrawer(null)}
        onEdit={(e) => {
          setSelectedEmployeeForDrawer(null);
          handleOpenEditModal(e);
        }}
        onDelete={(e) => {
          setSelectedEmployeeForDrawer(null);
          setEmployeeToDelete(e);
        }}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        opened={Boolean(employeeToDelete)}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        confirmLabel="Delete Employee"
        confirmColor="red"
      >
        Are you sure you want to delete <strong>{employeeToDelete?.name}</strong>?
      </ConfirmDialog>
    </>
  );
}
