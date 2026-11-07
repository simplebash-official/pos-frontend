import { useState, useEffect } from 'react';
import {
  Box,
  Title,
  Text,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Progress,
  Group,
  Center,
  Loader,
} from '@mantine/core';
import { IconLock, IconCheck, IconX, IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { t } from '@/shared/i18n/t';
import { ROUTES } from '@/constants/routes';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { AuthLayout } from './AuthLayout';
import { verifyResetTokenApi, resetPasswordApi } from '../api/authApi';
import { loginErrorMessage } from '../lib/shopCode';

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 30;
  if (password.length >= 12) score += 20;
  if (/[0-9]/.test(password)) score += 20;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  return Math.min(score, 100);
}

function getStrengthColor(strength: number): string {
  if (strength < 40) return 'red';
  if (strength < 70) return 'yellow';
  return 'green';
}

function RequirementItem({ label, meets }: { label: string; meets: boolean }) {
  return (
    <Group gap={6} align="center">
      {meets ? (
        <IconCheck size={14} color="var(--mantine-color-green-6)" stroke={2.5} />
      ) : (
        <IconX size={14} color="var(--mantine-color-dimmed)" stroke={2} />
      )}
      <Text size="xs" c={meets ? 'green' : 'dimmed'}>
        {label}
      </Text>
    </Group>
  );
}

export const ResetPasswordScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') ?? '';
  const shopCode = searchParams.get('shopCode') ?? searchParams.get('shop') ?? '';
  const trimmedToken = token.trim();
  const hasToken = Boolean(trimmedToken);

  const loginUrl = shopCode.trim()
    ? `${ROUTES.LOGIN}?shop=${encodeURIComponent(shopCode.trim())}`
    : ROUTES.LOGIN;

  const forgotPasswordUrl = shopCode.trim()
    ? `${ROUTES.FORGOT_PASSWORD}?shop=${encodeURIComponent(shopCode.trim())}`
    : ROUTES.FORGOT_PASSWORD;

  const [isVerifying, setIsVerifying] = useState(hasToken);
  const [isValidToken, setIsValidToken] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    hasToken ? null : 'No reset token was provided in the link.'
  );

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!trimmedToken) {
      return;
    }

    let active = true;
    verifyResetTokenApi(trimmedToken)
      .then((res) => {
        if (!active) return;
        if (res.valid) {
          setIsValidToken(true);
          setVerificationError(null);
        } else {
          setIsValidToken(false);
          setVerificationError(res.message || 'This reset link has expired or is invalid.');
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setIsValidToken(false);
        setVerificationError(loginErrorMessage(err, 'This reset link has expired or is invalid.'));
      })
      .finally(() => {
        if (active) setIsVerifying(false);
      });

    return () => {
      active = false;
    };
  }, [trimmedToken]);

  const hasMinLength = newPassword.length >= 8;
  const passwordsMatch = Boolean(newPassword && newPassword === confirmPassword);
  const strength = getPasswordStrength(newPassword);
  const canSubmit = hasMinLength && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength) {
      notifications.show({
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long.',
        color: 'red',
      });
      return;
    }

    if (!passwordsMatch) {
      notifications.show({
        title: 'Passwords Do Not Match',
        message: 'Please ensure both password entries match exactly.',
        color: 'red',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordApi({
        token: token.trim(),
        newPassword,
      });

      notifications.show({
        title: 'Password Reset Successful',
        message: 'Your password has been reset. Please sign in with your new password.',
        color: 'green',
      });

      navigate(loginUrl, { replace: true });
    } catch (err: unknown) {
      notifications.show({
        title: 'Reset Failed',
        message: loginErrorMessage(
          err,
          'Unable to reset your password. The reset link may have expired.'
        ),
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Stack w="100%" align="center" gap="lg" style={{ maxWidth: 420 }}>
        {/* Header */}
        <Stack gap="xs" align="center" w="100%">
          <Title
            order={1}
            ta="center"
            fw={800}
            fz={{ base: 'xl', md: '2xl' }}
            style={{ color: 'var(--text-primary)' }}
          >
            {t('Set New Password')}
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            {t('Create a new strong password for your account.')}
          </Text>
        </Stack>

        {isVerifying ? (
          <Center p="xl" style={{ minHeight: 180 }}>
            <Stack align="center" gap="sm">
              <Loader size="md" color="blue" />
              <Text size="sm" c="dimmed">
                {t('Verifying reset link...')}
              </Text>
            </Stack>
          </Center>
        ) : !isValidToken ? (
          <Stack w="100%" gap="md">
            <Alert
              color="red"
              icon={<IconAlertCircle size={20} />}
              title={t('Invalid or Expired Link')}
              radius="md"
            >
              <Text size="sm">
                {verificationError ||
                  t(
                    'This password reset link is invalid or has expired. Please request a new one.'
                  )}
              </Text>
            </Alert>

            <Button
              component={Link}
              to={forgotPasswordUrl}
              fullWidth
              size="md"
              style={{ minHeight: isMobile ? '44px' : undefined }}
            >
              {t('Request a New Reset Link')}
            </Button>

            <Button
              component={Link}
              to={loginUrl}
              fullWidth
              size="md"
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              style={{ minHeight: isMobile ? '44px' : undefined }}
            >
              {t('Back to Sign In')}
            </Button>
          </Stack>
        ) : (
          <Box component="form" onSubmit={handleSubmit} w="100%">
            <Stack gap="md" w="100%">
              <PasswordInput
                name="newPassword"
                autoComplete="new-password"
                label={t('New Password')}
                placeholder="••••••••"
                leftSection={<IconLock size={16} />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                size="md"
                required
                autoFocus={!isMobile}
                styles={{
                  input: {
                    fontSize: isMobile ? '16px' : undefined,
                    minHeight: isMobile ? '44px' : undefined,
                  },
                }}
              />

              {newPassword ? (
                <Stack gap={4}>
                  <Progress
                    value={strength}
                    color={getStrengthColor(strength)}
                    size="sm"
                    radius="xl"
                  />
                  <Text size="xs" c="dimmed">
                    {strength < 40
                      ? t('Weak password')
                      : strength < 70
                        ? t('Moderate password')
                        : t('Strong password')}
                  </Text>
                </Stack>
              ) : null}

              <PasswordInput
                name="confirmPassword"
                autoComplete="new-password"
                label={t('Confirm New Password')}
                placeholder="••••••••"
                leftSection={<IconLock size={16} />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                size="md"
                required
                styles={{
                  input: {
                    fontSize: isMobile ? '16px' : undefined,
                    minHeight: isMobile ? '44px' : undefined,
                  },
                }}
              />

              {/* Requirement Checklist */}
              <Stack
                gap={4}
                p="xs"
                style={{ background: 'var(--bg-hover)', borderRadius: 'var(--mantine-radius-md)' }}
              >
                <RequirementItem label={t('At least 8 characters')} meets={hasMinLength} />
                <RequirementItem label={t('Passwords must match')} meets={passwordsMatch} />
              </Stack>

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={isSubmitting}
                disabled={!canSubmit}
                style={{ minHeight: isMobile ? '44px' : undefined }}
              >
                {t('Reset Password')}
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </AuthLayout>
  );
};
