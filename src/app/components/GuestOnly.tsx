import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, selectIsAuthenticated, selectIsAuthInitialized } from '@/store/slices/authSlice';
import { useSetupStatus } from '@/features/onboarding/hooks/useSetupStatus';
import { ROUTES } from '@/constants/routes';
import { isTauri } from '@/shared/lib/runtime';
import {
  getRememberedShopCode,
  getShopCodeFromLink,
  isShopCodeRequired,
} from '@/features/auth/lib/shopCode';

export interface GuestOnlyProps {
  children: ReactNode;
}

export const GuestOnly = ({ children }: GuestOnlyProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const dispatch = useAppDispatch();
  const location = useLocation();

  // An "Open POS" link from the SimpleBash app names the shop (`?shop=`). A
  // saved session from a different shop must not swallow that hand-off and
  // show the previous shop's data.
  const linkedShop = getShopCodeFromLink(location.search);
  const staleSession =
    isInitialized &&
    isAuthenticated &&
    isShopCodeRequired() &&
    linkedShop !== '' &&
    getRememberedShopCode() !== linkedShop;

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
