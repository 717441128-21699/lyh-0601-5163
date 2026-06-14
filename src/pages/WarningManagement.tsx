import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  MapPin,
  Activity,
  Droplets,
  TrendingDown,
  RefreshCw,
  ArrowLeft,
  FileText,
  Send,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, getWarningLevelBadge, getWarningStatusBadge, getWarningTypeBadge, getRiskLevelBadge } from '../components/ui/Badge';
import { Input, Select, TextArea } from '../components/ui/Input';
import {
  LoadingOverlay,
  Pagination,
  Timeline,
  Drawer,
  Modal,
  StatCard,
} from '../components/common';
import { LineChart, PieChart } from '../components/charts';
import { useWarningStore } from '../store/useWarningStore';
import { usePermission } from '../hooks/usePermission';
import { cn } from '../lib/utils';
import { formatDate } from '../utils/date';
import type { Warning, WarningStatus, WarningType } from '../types';

const WarningManagement: React.FC = () => {
  const { warningId } = useParams<{ warningId?: string }>();
  const navigate = useNavigate();
  const { canApproveStep, isStation, isProvincial, isNational } = usePermission();

  const {
    warnings,
    selectedWarning,
    total,
    page,
    pageSize,
    loading,
    loadWarnings,
    loadWarningById,
    confirmWarning,
    reviewWarning,
    approveWarning,
    rejectWarning,
    closeWarning,
    setPage,
    clearSelectedWarning,
  } = useWarningStore();

  const [statusFilter, setStatusFilter] = useState<WarningStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<WarningType | ''>('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalType, setApprovalType] = useState<'confirm' | 'review' | 'approve' | 'reject'>('confirm');
  const [approvalOpinion, setApprovalOpinion] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectOpinion, setRejectOpinion] = useState('');

  useEffect(() => {
    loadWarnings({
      status: statusFilter || undefined,
      type: typeFilter || undefined,
    });
  }, [statusFilter, typeFilter, page]);

  useEffect(() => {
    if (warningId) {
      loadWarningById(warningId);
      setShowDetail(true);
    }
  }, [warningId]);

  useEffect(() => {
    if (showDetail && selectedWarning) {
      //
    } else if (!showDetail) {
      clearSelectedWarning();
    }
  }, [showDetail, selectedWarning]);

  const filteredWarnings = useMemo(() => {
    if (!searchKeyword) return warnings;
    const keyword = searchKeyword.toLowerCase();
    return warnings.filter(
      (w) =>
        w.regionName.toLowerCase().includes(keyword) ||
        w.description.toLowerCase().includes(keyword) ||
        w.warningNo.toLowerCase().includes(keyword)
    );
  }, [warnings, searchKeyword]);

  const handleViewDetail = async (warning: Warning) => {
    await loadWarningById(warning.id);
    setShowDetail(true);
    navigate(`/warning/${warning.id}`, { replace: true });
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    navigate('/warning', { replace: true });
    clearSelectedWarning();
  };

  const handleOpenApproval = (type: 'confirm' | 'review' | 'approve') => {
    setApprovalType(type);
    setApprovalOpinion('');
    setShowApprovalModal(true);
  };

  const handleApproval = async () => {
    if (!selectedWarning) return;

    try {
      if (approvalType === 'confirm') {
        await confirmWarning(selectedWarning.id, approvalOpinion);
      } else if (approvalType === 'review') {
        await reviewWarning(selectedWarning.id, approvalOpinion);
      } else if (approvalType === 'approve') {
        await approveWarning(selectedWarning.id, approvalOpinion);
      }
      setShowApprovalModal(false);
    } catch (error) {
      console.error('审批失败:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedWarning) return;

    try {
      await rejectWarning(selectedWarning.id, rejectOpinion);
      setShowRejectModal(false);
    } catch (error) {
      console.error('驳回失败:', error);
    }
  };

  const handleCloseWarning = async () => {
    if (!selectedWarning) return;

    try {
      await closeWarning(selectedWarning.id);
    } catch (error) {
      console.error('关闭失败:', error);
    }
  };

  const getCurrentStep = (warning: Warning) => {
    if (warning.status === 'pending_confirm') return 1;
    if (warning.status === 'confirmed') return 2;
    if (warning.status === 'reviewing') return 3;
    return 0;
  };

  const getApprovalButtonText = (type: 'confirm' | 'review' | 'approve' | 'reject') => {
    const texts = {
      confirm: '确认预警',
      review: '审核通过',
      approve: '批准执行',
      reject: '驳回',
    };
    return texts[type];
  };

  const warningStats = useMemo(() => {
    const pending = warnings.filter((w) => w.status === 'pending_confirm').length;
    const confirmed = warnings.filter((w) => w.status === 'confirmed').length;
    const reviewing = warnings.filter((w) => w.status === 'reviewing').length;
    const approved = warnings.filter((w) => w.status === 'approved').length;
    const waterLevel = warnings.filter((w) => w.type === 'water_level').length;
    const subsidence = warnings.filter((w) => w.type === 'subsidence').length;

    return { pending, confirmed, reviewing, approved, waterLevel, subsidence };
  }, [warnings]);

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'pending_confirm', label: '待确认' },
    { value: 'confirmed', label: '已确认' },
    { value: 'reviewing', label: '审核中' },
    { value: 'approved', label: '已批准' },
    { value: 'rejected', label: '已驳回' },
    { value: 'closed', label: '已关闭' },
  ];

  const typeOptions = [
    { value: '', label: '全部类型' },
    { value: 'water_level', label: '水位预警' },
    { value: 'subsidence', label: '沉降预警' },
  ];

  return (
    <div className="relative min-h-full">
      <LoadingOverlay visible={loading} text="正在加载预警数据..." />

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-warning-500" />
              预警管理
            </h1>
            <p className="mt-1 text-dark-400">地下水超采与地面沉降预警监测及审批管理</p>
          </div>
          <Button
            variant="secondary"
            leftIcon={<RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />}
            onClick={() => loadWarnings()}
          >
            刷新
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="待确认"
            value={warningStats.pending}
            unit="个"
            icon={<Clock className="w-5 h-5" />}
            color="warning"
          />
          <StatCard
            title="已确认待审核"
            value={warningStats.confirmed}
            unit="个"
            icon={<CheckCircle className="w-5 h-5" />}
            color="info"
          />
          <StatCard
            title="审核中"
            value={warningStats.reviewing}
            unit="个"
            icon={<Activity className="w-5 h-5" />}
            color="primary"
          />
          <StatCard
            title="已批准"
            value={warningStats.approved}
            unit="个"
            icon={<CheckCircle className="w-5 h-5" />}
            color="success"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden mb-6">
        <div className="p-4 border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <Input
                  placeholder="搜索预警编号、区域..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as WarningStatus | '')}
                className="w-36"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>

              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as WarningType | '')}
                className="w-36"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-400">
                共 <span className="text-white font-medium">{total}</span> 条预警
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  预警编号
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  等级
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  类型
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  区域
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  预警内容
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  触发值
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  触发时间
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredWarnings.map((warning) => {
                const levelBadge = getWarningLevelBadge(warning.level);
                const typeBadge = getWarningTypeBadge(warning.type);
                const statusBadge = getWarningStatusBadge(warning.status);
                const currentStep = getCurrentStep(warning);

                return (
                  <tr
                    key={warning.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(warning)}
                  >
                    <td className="py-3 px-4 text-sm font-mono text-dark-300">
                      {warning.warningNo}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={levelBadge.variant as any} dot>
                        {levelBadge.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={typeBadge.variant as any}>{typeBadge.label}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-dark-500" />
                        <span className="text-sm text-white">{warning.regionName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-dark-300 max-w-xs truncate">
                      {warning.description}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          warning.type === 'water_level' ? 'text-primary-400' : 'text-danger-400'
                        )}
                      >
                        {warning.triggerValue.toFixed(1)}
                        {warning.type === 'water_level' ? 'm' : 'cm/年'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadge.variant as any}>{statusBadge.label}</Badge>
                        {currentStep > 0 && (
                          <span className="text-xs text-dark-500">第 {currentStep} 步</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-dark-400">
                      {formatDate(warning.createdAt, 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        rightIcon={<ChevronRight className="w-4 h-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetail(warning);
                        }}
                      >
                        详情
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {total > pageSize && (
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(total / pageSize)}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </Card>

      <Drawer
        visible={showDetail && !!selectedWarning}
        title="预警详情"
        onClose={handleCloseDetail}
        width={720}
      >
        {selectedWarning && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedWarning.warningNo}
                  </h3>
                  <Badge
                    variant={getWarningLevelBadge(selectedWarning.level).variant as any}
                    dot
                  >
                    {getWarningLevelBadge(selectedWarning.level).label}
                  </Badge>
                  <Badge variant={getWarningTypeBadge(selectedWarning.type).variant as any}>
                    {getWarningTypeBadge(selectedWarning.type).label}
                  </Badge>
                </div>
                <p className="text-dark-400">
                  {selectedWarning.regionName} ·{' '}
                  {formatDate(selectedWarning.createdAt, 'yyyy年MM月dd日 HH:mm')}
                </p>
              </div>
              <Badge
                variant={getWarningStatusBadge(selectedWarning.status).variant as any}
                className="text-sm"
              >
                {getWarningStatusBadge(selectedWarning.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  {selectedWarning.type === 'water_level' ? (
                    <Droplets className="w-5 h-5 text-primary-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-danger-400" />
                  )}
                  <span className="text-sm text-dark-400">触发条件</span>
                </div>
                <p className="text-white font-medium">{selectedWarning.triggerCondition}</p>
              </div>

              <div className="p-4 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-warning-400" />
                  <span className="text-sm text-dark-400">当前值 / 阈值</span>
                </div>
                <p className="text-white font-medium">
                  <span className="text-danger-400">{selectedWarning.triggerValue.toFixed(2)}</span>
                  <span className="text-dark-500 mx-2">/</span>
                  <span>{selectedWarning.threshold.toFixed(2)}</span>
                  {selectedWarning.type === 'water_level' ? ' m' : ' cm/年'}
                </p>
              </div>

              <div className="p-4 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-info-400" />
                  <span className="text-sm text-dark-400">持续时长</span>
                </div>
                <p className="text-white font-medium">
                  连续 <span className="text-primary-400">{selectedWarning.continuousMonths}</span> 个月
                </p>
              </div>

              <div className="p-4 bg-dark-800/50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-success-400" />
                  <span className="text-sm text-dark-400">影响范围</span>
                </div>
                <p className="text-white font-medium">
                  {selectedWarning.affectedArea.toFixed(0)} km² ·{' '}
                  {selectedWarning.affectedPopulation.toLocaleString()} 人
                </p>
              </div>
            </div>

            <div className="p-4 bg-dark-800/50 rounded-xl">
              <h4 className="text-sm font-medium text-white mb-2">预警描述</h4>
              <p className="text-dark-300 text-sm leading-relaxed">
                {selectedWarning.description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-400" />
                三级审批流程
              </h4>
              <div className="p-4 bg-dark-800/50 rounded-xl">
                <Timeline
                  steps={selectedWarning.approvalProcess.map((step) => ({
                    id: step.id,
                    title: step.stepName,
                    description: step.opinion || undefined,
                    time: step.approvedAt
                      ? formatDate(step.approvedAt, 'MM-dd HH:mm')
                      : undefined,
                    user: step.approverName,
                    status:
                      step.status === 'approved'
                        ? 'completed'
                        : step.status === 'rejected'
                        ? 'rejected'
                        : selectedWarning.status === 'pending_confirm' && step.stepOrder === 1
                        ? 'current'
                        : selectedWarning.status === 'confirmed' && step.stepOrder === 2
                        ? 'current'
                        : selectedWarning.status === 'reviewing' && step.stepOrder === 3
                        ? 'current'
                        : 'pending',
                  }))}
                />
              </div>
            </div>

            {(selectedWarning.status === 'pending_confirm' ||
              selectedWarning.status === 'confirmed' ||
              selectedWarning.status === 'reviewing') && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                {selectedWarning.status === 'pending_confirm' &&
                  canApproveStep(selectedWarning, 1) && (
                    <>
                      <Button
                        variant="success"
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                        onClick={() => handleOpenApproval('confirm')}
                      >
                        确认预警
                      </Button>
                      <Button
                        variant="danger"
                        leftIcon={<XCircle className="w-4 h-4" />}
                        onClick={() => {
                          setRejectOpinion('');
                          setShowRejectModal(true);
                        }}
                      >
                        驳回
                      </Button>
                    </>
                  )}

                {selectedWarning.status === 'confirmed' &&
                  canApproveStep(selectedWarning, 2) && (
                    <>
                      <Button
                        variant="primary"
                        leftIcon={<Send className="w-4 h-4" />}
                        onClick={() => handleOpenApproval('review')}
                      >
                        审核通过
                      </Button>
                      <Button
                        variant="danger"
                        leftIcon={<XCircle className="w-4 h-4" />}
                        onClick={() => {
                          setRejectOpinion('');
                          setShowRejectModal(true);
                        }}
                      >
                        审核驳回
                      </Button>
                    </>
                  )}

                {selectedWarning.status === 'reviewing' &&
                  canApproveStep(selectedWarning, 3) && (
                    <>
                      <Button
                        variant="success"
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                        onClick={() => handleOpenApproval('approve')}
                      >
                        批准执行
                      </Button>
                      <Button
                        variant="danger"
                        leftIcon={<XCircle className="w-4 h-4" />}
                        onClick={() => {
                          setRejectOpinion('');
                          setShowRejectModal(true);
                        }}
                      >
                        不予批准
                      </Button>
                    </>
                  )}
              </div>
            )}

            {(selectedWarning.status === 'approved' ||
              selectedWarning.status === 'rejected') && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                <Button
                  variant="secondary"
                  leftIcon={<XCircle className="w-4 h-4" />}
                  onClick={handleCloseWarning}
                >
                  关闭预警
                </Button>
              </div>
            )}

            {selectedWarning.status === 'approved' && (
              <div className="p-4 bg-success-500/10 border border-success-500/30 rounded-xl">
                <h4 className="text-sm font-medium text-success-400 mb-2">
                  已批准执行方案
                </h4>
                <p className="text-sm text-dark-300">
                  预警已获批准，可实施压采或回灌方案。请前往开采计划页面查看详细方案。
                </p>
                <Button
                  variant="success"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/mining-plan')}
                >
                  查看开采计划
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

      <Modal
        visible={showApprovalModal}
        title={getApprovalButtonText(approvalType)}
        onClose={() => setShowApprovalModal(false)}
        onConfirm={handleApproval}
        confirmLoading={loading}
        confirmText={getApprovalButtonText(approvalType)}
        width={480}
      >
        <div className="space-y-4">
          <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl">
            <p className="text-sm text-primary-300">
              {approvalType === 'confirm' &&
                '确认预警信息准确无误后，将进入省水利厅审核环节。'}
              {approvalType === 'review' &&
                '审核通过后，预警将提交至水利部进行最终批准。'}
              {approvalType === 'approve' &&
                '批准后将正式启动压采或回灌方案，请审慎决策。'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              审批意见
              <span className="text-danger-400"> *</span>
            </label>
            <TextArea
              value={approvalOpinion}
              onChange={(e) => setApprovalOpinion(e.target.value)}
              placeholder="请输入审批意见..."
              rows={4}
              required
            />
          </div>
        </div>
      </Modal>

      <Modal
        visible={showRejectModal}
        title="驳回预警"
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        confirmLoading={loading}
        confirmText="确认驳回"
        confirmVariant="danger"
        width={480}
      >
        <div className="space-y-4">
          <div className="p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl">
            <p className="text-sm text-danger-300">
              驳回后预警将被关闭，请填写详细的驳回理由。
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              驳回理由
              <span className="text-danger-400"> *</span>
            </label>
            <TextArea
              value={rejectOpinion}
              onChange={(e) => setRejectOpinion(e.target.value)}
              placeholder="请输入驳回理由..."
              rows={4}
              required
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WarningManagement;
