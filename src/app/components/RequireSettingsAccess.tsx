import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { canOpenSettings } from '@/features/settings/settingsSections';
import { useSettingsAccess } from '@/features/settings/hooks/useSettingsAccess';

export interface RequireSettingsAccessProps {
  children: ReactNode;
}

/**
 * Route guard for Settings: an Admin, or anyone holding the permission of at least one section
 * (for example a Manager who may manage the landlords and companies list). Which sections they
 * then see is decided by the page itself.
 */
export const RequireSettingsAccess = ({ children }: RequireSettingsAccessProps) => {
  if (!canOpenSettings(useSettingsAccess())) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return <>{children}</>;
};
