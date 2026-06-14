import React, { useState } from 'react';
import { Bell, Search, Menu, LogOut, ChevronDown, Settings, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUserStore } from '../../store/useUserStore';
import { usePermission } from '../../hooks/usePermission';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, sidebarCollapsed }) => {
  const { user, logout } = useUserStore();
  const { isNational, isProvincial, isMunicipal } = usePermission();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, title: '新预警生成', content: '河北省沧州市出现一级水位预警', time: '5分钟前', unread: true, type: 'warning' },
    { id: 2, title: '审批待办', content: '山东省开采计划待您审批', time: '1小时前', unread: true, type: 'info' },
    { id: 3, title: '周报生成', content: '本周健康诊断报告已生成', time: '2小时前', unread: false, type: 'success' },
  ]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const getRoleBadge = () => {
    if (isNational) return { variant: 'primary' as const, label: '国家级' };
    if (isProvincial) return { variant: 'info' as const, label: '省级' };
    if (isMunicipal) return { variant: 'success' as const, label: '市级' };
    return { variant: 'default' as const, label: '监测站' };
  };

  const roleBadge = getRoleBadge();
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-white/10 z-30 transition-all duration-300',
        sidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="搜索监测井、区域、预警..."
              className="w-80 h-9 pl-10 pr-4 bg-dark-800/50 border border-white/10 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 rounded-full text-[10px] text-white font-medium flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-3 border-b border-white/10">
                  <h3 className="font-medium text-white">通知中心</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors',
                        notification.unread && 'bg-primary-500/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Badge variant={notification.type as any} dot={notification.unread}>
                          {notification.title}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-dark-300">{notification.content}</p>
                      <p className="mt-1 text-xs text-dark-500">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-white/10">
                  <button className="w-full py-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
                    查看全部通知
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pl-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <div className="flex items-center gap-1">
                  <Badge variant={roleBadge.variant} className="text-[10px] py-0 px-1.5">
                    {roleBadge.label}
                  </Badge>
                  <span className="text-xs text-dark-500">{user?.provinceName || '全国'}</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-dark-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                      {user?.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-dark-400">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-dark-300 hover:text-white hover:bg-white/5 transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm">个人信息</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-dark-300 hover:text-white hover:bg-white/5 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">系统设置</span>
                  </button>
                </div>
                <div className="p-2 border-t border-white/10">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-danger-400 hover:text-danger-300 hover:bg-danger-500/10"
                    onClick={handleLogout}
                    leftIcon={<LogOut className="w-4 h-4" />}
                  >
                    退出登录
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
