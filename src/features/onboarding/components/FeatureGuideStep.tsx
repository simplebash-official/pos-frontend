import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  SimpleGrid,
  Paper,
  ThemeIcon,
  Badge,
  List,
  Box,
} from '@mantine/core';
import {
  IconArrowRight,
  IconArrowLeft,
  IconReceipt2,
  IconTools,
  IconBarcode,
  IconShieldLock,
  IconCheck,
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';

export interface FeatureGuideStepProps {
  onNext: () => void;
  onPrev: () => void;
}

export const FeatureGuideStep = ({ onNext, onPrev }: FeatureGuideStepProps) => {
  const features = [
    {
      icon: IconReceipt2,
      color: 'blue',
      badge: t('Point of Sale'),
      title: t('Smart Billing & Split Tender'),
      description: t(
        'Lightning-fast checkout with barcode scanning, hold carts, split cash/card/credit payments, and instant receipt printing.'
      ),
      highlights: [
        t('Split payments across cash, card, and customer credit'),
        t('Direct thermal 80mm & A4 invoice generation'),
        t('Cart suspension & instant barcode search'),
      ],
    },
    {
      icon: IconTools,
      color: 'teal',
      badge: t('Service Center'),
      title: t('Repair Jobs & Workshop'),
      description: t(
        'Complete end-to-end device repair management from customer drop-off, fault diagnosis, to parts allocation and delivery.'
      ),
      highlights: [
        t('Device intake tickets & status tracking'),
        t('Parts deduction & labor cost tracking'),
        t('Technician assignment & commission tracking'),
      ],
    },
    {
      icon: IconBarcode,
      color: 'indigo',
      badge: t('Stock Control'),
      title: t('Inventory & Serial Tracking'),
      description: t(
        'Granular inventory tracking with serialized items, automatic sequential SKUs, low-stock notifications, and supplier purchase orders.'
      ),
      highlights: [
        t('Unique serial number tracking per device'),
        t('Automatic low-stock reorder warnings'),
        t('Multi-supplier catalog linking & purchase history'),
      ],
    },
    {
      icon: IconShieldLock,
      color: 'blue',
      badge: t('Security & Privacy'),
      title: t('100% Offline-First Architecture'),
      description: t(
        'Your business data lives exclusively on your local computer. No cloud dependency, zero downtime, and complete cryptographic security.'
      ),
      highlights: [
        t('Zero cloud lock-in: total data sovereignty'),
        t('Instant one-click database backups & export'),
        t('Role-based permissions (Admin, Cashier, Tech)'),
      ],
    },
  ];

  return (
    <Stack gap="xl">
      <Box>
        <Title
          order={1}
          style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          {t('Explore Jana2U POS Capabilities')}
        </Title>
        <Text c="dimmed" size="md" mt="xs" maw={780} style={{ lineHeight: 1.6 }}>
          {t(
            'Engineered for retail stores, electronics repair shops, and high-volume checkout counters. Here is a glance at what you can do.'
          )}
        </Text>
      </Box>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Paper
              key={idx}
              withBorder
              p="xl"
              radius="md"
              style={{
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
              }}
            >
              <div>
                <Group justify="space-between" mb="sm">
                  <ThemeIcon color={item.color} variant="light" size={44} radius="md">
                    <Icon size={24} />
                  </ThemeIcon>
                  <Badge color={item.color} variant="subtle" size="sm">
                    {item.badge}
                  </Badge>
                </Group>

                <Text fw={700} size="lg" mb={6}>
                  {item.title}
                </Text>
                <Text size="sm" c="dimmed" mb="md" style={{ lineHeight: 1.5 }}>
                  {item.description}
                </Text>

                <List
                  size="xs"
                  spacing={6}
                  icon={
                    <ThemeIcon color={item.color} size={14} radius="xl" variant="light">
                      <IconCheck size={10} />
                    </ThemeIcon>
                  }
                >
                  {item.highlights.map((point, pIdx) => (
                    <List.Item key={pIdx}>{point}</List.Item>
                  ))}
                </List>
              </div>
            </Paper>
          );
        })}
      </SimpleGrid>

      <Group justify="space-between" mt="lg">
        <Button
          variant="default"
          size="lg"
          radius="md"
          leftSection={<IconArrowLeft size={20} />}
          onClick={onPrev}
        >
          {t('Back')}
        </Button>
        <Button
          color="blue"
          size="lg"
          radius="md"
          rightSection={<IconArrowRight size={20} />}
          onClick={onNext}
        >
          {t('Next: Database Setup')}
        </Button>
      </Group>
    </Stack>
  );
};
