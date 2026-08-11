import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectIsAuthInitialized } from '@/store/slices/authSlice';
import { ROUTES } from '@/constants/routes';

export interface GuestOnlyProps {
  children: ReactNode;
}

export const GuestOnly = ({ children }: GuestOnlyProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);

  if (isInitialized && isAuthenticated) {
    return <Navigate to={ROUTES.BILLING} replace />;
  }

  return <>{children}</>;
};
