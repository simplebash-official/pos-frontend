import {
  Group,
  Burger,
  Title,
  Button,
  Badge,
  ActionIcon,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { IconShoppingCart, IconUserCheck, IconSun, IconMoon } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/features/billing/hooks/useCart';

export interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

export function Header({ opened, toggle }: HeaderProps) {
  const navigate = useNavigate();
  const { itemCount: cartItemsCount } = useCart();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title order={3} style={{ cursor: 'pointer' }} onClick={() => navigate('/billing')}>
          ⚡ POS Core
        </Title>
        <Badge variant="light" color="blue" size="sm">
          Phase 1: Retail & Core
        </Badge>
      </Group>

      <Group gap="xs">
        <Button
          leftSection={<IconShoppingCart size={18} />}
          variant="filled"
          color="blue"
          size="sm"
          onClick={() => navigate('/billing')}
        >
          Billing Counter
          {cartItemsCount > 0 && (
            <Badge color="white" c="blue" size="xs" ml="xs">
              {cartItemsCount}
            </Badge>
          )}
        </Button>

        <Tooltip label={colorScheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <ActionIcon
            variant="light"
            color="gray"
            size="lg"
            radius="xl"
            aria-label="Toggle color scheme"
            onClick={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
          >
            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>
        </Tooltip>

        <Tooltip label="Active Cashier: Admin">
          <ActionIcon variant="light" color="gray" size="lg" radius="xl">
            <IconUserCheck size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>
  );
}
