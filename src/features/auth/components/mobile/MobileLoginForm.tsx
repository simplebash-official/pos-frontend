import { useState } from 'react';
import { TextInput, PasswordInput, Checkbox, Button, Anchor, Group, Stack } from '@mantine/core';
import { IconChevronLeft, IconLock } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';
import { loginApi } from '../../api/authApi';
import { ApiError } from '@/shared/types/common';

interface MobileLoginFormProps {
  onBack: () => void;
}

export const MobileLoginForm = ({ onBack }: MobileLoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    notifications.show({
      title: 'Password Reset',
      message:
        'Please contact your Jana2U System Administrator to reset your POS terminal access credentials.',
      color: 'blue',
    });
  };

  return (
    <>
      {/* Top Header with Back Button */}
      <div className="mobile-auth-topbar">
        <button
          type="button"
          className="mobile-back-btn"
          onClick={onBack}
          aria-label="Back to Welcome Screen"
        >
          <IconChevronLeft size={18} stroke={2.5} />
          <span>Back</span>
        </button>
      </div>

      {/* Spacer to push card to bottom */}
      <div style={{ flex: 1 }} />

      {/* Bottom Sheet Card */}
      <div className="mobile-auth-sheet">
        <div className="mobile-sheet-header">
          <h2 className="mobile-sheet-title">Staff Sign In</h2>
          <p className="mobile-sheet-subtitle">
            Access the POS terminal for repairs, printing &amp; sales
          </p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="you@jana2u.local"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="mobile-auth-input"
              type="email"
              required
              autoComplete="email"
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="mobile-auth-input"
              required
              autoComplete="current-password"
            />

            <Group justify="space-between" align="center" mt={2}>
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.currentTarget.checked)}
                size="sm"
                color="blue"
              />
              <Anchor
                href="#forgot-password"
                onClick={handleForgotPassword}
                size="xs"
                fw={600}
                c="blue"
              >
                Forgot password?
              </Anchor>
            </Group>

            <Button
              type="submit"
              fullWidth
              loading={isSubmitting}
              color="blue"
              className="mobile-primary-btn"
              mt="sm"
            >
              Sign In
            </Button>

            <div className="mobile-auth-security-badge">
              <IconLock size={14} stroke={2} />
              <span>JANA2U Service Center - Internal Use Only</span>
            </div>
          </Stack>
        </form>
      </div>
    </>
  );
};
