import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Mail,
  Phone,
  UserCheck,
  UserX,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input, Select, TextArea } from '../components/ui/Input';
import {
  LoadingOverlay,
  Tabs,
  TabPanel,
  Modal,
  StatCard,
} from '../components/common';
import { useUserStore } from '../store/useUserStore';
import { useDataStore } from '../store/useDataStore';
import { usePermission } from '../hooks/usePermission';
import { cn } from '../lib/utils';
import { formatDate } from '../utils/date';
import type { User, UserRole } from '../types';

const roleConfig: Record<UserRole, { label: string; color: 'primary' | 'info' | 'success' | 'default' }> = {
  national: { label: '国家级管理员', color: 'primary' },
  provincial: { label: '省级管理员', color: 'info' },
  municipal: { label: '市级管理员', color: 'success' },
  station: { label: '监测站用户', color: 'default' },
};

const PermissionManagement: React.FC = () => {
  const { isNational, isProvincial, dataScope } = usePermission();
  const { user: currentUser } = useUserStore();
  const { provinces, cities, loadProvinces, loadCities } = useDataStore();
  const {
    users,
    loading,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useUserStore();

  const [activeTab, setActiveTab] = useState('users');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    role: 'station' as UserRole,
    provinceId: '',
    cityId: '',
    status: 'active' as 'active' | 'disabled',
    password: '123456',
  });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadUsers(), loadProvinces()]);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (formData.provinceId) {
      loadCities(formData.provinceId);
    }
  }, [formData.provinceId]);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (!isNational) {
      result = result.filter((u) => {
        if (currentUser?.role === 'provincial') {
          return u.provinceId === currentUser.provinceId;
        }
        if (currentUser?.role === 'municipal') {
          return u.cityId === currentUser.cityId;
        }
        return false;
      });
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(keyword) ||
          u.username.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword)
      );
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    if (statusFilter) {
      result = result.filter((u) => u.status === statusFilter);
    }

    return result;
  }, [users, isNational, currentUser, searchKeyword, roleFilter, statusFilter]);

  const userStats = useMemo(() => {
    const total = filteredUsers.length;
    const national = filteredUsers.filter((u) => u.role === 'national').length;
    const provincial = filteredUsers.filter((u) => u.role === 'provincial').length;
    const municipal = filteredUsers.filter((u) => u.role === 'municipal').length;
    const active = filteredUsers.filter((u) => u.status === 'active').length;

    return { total, national, provincial, municipal, active };
  }, [filteredUsers]);

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      name: '',
      email: '',
      phone: '',
      role: 'station',
      provinceId: currentUser?.provinceId || '',
      cityId: currentUser?.cityId || '',
      status: 'active',
      password: '123456',
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      provinceId: user.provinceId || '',
      cityId: user.cityId || '',
      status: user.status,
      password: '',
    });
    setShowUserModal(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('删除用户失败:', error);
    }
  };

  const handleSubmitUser = async () => {
    try {
      if (editingUser) {
        const updateData: Partial<User> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          provinceId: formData.provinceId || undefined,
          cityId: formData.cityId || undefined,
          status: formData.status,
        };
        if (formData.password) {
          (updateData as any).password = formData.password;
        }
        await updateUser({ id: editingUser.id, ...updateData });
      } else {
        await createUser({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          provinceId: formData.provinceId || undefined,
          cityId: formData.cityId || undefined,
          status: formData.status,
        });
      }
      setShowUserModal(false);
    } catch (error) {
      console.error('保存用户失败:', error);
    }
  };

  const roleOptions = [
    { value: '', label: '全部角色' },
    { value: 'national', label: '国家级管理员' },
    { value: 'provincial', label: '省级管理员' },
    { value: 'municipal', label: '市级管理员' },
    { value: 'station', label: '监测站用户' },
  ];

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'active', label: '正常' },
    { value: 'disabled', label: '禁用' },
  ];

  const availableProvinces = useMemo(() => {
    if (isNational) return provinces;
    if (dataScope.provinceIds) {
      return provinces.filter((p) => dataScope.provinceIds!.includes(p.id));
    }
    return [];
  }, [provinces, isNational, dataScope]);

  const availableCities = useMemo(() => {
    if (formData.provinceId) {
      if (isProvincial && dataScope.cityIds) {
        return cities.filter((c) => dataScope.cityIds!.includes(c.id));
      }
      return cities.filter((c) => c.provinceId === formData.provinceId);
    }
    return [];
  }, [cities, formData.provinceId, isProvincial, dataScope]);

  const rolePermissionDescriptions: Record<UserRole, string[]> = {
    national: [
      '查看全国所有监测数据和统计报表',
      '管理所有用户账号和权限',
      '审批所有预警和开采计划',
      '生成全国性健康诊断报告',
    ],
    provincial: [
      '查看本省所有监测数据和统计报表',
      '管理本省用户账号和权限',
      '审核本省预警和开采计划',
      '生成本省健康诊断报告',
    ],
    municipal: [
      '查看本市所有监测数据和统计报表',
      '管理本市用户账号',
      '确认本市预警信息',
      '查看本市健康诊断报告',
    ],
    station: [
      '查看所辖监测井的实时数据',
      '确认本站负责的预警信息',
      '录入监测数据',
      '查看本站相关报告',
    ],
  };

  return (
    <div className="relative min-h-full">
      <LoadingOverlay visible={loading} text="正在加载权限管理数据..." />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary-400" />
              权限管理
            </h1>
            <p className="mt-1 text-dark-400">用户账号管理与权限配置</p>
          </div>

          {(isNational || isProvincial) && (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddUser}
            >
              添加用户
            </Button>
          )}
        </div>
      </div>

      <Tabs
        tabs={[
          { key: 'users', label: '用户管理', icon: <Users className="w-4 h-4" /> },
          { key: 'roles', label: '角色权限', icon: <Shield className="w-4 h-4" /> },
        ]}
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <TabPanel activeKey="users" itemKey="users">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard
              title="总用户数"
              value={userStats.total}
              unit="人"
              icon={<Users className="w-5 h-5" />}
              color="primary"
            />
            <StatCard
              title="国家级"
              value={userStats.national}
              unit="人"
              icon={<Shield className="w-5 h-5" />}
              color="primary"
            />
            <StatCard
              title="省级"
              value={userStats.provincial}
              unit="人"
              icon={<MapPin className="w-5 h-5" />}
              color="info"
            />
            <StatCard
              title="市级"
              value={userStats.municipal}
              unit="人"
              icon={<MapPin className="w-5 h-5" />}
              color="success"
            />
            <StatCard
              title="正常账号"
              value={userStats.active}
              unit="人"
              icon={<UserCheck className="w-5 h-5" />}
              color="success"
            />
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                    <Input
                      placeholder="搜索用户名、姓名、邮箱..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="w-64 pl-10"
                    />
                  </div>

                  <Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                    className="w-36"
                  >
                    {roleOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-32"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  leftIcon={<RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />}
                  onClick={loadUsers}
                >
                  刷新
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                      用户名
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                      姓名
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                      所属区域
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                      邮箱
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                      手机号
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((user) => {
                    const roleBadge = roleConfig[user.role];
                    const province = provinces.find((p) => p.id === user.provinceId);
                    const city = cities.find((c) => c.id === user.cityId);
                    const region = city ? `${province?.name} ${city.name}` : province?.name || '全国';

                    return (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-sm font-mono text-dark-300">
                          {user.username}
                        </td>
                        <td className="py-3 px-4 text-sm text-white font-medium">{user.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant={roleBadge.color}>{roleBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-dark-500" />
                            <span className="text-sm text-dark-300">{region}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-4 h-4 text-dark-500" />
                            <span className="text-sm text-dark-300 truncate max-w-[150px]">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-4 h-4 text-dark-500" />
                            <span className="text-sm text-dark-300">{user.phone}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {user.status === 'active' ? (
                            <Badge variant="success" dot>
                              正常
                            </Badge>
                          ) : (
                            <Badge variant="default" dot>
                              禁用
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-dark-400">
                          {formatDate(user.createdAt, 'yyyy-MM-dd')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {(isNational ||
                              (isProvincial && user.role !== 'national') ||
                              (currentUser?.role === 'municipal' &&
                                user.role === 'station' &&
                                user.cityId === currentUser.cityId)) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  leftIcon={<Edit2 className="w-4 h-4" />}
                                  onClick={() => handleEditUser(user)}
                                >
                                  编辑
                                </Button>
                                {user.id !== currentUser?.id &&
                                  user.role !== 'national' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-danger-400 hover:text-danger-300 hover:bg-danger-500/10"
                                      leftIcon={<Trash2 className="w-4 h-4" />}
                                      onClick={() => handleDeleteClick(user)}
                                    >
                                      删除
                                    </Button>
                                  )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="py-12 text-center">
                <Users className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400">暂无用户数据</p>
              </div>
            )}
          </Card>
        </TabPanel>

        <TabPanel activeKey="roles" itemKey="roles">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(Object.keys(roleConfig) as UserRole[]).map((role) => {
              const config = roleConfig[role];
              const count = users.filter((u) => u.role === role).length;

              return (
                <Card key={role} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={cn(
                            'p-3 rounded-xl',
                            config.color === 'primary' && 'bg-primary-500/20',
                            config.color === 'info' && 'bg-info-500/20',
                            config.color === 'success' && 'bg-success-500/20',
                            config.color === 'default' && 'bg-dark-700'
                          )}
                        >
                          <Shield
                            className={cn(
                              'w-6 h-6',
                              config.color === 'primary' && 'text-primary-400',
                              config.color === 'info' && 'text-info-400',
                              config.color === 'success' && 'text-success-400',
                              config.color === 'default' && 'text-dark-400'
                            )}
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {config.label}
                          </h3>
                          <p className="text-sm text-dark-400">当前用户数: {count} 人</p>
                        </div>
                      </div>
                    </div>
                    <Badge variant={config.color}>{config.label}</Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-dark-400 mb-3">权限说明</h4>
                    {rolePermissionDescriptions[role].map((desc, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-dark-300">{desc}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-sm font-medium text-dark-400 mb-2">数据范围</h4>
                    <p className="text-sm text-dark-300">
                      {role === 'national'
                        ? '全国所有省份、地市数据'
                        : role === 'provincial'
                        ? '本省所有地市数据'
                        : role === 'municipal'
                        ? '本市所有区县数据'
                        : '本站所辖监测井数据'}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabPanel>
      </Tabs>

      <Modal
        visible={showUserModal}
        title={editingUser ? '编辑用户' : '添加用户'}
        onClose={() => setShowUserModal(false)}
        onConfirm={handleSubmitUser}
        confirmLoading={loading}
        confirmText={editingUser ? '保存修改' : '创建用户'}
        width={560}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                用户名 <span className="text-danger-400">*</span>
              </label>
              <Input
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="请输入用户名"
                disabled={!!editingUser}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                姓名 <span className="text-danger-400">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入姓名"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                邮箱 <span className="text-danger-400">*</span>
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                手机号 <span className="text-danger-400">*</span>
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入手机号"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">
                角色 <span className="text-danger-400">*</span>
              </label>
              <Select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as UserRole,
                    provinceId: e.target.value === 'national' ? '' : formData.provinceId,
                    cityId:
                      e.target.value === 'national' || e.target.value === 'provincial'
                        ? ''
                        : formData.cityId,
                  })
                }
                required
              >
                {roleOptions
                  .filter((o) => o.value !== '')
                  .map((opt) => {
                    const disabled =
                      !isNational &&
                      ((currentUser?.role === 'provincial' &&
                        (opt.value === 'national' || opt.value === 'provincial')) ||
                        (currentUser?.role === 'municipal' &&
                          opt.value !== 'station'));
                    return (
                      <option key={opt.value} value={opt.value} disabled={disabled}>
                        {opt.label}
                      </option>
                    );
                  })}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">状态</label>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'disabled',
                  })
                }
              >
                <option value="active">正常</option>
                <option value="disabled">禁用</option>
              </Select>
            </div>
          </div>

          {formData.role !== 'national' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">
                  省份 {formData.role !== 'station' && <span className="text-danger-400">*</span>}
                </label>
                <Select
                  value={formData.provinceId}
                  onChange={(e) =>
                    setFormData({ ...formData, provinceId: e.target.value, cityId: '' })
                  }
                  disabled={!isNational && !!currentUser?.provinceId}
                  required={formData.role !== 'station'}
                >
                  <option value="">请选择省份</option>
                  {availableProvinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </div>
              {formData.role === 'municipal' && (
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    城市 <span className="text-danger-400">*</span>
                  </label>
                  <Select
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    disabled={!isNational && !isProvincial && !!currentUser?.cityId}
                    required
                  >
                    <option value="">请选择城市</option>
                    {availableCities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              密码 {!editingUser && <span className="text-danger-400">*</span>}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingUser ? '不修改请留空' : '请输入密码，默认123456'}
              required={!editingUser}
            />
            {!editingUser && (
              <p className="mt-1 text-xs text-dark-500">默认密码: 123456</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        visible={showDeleteConfirm}
        title="确认删除用户"
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        confirmLoading={loading}
        confirmText="确认删除"
        confirmVariant="danger"
        width={480}
      >
        <div className="space-y-4">
          <div className="p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-danger-400">此操作不可撤销</p>
                <p className="text-sm text-dark-400 mt-1">
                  删除用户后，该账号将无法登录系统，相关数据将被保留。
                </p>
              </div>
            </div>
          </div>

          {userToDelete && (
            <div className="p-4 bg-dark-800/50 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                  {userToDelete.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{userToDelete.name}</p>
                  <p className="text-sm text-dark-400">@{userToDelete.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={roleConfig[userToDelete.role].color}>
                  {roleConfig[userToDelete.role].label}
                </Badge>
                <Badge
                  variant={userToDelete.status === 'active' ? 'success' : 'default'}
                  dot
                >
                  {userToDelete.status === 'active' ? '正常' : '禁用'}
                </Badge>
              </div>
            </div>
          )}

          <p className="text-sm text-dark-400">
            请确认是否要删除该用户？此操作不可撤销。
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionManagement;
