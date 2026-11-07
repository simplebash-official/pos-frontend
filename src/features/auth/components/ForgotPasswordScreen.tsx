import { useState } from 'react';
import { Box, Title, Text, TextInput, Button, Stack, Alert, Anchor, Group } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconMail, IconInfoCircle } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { t } from '@/shared/i18n/t';
import { ROUTES } from '@/constants/routes';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { AuthLayout } from './AuthLayout';
import { ShopCodeField } from './ShopCodeField';
import { useLoginShopCode } from '../lib/useLoginShopCode';
import { forgotPasswordApi } from '../api/authApi';
import {
  isShopCodeRequired,
  isValidShopCode,
  normalizeShopCode,
  loginErrorMessage,
} from '../lib/shopCode';

export const ForgotPasswordScreen = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const searchParams = new URLSearchParams(location.search);
  const initialIdentifier = searchParams.get('username') ?? '';

  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    shopCode,
    setShopCode,
    locked: shopCodeLocked,
    focusField: focusShopCode,
    error: shopCodeError,
    setError: setShopCodeError,
    changeShop,
  } = useLoginShopCode(location.search);

  const loginUrl = shopCode?.trim()
    ? `${ROUTES.LOGIN}?shop=${encodeURIComponent(shopCode.trim())}`
    : ROUTES.LOGIN;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      notifications.show({
        title: 'Information Required',
        message: 'Please enter your registered admin username or email.',
        color: 'red',
      });
      return;
    }

    const needsShopCode = isShopCodeRequired();
    if (needsShopCode && !isValidShopCode(shopCode)) {
      setShopCodeError('Enter your shop code, e.g. test-shop.');
      return;
    }
    setShopCodeError(null);

    setIsSubmitting(true);
    try {
      await forgotPasswordApi({
        identifier: trimmedIdentifier,
        shopCode: needsShopCode ? normalizeShopCode(shopCode) : undefined,
      });
      setIsSubmitted(true);
    } catch (err: unknown) {
      notifications.show({
        title: 'Request Failed',
        message: loginErrorMessage(
          err,
          'Unable to send password reset instructions. Please verify your details and try again.'
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
        {/* Back Link */}
        <Group justify="flex-start" w="100%">
          <Anchor
            component={Link}
            to={loginUrl}
            size="sm"
            c="dimmed"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              minHeight: isMobile ? 44 : undefined,
            }}
          >
            <IconArrowLeft size={16} />
            <span>{t('Back to Sign In')}</span>
          </Anchor>
        </Group>

        {/* Header */}
        <Stack gap="xs" align="center" w="100%">
          <Title
            order={1}
            ta="center"
            fw={800}
            fz={{ base: 'xl', md: '2xl' }}
            style={{ color: 'var(--text-primary)' }}
          >
            {t('Reset Admin Password')}
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            {t('Enter your shop code and registered admin username or email.')}
          </Text>
        </Stack>

        {isSubmitted ? (
          <Stack w="100%" gap="md">
            <Alert
              color="green"
              icon={<IconCheck size={20} />}
              title={t('Check your email')}
              radius="md"
            >
              <Text size="sm">
                {t(
                  "Check your email. If an account matches those details, we've sent password reset instructions. The link will expire in 15 minutes."
                )}
              </Text>
            </Alert>

            <Button
              component={Link}
              to={loginUrl}
              fullWidth
              size="md"
              variant="default"
              style={{ minHeight: isMobile ? '44px' : undefined }}
            >
              {t('Return to Sign In')}
            </Button>
          </Stack>
        ) : (
          <Box component="form" onSubmit={handleSubmit} w="100%">
            <Stack gap="md" w="100%">
              <ShopCodeField
                value={shopCode}
                onChange={(v) => {
                  setShopCode(v);
                  setShopCodeError(null);
                }}
                error={shopCodeError}
                size="md"
                locked={shopCodeLocked}
                onChangeShop={changeShop}
                autoFocus={focusShopCode}
              />

              <TextInput
                name="identifier"
                autoComplete="username email"
                label={t('Username or Email')}
                placeholder={t('admin or admin@example.com')}
                leftSection={<IconMail size={16} />}
                value={identifier}
                onChange={(e) => setIdentifier(e.currentTarget.value)}
                size="md"
                required
                autoFocus={!isMobile && !focusShopCode}
                styles={{
                  input: {
                    fontSize: isMobile ? '16px' : undefined,
                    minHeight: isMobile ? '44px' : undefined,
                  },
                }}
              />

              {/* Staff guidance note */}
              <Alert
                variant="light"
                color="blue"
                icon={<IconInfoCircle size={18} />}
                title={t('Staff & Cashiers')}
                radius="md"
              >
                <Text size="xs">
                  {t(
                    'Are you a cashier or staff member? Please ask your Shop Manager or Admin to reset your password directly from the POS Settings menu.'
                  )}
                </Text>
              </Alert>

              <Button
                type="submit"
                fullWidth
                size="md"
                loading={isSubmitting}
                style={{ minHeight: isMobile ? '44px' : undefined }}
              >
                {t('Send Reset Instructions')}
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </AuthLayout>
  );
};
