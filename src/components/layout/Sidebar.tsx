import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  FileBarChart,
  FileText,
  Users,
  Droplets,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePermission } from '../../hooks/usePermission';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  Map: <Map className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
  FileBarChart: <FileBarChart className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { menuItems, user } = usePermission();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-dark-900/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-40',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-white whitespace-nowrap">
                  地下水监测平台
                </h1>
                <p className="text-xs text-dark-400 whitespace-nowrap">
                  智能监测分析系统
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                      isActive
                        ? 'bg-primary-500/20 text-primary-300'
                        : 'text-dark-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span
                      className={cn(
                        'flex-shrink-0 transition-colors',
                        isActive ? 'text-primary-400' : 'text-dark-400 group-hover:text-primary-400'
                      )}
                    >
                      {iconMap[item.icon]}
                    </span>
                    {!collapsed && (
                      <span className="font-medium whitespace-nowrap">{item.label}</span>
                    )}
                    {isActive && !collapsed && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {!collapsed && user && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-dark-400 truncate">
                  {user.role === 'national'
                    ? '国家级管理员'
                    : user.role === 'provincial'
                    ? '省级管理员'
                    : user.role === 'municipal'
                    ? '市级管理员'
                    : '监测站用户'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
