import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Droplets,
  Target,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  BarChart3,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, getMiningPlanStatusBadge, getRiskLevelBadge } from '../components/ui/Badge';
import { Input, Select, TextArea } from '../components/ui/Input';
import {
  LoadingOverlay,
  StatCard,
  Tabs,
  TabPanel,
  Modal,
  Drawer,
  Timeline,
} from '../components/common';
import {
  BarChart,
  LineChart,
  MultiLineChart,
  PieChart,
  GaugeChart,
} from '../components/charts';
import { useDataStore } from '../store/useDataStore';
import { usePermission } from '../hooks/usePermission';
import { cn } from '../lib/utils';
import { readExcelFile, generateMiningPlanTemplate, parseExcelData } from '../utils/excel';
import { formatDate } from '../utils/date';
import type { MiningPlan, RiskPrediction, TargetRegion, RechargeWell } from '../types';

const excelColumns = [
  { key: 'regionCode', label: '行政区划代码', required: true, type: 'string' as const },
  { key: 'regionName', label: '行政区划名称', required: true, type: 'string' as const },
  { key: 'plannedExtraction', label: '计划开采量(万m³)', required: true, type: 'number' as const },
  { key: 'aquifer', label: '含水层类型', required: false, type: 'string' as const },
];

const MiningPlanManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isNational, isProvincial, dataScope } = usePermission();

  const {
    loading,
    provinces,
    miningPlans,
    loadProvinces,
    loadMiningPlans,
    uploadMiningPlan,
    submitMiningPlan,
  } = useDataStore();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MiningPlan | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<any[][]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [planToSubmit, setPlanToSubmit] = useState<MiningPlan | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadProvinces(),
        loadMiningPlans(selectedYear, selectedProvince),
      ]);
    };
    loadData();
  }, [selectedYear, selectedProvince]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'draft', label: '草稿' },
    { value: 'submitted', label: '已提交' },
    { value: 'approved', label: '已批准' },
    { value: 'rejected', label: '已驳回' },
  ];

  const provinceOptions = useMemo(() => {
    if (!dataScope.provinceIds) {
      return provinces.map((p) => ({ value: p.id, label: p.name }));
    }
    return provinces
      .filter((p) => dataScope.provinceIds!.includes(p.id))
      .map((p) => ({ value: p.id, label: p.name }));
  }, [provinces, dataScope]);

  const filteredPlans = useMemo(() => {
    let plans = miningPlans;

    if (!isNational && dataScope.provinceIds.length > 0) {
      plans = plans.filter((p) => dataScope.provinceIds.includes(p.provinceId));
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      plans = plans.filter(
        (p) =>
          p.planNo.toLowerCase().includes(keyword) ||
          p.provinceName.toLowerCase().includes(keyword)
      );
    }

    if (statusFilter) {
      plans = plans.filter((p) => p.status === statusFilter);
    }

    return plans;
  }, [miningPlans, searchKeyword, statusFilter, isNational, dataScope]);

  const handleFileChange = async (file: File) => {
    if (!file) return;

    setUploadFile(file);
    setUploadError('');

    try {
      const data = await readExcelFile(file);
      setUploadData(data);
    } catch (error) {
      setUploadError('文件读取失败，请检查文件格式');
      console.error('Excel读取错误:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = async () => {
    if (!uploadData || uploadData.length < 2) {
      setUploadError('请上传有效的Excel文件');
      return;
    }

    try {
      const validation = parseExcelData(uploadData, excelColumns);

      if (!validation.valid) {
        setUploadError(validation.errors.join('; '));
        return;
      }

      await uploadMiningPlan(validation.data);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadData([]);
    } catch (error) {
      setUploadError('上传失败，请重试');
      console.error('上传错误:', error);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = generateMiningPlanTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `地下水开采计划模板_${new Date().getFullYear()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleViewDetail = (plan: MiningPlan) => {
    setSelectedPlan(plan);
    setShowDetailDrawer(true);
  };

  const handleSubmitPlan = async () => {
    if (!planToSubmit) return;

    try {
      await submitMiningPlan(planToSubmit.id);
      setShowConfirmModal(false);
      setPlanToSubmit(null);
      loadMiningPlans(selectedYear, selectedProvince);
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  const riskPredictionChartData = useMemo(() => {
    if (!selectedPlan?.riskPrediction) return { series: [], xAxisData: [] };

    const xAxisData = selectedPlan.riskPrediction.map((r) => r.month);
    const series = [
      {
        name: '预测开采量',
        data: selectedPlan.riskPrediction.map((r) => r.predictedExtraction / 100000000),
        color: '#3b82f6',
      },
      {
        name: '允许开采量',
        data: selectedPlan.riskPrediction.map((r) => r.allowableExtraction / 100000000),
        color: '#10b981',
      },
    ];

    return { series, xAxisData };
  }, [selectedPlan]);

  const regionalPlanChartData = useMemo(() => {
    if (!selectedPlan?.regionalPlans) return [];

    return selectedPlan.regionalPlans
      .sort((a, b) => b.plannedExtraction - a.plannedExtraction)
      .slice(0, 10)
      .map((r) => ({
        name: r.regionName,
        value: r.plannedExtraction / 100000000,
        itemStyle: {
          color:
            r.predictedRisk === 'high'
              ? '#ef4444'
              : r.predictedRisk === 'medium'
              ? '#f59e0b'
              : '#10b981',
        },
      }));
  }, [selectedPlan]);

  const planStats = useMemo(() => {
    const draft = miningPlans.filter((p) => p.status === 'draft').length;
    const submitted = miningPlans.filter((p) => p.status === 'submitted').length;
    const approved = miningPlans.filter((p) => p.status === 'approved').length;
    const totalExtraction = miningPlans
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + p.totalExtraction, 0);

    return { draft, submitted, approved, totalExtraction };
  }, [miningPlans]);

  return (
    <div className="relative min-h-full">
      <LoadingOverlay visible={loading} text="正在加载开采计划数据..." />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileSpreadsheet className="w-6 h-6 text-primary-400" />
              开采计划管理
            </h1>
            <p className="mt-1 text-dark-400">年度地下水开采计划上传、风险预测与压采方案推荐</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleDownloadTemplate}
            >
              下载模板
            </Button>
            <Button
              variant="primary"
              leftIcon={<Upload className="w-4 h-4" />}
              onClick={() => setShowUploadModal(true)}
            >
              上传计划
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="草稿"
            value={planStats.draft}
            unit="个"
            icon={<FileSpreadsheet className="w-5 h-5" />}
            color="default"
          />
          <StatCard
            title="待审核"
            value={planStats.submitted}
            unit="个"
            icon={<AlertTriangle className="w-5 h-5" />}
            color="warning"
          />
          <StatCard
            title="已批准"
            value={planStats.approved}
            unit="个"
            icon={<CheckCircle className="w-5 h-5" />}
            color="success"
          />
          <StatCard
            title="年度总开采量"
            value={(planStats.totalExtraction / 100000000).toFixed(2)}
            unit="亿m³"
            icon={<Droplets className="w-5 h-5" />}
            color="info"
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
                  placeholder="搜索计划编号、省份..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>

              <Select
                value={selectedYear.toString()}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-32"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}年
                  </option>
                ))}
              </Select>

              {(isNational || isProvincial) && (
                <Select
                  value={selectedProvince || ''}
                  onChange={(e) => setSelectedProvince(e.target.value || undefined)}
                  className="w-36"
                >
                  <option value="">全部省份</option>
                  {provinceOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              )}

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
              onClick={() => loadMiningPlans(selectedYear, selectedProvince)}
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
                  计划编号
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  年度
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  省份
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  总开采量
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  包含区域
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  预测风险
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
              {filteredPlans.map((plan) => {
                const statusBadge = getMiningPlanStatusBadge(plan.status);
                const hasHighRisk = plan.regionalPlans.some((r) => r.predictedRisk === 'high');

                return (
                  <tr
                    key={plan.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(plan)}
                  >
                    <td className="py-3 px-4 text-sm font-mono text-dark-300">
                      {plan.planNo}
                    </td>
                    <td className="py-3 px-4 text-sm text-white">{plan.year}年</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-dark-500" />
                        <span className="text-sm text-white">{plan.provinceName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white font-medium">
                      {(plan.totalExtraction / 100000000).toFixed(2)} 亿m³
                    </td>
                    <td className="py-3 px-4 text-sm text-dark-300">
                      {plan.regionalPlans.length} 个市县
                    </td>
                    <td className="py-3 px-4">
                      {hasHighRisk ? (
                        <Badge variant="danger" dot>
                          高风险
                        </Badge>
                      ) : plan.regionalPlans.some((r) => r.predictedRisk === 'medium') ? (
                        <Badge variant="warning" dot>
                          中风险
                        </Badge>
                      ) : (
                        <Badge variant="success" dot>
                          低风险
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusBadge.variant as any}>{statusBadge.label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-dark-400">
                      {formatDate(plan.createdAt, 'yyyy-MM-dd')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {plan.status === 'draft' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlanToSubmit(plan);
                              setShowConfirmModal(true);
                            }}
                          >
                            提交
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(plan);
                          }}
                        >
                          详情
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPlans.length === 0 && (
          <div className="py-12 text-center">
            <FileSpreadsheet className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">暂无开采计划数据</p>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => setShowUploadModal(true)}
            >
              上传第一份计划
            </Button>
          </div>
        )}
      </Card>

      <Modal
        visible={showUploadModal}
        title="上传开采计划"
        onClose={() => {
          setShowUploadModal(false);
          setUploadFile(null);
          setUploadData([]);
          setUploadError('');
        }}
        onConfirm={handleUpload}
        confirmLoading={loading}
        confirmText="确认上传"
        width={600}
      >
        <div className="space-y-4">
          <div
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer',
              isDragging
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-white/10 hover:border-primary-500/50 hover:bg-white/5'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />
            <Upload className="w-12 h-12 text-dark-500 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">
              {uploadFile ? uploadFile.name : '点击或拖拽文件到此处上传'}
            </p>
            <p className="text-sm text-dark-500">支持 .xlsx, .xls 格式</p>
          </div>

          {uploadError && (
            <div className="p-3 bg-danger-500/10 border border-danger-500/30 rounded-xl">
              <p className="text-sm text-danger-400">{uploadError}</p>
            </div>
          )}

          {uploadData.length > 0 && (
            <div className="p-3 bg-success-500/10 border border-success-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success-400" />
                <p className="text-sm text-success-400">
                  文件解析成功，共 {uploadData.length - 1} 条数据
                </p>
              </div>
            </div>
          )}

          <div className="p-3 bg-dark-800/50 rounded-xl">
            <h4 className="text-sm font-medium text-white mb-2">说明</h4>
            <ul className="text-sm text-dark-400 space-y-1">
              <li>• 请先下载模板，按照模板格式填写开采计划</li>
              <li>• 系统将自动验证数据完整性和格式正确性</li>
              <li>• 上传后系统将自动进行未来12个月风险预测</li>
              <li>• 预测超采风险时将自动推荐压采目标和回灌井位</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Drawer
        visible={showDetailDrawer && !!selectedPlan}
        title="开采计划详情"
        onClose={() => {
          setShowDetailDrawer(false);
          setSelectedPlan(null);
        }}
        width={800}
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedPlan.planNo}
                </h3>
                <p className="text-dark-400 mt-1">
                  {selectedPlan.year}年度 · {selectedPlan.provinceName}
                </p>
              </div>
              <Badge
                variant={getMiningPlanStatusBadge(selectedPlan.status).variant as any}
                className="text-sm"
              >
                {getMiningPlanStatusBadge(selectedPlan.status).label}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                <p className="text-xs text-dark-500 mb-1">总开采量</p>
                <p className="text-2xl font-bold text-primary-400">
                  {(selectedPlan.totalExtraction / 100000000).toFixed(2)}
                </p>
                <p className="text-xs text-dark-500">亿m³</p>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                <p className="text-xs text-dark-500 mb-1">包含市县</p>
                <p className="text-2xl font-bold text-info-400">
                  {selectedPlan.regionalPlans.length}
                </p>
                <p className="text-xs text-dark-500">个</p>
              </div>
              <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                <p className="text-xs text-dark-500 mb-1">创建时间</p>
                <p className="text-sm font-medium text-white mt-2">
                  {formatDate(selectedPlan.createdAt, 'yyyy-MM-dd')}
                </p>
              </div>
            </div>

            <Tabs
              tabs={[
                { key: 'prediction', label: '风险预测' },
                { key: 'regional', label: '区域分解' },
                { key: 'optimization', label: '压采方案' },
              ]}
            >
              <TabPanel activeKey="prediction" itemKey="prediction">
                <div className="space-y-6">
                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-primary-400" />
                      未来12个月超采风险预测
                    </h4>
                    <MultiLineChart
                      series={riskPredictionChartData.series}
                      xAxisData={riskPredictionChartData.xAxisData}
                      yAxisName="开采量 (亿m³)"
                      height={300}
                      showLegend
                    />
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <h4 className="text-sm font-medium text-white mb-3">风险等级分布</h4>
                      <PieChart
                        data={[
                          {
                            name: '高风险',
                            value: selectedPlan.regionalPlans.filter(
                              (r) => r.predictedRisk === 'high'
                            ).length,
                          },
                          {
                            name: '中风险',
                            value: selectedPlan.regionalPlans.filter(
                              (r) => r.predictedRisk === 'medium'
                            ).length,
                          },
                          {
                            name: '低风险',
                            value: selectedPlan.regionalPlans.filter(
                              (r) => r.predictedRisk === 'low'
                            ).length,
                          },
                        ]}
                        height={200}
                        innerRadius={40}
                        showLabel={false}
                      />
                    </Card>

                    <Card className="p-4">
                      <h4 className="text-sm font-medium text-white mb-3">综合风险指数</h4>
                      <GaugeChart
                        value={
                          (selectedPlan.regionalPlans.filter(
                            (r) => r.predictedRisk === 'high'
                          ).length /
                            selectedPlan.regionalPlans.length) *
                          100
                        }
                        max={100}
                        unit="%"
                        title="超采风险"
                        height={200}
                      />
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4">风险预测详情</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              月份
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              预测开采量
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              允许开采量
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              超采量
                            </th>
                            <th className="text-center py-2 px-3 text-xs font-medium text-dark-400">
                              风险等级
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedPlan.riskPrediction.map((r) => {
                            const riskBadge = getRiskLevelBadge(r.riskLevel);
                            return (
                              <tr key={r.month} className="hover:bg-white/5">
                                <td className="py-2 px-3 text-sm text-white">{r.month}</td>
                                <td className="py-2 px-3 text-sm text-right text-white">
                                  {(r.predictedExtraction / 100000000).toFixed(3)} 亿m³
                                </td>
                                <td className="py-2 px-3 text-sm text-right text-success-400">
                                  {(r.allowableExtraction / 100000000).toFixed(3)} 亿m³
                                </td>
                                <td
                                  className={cn(
                                    'py-2 px-3 text-sm text-right font-medium',
                                    r.overexploitationAmount > 0
                                      ? 'text-danger-400'
                                      : 'text-success-400'
                                  )}
                                >
                                  {r.overexploitationAmount > 0 ? '+' : ''}
                                  {(r.overexploitationAmount / 100000000).toFixed(3)} 亿m³
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <Badge variant={riskBadge.variant as any} className="text-[10px]">
                                    {riskBadge.label}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </TabPanel>

              <TabPanel activeKey="regional" itemKey="regional">
                <div className="space-y-6">
                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4">各市县计划开采量排名</h4>
                    <BarChart
                      data={regionalPlanChartData}
                      height={400}
                      horizontal
                      yAxisName="市县"
                      xAxisName="开采量 (亿m³)"
                      showGradient={false}
                    />
                  </Card>

                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4">区域开采计划详情</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              区域
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              计划开采量
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              允许开采量
                            </th>
                            <th className="text-center py-2 px-3 text-xs font-medium text-dark-400">
                              预测风险
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedPlan.regionalPlans.map((r) => {
                            const riskBadge = getRiskLevelBadge(r.predictedRisk);
                            return (
                              <tr key={r.regionId} className="hover:bg-white/5">
                                <td className="py-2 px-3 text-sm text-white">{r.regionName}</td>
                                <td className="py-2 px-3 text-sm text-right text-white">
                                  {(r.plannedExtraction / 100000000).toFixed(3)} 亿m³
                                </td>
                                <td className="py-2 px-3 text-sm text-right text-success-400">
                                  {(r.allowableExtraction / 100000000).toFixed(3)} 亿m³
                                </td>
                                <td className="py-2 px-3 text-center">
                                  <Badge variant={riskBadge.variant as any} className="text-[10px]">
                                    {riskBadge.label}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </TabPanel>

              <TabPanel activeKey="optimization" itemKey="optimization">
                <div className="space-y-6">
                  <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                    <h4 className="text-sm font-medium text-primary-400 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      智能优化建议
                    </h4>
                    <p className="text-sm text-dark-300">
                      {selectedPlan.optimizationSuggestion.estimatedEffect}
                    </p>
                  </div>

                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-white flex items-center gap-2">
                        <Target className="w-4 h-4 text-warning-400" />
                        压采目标区域
                      </h4>
                      <span className="text-sm text-dark-400">
                        总压采目标:{' '}
                        <span className="text-warning-400 font-medium">
                          {(
                            selectedPlan.optimizationSuggestion.totalReductionTarget /
                            100000000
                          ).toFixed(2)}{' '}
                          亿m³
                        </span>
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              优先级
                            </th>
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              区域
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              当前开采量
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              建议压采量
                            </th>
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              压采理由
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedPlan.optimizationSuggestion.targetRegions
                            .sort((a, b) => a.suggestedReduction - b.suggestedReduction)
                            .reverse()
                            .map((r: TargetRegion, index) => (
                              <tr key={r.regionId} className="hover:bg-white/5">
                                <td className="py-2 px-3">
                                  <span
                                    className={cn(
                                      'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                                      index === 0
                                        ? 'bg-danger-500/20 text-danger-400'
                                        : index === 1
                                        ? 'bg-warning-500/20 text-warning-400'
                                        : index === 2
                                        ? 'bg-info-500/20 text-info-400'
                                        : 'bg-dark-700 text-dark-400'
                                    )}
                                  >
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-sm text-white">{r.regionName}</td>
                                <td className="py-2 px-3 text-sm text-right text-white">
                                  {(r.currentExtraction / 100000000).toFixed(3)} 亿m³
                                </td>
                                <td className="py-2 px-3 text-sm text-right font-medium text-warning-400">
                                  {(r.suggestedReduction / 100000000).toFixed(3)} 亿m³
                                </td>
                                <td className="py-2 px-3 text-sm text-dark-400 max-w-xs truncate">
                                  {r.reason}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-info-400" />
                      推荐回灌井位
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              优先级
                            </th>
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              井号
                            </th>
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              井名
                            </th>
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              含水层
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              建议回灌量
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedPlan.optimizationSuggestion.rechargeWells
                            .sort((a, b) => a.priority - b.priority)
                            .map((w: RechargeWell, index) => (
                              <tr key={w.wellNo} className="hover:bg-white/5">
                                <td className="py-2 px-3">
                                  <span
                                    className={cn(
                                      'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                                      w.priority === 1
                                        ? 'bg-danger-500/20 text-danger-400'
                                        : w.priority === 2
                                        ? 'bg-warning-500/20 text-warning-400'
                                        : 'bg-info-500/20 text-info-400'
                                    )}
                                  >
                                    {w.priority}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-sm font-mono text-dark-300">
                                  {w.wellNo}
                                </td>
                                <td className="py-2 px-3 text-sm text-white">{w.name}</td>
                                <td className="py-2 px-3 text-sm text-dark-400">{w.aquifer}</td>
                                <td className="py-2 px-3 text-sm text-right font-medium text-info-400">
                                  {(w.suggestedRechargeAmount / 10000).toFixed(2)} 万m³/年
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </TabPanel>
            </Tabs>
          </div>
        )}
      </Drawer>

      <Modal
        visible={showConfirmModal}
        title="提交开采计划"
        onClose={() => {
          setShowConfirmModal(false);
          setPlanToSubmit(null);
        }}
        onConfirm={handleSubmitPlan}
        confirmLoading={loading}
        confirmText="确认提交"
        width={480}
      >
        <div className="space-y-4">
          <div className="p-3 bg-warning-500/10 border border-warning-500/30 rounded-xl">
            <p className="text-sm text-warning-300">
              提交后将进入审批流程，计划内容将不可修改。确认要提交吗？
            </p>
          </div>

          {planToSubmit && (
            <div className="p-4 bg-dark-800/50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">计划编号</span>
                <span className="text-sm font-mono text-white">{planToSubmit.planNo}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">年度</span>
                <span className="text-sm text-white">{planToSubmit.year}年</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-400">省份</span>
                <span className="text-sm text-white">{planToSubmit.provinceName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-400">总开采量</span>
                <span className="text-sm font-medium text-primary-400">
                  {(planToSubmit.totalExtraction / 100000000).toFixed(2)} 亿m³
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MiningPlanManagement;
