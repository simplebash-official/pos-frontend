import {
  Group,
  Burger,
  Title,
  Button,
  Badge,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconShoppingCart, IconUserCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/features/billing/hooks/useCart';
import { ROUTES } from '@/constants';

export interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {
  const navigate = useNavigate();
  const { itemCount: cartItemsCount } = useCart();

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title order={3} style={{ cursor: 'pointer' }} onClick={() => navigate(ROUTES.BILLING)}>
          Jana2U Service Center
        </Title>
      </Group>

      <Group gap="xs">
        <Button
          leftSection={<IconShoppingCart size={18} />}
          variant="filled"
          color="blue"
          size="sm"
          onClick={() => navigate(ROUTES.BILLING)}
        >
          Billing Counter
          {cartItemsCount > 0 && (
            <Badge color="white" c="blue" size="xs" ml="xs">
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
