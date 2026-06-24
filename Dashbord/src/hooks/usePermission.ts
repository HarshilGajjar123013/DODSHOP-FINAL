'use client';

import { useAdminStore } from '@/store/adminStore';
import {
  Permission,
  hasPermission as checkPermission,
  hasAllPermissions as checkAllPermissions,
  hasAnyPermission as checkAnyPermission,
  getPermissions as getRolePermissions,
} from '@/lib/permissions';

export function usePermission() {
  const { role } = useAdminStore();

  const can = (permission: Permission): boolean => {
    return checkPermission(role, permission);
  };

  const canAll = (permissions: Permission[]): boolean => {
    return checkAllPermissions(role, permissions);
  };

  const canAny = (permissions: Permission[]): boolean => {
    return checkAnyPermission(role, permissions);
  };

  const myPermissions = (): Permission[] => {
    return getRolePermissions(role);
  };

  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isManager = role === 'MANAGER';

  return {
    can,
    canAll,
    canAny,
    getPermissions: myPermissions,
    isSuperAdmin,
    isManager,
    role,
  };
}
