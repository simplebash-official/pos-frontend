import React, { useMemo, useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  ScrollArea,
  Center,
  ThemeIcon,
} from '@mantine/core';
import {
  IconSearch,
  IconPackage,
  IconUser,
  IconHammer,
  IconPrinter,
  IconArrowRight,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SearchHistoryInput } from './SearchHistoryInput';
import { SearchHighlight } from './SearchHighlight';

import { queryKeys } from '@/api/queryKeys';
import { useAllProducts } from '@/features/inventory/hooks/useProducts';
import { useAllCustomers } from '@/features/customers/hooks/useCustomers';
import { fetchRepairs } from '@/features/repairs/api/repairsApi';
import { fetchPrintJobs } from '@/features/print-jobs/api/printJobsApi';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/constants/routes';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';
import { useEntitySearch } from '@/shared/hooks/useEntitySearch';
import type { SearchTerm } from '@/shared/lib/search';
import {
  CUSTOMER_SEARCH_FIELDS,
  PRINT_JOB_SEARCH_FIELDS,
  PRODUCT_SEARCH_FIELDS,
  REPAIR_JOB_SEARCH_FIELDS,
} from '@/shared/lib/searchFields';

/** Most rows the palette ever shows. */
const MAX_RESULTS = 15;
/** Rows every matching category is guaranteed, before anything competes for the rest. */
const GUARANTEED_PER_CATEGORY = 3;

interface QuickSearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Product' | 'Customer' | 'Repair' | 'Print Job';
  icon: React.ElementType;
  color: string;
  route: string;
}

/**
 * Combines the per-category result lists into one list.
 *
 * Every category that matched gets its top few rows before any category takes a
 * second helping. Without that, a query matching plenty of products filled the
 * whole list and the customer or ticket the user was actually looking for never
 * appeared.
 *
 * Rows are not re-sorted across categories: a product's score and a customer's
 * score are computed over different fields and are not comparable, so ordering
 * by them would only look meaningful.
 */
function mergeByCategory(groups: readonly QuickSearchResult[][]): QuickSearchResult[] {
  const merged: QuickSearchResult[] = [];
  const taken = groups.map(() => 0);

  groups.forEach((group, i) => {
    const share = group.slice(0, GUARANTEED_PER_CATEGORY);
    merged.push(...share);
    taken[i] = share.length;
  });

  for (let i = 0; i < groups.length && merged.length < MAX_RESULTS; i += 1) {
    const remaining = MAX_RESULTS - merged.length;
    merged.push(...groups[i].slice(taken[i], taken[i] + remaining));
  }

  return merged.slice(0, MAX_RESULTS);
}

export const GlobalQuickSearchModal = () => {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Ctrl+K (Cmd+K on Mac, handled by the engine treating 'ctrl' as ctrlKey||metaKey)
  useAppShortcuts([
    { key: 'Ctrl+K', ignoreInput: true, handler: () => setOpened((prev) => !prev) },
  ]);

  // Products and customers come from the Dexie mirror, so the palette works
  // offline and refreshes itself when a sync pull or another tab changes a row.
  const { data: products } = useAllProducts({ enabled: opened });
  const { data: customers } = useAllCustomers({ enabled: opened });

  const { data: repairs = [] } = useQuery({
    queryKey: queryKeys.repairs.all,
    queryFn: fetchRepairs,
    enabled: opened,
  });

  const { data: printJobs = [] } = useQuery({
    queryKey: queryKeys.printJobs.all,
    queryFn: fetchPrintJobs,
    enabled: opened,
  });

  const productHits = useEntitySearch(products, PRODUCT_SEARCH_FIELDS, query, MAX_RESULTS);
  const customerHits = useEntitySearch(customers, CUSTOMER_SEARCH_FIELDS, query, MAX_RESULTS);
  const repairHits = useEntitySearch(repairs, REPAIR_JOB_SEARCH_FIELDS, query, MAX_RESULTS);
  const printJobHits = useEntitySearch(printJobs, PRINT_JOB_SEARCH_FIELDS, query, MAX_RESULTS);

  // Every list is searched with the same query, so any one of them carries the
  // terms the highlighter needs.
  const terms: readonly SearchTerm[] = productHits.terms;

  const results = useMemo(() => {
    if (terms.length === 0) return [];

    const productRows: QuickSearchResult[] = productHits.results.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: `${p.sku} · ${formatMoney(p.sellingPriceCents)} · Stock: ${p.stockQuantity}`,
      category: 'Product',
      icon: IconPackage,
      color: 'blue',
      route: ROUTES.INVENTORY,
    }));

    const customerRows: QuickSearchResult[] = customerHits.results.map((c) => ({
      id: c.id,
      title: c.name,
      subtitle: `${c.primaryPhone}${c.email ? ` · ${c.email}` : ''}`,
      category: 'Customer',
      icon: IconUser,
      color: 'grape',
      route: ROUTES.CUSTOMERS,
    }));

    const repairRows: QuickSearchResult[] = repairHits.results.map((r) => ({
      id: r.id,
      title: `${r.ticketNumber}: ${r.deviceModel}`,
      subtitle: `${r.customerName} · ${formatMoney(r.estimatedCostCents)}`,
      category: 'Repair',
      icon: IconHammer,
      color: 'orange',
      route: ROUTES.REPAIRS,
    }));

    const printJobRows: QuickSearchResult[] = printJobHits.results.map((p) => ({
      id: p.id,
      title: `${p.ticketNumber}: ${p.jobType.toUpperCase()} (${p.quantity} units)`,
      subtitle: `${p.customerName} · ${formatMoney(p.estimatedCostCents)}`,
      category: 'Print Job',
      icon: IconPrinter,
      color: 'teal',
      route: ROUTES.PRINT_JOBS,
    }));

    return mergeByCategory([productRows, customerRows, repairRows, printJobRows]);
  }, [terms, productHits.results, customerHits.results, repairHits.results, printJobHits.results]);

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={
        <Text fw={700} size="lg">
          Quick Search Palette
        </Text>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        <SearchHistoryInput
          namespace="global"
          placeholder="Search products, customers, repairs, or tickets..."
          leftSection={<IconSearch size={18} />}
          value={query}
          onValueChange={setQuery}
          autoFocus
          size="md"
        />

        <ScrollArea.Autosize mah={400}>
          <Stack gap="xs">
            {!query.trim() ? (
              <Center py="xl">
                <Text size="sm" c="dimmed">
                  Type to search across Products, Customers, Repairs, and Print Jobs...
                </Text>
              </Center>
            ) : results.length === 0 ? (
              <Center py="xl">
                <Text size="sm" c="dimmed">
                  No matching results found.
                </Text>
              </Center>
            ) : (
              results.map((res) => {
                const Icon = res.icon;
                return (
                  <Paper
                    key={`${res.category}-${res.id}`}
                    p="xs"
                    withBorder
                    radius="var(--mantine-radius-default)"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      navigate(res.route);
                      setOpened(false);
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap">
                      <Group gap="sm" wrap="nowrap">
                        <ThemeIcon color={res.color} variant="light" size="md">
                          <Icon size={18} />
                        </ThemeIcon>
                        <div>
                          <Group gap="xs">
                            <Text size="sm" fw={700}>
                              <SearchHighlight text={res.title} terms={terms} />
                            </Text>
                            <Badge size="xs" color={res.color} variant="light">
                              {res.category}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed">
                            <SearchHighlight text={res.subtitle} terms={terms} />
                          </Text>
                        </div>
                      </Group>
                      <IconArrowRight size={16} style={{ opacity: 0.5 }} />
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
