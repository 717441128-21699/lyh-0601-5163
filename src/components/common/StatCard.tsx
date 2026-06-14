import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

const colorClasses = {
  primary: 'from-primary-500/20 to-primary-600/5 border-primary-500/20',
  success: 'from-success-500/20 to-success-600/5 border-success-500/20',
  warning: 'from-warning-500/20 to-warning-600/5 border-warning-500/20',
  danger: 'from-danger-500/20 to-danger-600/5 border-danger-500/20',
  info: 'from-info-500/20 to-info-600/5 border-info-500/20',
  default: 'from-dark-800/50 to-dark-900/50 border-white/10',
};

const iconBgClasses = {
  primary: 'bg-primary-500/20 text-primary-400',
  success: 'bg-success-500/20 text-success-400',
  warning: 'bg-warning-500/20 text-warning-400',
  danger: 'bg-danger-500/20 text-danger-400',
  info: 'bg-info-500/20 text-info-400',
  default: 'bg-dark-800 text-dark-400',
};

const trendClasses = {
  up: 'text-success-400',
  down: 'text-danger-400',
  stable: 'text-dark-400',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon,
  color = 'primary',
  loading = false,
  className,
  onClick,
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  if (loading) {
    return (
      <Card className={cn('p-5 animate-pulse', className)}>
        <div className="h-5 w-24 bg-dark-700 rounded mb-3" />
        <div className="h-8 w-32 bg-dark-700 rounded mb-2" />
        <div className="h-4 w-16 bg-dark-700 rounded" />
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'p-5 bg-gradient-to-br border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
        colorClasses[color],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-dark-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white">{value}</span>
            {unit && <span className="text-sm text-dark-400">{unit}</span>}
          </div>
          {trend && trendValue && (
            <div className={cn('mt-2 flex items-center gap-1 text-sm', trendClasses[trend])}>
              <TrendIcon className="w-4 h-4" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl', iconBgClasses[color])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
