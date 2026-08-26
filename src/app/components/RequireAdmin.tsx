import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

export interface RequireAdminProps {
  children: ReactNode;
}

/**
 * Route guard for anything backed by the backend's `AdminUser` extractor
 * (e.g. Suppliers, which requires Admin on every route including reads —
 * not just a permission). For a route backed by `require_permission`/
 * `require_any_permission` instead, use `RequirePermission`.
 */
export const RequireAdmin = ({ children }: RequireAdminProps) => {
  const role = useAppSelector(selectUserRole);

  if (role !== USER_ROLES.ADMIN) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
