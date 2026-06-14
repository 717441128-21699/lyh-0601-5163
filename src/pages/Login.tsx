import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Droplets,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Shield,
  MapPin,
  Activity,
  TrendingDown,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { useUserStore } from '../store/useUserStore';
import { usePermission } from '../hooks/usePermission';

const testAccounts = [
  { username: 'admin', name: '国家级管理员', role: 'national', region: '全国' },
  { username: 'hebei', name: '河北省管理员', role: 'provincial', region: '河北省' },
  { username: 'shijiazhuang', name: '石家庄市管理员', role: 'municipal', region: '河北省石家庄市' },
  { username: 'station1', name: '监测站用户', role: 'station', region: '河北省石家庄市' },
];

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useUserStore();
  const { isNational, isProvincial, isMunicipal, isStation } = usePermission();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    logout();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    try {
      await login({ username: username.trim(), password: password.trim() });
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account: typeof testAccounts[0]) => {
    setUsername(account.username);
    setPassword('123456');
    setError('');
    setLoading(true);
    try {
      await login({ username: account.username, password: '123456' });
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'national':
        return { variant: 'primary' as const, label: '国家级' };
      case 'provincial':
        return { variant: 'info' as const, label: '省级' };
      case 'municipal':
        return { variant: 'success' as const, label: '市级' };
      default:
        return { variant: 'default' as const, label: '监测站' };
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-900 via-primary-900/20 to-dark-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-info-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-success-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '4s' }}
          />
        </div>

        <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col justify-center p-12">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/30">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">地下水监测平台</h1>
              <p className="text-dark-400">智能监测分析系统</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            全国地下水超采
            <br />
            与地面沉降
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-info-400">
              智能监测分析
            </span>
          </h2>

          <p className="text-dark-400 mb-12 text-lg leading-relaxed">
            实时接入各监测井水位、水文地质参数、GNSS地面沉降点及InSAR遥感数据，
            智能分析超采风险，自动预警推送，保障全国地下水安全。
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary-500/20 flex-shrink-0">
                <Activity className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">实时监测</h4>
                <p className="text-sm text-dark-500">300+监测井实时数据接入</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-warning-500/20 flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-warning-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">智能预警</h4>
                <p className="text-sm text-dark-500">三级审批流程管理</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-info-500/20 flex-shrink-0">
                <MapPin className="w-5 h-5 text-info-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">热力图展示</h4>
                <p className="text-sm text-dark-500">全国超采分布一目了然</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success-500/20 flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-success-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">智能分析</h4>
                <p className="text-sm text-dark-500">健康诊断报告自动生成</p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-2 text-dark-500 text-sm">
              <Shield className="w-4 h-4" />
              <span>三级权限管理体系 · 数据安全加密传输</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">地下水监测平台</h1>
              <p className="text-dark-500 text-sm">智能监测分析系统</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">欢迎登录</h2>
          <p className="text-dark-400 mb-8">请输入您的账号密码登录系统</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                用户名
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="h-12"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                密码
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="h-12 pr-12"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-danger-400 flex-shrink-0" />
                <p className="text-sm text-danger-400">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-dark-800 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-400">记住我</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                忘记密码?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              loading={loading}
              disabled={loading}
            >
              {loading ? '登录中...' : '登 录'}
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-sm text-dark-500 mb-4">测试账号（密码均为 123456）：</p>
            <div className="space-y-2">
              {testAccounts.map((account) => {
                const badge = getRoleBadge(account.role);
                return (
                  <button
                    key={account.username}
                    onClick={() => handleQuickLogin(account)}
                    disabled={loading}
                    className={cn(
                      'w-full p-3 rounded-xl border border-white/10 bg-dark-800/50 hover:bg-dark-800 hover:border-primary-500/30 transition-all text-left flex items-center justify-between group',
                      loading && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold">
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{account.name}</p>
                        <p className="text-xs text-dark-500">账号: {account.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={badge.variant} className="text-[10px]">
                        {badge.label}
                      </Badge>
                      <span className="text-xs text-dark-500 group-hover:text-primary-400 transition-colors">
                        {account.region}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 text-center text-xs text-dark-600">
            <p>© 2025 全国地下水超采与地面沉降智能监测分析平台</p>
            <p className="mt-1">登录即表示您同意我们的服务条款和隐私政策</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
