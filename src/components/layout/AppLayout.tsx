import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUserStore } from '../../store/useUserStore';
import { usePermission } from '../../hooks/usePermission';
import { LoadingOverlay } from '../common';
import { cn } from '../../lib/utils';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading, checkAuth } = useUserStore();
  const { menuItems, canViewRegionData } = usePermission();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuth();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    verifyAuth();
  }, []);

  useEffect(() => {
    if (!initialLoading && !user && !authLoading) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, authLoading, initialLoading, navigate, location]);

  if (initialLoading || authLoading || !user) {
    return (
      <div className="h-screen bg-dark-900 flex items-center justify-center">
        <LoadingOverlay visible text="正在验证身份..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <Header
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />

      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
