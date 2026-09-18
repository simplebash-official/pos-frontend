import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
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
} from '@tabler/icons-react';
import { t } from '@/shared/i18n/t';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';
import { selectAppLanguage, setAppLanguage } from '@/store/slices/settingsSlice';
import { ROUTES } from '@/constants/routes';
import { logger } from '@/shared/logging';
import { useIsMobile } from '@/shared/hooks/useResponsive';
import { isTauri } from '@/shared/lib/runtime';
import { useSetupStatus, useInitializeSetup } from '../hooks/useSetupStatus';
import { completeInstallationSetupNative } from '../api/onboardingApi';
import { SplashStep } from './SplashStep';
import { FeatureGuideStep } from './FeatureGuideStep';
import { DataChoiceStep } from './DataChoiceStep';
import { ProgressStep } from './ProgressStep';
import type { SetupSystemPayload, SetupSystemResult } from '../types';
import { PRODUCT_NAME } from '@/config/branding';

export const WelcomeWizard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const appLanguage = useAppSelector(selectAppLanguage);

  const { data: status, isLoading: statusLoading } = useSetupStatus();
  const initializeMutation = useInitializeSetup();

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

  // If setup was ALREADY completed prior to opening the wizard, redirect immediately to Dashboard.
  // Never auto-redirect while the user is on the active provisioning screen (activeStep === 3).
  const initialCheckDoneRef = useRef(false);
  useEffect(() => {
    if (initialCheckDoneRef.current) return;
    if (!statusLoading && status) {
      initialCheckDoneRef.current = true;
      if (status.setup_completed && activeStep === 0) {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }
    }
  }, [status, statusLoading, navigate, activeStep]);

  // This wizard is desktop-only (SQLite/offline vault copy). A web (MongoDB) session
  // that somehow lands on /welcome gets bounced to Login instead of seeing it.
  useEffect(() => {
    if (!isTauri()) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [navigate]);

  const handleStartSetup = async (payload: SetupSystemPayload) => {
    setSetupPayload(payload);
    setActiveStep(3); // Advance to ProgressStep
    setSetupError(null);
    // The password is masked by the logger's redaction; the choice is what matters.
    logger.info('onboarding', 'setup.start', { ...payload }, 'Starting first-time setup');

    initializeMutation.mutate(payload, {
      onSuccess: async (data) => {
        logger.info(
          'onboarding',
          'setup.done',
          { sampleDataLoaded: data.sample_data_loaded, adminEmail: data.admin_email },
          'First-time setup completed'
        );
        setSetupResult(data);
        // Inform desktop shell (Tauri) that setup completed
        await completeInstallationSetupNative(data.sample_data_loaded);
      },
      onError: (err) => {
        logger.error('onboarding', 'setup.error', err);
        const apiErr = err as Error & { statusCode?: number; code?: string };
        if (
          apiErr?.statusCode === 409 ||
          apiErr?.code === 'SETUP_ALREADY_COMPLETED' ||
          apiErr?.message?.includes('already been completed')
        ) {
          setSetupError(
            t(
              'Database setup was already completed on this workstation. You can log in directly using your administrator credentials.'
            )
          );
          return;
        }
        setSetupError(
          err.message || t('Failed to initialize database. Please check backend logs.')
        );
      },
    });
  };

  const handleCompleteAndLaunch = () => {
    logger.info('onboarding', 'launch', { autoLogin: Boolean(setupResult?.token) });
    if (setupResult?.token && setupResult?.user) {
      // Auto-authenticate with issued JWT token & Admin user
      dispatch(
        loginSuccess({
          user: setupResult.user,
          token: setupResult.token,
        })
      );
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

  if (!isTauri()) {
    return null;
  }

  return (
    <Box
      style={{
        width: '100vw',
        height: '100vh',
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
                  Workstation Setup Studio
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
            onStepClick={activeStep < 3 ? setActiveStep : undefined}
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
            <Stepper.Step
              label={t('Database')}
              description={!isMobile ? t('Demo or Clean') : undefined}
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
                  {t('Workstation Record')}
                </Text>
              </Group>
              <Text size="xs" c="dimmed" ff="monospace">
                ID: {shortId} · {status?.platform || 'Desktop'}
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
          height: isMobile ? 'auto' : '100vh',
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

          {activeStep === 2 && (
            <DataChoiceStep
              loading={initializeMutation.isPending}
              onSubmit={handleStartSetup}
              onPrev={() => setActiveStep(1)}
            />
          )}

          {activeStep === 3 && (
            <ProgressStep
              payload={setupPayload}
              loading={initializeMutation.isPending}
              result={setupResult}
              error={setupError}
              onRetry={() => setActiveStep(2)}
              onComplete={handleCompleteAndLaunch}
              onGoToLogin={() => navigate(ROUTES.LOGIN)}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};
