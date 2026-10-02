import { t } from '@/shared/i18n/t';
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import {
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectIsAuthLoading,
} from '@/store/slices/authSlice';
import { useSetupStatus } from '@/features/onboarding/hooks/useSetupStatus';
import { PageLoader } from '@/shared/components/PageLoader';
import { ROUTES } from '@/constants/routes';
import { PRODUCT_NAME } from '@/config/branding';
import { isTauri } from '@/shared/lib/runtime';

export interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const isLoading = useAppSelector(selectIsAuthLoading);
  const { data: status, isPending: isStatusPending } = useSetupStatus();
  const location = useLocation();

  // Also wait for this session's setup status, so a set-up shop is never
  // bounced to /welcome (or a new one flashed the dashboard) on a guess.
  if (!isInitialized || isLoading || (isAuthenticated && isStatusPending)) {
    return (
      <PageLoader
        variant="orb"
        orbState="connecting"
        size={72}
        title={t('Authenticating session...')}
        subtitle={`Connecting to ${PRODUCT_NAME} console`}
        height="100vh"
      />
    );
  }

  if (!isAuthenticated) {
    if (status && !status.setup_completed && isTauri()) {
      return <Navigate to={ROUTES.WELCOME} replace />;
    }
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (status && !status.setup_completed) {
    return <Navigate to={ROUTES.WELCOME} replace />;
  }

  return <>{children}</>;
};
