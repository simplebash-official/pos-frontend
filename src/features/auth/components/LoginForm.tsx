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
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { PageLoader } from '@/shared/components/PageLoader';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';
import { loginApi } from '../api/authApi';
import { ApiError } from '@/shared/types/common';
import { useIsMobile } from '@/shared/hooks/useResponsive';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.BILLING;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please enter both your email address and password to continue.',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await loginApi({ email: trimmedEmail, password });
      dispatch(loginSuccess({ user: data.user, token: data.token }));

      notifications.show({
        title: 'Logged In Successfully',
        message: `Welcome back, ${data.user.name || data.user.email}! Redirecting to POS console...`,
        color: 'green',
      });

      navigate(from, { replace: true });
    } catch (err: unknown) {
      const apiError = err as ApiError;
      notifications.show({
        title: 'Login Failed',
        message: apiError.message || 'Invalid email or password. Please try again.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {isSubmitting && (
        <Portal>
          <Overlay
            color="#000"
            backgroundOpacity={0.7}
            blur={5}
            zIndex={9999}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <PageLoader
              variant="orb"
              orbState="connecting"
              orbTheme="dark"
              size={64}
              title="Signing in..."
              subtitle="Connecting to POS console..."
              height="auto"
            />
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

        {/* Form Fields */}
        <Box component="form" onSubmit={handleLogin} w="100%">
          <Stack gap="md" w="100%">
            <TextInput
              label="Email Address"
              placeholder="admin@jana2u.local"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              size="md"
              type="email"
              required
              autoFocus={!isMobile}
              styles={{
                input: {
                  fontSize: isMobile ? '16px' : undefined,
                  minHeight: isMobile ? '44px' : undefined,
                },
              }}
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              size="md"
              required
              styles={{
                input: {
                  fontSize: isMobile ? '16px' : undefined,
                  minHeight: isMobile ? '44px' : undefined,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              size="md"
              mt="sm"
              loading={isSubmitting}
              style={{ minHeight: isMobile ? '44px' : undefined }}
            >
              Log in
            </Button>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};
