import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { USER_ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';

export interface RequireAdminProps {
  children: ReactNode;
}

export const RequireAdmin = ({ children }: RequireAdminProps) => {
  const role = useAppSelector(selectUserRole);

  if (role !== USER_ROLES.ADMIN) {
    return <Navigate to={ROUTES.BILLING} replace />;
  }

  return <>{children}</>;
};
