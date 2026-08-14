import { useState, useMemo } from 'react';
import {
  Button,
  Badge,
  Group,
  Text,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  ActionIcon,
  Skeleton,
  Avatar,
  Box,
  Tooltip,
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
  IconTools,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { EntityListPage } from '@/shared/components/EntityListPage';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PhoneDisplay } from '@/shared/components/PhoneDisplay';
import { getInitials, getAvatarColor } from '@/shared/lib/utils';
import { Employee, EmployeeInput, EMPLOYEE_ROLE_LABELS } from '../types';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  deleteEmployees,
} from '../api/mockEmployees';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeDetailDrawer } from './EmployeeDetailDrawer';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';
import { RoleGuard } from '@/shared/components/RoleGuard';
import { USER_ROLES } from '@/constants/roles';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import { EMPLOYEE_SEARCH_FIELDS } from '@/shared/lib/searchFields';

export const EmployeeList = () => {
  const queryClient = useQueryClient();

  const {
    data: employees = [],
    isLoading,
    isPending,
    isFetching,
  } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: fetchEmployees,
  });
  const isEmployeesLoading = isLoading || isPending || isFetching;

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

  const roleFilteredEmployees = useMemo(() => {
    if (!selectedRole) return employees;
    return employees.filter((e) => e.role === selectedRole);
  }, [employees, selectedRole]);

  const { results: filteredEmployees } = useEntitySearch(
    roleFilteredEmployees,
    EMPLOYEE_SEARCH_FIELDS,
    search,
    null
  );

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
      sortable: true,
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
      sortable: true,
      render: (e) => (
        <Badge size="xs" color="indigo" variant="light">
          {EMPLOYEE_ROLE_LABELS[e.role]}
        </Badge>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      align: 'left',
      width: '20%',
      sortable: true,
      render: (e) => (
        <Group gap={4}>
          <IconPhone size={14} style={{ opacity: 0.6 }} />
          <Text size="xs">{e.phone}</Text>
        </Group>
      ),
    },
    {
      key: 'split',
      header: 'Split Rule',
      align: 'center',
      width: '18%',
      sortable: true,
      sortFn: (a, b, direction) => {
        const valA = a.defaultSplitValue;
        const valB = b.defaultSplitValue;
        return direction === 'asc' ? valA - valB : valB - valA;
      },
      render: (e) => (
        <RoleGuard
          allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.CASHIER]}
          fallback={
            <Text size="xs" c="dimmed">
              Restricted
            </Text>
          }
        >
          <Badge
            size="xs"
            color={e.defaultSplitType === 'percentage' ? 'indigo' : 'teal'}
            variant="light"
          >
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
      sortable: false,
      render: (e) => (
        <Group gap={4} justify="flex-end" onClick={(ev) => ev.stopPropagation()}>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => setSelectedEmployeeForDrawer(e)}
          >
            <IconEye size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            onClick={() => handleOpenEditModal(e)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="red" size="sm" onClick={() => setEmployeeToDelete(e)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ),
    },
  ];

  const technicalStaffCount = useMemo(() => {
    return employees.filter(
      (e) => (e.role === 'technician' || e.role === 'printer') && e.status === 'active'
    ).length;
  }, [employees]);

  const salesStaffCount = useMemo(() => {
    return employees.filter(
      (e) => (e.role === 'sales' || e.role === 'general') && e.status === 'active'
    ).length;
  }, [employees]);

  const kpiCards = (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Active Staff Members
              </Text>
              {isEmployeesLoading ? (
                <Skeleton height={28} width={60} mt={4} />
              ) : (
                <Text fw={800} size="xl">
                  {employees.filter((e) => e.status === 'active').length}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color="indigo" size="lg">
              <IconUserCheck size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Technicians & Printers
              </Text>
              {isEmployeesLoading ? (
                <Skeleton height={28} width={60} mt={4} />
              ) : (
                <Text fw={800} size="xl" c="teal">
                  {technicalStaffCount}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color="teal" size="lg">
              <IconTools size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <div>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                Sales & Service Staff
              </Text>
              {isEmployeesLoading ? (
                <Skeleton height={28} width={60} mt={4} />
              ) : (
                <Text fw={800} size="xl" c="blue">
                  {salesStaffCount}
                </Text>
              )}
            </div>
            <ThemeIcon variant="light" color="blue" size="lg">
              <IconUsers size={22} />
            </ThemeIcon>
          </Group>
        </Card>
      </Grid.Col>
    </Grid>
  );

  return (
    <>
      <EntityListPage
        namespace="employees"
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
        ) : isLoading ? (
          <Grid gap="md">
            {Array.from({ length: 6 }, (_, i) => (
              <Grid.Col key={`emp-skel-${i}`} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card withBorder p="md" style={{ height: '100%' }}>
                  <Stack justify="space-between" style={{ height: '100%' }} gap="md">
                    <div>
                      <Group justify="space-between" align="flex-start" mb="xs">
                        <Group gap="sm">
                          <Skeleton height={38} width={38} radius="md" />
                          <div>
                            <Skeleton height={16} width={130} mb={6} />
                            <Skeleton height={12} width={90} />
                          </div>
                        </Group>
                        <Skeleton height={20} width={70} radius="xl" />
                      </Group>
                      <Box pt="xs" style={{ borderTop: '1px solid var(--border)' }}>
                        <Skeleton height={24} width="80%" mb={6} />
                        <Skeleton height={24} width="65%" />
                      </Box>
                    </div>
                    <Group
                      justify="space-between"
                      pt="xs"
                      style={{ borderTop: '1px solid var(--border)' }}
                    >
                      <Skeleton height={14} width={80} />
                      <Group gap="xs">
                        <Skeleton height={24} width={24} circle />
                        <Skeleton height={24} width={24} circle />
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Grid gap="md">
            {filteredEmployees.map((emp) => (
              <Grid.Col key={emp.id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card
                  className="entity-grid-card"
                  p="md"
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
                  <Stack justify="space-between" style={{ height: '100%' }} gap="md">
                    {/* Top Section */}
                    <div>
                      <Group justify="space-between" align="flex-start" wrap="nowrap" mb="xs">
                        <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                          <Avatar
                            color={getAvatarColor(emp.name)}
                            radius="var(--mantine-radius-default)"
                            size="md"
                            fw={700}
                          >
                            {getInitials(emp.name)}
                          </Avatar>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Text size="sm" fw={700} lineClamp={1}>
                              {emp.name}
                            </Text>
                            <Text size="xs" c="dimmed">
                              NIC/ID: {emp.nicOrId || 'N/A'}
                            </Text>
                          </div>
                        </Group>

                        {/* Role Badge */}
                        <Badge color="indigo" variant="light" size="sm" style={{ flexShrink: 0 }}>
                          {EMPLOYEE_ROLE_LABELS[emp.role]}
                        </Badge>
                      </Group>

                      {/* Structured Details */}
                      <Box pt="xs" style={{ borderTop: '1px solid var(--border)' }}>
                        <Stack gap={6}>
                          <PhoneDisplay primaryPhone={emp.phone} />
                          <Group justify="space-between" align="center">
                            <Text size="xs" c="dimmed">
                              Split Rule:
                            </Text>
                            <Badge
                              size="xs"
                              color={emp.defaultSplitType === 'percentage' ? 'indigo' : 'teal'}
                              variant="light"
                            >
                              {emp.defaultSplitType === 'percentage'
                                ? `${emp.defaultSplitValue}% Profit`
                                : formatMoney(emp.defaultSplitValue)}
                            </Badge>
                          </Group>
                        </Stack>
                      </Box>
                    </div>

                    {/* Footer Action Rail */}
                    <Group
                      justify="space-between"
                      align="center"
                      pt="xs"
                      style={{ borderTop: '1px solid var(--border)' }}
                      onClick={(ev) => ev.stopPropagation()}
                    >
                      <Text
                        size="xs"
                        c="indigo"
                        fw={600}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedEmployeeForDrawer(emp)}
                      >
                        View Profile →
                      </Text>

                      <Group gap="xs">
                        <RoleGuard allowedRoles={[USER_ROLES.ADMIN]} fallback={null}>
                          <Tooltip label="Edit Employee" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => handleOpenEditModal(emp)}
                              aria-label="Edit Employee"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Delete Employee" withArrow>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => setEmployeeToDelete(emp)}
                              aria-label="Delete Employee"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </RoleGuard>
                      </Group>
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
};
