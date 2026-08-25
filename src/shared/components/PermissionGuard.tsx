import React from 'react';
import { Alert } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useHasAnyPermission } from '@/shared/hooks/usePermissions';
import type { Permission } from '@/constants/permissions';

interface PermissionGuardProps {
  /** Any one of these grants access (OR semantics, matching the backend's `require_any_permission`). */
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard = ({ permissions, children, fallback }: PermissionGuardProps) => {
  const allowed = useHasAnyPermission(permissions);

  if (!allowed) {
    if (fallback) return <>{fallback}</>;
    return (
      <Alert color="red" icon={<IconLock size={16} />} title="Access Restricted">
        You do not have permission to view this section.
      </Alert>
    );
  }

  return <>{children}</>;
};
