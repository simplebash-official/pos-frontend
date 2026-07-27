import { Group, Burger, Title, Button, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { IconShoppingCart, IconUserCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';

export interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {
  const navigate = useNavigate();
  const cartItemsCount = useCartStore((state) => state.items.length);

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title order={3} style={{ cursor: 'pointer' }} onClick={() => navigate('/billing')}>
          ⚡ POS Core
        </Title>
        <Badge variant="light" color="indigo" size="sm">
          Phase 1: Retail & Core
        </Badge>
      </Group>

      <Group gap="xs">
        <Button
          leftSection={<IconShoppingCart size={18} />}
          variant="filled"
          color="indigo"
          size="sm"
          onClick={() => navigate('/billing')}
        >
          Billing Counter
          {cartItemsCount > 0 && (
            <Badge color="white" c="indigo" size="xs" ml="xs">
              {cartItemsCount}
            </Badge>
          )}
        </Button>

        <Tooltip label="Active Cashier: Admin">
          <ActionIcon variant="light" color="gray" size="lg" radius="xl">
            <IconUserCheck size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
