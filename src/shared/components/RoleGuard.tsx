import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/authSlice';
import { UserRole } from '@/constants/roles';
import { Alert } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const currentRole = useAppSelector(selectUserRole);

  if (!allowedRoles.includes(currentRole)) {
    if (fallback) return <>{fallback}</>;
    return (
      <Alert color="red" icon={<IconLock size={16} />} title="Access Restricted">
        Your role ({currentRole}) does not have permission to view this section or financial
        details.
      </Alert>
    );
  }

  return <>{children}</>;
}
