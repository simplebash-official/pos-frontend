import { useState, useMemo } from 'react';
import {
  Button,
  Badge,
  Group,
  Text,
  Paper,
  TextInput,
  Stack,
  Card,
  Grid,
  ThemeIcon,
  ActionIcon,
  SegmentedControl,
  Chip,
  Box,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconUserCheck,
  IconUser,
  IconPhone,
  IconId,
  IconEdit,
  IconTrash,
  IconEye,
  IconLayoutGrid,
  IconList,
  IconCheck,
  IconFilter,
  IconCoin,
  IconPercentage,
} from '@tabler/icons-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '@/shared/components/PageHeader';
import { DataTable, Column } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { Employee, EmployeeInput, EMPLOYEE_ROLE_LABELS, EmployeeRole } from '../types';
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  deleteEmployees,
  fetchEmployeeEarnings,
} from '../api/mockEmployees';
import { EmployeeFormModal } from './EmployeeFormModal';
import { EmployeeDetailDrawer } from './EmployeeDetailDrawer';
import { queryKeys } from '@/api/queryKeys';
import { formatMoney } from '@/shared/lib/money';

export function EmployeeList() {
  const queryClient = useQueryClient();

  // Queries
  const { data: employees = [], isLoading } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: fetchEmployees,
  });

  const { data: allEarnings = [] } = useQuery({
    queryKey: ['all-employee-earnings'],
    queryFn: () => fetchEmployeeEarnings(),
  });

  // State
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal / Drawer state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [selectedEmployeeForDrawer, setSelectedEmployeeForDrawer] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (newEmp) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Employee Registered',
        message: `Saved ${newEmp.name} to employee directory`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });
    },
    onError: (err: Error) => {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to create employee',
        color: 'red',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<EmployeeInput> }) =>
      updateEmployee(id, input),
    onSuccess: (updatedEmp) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Employee Updated',
        message: `Updated profile for ${updatedEmp.name}`,
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
      if (selectedEmployeeForDrawer?.id === updatedEmp.id) {
        setSelectedEmployeeForDrawer(updatedEmp);
      }
    },
    onError: (err: Error) => {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to update employee',
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
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
    onError: (err: Error) => {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to delete employee',
        color: 'red',
      });
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deleteEmployees,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all });
      notifications.show({
        title: 'Employees Deleted',
        message: 'Selected employee records removed',
        color: 'blue',
      });
    },
    onError: (err: Error) => {
      notifications.show({
        title: 'Error',
        message: err.message || 'Failed to delete employees',
        color: 'red',
      });
    },
  });

  // Calculate earnings map per employee
  const earningsPerEmployee = useMemo(() => {
    const map = new Map<string, { totalCents: number; jobCount: number }>();
    allEarnings.forEach((e) => {
      const existing = map.get(e.employeeId) || { totalCents: 0, jobCount: 0 };
      map.set(e.employeeId, {
        totalCents: existing.totalCents + e.earnedAmountCents,
        jobCount: existing.jobCount + 1,
      });
    });
    return map;
  }, [allEarnings]);

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        e.name.toLowerCase().includes(query) ||
        e.phone.toLowerCase().includes(query) ||
        (e.nicOrId && e.nicOrId.toLowerCase().includes(query)) ||
        (EMPLOYEE_ROLE_LABELS[e.role] || '').toLowerCase().includes(query);

      const matchesRole = !selectedRole || e.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [employees, search, selectedRole]);

  // Handlers
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

  // Table Columns
  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee Name',
      align: 'left',
      width: '24%',
      render: (emp) => (
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon
            variant="light"
            color="indigo"
            size="sm"
            radius="var(--mantine-radius-default)"
          >
            <IconUser size={14} />
          </ThemeIcon>
          <div>
            <Text size="sm" fw={700} c="indigo">
              {emp.name}
            </Text>
            {emp.nicOrId && (
              <Group gap={4}>
                <IconId size={12} style={{ opacity: 0.5 }} />
                <Text size="xs" c="dimmed">
                  {emp.nicOrId}
                </Text>
              </Group>
            )}
          </div>
        </Group>
      ),
    },
    {
      key: 'role',
      header: 'Job Category',
      align: 'left',
      width: '22%',
      render: (emp) => (
        <Badge color="indigo" variant="light" size="sm">
          {EMPLOYEE_ROLE_LABELS[emp.role] || emp.role}
        </Badge>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      align: 'left',
      width: '18%',
      render: (emp) => (
        <Group gap={4}>
          <IconPhone size={14} style={{ opacity: 0.6 }} />
          <Text size="sm" fw={600}>
            {emp.phone}
          </Text>
        </Group>
      ),
    },
    {
      key: 'defaultSplit',
      header: 'Default Profit Split',
      align: 'left',
      width: '18%',
      render: (emp) => (
        <Group gap={4}>
          {emp.defaultSplitType === 'percentage' ? (
            <Badge color="indigo" variant="outline" size="xs">
              {emp.defaultSplitValue}% Profit
            </Badge>
          ) : (
            <Badge color="teal" variant="outline" size="xs">
              {formatMoney(emp.defaultSplitValue)} Fixed
            </Badge>
          )}
        </Group>
      ),
    },
    {
      key: 'earnings',
      header: 'Total Earned',
      align: 'right',
      width: '18%',
      render: (emp) => {
        const stats = earningsPerEmployee.get(emp.id) || { totalCents: 0, jobCount: 0 };
        return (
          <div>
            <Text size="sm" fw={800} c="indigo">
              {formatMoney(stats.totalCents)}
            </Text>
            <Text size="xs" c="dimmed">
              {stats.jobCount} jobs completed
            </Text>
          </div>
        );
      },
    },
  ];

  // Stats calculation
  const totalEmployeesCount = employees.length;
  const activeStaffCount = employees.filter((e) => e.status === 'active').length;
  const totalCommissionPaidCents = allEarnings.reduce(
    (acc, curr) => acc + curr.earnedAmountCents,
    0
  );

  return (
    <Stack gap="lg">
      <PageHeader
        title="Employees & Commission Splits"
        description="Save staff details, assign work, configure profit splits (percentage or fixed amount), and track earnings"
        action={
          <Button leftSection={<IconPlus size={16} />} color="indigo" onClick={handleOpenAddModal}>
            Register New Employee
          </Button>
        }
      />

      {/* KPI Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="var(--mantine-radius-default)">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Total Staff Members
                </Text>
                <Text fw={800} size="xl">
                  {totalEmployeesCount}
                </Text>
              </div>
              <ThemeIcon
                variant="light"
                color="indigo"
                size="lg"
                radius="var(--mantine-radius-default)"
              >
                <IconUserCheck size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="var(--mantine-radius-default)">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Active Shop Staff
                </Text>
                <Text fw={800} size="xl" c="green">
                  {activeStaffCount} / {totalEmployeesCount}
                </Text>
              </div>
              <ThemeIcon
                variant="light"
                color="green"
                size="lg"
                radius="var(--mantine-radius-default)"
              >
                <IconCheck size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="sm" radius="var(--mantine-radius-default)">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  Total Profit Splits Earned
                </Text>
                <Text fw={800} size="xl" c="indigo">
                  {formatMoney(totalCommissionPaidCents)}
                </Text>
              </div>
              <ThemeIcon
                variant="light"
                color="teal"
                size="lg"
                radius="var(--mantine-radius-default)"
              >
                <IconCoin size={22} />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Filter and Control Bar */}
      <Paper p="sm" withBorder radius="var(--mantine-radius-default)">
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <TextInput
              placeholder="Search employee by name, phone, NIC, or role..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ minWidth: 300, flex: 1 }}
              size="sm"
            />

            <SegmentedControl
              value={viewMode}
              onChange={(val) => setViewMode(val as 'table' | 'grid')}
              data={[
                {
                  label: <CenterLabel icon={<IconList size={16} />} text="Table" />,
                  value: 'table',
                },
                {
                  label: <CenterLabel icon={<IconLayoutGrid size={16} />} text="Cards" />,
                  value: 'grid',
                },
              ]}
              size="sm"
            />
          </Group>

          {/* Role Filter Chips */}
          <Box>
            <Group gap="xs" align="center">
              <Group gap={4}>
                <IconFilter size={14} style={{ opacity: 0.6 }} />
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Filter by Role:
                </Text>
              </Group>

              <Chip
                checked={selectedRole === null}
                onChange={() => setSelectedRole(null)}
                size="xs"
                variant="light"
                color="indigo"
              >
                All Roles ({employees.length})
              </Chip>

              {(['technician', 'printer', 'sales', 'general'] as EmployeeRole[]).map((r) => {
                const count = employees.filter((e) => e.role === r).length;
                return (
                  <Chip
                    key={r}
                    checked={selectedRole === r}
                    onChange={() => setSelectedRole(selectedRole === r ? null : r)}
                    size="xs"
                    variant="light"
                    color="indigo"
                  >
                    {EMPLOYEE_ROLE_LABELS[r]} ({count})
                  </Chip>
                );
              })}
            </Group>
          </Box>
        </Stack>
      </Paper>

      {/* Main Table / Grid View */}
      {viewMode === 'table' ? (
        <DataTable
          data={filteredEmployees}
          columns={columns}
          loading={isLoading}
          keyExtractor={(emp) => emp.id}
          onRowClick={(emp) => setSelectedEmployeeForDrawer(emp)}
          onDeleteSelected={(ids) => deleteBatchMutation.mutate(ids)}
          emptyText={
            search || selectedRole
              ? 'No employees match your search criteria.'
              : 'No employees registered yet. Click "Register New Employee" to get started.'
          }
        />
      ) : (
        <Grid>
          {filteredEmployees.length === 0 ? (
            <Grid.Col span={12}>
              <Paper p="xl" withBorder radius="md">
                <Text ta="center" c="dimmed" size="sm">
                  {isLoading
                    ? 'Loading employees...'
                    : search || selectedRole
                      ? 'No employees match your search criteria.'
                      : 'No employees registered yet.'}
                </Text>
              </Paper>
            </Grid.Col>
          ) : (
            filteredEmployees.map((emp) => {
              const stats = earningsPerEmployee.get(emp.id) || { totalCents: 0, jobCount: 0 };
              return (
                <Grid.Col key={emp.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card
                    className="hover-card"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    padding="md"
                    h="100%"
                    onClick={() => setSelectedEmployeeForDrawer(emp)}
                  >
                    <Stack justify="space-between" h="100%">
                      <Stack gap="xs">
                        <Group justify="space-between" align="flex-start">
                          <Group gap="xs">
                            <ThemeIcon
                              color="indigo"
                              variant="light"
                              size="lg"
                              radius="var(--mantine-radius-default)"
                            >
                              <IconUser size={20} />
                            </ThemeIcon>
                            <div>
                              <Text fw={800} size="md" c="indigo" lineClamp={1}>
                                {emp.name}
                              </Text>
                              <Badge color="indigo" variant="light" size="xs">
                                {EMPLOYEE_ROLE_LABELS[emp.role] || emp.role}
                              </Badge>
                            </div>
                          </Group>
                          <Badge color={emp.status === 'active' ? 'green' : 'gray'} size="xs">
                            {emp.status}
                          </Badge>
                        </Group>

                        <Group gap={4}>
                          <IconPhone size={14} style={{ opacity: 0.6 }} />
                          <Text size="xs" fw={600}>
                            {emp.phone}
                          </Text>
                        </Group>

                        <Paper p="xs" withBorder bg="var(--mantine-color-gray-0)">
                          <Group justify="space-between" align="center">
                            <Text size="xs" c="dimmed">
                              Split Rule:
                            </Text>
                            {emp.defaultSplitType === 'percentage' ? (
                              <Group gap={2}>
                                <IconPercentage size={12} />
                                <Text size="xs" fw={700}>
                                  {emp.defaultSplitValue}% Profit
                                </Text>
                              </Group>
                            ) : (
                              <Group gap={2}>
                                <IconCoin size={12} />
                                <Text size="xs" fw={700}>
                                  {formatMoney(emp.defaultSplitValue)} Fixed
                                </Text>
                              </Group>
                            )}
                          </Group>
                        </Paper>

                        <Group justify="space-between" align="center" mt={4}>
                          <Text size="xs" c="dimmed">
                            Total Earned:
                          </Text>
                          <Text fw={800} size="md" c="indigo">
                            {formatMoney(stats.totalCents)}
                          </Text>
                        </Group>
                      </Stack>

                      <Group
                        justify="flex-end"
                        gap="xs"
                        pt="xs"
                        style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
                      >
                        <Button
                          variant="light"
                          color="indigo"
                          size="xs"
                          leftSection={<IconEye size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmployeeForDrawer(emp);
                          }}
                        >
                          Details & Split History
                        </Button>
                        <Button
                          variant="default"
                          size="xs"
                          leftSection={<IconEdit size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(emp);
                          }}
                        >
                          Edit
                        </Button>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEmployeeToDelete(emp);
                          }}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Group>
                    </Stack>
                  </Card>
                </Grid.Col>
              );
            })
          )}
        </Grid>
      )}

      {/* Form Modal */}
      <EmployeeFormModal
        opened={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        employeeToEdit={employeeToEdit}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Detail Drawer */}
      <EmployeeDetailDrawer
        employee={selectedEmployeeForDrawer}
        opened={selectedEmployeeForDrawer !== null}
        onClose={() => setSelectedEmployeeForDrawer(null)}
        onEdit={(emp) => {
          setSelectedEmployeeForDrawer(null);
          handleOpenEditModal(emp);
        }}
        onDelete={(emp) => {
          setSelectedEmployeeForDrawer(null);
          setEmployeeToDelete(emp);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        opened={employeeToDelete !== null}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        confirmLabel="Delete Record"
        confirmColor="red"
        loading={deleteMutation.isPending}
      >
        Are you sure you want to delete employee <strong>{employeeToDelete?.name}</strong>? This
        action will remove their profile.
      </ConfirmDialog>
    </Stack>
  );
}

function CenterLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <Group gap={6} justify="center" wrap="nowrap">
      {icon}
      <Box component="span" style={{ whiteSpace: 'nowrap' }}>
        {text}
      </Box>
    </Group>
  );
}
