import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectUserPermissions } from '@/store/slices/authSlice';
import { ROUTES } from '@/constants/routes';
import type { Permission } from '@/constants/permissions';

export interface RequirePermissionProps {
  /** Any one of these grants access (OR semantics, matching the backend's `require_any_permission`). */
  permissions: Permission[];
  children: ReactNode;
}

/**
 * Route guard for anything backed by the backend's `require_permission`/
 * `require_any_permission` check. For a route backed by the backend's
 * `AdminUser` extractor instead (e.g. Suppliers), use `RequireAdmin`.
 */
export const RequirePermission = ({ permissions, children }: RequirePermissionProps) => {
  const mine = useAppSelector(selectUserPermissions);

  if (!permissions.some((permission) => mine.includes(permission))) {
    return <Navigate to={ROUTES.BILLING} replace />;
  }

  return <>{children}</>;
};
