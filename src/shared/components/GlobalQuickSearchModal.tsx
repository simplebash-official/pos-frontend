import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  TextInput,
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  ScrollArea,
  Kbd,
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

import { db } from '@/offline/db/schema';
import { fetchRepairs } from '@/features/repairs/api/mockRepairs';
import { fetchPrintJobs } from '@/features/print-jobs/api/mockPrintJobs';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/constants/routes';
import { Product } from '@/features/inventory/types';
import { Customer } from '@/features/customers/types';
import { RepairJob } from '@/features/repairs/types';
import { PrintJob } from '@/features/print-jobs/types';
import { useAppShortcuts } from '@/shared/hooks/useShortcuts';

export const GlobalQuickSearchModal = () => {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [repairs, setRepairs] = useState<RepairJob[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);

  // Ctrl+K (Cmd+K on Mac, handled by the engine treating 'ctrl' as ctrlKey||metaKey)
  useAppShortcuts([
    { key: 'Ctrl+K', ignoreInput: true, handler: () => setOpened((prev) => !prev) },
  ]);

  // Fetch data when modal opens
  useEffect(() => {
    if (opened) {
      db.products.where('_isDeleted').equals(0).toArray().then(setProducts);
      db.customers.where('_isDeleted').equals(0).toArray().then(setCustomers);
      fetchRepairs().then(setRepairs);
      fetchPrintJobs().then(setPrintJobs);
    }
  }, [opened]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      category: 'Product' | 'Customer' | 'Repair' | 'Print Job';
      icon: React.ElementType;
      color: string;
      route: string;
    }> = [];

    // Products
    products.forEach((p) => {
      if (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q)
      ) {
        items.push({
          id: p.id,
          title: p.name,
          subtitle: `${p.sku} · ${formatMoney(p.sellingPriceCents)} · Stock: ${p.stockQuantity}`,
          category: 'Product',
          icon: IconPackage,
          color: 'blue',
          route: ROUTES.INVENTORY,
        });
      }
    });

    // Customers
    customers.forEach((c) => {
      if (
        c.name.toLowerCase().includes(q) ||
        c.primaryPhone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      ) {
        items.push({
          id: c.id,
          title: c.name,
          subtitle: `${c.primaryPhone}${c.email ? ` · ${c.email}` : ''}`,
          category: 'Customer',
          icon: IconUser,
          color: 'grape',
          route: ROUTES.CUSTOMERS,
        });
      }
    });

    // Repairs
    repairs.forEach((r) => {
      if (
        r.ticketNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.deviceModel.toLowerCase().includes(q)
      ) {
        items.push({
          id: r.id,
          title: `${r.ticketNumber}: ${r.deviceModel}`,
          subtitle: `${r.customerName} · ${formatMoney(r.estimatedCostCents)}`,
          category: 'Repair',
          icon: IconHammer,
          color: 'orange',
          route: ROUTES.REPAIRS,
        });
      }
    });

    // Print Jobs
    printJobs.forEach((pr) => {
      if (
        pr.ticketNumber.toLowerCase().includes(q) ||
        pr.customerName.toLowerCase().includes(q) ||
        pr.jobType.toLowerCase().includes(q)
      ) {
        items.push({
          id: pr.id,
          title: `${pr.ticketNumber}: ${pr.jobType.toUpperCase()} (${pr.quantity} units)`,
          subtitle: `${pr.customerName} · ${formatMoney(pr.estimatedCostCents)}`,
          category: 'Print Job',
          icon: IconPrinter,
          color: 'teal',
          route: ROUTES.PRINT_JOBS,
        });
      }
    });

    return items.slice(0, 15);
  }, [query, products, customers, repairs, printJobs]);

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={
        <Group gap="xs">
          <Text fw={700}>Quick Search Palette</Text>
          <Kbd size="xs">Cmd + K</Kbd>
        </Group>
      }
      size="lg"
      radius="var(--mantine-radius-default)"
      centered
    >
      <Stack gap="md">
        <TextInput
          placeholder="Search products, customers, repairs, or tickets..."
          leftSection={<IconSearch size={18} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
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
                              {res.title}
                            </Text>
                            <Badge size="xs" color={res.color} variant="light">
                              {res.category}
                            </Badge>
                          </Group>
                          <Text size="xs" c="dimmed">
                            {res.subtitle}
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
