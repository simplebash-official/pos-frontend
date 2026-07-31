import { useState, useMemo } from 'react';
import {
  Modal,
  TextInput,
  SegmentedControl,
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Button,
  ScrollArea,
  Box,
} from '@mantine/core';
import { IconSearch, IconTools, IconPrinter, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { fetchRepairs } from '@/features/repairs/api/mockRepairs';
import { fetchPrintJobs } from '@/features/print-jobs/api/mockPrintJobs';
import { formatMoney } from '@/shared/lib/money';
import { useCart } from '../hooks/useCart';
import { playScanSuccessSound } from '../lib/audio';

export interface ServiceJobPickerModalProps {
  opened: boolean;
  onClose: () => void;
}

export interface CombinedServiceJob {
  id: string;
  ticketNumber: string;
  type: 'repair' | 'print';
  title: string;
  description: string;
  customerName: string;
  customerPhone?: string;
  status: string;
  costCents: number;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
}

function generateServiceJobId(type: string, id: string): string {
  return `svc-${type}-${id}-${Math.random().toString(36).substring(2, 9)}`;
}

export function ServiceJobPickerModal({ opened, onClose }: ServiceJobPickerModalProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'repair' | 'print'>('all');

  const { add, attachCustomer, soundEnabled, customerId: currentCustomerId } = useCart();

  const { data: repairs = [] } = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: fetchRepairs,
  });

  const { data: printJobs = [] } = useQuery({
    queryKey: queryKeys.printJobs.all,
    queryFn: fetchPrintJobs,
  });

  const combinedJobs = useMemo<CombinedServiceJob[]>(() => {
    const list: CombinedServiceJob[] = [];

    for (const r of repairs) {
      if (r.status === 'delivered' || r.status === 'cancelled') continue;
      list.push({
        id: r.id,
        ticketNumber: r.ticketNumber,
        type: 'repair',
        title: `${r.deviceModel} Repair`,
        description: r.issueDescription,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        status: r.status,
        costCents: r.estimatedCostCents,
        assignedEmployeeId: r.assignedEmployeeId,
        assignedEmployeeName: r.assignedEmployeeName,
      });
    }

    for (const p of printJobs) {
      if (p.status === 'delivered' || p.status === 'cancelled') continue;
      list.push({
        id: p.id,
        ticketNumber: p.ticketNumber,
        type: 'print',
        title: `${p.jobType.toUpperCase()} Printing (${p.quantity} units)`,
        description: `Customer: ${p.customerName}`,
        customerName: p.customerName,
        customerPhone: p.customerPhone,
        status: p.status,
        costCents: p.estimatedCostCents,
        assignedEmployeeId: p.assignedEmployeeId,
        assignedEmployeeName: p.assignedEmployeeName,
      });
    }

    return list;
  }, [repairs, printJobs]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return combinedJobs.filter((job) => {
      const matchesType = filterType === 'all' || job.type === filterType;
      const matchesSearch =
        !q ||
        job.ticketNumber.toLowerCase().includes(q) ||
        job.customerName.toLowerCase().includes(q) ||
        (job.customerPhone && job.customerPhone.includes(q)) ||
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [combinedJobs, filterType, search]);

  const handleSelectJob = (job: CombinedServiceJob) => {
    const uniqueId = generateServiceJobId(job.type, job.id);
    add({
      id: uniqueId,
      productId: job.id,
      name: `${job.ticketNumber}: ${job.title}`,
      sku: job.ticketNumber,
      unitPriceCents: job.costCents,
      quantity: 1,
      discountCents: 0,
      sourceType: job.type,
      sourceTicketNumber: job.ticketNumber,
      assignedEmployeeId: job.assignedEmployeeId,
      assignedEmployeeName: job.assignedEmployeeName,
    });

    // Auto-attach customer if not already attached
    if (job.customerName && (!currentCustomerId || currentCustomerId === '')) {
      attachCustomer(
        `cust-${job.customerPhone || job.customerName}`,
        job.customerName,
        job.customerPhone
      );
    }

    playScanSuccessSound(soundEnabled);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconTools size={20} color="var(--mantine-color-orange-6)" />
          <Text fw={700} size="md">
            Select Service Job (Repairs & Print Jobs - F4)
          </Text>
        </Group>
      }
      size="lg"
      radius="var(--mantine-radius-default)"
    >
      <Stack gap="sm">
        <Group justify="space-between">
          <TextInput
            placeholder="Search ticket # (e.g. REP-1001), customer name or phone..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: 1 }}
            autoFocus
          />
          <SegmentedControl
            size="xs"
            value={filterType}
            onChange={(val) => setFilterType(val as 'all' | 'repair' | 'print')}
            data={[
              { label: 'All Jobs', value: 'all' },
              { label: 'Repairs', value: 'repair' },
              { label: 'Print Jobs', value: 'print' },
            ]}
          />
        </Group>

        <ScrollArea.Autosize mah={400} offsetScrollbars>
          {filteredJobs.length === 0 ? (
            <Box ta="center" py="xl">
              <Text c="dimmed" size="sm">
                No active ready/in-repair service jobs found.
              </Text>
            </Box>
          ) : (
            <Stack gap="xs">
              {filteredJobs.map((job) => {
                const isRepair = job.type === 'repair';
                return (
                  <Paper
                    key={`${job.type}-${job.id}`}
                    p="sm"
                    withBorder
                    style={{
                      borderLeft: `4px solid ${
                        isRepair ? 'var(--mantine-color-orange-6)' : 'var(--mantine-color-teal-6)'
                      }`,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelectJob(job)}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Stack gap={2} style={{ flex: 1 }}>
                        <Group gap="xs" align="center">
                          <Text fw={700} size="sm">
                            {job.ticketNumber}
                          </Text>
                          <Badge
                            size="xs"
                            color={isRepair ? 'orange' : 'teal'}
                            variant="light"
                            leftSection={
                              isRepair ? <IconTools size={10} /> : <IconPrinter size={10} />
                            }
                          >
                            {isRepair ? 'Repair' : 'Print Job'}
                          </Badge>
                          <Badge size="xs" color={job.status === 'ready' ? 'green' : 'blue'}>
                            {job.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </Group>

                        <Text size="sm" fw={600}>
                          {job.title}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {job.description}
                        </Text>

                        <Group gap="md" mt={4}>
                          <Text size="xs" c="dimmed">
                            Customer: <b>{job.customerName}</b> ({job.customerPhone || 'N/A'})
                          </Text>
                          {job.assignedEmployeeName && (
                            <Text size="xs" c="dimmed">
                              Tech: <b>{job.assignedEmployeeName}</b>
                            </Text>
                          )}
                        </Group>
                      </Stack>

                      <Group gap="sm" align="center">
                        <Text size="md" fw={800} c={isRepair ? 'orange.7' : 'teal.7'}>
                          {formatMoney(job.costCents)}
                        </Text>
                        <Button
                          size="xs"
                          color={isRepair ? 'orange' : 'teal'}
                          leftSection={<IconPlus size={14} />}
                        >
                          Bill Ticket
                        </Button>
                      </Group>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
}
