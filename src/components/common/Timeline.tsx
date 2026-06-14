import React from 'react';
import { CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'rejected';
  time?: string;
  user?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    iconClass: 'text-dark-500 bg-dark-800',
    lineClass: 'bg-dark-700',
    textClass: 'text-dark-400',
  },
  current: {
    icon: ChevronRight,
    iconClass: 'text-white bg-primary-500 animate-pulse',
    lineClass: 'bg-primary-500',
    textClass: 'text-white',
  },
  completed: {
    icon: CheckCircle,
    iconClass: 'text-white bg-success-500',
    lineClass: 'bg-success-500',
    textClass: 'text-dark-300',
  },
  rejected: {
    icon: XCircle,
    iconClass: 'text-white bg-danger-500',
    lineClass: 'bg-danger-500',
    textClass: 'text-danger-400',
  },
};

export const Timeline: React.FC<TimelineProps> = ({ steps, className }) => {
  return (
    <div className={cn('relative', className)}>
      {steps.map((step, index) => {
        const config = statusConfig[step.status];
        const Icon = config.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative pl-8 pb-6 last:pb-0">
            {!isLast && (
              <div
                className={cn(
                  'absolute left-3 top-6 w-0.5 h-full',
                  config.lineClass
                )}
              />
            )}

            <div
              className={cn(
                'absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center',
                config.iconClass
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>

            <div className={cn('pt-0.5', config.textClass)}>
              <div className="flex items-center gap-2">
                <h4 className={cn(
                  'font-medium',
                  step.status === 'current' ? 'text-primary-400' :
                  step.status === 'rejected' ? 'text-danger-400' :
                  step.status === 'completed' ? 'text-success-400' : 'text-dark-400'
                )}>
                  {step.title}
                </h4>
                {step.time && (
                  <span className="text-xs text-dark-500">{step.time}</span>
                )}
              </div>
              {step.description && (
                <p className="mt-1 text-sm text-dark-500">{step.description}</p>
              )}
              {step.user && (
                <p className="mt-0.5 text-xs text-dark-600">处理人: {step.user}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
