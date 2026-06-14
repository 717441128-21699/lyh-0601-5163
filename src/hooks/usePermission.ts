import { useMemo } from 'react';
import { useUserStore } from '../store/useUserStore';
import { getMenuItems, canViewRegion, hasPermission as checkPermission } from '../utils/permission';
import type { UserRole, Warning } from '../types';

export const usePermission = () => {
  const { user } = useUserStore();

  const menuItems = useMemo(() => {
    if (!user) return [];
    return getMenuItems(user.role);
  }, [user]);

  const canViewRegionData = (provinceId?: string, cityId?: string) => {
    if (!user) return false;
    return canViewRegion(user, provinceId, cityId);
  };

  const hasPermission = (requiredRole: UserRole) => {
    if (!user) return false;
    return checkPermission(user.role, requiredRole);
  };

  const canApproveStep = (warning: Warning | UserRole, stepOrder?: number) => {
    if (!user) return false;

    if (typeof warning === 'string') {
      return user.role === warning;
    }

    if (stepOrder !== undefined) {
      const step = warning.approvalProcess.find((s) => s.stepOrder === stepOrder);
      if (!step || step.status !== 'pending') return false;
      return user.role === step.role;
    }

    return false;
  };

  const isNational = user?.role === 'national';
  const isProvincial = user?.role === 'provincial';
  const isMunicipal = user?.role === 'municipal';
  const isStation = user?.role === 'station';

  const dataScope = useMemo(() => {
    if (!user) return { provinceIds: [], cityIds: [] };

    switch (user.role) {
      case 'national':
        return { provinceIds: [], cityIds: [], scope: 'national' as const };
      case 'provincial':
        return {
          provinceIds: user.provinceId ? [user.provinceId] : [],
          cityIds: [],
          scope: 'provincial' as const,
        };
      case 'municipal':
      case 'station':
        return {
          provinceIds: user.provinceId ? [user.provinceId] : [],
          cityIds: user.cityId ? [user.cityId] : [],
          scope: 'municipal' as const,
        };
      default:
        return { provinceIds: [], cityIds: [], scope: 'none' as const };
    }
  }, [user]);

  return {
    user,
    menuItems,
    canViewRegionData,
    hasPermission,
    canApproveStep,
    isNational,
    isProvincial,
    isMunicipal,
    isStation,
    dataScope,
  };
};
