import { useState } from 'react';
import {
  Box,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Portal,
  Overlay,
  Alert,
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle } from '@tabler/icons-react';
import { PageLoader } from '@/shared/components/PageLoader';
import { STORAGE_KEYS, ROUTES } from '@/constants';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please enter both your email address and password to continue.',
        color: 'red',
      });
      return;
    }

    setIsLoggingIn(true);
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock_token_pre_backend');

    notifications.show({
      title: 'Logged In Successfully',
      message: `Welcome back, ${email.split('@')[0]}! Redirecting to POS console...`,
      color: 'green',
    });

    setTimeout(() => {
      navigate(ROUTES.BILLING, { state: { fromLogin: true } });
    }, 1000);
  };

  return (
    <>
      {isLoggingIn && (
        <Portal>
          <Overlay
            color="#000"
            backgroundOpacity={0.65}
            blur={4}
            zIndex={9999}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <PageLoader size={45} title="Signing in..." height="auto" />
          </Overlay>
        </Portal>
      )}

      <Stack w="100%" align="center" gap="lg" style={{ maxWidth: 360 }}>
        <Text fz="xl" fw={900} c="blue">
          Jana2U Service Center
        </Text>

        <Title
          order={1}
          ta="center"
          fw={800}
          fz={{ base: 'xl', md: '2xl' }}
          style={{ color: 'var(--text-primary)' }}
        >
          Sign in to POS Console
        </Title>

        <Alert
          variant="light"
          color="blue"
          title="Development Mode"
          icon={<IconInfoCircle size={16} />}
          w="100%"
        >
          Any email and password are accepted during pre-backend development.
        </Alert>

        {/* Form Fields */}
        <Box component="form" onSubmit={handleLogin} w="100%">
          <Stack gap="md" w="100%">
            <TextInput
              label="Email Address"
              placeholder="operator@pos.local"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              size="md"
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              size="md"
            />

            <Button type="submit" fullWidth size="md" mt="sm">
              Log in
            </Button>
          </Stack>
        </Box>
      </Stack>
    </>
  );
}
