import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActiveKey?: string;
  activeKey?: string;
  onChange?: (key: string) => void;
  className?: string;
  tabClassName?: string;
  variant?: 'default' | 'pills' | 'underline';
  children?: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveKey,
  activeKey: controlledActiveKey,
  onChange,
  className,
  tabClassName,
  variant = 'default',
  children,
}) => {
  const [internalActiveKey, setInternalActiveKey] = useState(
    defaultActiveKey || tabs[0]?.key || ''
  );

  const activeKey = controlledActiveKey ?? internalActiveKey;

  const handleTabClick = (key: string) => {
    if (controlledActiveKey === undefined) {
      setInternalActiveKey(key);
    }
    onChange?.(key);
  };

  const variantClasses = {
    default: 'gap-1 bg-dark-800/50 p-1 rounded-xl',
    pills: 'gap-2',
    underline: 'gap-0 border-b border-white/10 rounded-none bg-transparent p-0',
  };

  const tabVariantClasses = {
    default: (isActive: boolean) =>
      cn(
        'px-4 py-2 rounded-lg transition-all',
        isActive
          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
          : 'text-dark-400 hover:text-white hover:bg-white/5'
      ),
    pills: (isActive: boolean) =>
      cn(
        'px-4 py-2 rounded-xl transition-all',
        isActive
          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
          : 'text-dark-400 hover:text-white border border-transparent hover:border-white/10'
      ),
    underline: (isActive: boolean) =>
      cn(
        'px-4 py-3 border-b-2 transition-all -mb-px',
        isActive
          ? 'text-primary-400 border-primary-500'
          : 'text-dark-400 hover:text-white border-transparent hover:border-white/20'
      ),
  };

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('flex flex-wrap', variantClasses[variant])}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => !tab.disabled && handleTabClick(tab.key)}
            disabled={tab.disabled}
            className={cn(
              'flex items-center gap-2 text-sm font-medium whitespace-nowrap',
              tabVariantClasses[variant](activeKey === tab.key),
              tab.disabled && 'opacity-50 cursor-not-allowed',
              tabClassName
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {children && (
        <div className="mt-4">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === TabPanel) {
              return React.cloneElement(child as React.ReactElement<TabPanelProps>, {
                activeKey,
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

interface TabPanelProps {
  activeKey: string;
  itemKey: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  activeKey,
  itemKey,
  children,
  className,
}) => {
  if (activeKey !== itemKey) return null;

  return <div className={cn('mt-4', className)}>{children}</div>;
};
