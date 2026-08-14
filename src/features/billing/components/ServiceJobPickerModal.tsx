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
} from '@mantine/core';
import { IconSearch, IconPlus } from '@tabler/icons-react';
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

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          Select service job
        </Text>
      }
      size="lg"
      centered
      fullScreen={isMobile}
      padding={0}
    >
      {/* Search & Filter Bar Section with Top & Bottom Border Dividers */}
      <Box
        px={isMobile ? 'sm' : 'lg'}
        py="md"
        style={{
          borderTop: '1px solid var(--mantine-color-default-border)',
          borderBottom: '1px solid var(--mantine-color-default-border)',
        }}
      >
        <Group justify="space-between" align="center" gap="md" wrap={isMobile ? 'wrap' : 'nowrap'}>
          <SearchHistoryInput
            namespace="service_jobs"
            placeholder="Search ticket #, customer name"
            leftSection={<IconSearch size={16} />}
            value={search}
            onValueChange={setSearch}
            wrapperStyle={{ flex: 1, minWidth: isMobile ? '100%' : undefined }}
            /* Autofocusing here opens the soft keyboard over the job list it is meant to filter. */
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
      </Box>

      {/* Jobs List */}
      <Box p={isMobile ? 'sm' : 'lg'}>
        <ScrollArea.Autosize
          mah={isMobile ? '60vh' : 440}
          offsetScrollbars
          classNames={{ viewport: 'scrollarea-fluid-content' }}
        >
          {isLoading ? (
            <Stack gap="sm">
              {Array.from({ length: 4 }, (_, i) => (
                <Paper key={`job-skel-${i}`} p="md" withBorder>
                  <Group justify="space-between" align="center">
                    <Group gap="md" align="center" style={{ flex: 1 }}>
                      <Skeleton height={44} width={44} />
                      <Stack gap={4} style={{ flex: 1 }}>
                        <Skeleton height={14} width={100} />
                        <Skeleton height={16} width="70%" />
                      </Stack>
                    </Group>
                    <Skeleton height={24} width={80} />
                  </Group>
                </Paper>
              ))}
            </Stack>
          ) : filteredJobs.length === 0 ? (
            <Box ta="center" py="xl">
              <Text c="dimmed" size="sm">
                No active ready/in-repair service jobs found.
              </Text>
            </Box>
          ) : (
            <Stack gap="sm">
              {filteredJobs.map((job) => {
                const iconInfo = getCategoryIconInfo({ sourceType: job.type });
                const CatIcon = iconInfo.Icon;
                const isRepair = job.type === 'repair';
                const catColor = isRepair ? 'orange' : 'green';

                const metaText = [job.description, job.customerName, job.customerPhone]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <Paper
                    key={`${job.type}-${job.id}`}
                    p="md"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onClick={() => handleSelectJob(job)}
                  >
                    {/* On a phone the icon, details and the price/action column cannot share one
                        row without pushing the action off the edge — stack them instead. */}
                    <Group
                      justify="space-between"
                      align={isMobile ? 'stretch' : 'center'}
                      wrap={isMobile ? 'wrap' : 'nowrap'}
                    >
                      {/* Left: Category Icon & Job Info */}
                      <Group
                        gap="md"
                        align="center"
                        style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined }}
                        wrap="nowrap"
                      >
                        <ThemeIcon
                          size={isMobile ? 40 : 48}
                          color={catColor}
                          variant="light"
                          style={{ minWidth: isMobile ? 40 : 48, flexShrink: 0 }}
                        >
                          <CatIcon size={isMobile ? 20 : 24} />
                        </ThemeIcon>

                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <Group gap="xs" align="center">
                            <Text
                              size="xs"
                              fw={700}
                              c="dimmed"
                              style={{ fontFamily: 'monospace', letterSpacing: '0.3px' }}
                            >
                              <SearchHighlight text={job.ticketNumber} terms={searchTerms} />
                            </Text>
                            <Badge
                              size="xs"
                              radius="xl"
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

                          <Text fw={700} size="sm" lineClamp={1}>
                            <SearchHighlight text={job.title} terms={searchTerms} />
                          </Text>

                          {metaText && (
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {metaText}
                            </Text>
                          )}

                          {job.assignedEmployeeName && (
                            <Text size="xs" c="dimmed">
                              Tech: {job.assignedEmployeeName}
                            </Text>
                          )}
                        </Stack>
                      </Group>

                      {/* Right: Cost & Bill Ticket Button */}
                      {isMobile ? (
                        <Group
                          justify="space-between"
                          align="center"
                          mt="xs"
                          style={{ width: '100%' }}
                        >
                          <Text fw={700} size="md" style={{ fontFamily: 'monospace, sans-serif' }}>
                            {formatMoney(job.costCents)}
                          </Text>
                          <Button
                            size="sm"
                            color={isRepair ? 'orange' : 'green'}
                            leftSection={<IconPlus size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectJob(job);
                            }}
                            fw={600}
                          >
                            Bill ticket
                          </Button>
                        </Group>
                      ) : (
                        <Stack gap={6} align="flex-end" style={{ flexShrink: 0, paddingLeft: 12 }}>
                          <Text fw={700} size="md" style={{ fontFamily: 'monospace, sans-serif' }}>
                            {formatMoney(job.costCents)}
                          </Text>
                          <Button
                            size="xs"
                            color={isRepair ? 'orange' : 'green'}
                            leftSection={<IconPlus size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectJob(job);
                            }}
                            fw={600}
                          >
                            Bill ticket
                          </Button>
                        </Stack>
                      )}
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </ScrollArea.Autosize>
      </Box>
    </Modal>
  );
};
