import { t } from '@/shared/i18n/t';
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
import { SERVICE_CENTER_NAME } from '@/config/branding';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { logger } from '@/shared/logging';
import { CreateShopLink } from './CreateShopLink';
import { ShopCodeField } from './ShopCodeField';
import { useLoginShopCode } from '../lib/useLoginShopCode';
import {
  isShopCodeRequired,
  isShopCodeRejection,
  isValidShopCode,
  loginErrorMessage,
  normalizeShopCode,
  rememberShopCode,
} from '../lib/shopCode';

export const LoginForm = () => {
  // Read before the state below: a `?shop=` link from the SimpleBash app sets (and hides) the shop code.
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {
    shopCode,
    setShopCode,
    locked: shopCodeLocked,
    focusField: focusShopCode,
    error: shopCodeError,
    setError: setShopCodeError,
    changeShop,
    revealField,
  } = useLoginShopCode(location.search);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.DASHBOARD;

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

    const needsShopCode = isShopCodeRequired();
    if (needsShopCode && !isValidShopCode(shopCode)) {
      setShopCodeError('Enter your shop code, e.g. test-shop.');
      return;
    }
    setShopCodeError(null);

    setIsSubmitting(true);

    try {
      const data = await loginApi({
        email: trimmedEmail,
        password,
        shopCode: needsShopCode ? normalizeShopCode(shopCode) : undefined,
      });
      if (needsShopCode) {
        rememberShopCode(shopCode);
        logger.event('app', 'auth/login.shop_code', { shopCode: normalizeShopCode(shopCode) });
      }
      dispatch(loginSuccess({ user: data.user, token: data.token }));

      notifications.show({
        title: 'Logged In Successfully',
        message: `Welcome back, ${data.user.name || data.user.email}! Redirecting to POS console...`,
        color: 'green',
      });

      navigate(from, { replace: true });
    } catch (err: unknown) {
      // A wrong code from a link is hidden; show the field so it can be fixed.
      if (shopCodeLocked && isShopCodeRejection(err)) revealField();
      notifications.show({
        title: 'Login Failed',
        message: loginErrorMessage(err, 'Invalid email or password. Please try again.'),
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
              title={t('Signing in...')}
              subtitle="Connecting to POS console..."
              height="auto"
            />
          </Overlay>
        </Portal>
      )}

      <Stack w="100%" align="center" gap="lg" style={{ maxWidth: 360 }}>
        <Text fz="xl" fw={900} c="blue">
          {t(SERVICE_CENTER_NAME)}
        </Text>

        <Title
          order={1}
          ta="center"
          fw={800}
          fz={{ base: 'xl', md: '2xl' }}
          style={{ color: 'var(--text-primary)' }}
        >
          {t('Sign in to POS Console')}
        </Title>

        {/* Form Fields */}
        <Box component="form" onSubmit={handleLogin} w="100%">
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
              label={t('Email Address')}
              placeholder={t('admin@simplebash.local')}
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
              label={t('Password')}
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
              {t('Log in')}
            </Button>
          </Stack>
        </Box>

        <CreateShopLink />
      </Stack>
    </>
  );
};
