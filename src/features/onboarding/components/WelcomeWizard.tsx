import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  Alert,
  Box,
  Stack,
  Stepper,
  Group,
  ThemeIcon,
  ActionIcon,
  useMantineColorScheme,
  Text,
  Badge,
  Paper,
  Divider,
  SegmentedControl,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconSparkles,
  IconDatabase,
  IconRocket,
  IconDeviceDesktop,
  IconInfoCircle,
  IconCpu,
  IconCloud,
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginSuccess,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectAuthUser,
} from '@/store/slices/authSlice';
import { selectAppLanguage, setAppLanguage } from '@/store/slices/settingsSlice';
import { ROUTES } from '@/constants/routes';
import { queryKeys } from '@/api/queryKeys';
import { logger } from '@/shared/logging';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { isTauri } from '@/shared/lib/runtime';
import { useSetupStatus, useInitializeSetup } from '../hooks/useSetupStatus';
import { completeInstallationSetupNative, recoverCompletedSetup } from '../api/onboardingApi';
import { SplashStep } from './SplashStep';
import { FeatureGuideStep } from './FeatureGuideStep';
import { DataChoiceStep } from './DataChoiceStep';
import { JoinCloudShopStep } from './JoinCloudShopStep';
import { ProgressStep } from './ProgressStep';
import type { SetupSystemPayload, SetupSystemResult } from '../types';
import { PRODUCT_NAME } from '@/config/branding';
import { RegisterStep, useCloudState } from '@/features/account';

