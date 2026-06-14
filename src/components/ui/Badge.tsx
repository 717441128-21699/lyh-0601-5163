import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
  success: 'bg-success-500/20 text-success-300 border-success-500/30',
  warning: 'bg-warning-500/20 text-warning-300 border-warning-500/30',
  danger: 'bg-danger-500/20 text-danger-300 border-danger-500/30',
  info: 'bg-info-500/20 text-info-300 border-info-500/30',
  default: 'bg-dark-700/50 text-dark-300 border-white/10',
};

const dotColors: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  default: 'bg-dark-500',
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};

export const getWarningLevelBadge = (level: string) => {
  const variants: Record<string, BadgeVariant> = {
    primary: 'danger',
    secondary: 'warning',
    tertiary: 'info',
  };
  const labels: Record<string, string> = {
    primary: '一级预警',
    secondary: '二级预警',
    tertiary: '三级预警',
  };
  return { variant: variants[level] || 'default', label: labels[level] || '未知' };
};

export const getWarningStatusBadge = (status: string) => {
  const variants: Record<string, BadgeVariant> = {
    pending_confirm: 'warning',
    confirmed: 'info',
    reviewing: 'primary',
    approved: 'success',
    rejected: 'danger',
    closed: 'default',
  };
  const labels: Record<string, string> = {
    pending_confirm: '待确认',
    confirmed: '已确认',
    reviewing: '审核中',
    approved: '已批准',
    rejected: '已驳回',
    closed: '已关闭',
  };
  return { variant: variants[status] || 'default', label: labels[status] || '未知' };
};

export const getWarningTypeBadge = (type: string) => {
  const variants: Record<string, BadgeVariant> = {
    water_level: 'primary',
    subsidence: 'danger',
  };
  const labels: Record<string, string> = {
    water_level: '水位预警',
    subsidence: '沉降预警',
  };
  return { variant: variants[type] || 'default', label: labels[type] || '未知' };
};

export const getRiskLevelBadge = (risk: string) => {
  const variants: Record<string, BadgeVariant> = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
  };
  const labels: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
  };
  return { variant: variants[risk] || 'default', label: labels[risk] || '未知' };
};

export const getMiningPlanStatusBadge = (status: string) => {
  const variants: Record<string, BadgeVariant> = {
    draft: 'default',
    submitted: 'warning',
    approved: 'success',
    rejected: 'danger',
  };
  const labels: Record<string, string> = {
    draft: '草稿',
    submitted: '已提交',
    approved: '已批准',
    rejected: '已驳回',
  };
  return { variant: variants[status] || 'default', label: labels[status] || '未知' };
};
