import { t } from '@/shared/i18n/t';
import { Paper, Stack, Group, Text, Badge, ThemeIcon, Button, Box } from '@mantine/core';
import { IconFlame, IconAlertTriangle, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { FastMovingItem } from '../types';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/constants/routes';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export interface FastMoversWidgetProps {
  items: FastMovingItem[];
}

export const FastMoversWidget = ({ items }: FastMoversWidgetProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <Paper
      p={isMobile ? 'md' : 'lg'}
      withBorder
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon color="orange" variant="light" size="lg" radius="md">
              <IconFlame size={20} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="md">
                {t('Fast-Moving Products Today')}
              </Text>
              <Text size="xs" c="dimmed">
                {t('Top selling accessories and supplies today with remaining shelf stock')}
              </Text>
            </div>
          </Group>

          <Button
            size="xs"
            variant="subtle"
            color="blue"
            rightSection={<IconArrowRight size={14} />}
            onClick={() => navigate(ROUTES.INVENTORY)}
          >
            {t('Inventory')}
          </Button>
        </Group>

        {/* Product rows */}
        {items.length === 0 ? (
          <Paper p="lg" withBorder bg="var(--mantine-color-body)" radius="md">
            <Stack align="center" gap="xs">
              <ThemeIcon color="gray" variant="light" size={40} radius="xl">
                <IconFlame size={22} />
              </ThemeIcon>
              <Text fw={700} size="sm">
                {t('No Retail Products Sold Today')}
              </Text>
              <Text size="xs" c="dimmed" ta="center">
                {t(
                  'Fast-moving products and accessories sold at the counter today will appear here.'
                )}
              </Text>
            </Stack>
          </Paper>
        ) : (
          <Stack gap="xs">
            {items.map((item, index) => {
              const isLowStock = item.remainingStock <= item.minThreshold;

              return (
                <Paper
                  key={item.productId}
                  p="sm"
                  withBorder
                  radius="md"
                  bg="var(--mantine-color-body)"
                  className="dashboard-interactive-card"
                  style={{
                    borderColor: isLowStock ? 'var(--mantine-color-red-4)' : 'var(--border)',
                  }}
                >
                  <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                    <Group gap="sm" style={{ flex: 1, minWidth: 200 }}>
                      <ThemeIcon color="gray" variant="light" size="md" radius="xl">
                        <Text size="xs" fw={800}>
                          #{index + 1}
                        </Text>
                      </ThemeIcon>

                      <Box style={{ flex: 1 }}>
                        <Text fw={700} size="sm" lineClamp={1}>
                          {item.name}
                        </Text>
                        <Group gap="xs" mt={2}>
                          <Text size="3xs" c="dimmed">
                            {item.category}
                          </Text>
                          <Text size="3xs" c="dimmed">
                            •
                          </Text>
                          <Text size="3xs" fw={700} c="dimmed">
                            {formatMoney(item.sellingPriceCents)}
                          </Text>
                        </Group>
                      </Box>
                    </Group>

                    <Group gap="md">
                      <div>
                        <Text size="3xs" c="dimmed" fw={700} tt="uppercase" ta="right">
                          {t('Sold Today')}
                        </Text>
                        <Text
                          size="sm"
                          fw={800}
                          ta="right"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {item.soldTodayUnits} {t('units')}
                        </Text>
                      </div>

                      <Box style={{ minWidth: 90, textAlign: 'right' }}>
                        <Text size="3xs" c="dimmed" fw={700} tt="uppercase">
                          {t('Shelf Stock')}
                        </Text>
                        {isLowStock ? (
                          <Badge
                            size="xs"
                            color="red"
                            variant="light"
                            leftSection={<IconAlertTriangle size={10} />}
                          >
                            {item.remainingStock} {t('left')}
                          </Badge>
                        ) : (
                          <Badge size="xs" color="gray" variant="outline">
                            {item.remainingStock} {t('available')}
                          </Badge>
                        )}
                      </Box>
                    </Group>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
