import { useState, useMemo } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Button,
  ScrollArea,
  Box,
  ThemeIcon,
  Skeleton,
  ActionIcon,
  Center,
} from '@mantine/core';
import { IconSearch, IconPlus, IconX, IconTool } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { SegmentedToggle } from '@/shared/components/SegmentedToggle';
import { SearchHistoryInput } from '@/shared/components/SearchHistoryInput';
import { fetchRepairs } from '@/features/repairs/api/mockRepairs';
import { fetchPrintJobs } from '@/features/print-jobs/api/mockPrintJobs';
import { formatMoney } from '@/shared/lib/money';
import { useCart } from '../hooks/useCart';
import { playScanSuccessSound } from '../lib/audio';
import { getCategoryIconInfo } from '../lib/categoryIcons';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { SearchHighlight } from '@/shared/components/SearchHighlight';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import type { SearchField } from '@/shared/lib/search';

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

/**
 * Repairs and print jobs are merged into one shape here, so this config lives
 * with the component rather than in the shared `searchFields.ts`.
 */
const SERVICE_JOB_SEARCH_FIELDS: readonly SearchField<CombinedServiceJob>[] = [
  { get: (j) => j.ticketNumber, weight: 3, kind: 'text' },
  { get: (j) => j.customerName, weight: 3, kind: 'text' },
  { get: (j) => j.customerPhone, weight: 2, kind: 'digits' },
  { get: (j) => j.title, weight: 2, kind: 'text' },
  { get: (j) => j.description, weight: 1, kind: 'text' },
];

const generateServiceJobId = (type: string, id: string): string => {
  return `svc-${type}-${id}-${Math.random().toString(36).substring(2, 9)}`;
};

