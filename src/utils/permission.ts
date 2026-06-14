import type { UserRole, User } from '../types';

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    national: '国家级管理员',
    provincial: '省级管理员',
    municipal: '市级管理员',
    station: '监测站用户',
  };
  return labels[role];
};

export const getRoleLevel = (role: UserRole): number => {
  const levels: Record<UserRole, number> = {
    national: 4,
    provincial: 3,
    municipal: 2,
    station: 1,
  };
  return levels[role];
};

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};

export const canViewRegion = (
  user: User,
  regionProvinceId?: string,
  regionCityId?: string
): boolean => {
  switch (user.role) {
    case 'national':
      return true;
    case 'provincial':
      return user.provinceId === regionProvinceId;
    case 'municipal':
      return user.provinceId === regionProvinceId && user.cityId === regionCityId;
    case 'station':
      return user.provinceId === regionProvinceId && user.cityId === regionCityId;
    default:
      return false;
  }
};

export const canApproveStep = (user: User, stepRole: UserRole): boolean => {
  return user.role === stepRole;
};

export const getNextApprovalRole = (currentStep: number): UserRole | null => {
  const roles: UserRole[] = ['station', 'provincial', 'national'];
  if (currentStep < roles.length) {
    return roles[currentStep];
  }
  return null;
};

export const getAvailableRegions = (
  user: User,
  allProvinces: { id: string; name: string }[],
  allCities: { id: string; provinceId: string; name: string }[]
) => {
  switch (user.role) {
    case 'national':
      return {
        provinces: allProvinces,
        cities: allCities,
      };
    case 'provincial':
      return {
        provinces: allProvinces.filter(p => p.id === user.provinceId),
        cities: allCities.filter(c => c.provinceId === user.provinceId),
      };
    case 'municipal':
    case 'station':
      return {
        provinces: allProvinces.filter(p => p.id === user.provinceId),
        cities: allCities.filter(c => c.id === user.cityId),
      };
    default:
      return { provinces: [], cities: [] };
  }
};

export const getMenuItems = (role: UserRole) => {
  const allItems = [
    { path: '/dashboard', label: '核心看板', icon: 'LayoutDashboard', roles: ['national', 'provincial', 'municipal', 'station'] as UserRole[] },
    { path: '/region', label: '区域详情', icon: 'Map', roles: ['national', 'provincial', 'municipal', 'station'] as UserRole[] },
    { path: '/warning', label: '预警管理', icon: 'AlertTriangle', roles: ['national', 'provincial', 'municipal', 'station'] as UserRole[] },
    { path: '/mining-plan', label: '开采计划', icon: 'FileBarChart', roles: ['national', 'provincial', 'municipal'] as UserRole[] },
    { path: '/report', label: '健康诊断', icon: 'FileText', roles: ['national', 'provincial', 'municipal'] as UserRole[] },
    { path: '/permission', label: '权限管理', icon: 'Users', roles: ['national', 'provincial'] as UserRole[] },
  ];

  return allItems.filter(item => item.roles.includes(role));
};
