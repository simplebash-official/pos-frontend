import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectIsAuthInitialized } from '@/store/slices/authSlice';
import { useSetupStatus } from '@/features/onboarding/hooks/useSetupStatus';
import { ROUTES } from '@/constants/routes';

export interface GuestOnlyProps {
  children: ReactNode;
}

export const GuestOnly = ({ children }: GuestOnlyProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const { data: status, isLoading: isStatusLoading } = useSetupStatus();

  if (!isStatusLoading && status && !status.setup_completed) {
    return <Navigate to={ROUTES.WELCOME} replace />;
  }

  if (isInitialized && isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