export const ServiceJobPickerModal = ({ opened, onClose }: ServiceJobPickerModalProps) => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'repair' | 'print'>('all');

  const { add, attachCustomer, soundEnabled, customerId: currentCustomerId } = useCart();

  const { data: repairs = [], isLoading: loadingRepairs } = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: fetchRepairs,
    enabled: opened,
  });

  const { data: printJobs = [], isLoading: loadingPrintJobs } = useQuery({
    queryKey: queryKeys.printJobs.all,
    queryFn: fetchPrintJobs,
    enabled: opened,
  });

  const isLoading = loadingRepairs || loadingPrintJobs;

  const combinedJobs = useMemo<CombinedServiceJob[]>(() => {
    const list: CombinedServiceJob[] = [];

    for (const r of repairs) {
      if (r.status === 'delivered' || r.status === 'cancelled') continue;
      list.push({
        id: r.id,
        ticketNumber: r.ticketNumber,
        type: 'repair',
        title: `${r.deviceModel} repair`,
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
        title: `${p.jobType.charAt(0).toUpperCase() + p.jobType.slice(1)} printing (${p.quantity} units)`,
        description: '',
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

  const typeFilteredJobs = useMemo(() => {
    if (filterType === 'all') return combinedJobs;
    return combinedJobs.filter((job) => job.type === filterType);
  }, [combinedJobs, filterType]);

  const { results: filteredJobs, terms: searchTerms } = useEntitySearch(
    typeFilteredJobs,
    SERVICE_JOB_SEARCH_FIELDS,
    search,
    null
  );

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

  const handleClose = () => {
    setSearch('');
    setFilterType('all');
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={700} size="lg">
          Select Service Job
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
      padding="lg"
    >
      <Stack gap="md">
        {/* Search & Filter Bar */}
        <Group gap="sm" wrap={isMobile ? 'wrap' : 'nowrap'}>
          <SearchHistoryInput
            namespace="service_jobs"
            placeholder="Search ticket #, customer name, device…"
            leftSection={<IconSearch size={16} />}
            rightSection={
              search ? (
                <ActionIcon variant="subtle" size="sm" onClick={() => setSearch('')}>
                  <IconX size={14} />
                </ActionIcon>
              ) : (
                <Badge size="xs" variant="light" color="blue">
                  {filteredJobs.length}
                </Badge>
              )
            }
            value={search}
            onValueChange={setSearch}
            wrapperStyle={{ flex: 1, minWidth: isMobile ? '100%' : undefined }}
            autoFocus={!isMobile}
          />
          <SegmentedToggle
            size="sm"
            fullWidth={isMobile}
            value={filterType}
            onChange={(val) => setFilterType(val as 'all' | 'repair' | 'print')}
            data={[
              { label: 'All jobs', value: 'all' },
              { label: 'Repairs', value: 'repair' },
              { label: 'Print jobs', value: 'print' },
            ]}
          />
        </Group>

        {/* Jobs List */}
        <ScrollArea.Autosize
          mah={isMobile ? '60dvh' : 440}
          offsetScrollbars
          classNames={{ viewport: 'scrollarea-fluid-content' }}
        >
          <Stack gap="xs" pt={4} pb={4} px={2}>
            {isLoading ? (
              Array.from({ length: 4 }, (_, i) => (
                <Paper
                  key={`job-skel-${i}`}
                  p="md"
                  radius="var(--mantine-radius-default)"
                  withBorder
                >
                  <Group justify="space-between" align="center">
                    <Group gap="md">
                      <Skeleton height={36} width={36} />
                      <div>
                        <Skeleton height={16} width={140} mb={4} />
                        <Skeleton height={12} width={90} />
                      </div>
                    </Group>
                    <Skeleton height={20} width={60} />
                  </Group>
                </Paper>
              ))
            ) : filteredJobs.length === 0 ? (
              <Paper
                p="xl"
                withBorder
                radius="var(--mantine-radius-default)"
                bg="var(--mantine-color-body)"
              >
                <Center>
                  <Stack gap="xs" align="center">
                    <IconTool size={32} style={{ opacity: 0.3 }} />
                    <Text c="dimmed" size="sm" ta="center">
                      No active service jobs found matching your search.
                    </Text>
                  </Stack>
                </Center>
              </Paper>
            ) : (
              filteredJobs.map((job) => {
                const iconInfo = getCategoryIconInfo({ sourceType: job.type });
                const CatIcon = iconInfo.Icon;
                const isRepair = job.type === 'repair';
                const catColor = isRepair ? 'orange' : 'teal';

                const metaText = [job.description, job.customerName, job.customerPhone]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <Paper
                    key={`${job.type}-${job.id}`}
                    p="md"
                    radius="var(--mantine-radius-default)"
                    className="picker-card"
                    onClick={() => handleSelectJob(job)}
                  >
                    <Group
                      justify="space-between"
                      align="center"
                      wrap={isMobile ? 'wrap' : 'nowrap'}
                      gap="md"
                    >
                      {/* Left Icon & Info */}
                      <Group
                        gap="md"
                        wrap="nowrap"
                        style={{ minWidth: 0, flex: 1 }}
                        align="flex-start"
                      >
                        <ThemeIcon
                          color={catColor}
                          variant="light"
                          size="xl"
                          radius="var(--mantine-radius-default)"
                          style={{ flexShrink: 0, marginTop: 2 }}
                        >
                          <CatIcon size={22} />
                        </ThemeIcon>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Group gap={6} align="center" wrap="wrap">
                            <Badge
                              size="xs"
                              variant="filled"
                              color="blue"
                              radius="var(--mantine-radius-default)"
                            >
                              <SearchHighlight text={job.ticketNumber} terms={searchTerms} />
                            </Badge>
                            <Badge
                              size="xs"
                              radius="var(--mantine-radius-default)"
                              variant="light"
                              color={job.status === 'ready' ? 'green' : 'blue'}
                              fw={600}
                              tt="capitalize"
                            >
                              {job.status === 'in_repair'
                                ? 'In repair'
                                : job.status.replace('_', ' ')}
                            </Badge>
                          </Group>

                          <Text size="sm" fw={700} lineClamp={1} mt={4}>
                            <SearchHighlight text={job.title} terms={searchTerms} />
                          </Text>

                          {metaText && (
                            <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                              {metaText}
                            </Text>
                          )}

                          {job.assignedEmployeeName && (
                            <Text size="xs" c="dimmed" mt={2}>
                              Tech: {job.assignedEmployeeName}
                            </Text>
                          )}
                        </div>
                      </Group>

                      {/* Right: Cost & Bill Action */}
                      <Group gap="md" wrap="nowrap" style={{ flexShrink: 0 }} align="center">
                        <Box style={{ textAlign: isMobile ? 'left' : 'right' }}>
                          <Text size="10px" c="dimmed" tt="uppercase" fw={700}>
                            Estimated Total
                          </Text>
                          <Text size="sm" fw={800} c="blue" style={{ fontFamily: 'monospace' }}>
                            {formatMoney(job.costCents)}
                          </Text>
                        </Box>

                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          leftSection={<IconPlus size={14} />}
                          radius="var(--mantine-radius-default)"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectJob(job);
                          }}
                        >
                          Bill ticket
                        </Button>
                      </Group>
                    </Group>
                  </Paper>
                );
              })
            )}
          </Stack>
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};
