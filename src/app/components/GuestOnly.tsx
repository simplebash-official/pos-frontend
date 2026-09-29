import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  logout,
  selectAuthUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
} from '@/store/slices/authSlice';
import { useSetupStatus } from '@/features/onboarding/hooks/useSetupStatus';
import { ROUTES } from '@/constants/routes';
import { isTauri } from '@/shared/lib/runtime';

export interface GuestOnlyProps {
  children: ReactNode;
}

export const GuestOnly = ({ children }: GuestOnlyProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const user = useAppSelector(selectAuthUser);
  const dispatch = useAppDispatch();
  const location = useLocation();

  // An "Open POS" link from the SimpleBash app names the account that just
  // signed in (`?email=`). A saved session for a different account must not
  // swallow that hand-off and show the previous user's shop.
  const linkedEmail = new URLSearchParams(location.search).get('email')?.trim().toLowerCase();
  const staleSession =
    isInitialized &&
    isAuthenticated &&
    Boolean(linkedEmail) &&
    Boolean(user?.email) &&
    user?.email.trim().toLowerCase() !== linkedEmail;

  useEffect(() => {
    if (staleSession) {
      dispatch(logout());
    }
  }, [staleSession, dispatch]);

  const { data: status } = useSetupStatus();

  if (status && !status.setup_completed && isTauri()) {
    return <Navigate to={ROUTES.WELCOME} replace />;
  }

  if (isInitialized && isAuthenticated && !staleSession) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
