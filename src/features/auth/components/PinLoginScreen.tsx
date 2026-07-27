import { useState } from 'react';
import { Paper, Title, Text, PasswordInput, Button, Stack, Center, Box } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

export function PinLoginScreen() {
  const [pin, setPin] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (pin === '1234' || pin.length >= 4) {
      notifications.show({
        title: 'Logged In Successfully',
        message: 'Welcome to POS Core Counter',
        color: 'green',
      });
      navigate('/billing');
    } else {
      notifications.show({
        title: 'Invalid PIN',
        message: 'Enter any 4-digit PIN (default demo PIN: 1234)',
        color: 'red',
      });
    }
  };

  return (
    <Center style={{ minHeight: '80vh' }}>
      <Paper p="xl" withBorder radius="lg" style={{ width: 380 }}>
        <Stack align="center" gap="sm">
          <Box style={{ fontSize: 36 }}>🔐</Box>
          <Title order={3}>Cashier PIN Access</Title>
          <Text size="sm" c="dimmed" ta="center">
            Enter your cashier PIN code to unlock the billing terminal
          </Text>

          <PasswordInput
            placeholder="Enter 4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.currentTarget.value)}
            style={{ width: '100%' }}
            size="lg"
            maxLength={6}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLogin();
            }}
          />

          <Button fullWidth size="md" color="indigo" onClick={handleLogin} mt="sm">
            Unlock POS Counter
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
