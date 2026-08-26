import { Paper, Group, Text, ThemeIcon, SimpleGrid, Stack, Badge } from '@mantine/core';
import {
  IconCash,
  IconHammer,
  IconDeviceMobileCheck,
  IconCoin,
  IconArrowUpRight,
} from '@tabler/icons-react';
import { formatMoney } from '@/shared/lib/money';
import { DashboardPulseKpis } from '../types';

export interface DashboardKpiStripProps {
  kpis: DashboardPulseKpis;
  loading?: boolean;
}

export const DashboardKpiStrip = ({ kpis }: DashboardKpiStripProps) => {
  const cards = [
    {
      key: 'sales',
      label: "Today's Gross Sales",
      value: formatMoney(kpis.todaySalesCents),
      subtext: `${kpis.todayInvoicesCount} invoices · Avg ${formatMoney(kpis.avgBasketCents)}`,
      icon: IconCash,
      iconColor: 'blue',
      badge: 'Live',
      badgeColor: 'blue',
    },
    {
      key: 'repairs',
      label: 'Active Phone Repairs',
      value: `${kpis.activeRepairsCount} in shop`,
      subtext: 'Repair workshop currently processing',
      icon: IconHammer,
      iconColor: 'orange',
      badge: `${kpis.activeRepairsCount} Jobs`,
      badgeColor: 'orange',
    },
    {
      key: 'ready',
      label: 'Ready for Pickup',
      value: `${kpis.readyRepairsCount} devices ready`,
      subtext: `${formatMoney(kpis.uncollectedReadyValueCents)} uncollected value`,
      icon: IconDeviceMobileCheck,
      iconColor: 'teal',
      badge: 'Ready',
      badgeColor: 'teal',
    },
    {
      key: 'cash',
      label: 'Cash in Register Till',
      value: formatMoney(kpis.cashDrawerBalanceCents),
      subtext: `Float: ${formatMoney(kpis.openingFloatCents)} + Cash: ${formatMoney(kpis.cashSalesCents)}`,
      icon: IconCoin,
      iconColor: 'green',
      badge: 'Balanced',
      badgeColor: 'green',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Paper
            key={card.key}
            p="md"
            withBorder
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  tt="uppercase"
                  style={{ letterSpacing: '0.05em' }}
                >
                  {card.label}
                </Text>
                <Badge size="xs" variant="light" color={card.badgeColor}>
                  {card.badge}
                </Badge>
              </Group>

              <Group justify="space-between" align="center" mt={2}>
                <div>
                  <Text
                    size="xl"
                    fw={800}
                    style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}
                  >
                    {card.value}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    {card.subtext}
                  </Text>
                </div>

                <ThemeIcon color={card.iconColor} variant="light" size={42} radius="md">
                  <Icon size={22} stroke={1.5} />
                </ThemeIcon>
              </Group>

              <Group gap={4} mt={4} align="center">
                <IconArrowUpRight size={14} color="var(--mantine-color-dimmed)" />
                <Text size="3xs" c="dimmed" fw={600}>
                  Updated live from store register
                </Text>
              </Group>
            </Stack>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
};