export const WelcomeWizard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const appLanguage = useAppSelector(selectAppLanguage);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const currentUser = useAppSelector(selectAuthUser);

  const { data: status } = useSetupStatus();
  const queryClient = useQueryClient();
  const initializeMutation = useInitializeSetup();
  // The optional "register free account" step exists only in desktop when configured
  const { state: cloud } = useCloudState();
  const cloudStep = isTauri() && cloud.enabled;
  const dbStepIndex = cloudStep ? 3 : 2;
  // Linked to a cloud shop: its data (and admin) comes down by itself, so the
  // admin form is only offered if that turns out not to be possible.
  // 'joining' = downloading it; 'cloud-admin' = it came down with its admin but still needs
  // the demo-vs-clean choice; 'form' = nothing to download, set up a new admin here.
  const [joinMode, setJoinMode] = useState<'joining' | 'cloud-admin' | 'form'>('joining');
  const cloudLinked = cloudStep && cloud.linked;
  const joiningCloudShop = cloudLinked && joinMode === 'joining';
  const usingCloudAdmin = cloudLinked && joinMode === 'cloud-admin';
  const launchStepIndex = dbStepIndex + 1;

  const [activeStep, setActiveStepState] = useState<number>(0);
  const setActiveStep = (step: number) => {
    logger.info(
      'onboarding',
      'step',
      { from: activeStep, to: step },
      `Welcome wizard step ${step + 1}`
    );
    setActiveStepState(step);
  };
  const [setupPayload, setSetupPayload] = useState<SetupSystemPayload | null>(null);
  const [setupResult, setSetupResult] = useState<SetupSystemResult | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);

  // A shop that is already set up has nothing to do here: go to the dashboard.
  // Re-evaluated whenever the status changes (the answer for a just-restored
  // session can arrive after the first render), but never while the owner is
  // past the first step — the launch screen shows its own result.
  useEffect(() => {
    if (status?.setup_completed && activeStep === 0) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [status, navigate, activeStep]);

  // On web, unauthenticated visitors must sign in first to obtain tenant credentials
  useEffect(() => {
    if (!isTauri() && isInitialized && !isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [navigate, isInitialized, isAuthenticated]);

  const handleStartSetup = async (payload: SetupSystemPayload) => {
    setSetupPayload(payload);
    setActiveStep(launchStepIndex); // Advance to ProgressStep
    setSetupError(null);
    // The password is masked by the logger's redaction; the choice is what matters.
    logger.info('onboarding', 'setup.start', { ...payload }, 'Starting first-time setup');

    initializeMutation.mutate(payload, {
      onSuccess: async (data) => {
        logger.info(
          'onboarding',
          'setup.done',
          { sampleDataLoaded: data.sample_data_loaded, adminUsername: data.admin_username },
          'First-time setup completed'
        );
        setSetupResult(data);
        // Inform desktop shell (Tauri) that setup completed
        await completeInstallationSetupNative(data.sample_data_loaded);
      },
      onError: (err) => {
        logger.error('onboarding', 'setup.error', err);
        const apiErr = err as Error & { statusCode?: number; code?: string };
        // No answer at all (timed out, connection dropped): the server may have finished anyway.
        if (!apiErr?.statusCode) {
          void recoverCompletedSetup(payload).then(async (recovered) => {
            if (recovered) {
              logger.info('onboarding', 'setup.recovered', {}, 'Setup finished without a reply');
              setSetupResult(recovered);
              await completeInstallationSetupNative(recovered.sample_data_loaded);
            } else {
              setSetupError(
                err.message || t('Failed to initialize database. Please check backend logs.')
              );
            }
          });
          return;
        }
        if (
          apiErr?.statusCode === 409 ||
          apiErr?.code === 'SETUP_ALREADY_COMPLETED' ||
          apiErr?.message?.includes('already been completed')
        ) {
          // Nothing failed: this shop was set up earlier. Carry on to it.
          queryClient.invalidateQueries({ queryKey: queryKeys.system.all });
          notifications.show({ color: 'teal', message: t('Your shop is already set up.') });
          navigate(isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN, { replace: true });
          return;
        }
        setSetupError(
          usingCloudAdmin && apiErr?.statusCode === 401
            ? t(
                "That POS password doesn't match. Use the password you chose when you created this shop."
              )
            : err.message || t('Failed to initialize database. Please check backend logs.')
        );
      },
    });
  };

  const handleCompleteAndLaunch = () => {
    logger.info('onboarding', 'launch', { autoLogin: Boolean(setupResult?.token) });
    if (setupResult?.token && setupResult?.user) {
      // Auto-authenticate with issued JWT token & Admin user (Desktop setup)
      dispatch(
        loginSuccess({
          user: setupResult.user,
          token: setupResult.token,
        })
      );
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else if (isAuthenticated) {
      // Already authenticated (Web/Cloud session)
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      // Fallback: navigate to Login page
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const shortId = status?.installation_id
    ? status.installation_id.slice(0, 8).toUpperCase()
    : 'POS-STATION';

  return (
    <Box
      style={{
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-app)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        transition: 'background-color 0.25s ease',
      }}
    >
      {/* ========================================================================= */}
      {/* Left Navigation Rail (Desktop) / Top Bar (Mobile)                        */}
      {/* ========================================================================= */}
      <Box
        style={{
          width: isMobile ? '100%' : '340px',
          minWidth: isMobile ? '100%' : '340px',
          maxWidth: isMobile ? '100%' : '340px',
          height: isMobile ? 'auto' : '100vh',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: isMobile ? 'none' : '1px solid var(--border)',
          borderBottom: isMobile ? '1px solid var(--border)' : 'none',
          padding: isMobile ? '16px' : '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        {/* Top Branding & Stepper Zone */}
        <Stack gap="xl">
          {/* Identity Header */}
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ThemeIcon
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                size={40}
                radius="md"
              >
                <IconDeviceDesktop size={24} />
              </ThemeIcon>
              <div>
                <Text fw={800} size="md" style={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  {PRODUCT_NAME}
                </Text>
                <Text size="xs" c="dimmed">
                  {isTauri() ? t('Workstation Setup Studio') : t('Shop Onboarding Studio')}
                </Text>
              </div>
            </Group>

            <ActionIcon
              variant="default"
              size="md"
              radius="md"
              onClick={toggleColorScheme}
              title={t('Toggle Color Scheme')}
              aria-label={t('Toggle Color Scheme')}
            >
              {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            </ActionIcon>
          </Group>

          <Group gap="xs">
            <Badge color="blue" variant="light" size="sm">
              v{status?.app_version || '0.7.0'}
            </Badge>
            <Badge color="teal" variant="light" size="sm">
              {t('Initial First-Run')}
            </Badge>
          </Group>

          <Divider />

          {/* Stepper Navigation */}
          <Stepper
            active={activeStep}
            onStepClick={activeStep < launchStepIndex ? setActiveStep : undefined}
            orientation={isMobile ? 'horizontal' : 'vertical'}
            size={isMobile ? 'xs' : 'sm'}
            color="blue"
          >
            <Stepper.Step
              label={t('Welcome')}
              description={!isMobile ? t('System Check') : undefined}
              icon={<IconSparkles size={16} />}
            />
            <Stepper.Step
              label={t('Tour')}
              description={!isMobile ? t('Capabilities') : undefined}
              icon={<IconInfoCircle size={16} />}
            />
            {cloudStep && (
              <Stepper.Step
                label={t('Account')}
                description={!isMobile ? t('Optional') : undefined}
                icon={<IconCloud size={16} />}
              />
            )}
            <Stepper.Step
              label={cloudLinked && joinMode !== 'form' ? t('Your shop') : t('Database')}
              description={
                !isMobile
                  ? cloudLinked && joinMode !== 'form'
                    ? t('From the cloud')
                    : t('Demo or Clean')
                  : undefined
              }
              icon={<IconDatabase size={16} />}
            />
            <Stepper.Step
              label={t('Launch')}
              description={!isMobile ? t('Ready') : undefined}
              icon={<IconRocket size={16} />}
            />
          </Stepper>
        </Stack>

        {/* Bottom Workstation Signature & Language Toolbar */}
        {!isMobile && (
          <Stack gap="md" mt="xl">
            {/* Workstation signature card */}
            <Paper p="xs" radius="md" style={{ backgroundColor: 'var(--bg-card)' }}>
              <Group gap="xs" mb={2}>
                <ThemeIcon color="blue" variant="light" size="xs" radius="xl">
                  <IconCpu size={12} />
                </ThemeIcon>
                <Text size="xs" fw={700}>
                  {isTauri() ? t('Workstation Record') : t('Cloud Shop Instance')}
                </Text>
              </Group>
              <Text size="xs" c="dimmed" ff="monospace">
                ID: {shortId} · {isTauri() ? status?.platform || 'Desktop' : 'Web Cloud'}
              </Text>
            </Paper>

            {/* Language Switcher */}
            <SegmentedControl
              value={appLanguage}
              onChange={(val) => dispatch(setAppLanguage(val as 'en' | 'si'))}
              data={[
                { label: 'English', value: 'en' },
                { label: 'සිංහල (Sinhala)', value: 'si' },
              ]}
              fullWidth
              size="xs"
            />
          </Stack>
        )}
      </Box>

      {/* ========================================================================= */}
      {/* Right Main Stage (Full-Length & Full-Height Content)                      */}
      {/* ========================================================================= */}
      <Box
        style={{
          flex: 1,
          // minHeight 0 lets the stage scroll inside the fixed-height column on phones.
          minHeight: 0,
          height: isMobile ? undefined : '100dvh',
          overflowY: 'auto',
          padding: isMobile ? '20px 16px' : '48px 64px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-app)',
        }}
      >
        <Box
          style={{
            maxWidth: '1120px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Active Step Content */}
          {activeStep === 0 && <SplashStep status={status} onNext={() => setActiveStep(1)} />}

          {activeStep === 1 && (
            <FeatureGuideStep onNext={() => setActiveStep(2)} onPrev={() => setActiveStep(0)} />
          )}

          {cloudStep && activeStep === 2 && (
            <RegisterStep onNext={() => setActiveStep(3)} onPrev={() => setActiveStep(1)} />
          )}

          {activeStep === dbStepIndex && joiningCloudShop && (
            <JoinCloudShopStep
              onUseForm={() => setJoinMode('form')}
              onCloudAdmin={() => setJoinMode('cloud-admin')}
              onPrev={() => setActiveStep(dbStepIndex - 1)}
            />
          )}

          {activeStep === dbStepIndex && joinMode === 'form' && cloudLinked && (
            <Alert color="blue" variant="light" mb="md" role="status">
              {t(
                "We couldn't find a ready shop in the cloud, so let's set one up on this computer."
              )}
            </Alert>
          )}

          {activeStep === dbStepIndex && !joiningCloudShop && (
            <DataChoiceStep
              loading={initializeMutation.isPending}
              onSubmit={handleStartSetup}
              onPrev={() => setActiveStep(dbStepIndex - 1)}
              currentUser={currentUser}
              existingAdmin={usingCloudAdmin ? { username: 'admin' } : null}
              suggested={cloudStep && cloud.linked ? { name: cloud.accountName } : null}
            />
          )}

          {activeStep === launchStepIndex && (
            <ProgressStep
              payload={setupPayload}
              loading={initializeMutation.isPending}
              result={setupResult}
              error={setupError}
              onRetry={() => setActiveStep(dbStepIndex)}
              onComplete={handleCompleteAndLaunch}
              onGoToLogin={() => navigate(ROUTES.LOGIN)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
