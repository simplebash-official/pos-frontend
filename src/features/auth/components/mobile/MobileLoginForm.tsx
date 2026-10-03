import { t } from '@/shared/i18n/t';
import { useEffect, useState } from 'react';
import {
  Box,
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Anchor,
  Group,
  Stack,
  Portal,
  Overlay,
} from '@mantine/core';
import { IconChevronLeft, IconLock } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { PageLoader } from '@/shared/components/PageLoader';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';
import { loginApi } from '../../api/authApi';
import { logger } from '@/shared/logging';
import { CreateShopLink } from '../CreateShopLink';
import { ShopCodeField } from '../ShopCodeField';
import { useLoginShopCode } from '../../lib/useLoginShopCode';
import { selectShopProfile, updateShopProfile } from '@/store/slices/settingsSlice';
import {
  getShopNameFromLink,
  isShopCodeRequired,
  isShopCodeRejection,
  isValidShopCode,
  loginErrorMessage,
  normalizeShopCode,
  rememberShopCode,
} from '../../lib/shopCode';
import { BRAND_NAME, SERVICE_CENTER_NAME } from '@/config/branding';

interface MobileLoginFormProps {
  onBack: () => void;
}

export const MobileLoginForm = ({ onBack }: MobileLoginFormProps) => {
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
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const shopProfile = useAppSelector(selectShopProfile);
  const linkName = getShopNameFromLink(location.search);

  useEffect(() => {
    if (linkName) {
      dispatch(updateShopProfile({ tradingName: linkName }));
    }
  }, [linkName, dispatch]);

  const shopName =
    linkName ||
    (shopProfile?.tradingName?.trim() !== 'SimpleBash POS' && shopProfile?.tradingName?.trim()) ||
    shopProfile?.tradingName?.trim() ||
    shopProfile?.legalName?.trim() ||
    SERVICE_CENTER_NAME;

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
      const incomingShopName = data.shopName || linkName;
      if (incomingShopName) {
        dispatch(updateShopProfile({ tradingName: incomingShopName }));
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

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    notifications.show({
      title: 'Password Reset',
      message: `Please contact your ${BRAND_NAME} System Administrator to reset your POS terminal access credentials.`,
      color: 'blue',
    });
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
              size={60}
              title={t('Signing in...')}
              subtitle="Connecting to POS console..."
              height="auto"
            />
          </Overlay>
        </Portal>
      )}

      {/* Top Header with Back Button */}
      <div className="mobile-auth-topbar">
        <button
          type="button"
          className="mobile-back-btn"
          onClick={onBack}
          aria-label={t('Back to Welcome Screen')}
        >
          <IconChevronLeft size={18} stroke={2.5} />
          <span>{t('Back')}</span>
        </button>
      </div>

      {/* Spacer to push card to bottom */}
      <div style={{ flex: 1 }} />

      {/* Bottom Sheet Card */}
      <div className="mobile-auth-sheet">
        <div className="mobile-sheet-header">
          <h2 className="mobile-sheet-title">{t('Staff Sign In')}</h2>
          <p className="mobile-sheet-subtitle">
            {t('Access the POS terminal for repairs, printing &amp; sales')}
          </p>
        </div>

        <form onSubmit={handleLogin} noValidate>
          <Stack gap="md">
            <ShopCodeField
              value={shopCode}
              onChange={(v) => {
                setShopCode(v);
                setShopCodeError(null);
              }}
              error={shopCodeError}
              className="mobile-auth-input"
              locked={shopCodeLocked}
              onChangeShop={changeShop}
              autoFocus={focusShopCode}
            />

            <TextInput
              name="username"
              label={t('Email')}
              placeholder={t('you@simplebash.local')}
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              className="mobile-auth-input"
              type="email"
              required
              autoComplete="username"
            />

            <PasswordInput
              name="password"
              label={t('Password')}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              className="mobile-auth-input"
              required
              autoComplete="current-password"
            />

            <Group justify="space-between" align="center" mt={2}>
              <Checkbox
                label={t('Remember me')}
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
                {t('Forgot password?')}
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
              {t('Sign In')}
            </Button>

            <div className="mobile-auth-security-badge">
              <IconLock size={14} stroke={2} />
              <span>
                {shopName} - {t('Internal Use Only')}
              </span>
            </div>
          </Stack>
        </form>

        <Box mt="md">
          <CreateShopLink />
        </Box>
      </div>
    </>
  );
};
