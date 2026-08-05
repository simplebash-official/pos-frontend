import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import {
  selectIsAuthenticated,
  selectIsAuthInitialized,
  selectIsAuthLoading,
} from '@/store/slices/authSlice';
import { PageLoader } from '@/shared/components/PageLoader';
import { ROUTES } from '@/constants/routes';

export interface RequireAuthProps {
  children: ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const isLoading = useAppSelector(selectIsAuthLoading);
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return <PageLoader title="Authenticating session..." height="100vh" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
