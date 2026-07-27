import { PageHeader } from '@/shared/components/PageHeader';
import { SimpleGrid, Paper, Title, Text, Group, ThemeIcon } from '@mantine/core';
import { IconReceipt, IconHammer, IconPrinter, IconScale } from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';

export function ReportsDashboard() {
  const stats = [
    { title: 'Total Sales Today', valueCents: 12500000, icon: IconReceipt, color: 'blue' },
    { title: 'Repair Services Revenue', valueCents: 4500000, icon: IconHammer, color: 'orange' },
    { title: 'Print Jobs Revenue', valueCents: 3750000, icon: IconPrinter, color: 'teal' },
    { title: 'Estimated Net Profit', valueCents: 4250000, icon: IconScale, color: 'green' },
  ];

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Unified financial intelligence across billing, repairs, print jobs, and inventory cost"
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Paper key={stat.title} p="md" withBorder>
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  {stat.title}
                </Text>
                <ThemeIcon color={stat.color} variant="light" size="md" radius="md">
                  <Icon size={18} />
                </ThemeIcon>
              </Group>

              <Group align="flex-end" gap="xs" mt={15}>
                <Title order={3}>{formatMoney(stat.valueCents)}</Title>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>
    </div>
  );
}
