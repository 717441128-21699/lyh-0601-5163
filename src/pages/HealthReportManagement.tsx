import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Droplets,
  Activity,
  RefreshCw,
  Search,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Target,
  Eye,
  Clock,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, getRiskLevelBadge } from '../components/ui/Badge';
import { Input, Select } from '../components/ui/Input';
import {
  LoadingOverlay,
  StatCard,
  Tabs,
  TabPanel,
  Drawer,
  Modal,
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
import { formatDate } from '../utils/date';
import type {
  HealthReport,
  ReportType,
  WaterLevelAnalysis,
  SubsidenceAnalysis,
  ComplianceAnalysis,
  Recommendation,
  SupervisionPriority,
} from '../types';

const HealthReportManagement: React.FC = () => {
  const navigate = useNavigate();
  const { isNational, dataScope } = usePermission();

  const {
    loading,
    provinces,
    healthReports,
    loadProvinces,
    loadHealthReports,
    generateHealthReport,
  } = useDataStore();

  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedReport, setSelectedReport] = useState<HealthReport | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadProvinces(),
        loadHealthReports({
          type: typeFilter || undefined,
          regionId: selectedProvince,
        }),
      ]);
    };
    loadData();
  }, [typeFilter, selectedProvince]);

  const typeOptions = [
    { value: '', label: '全部类型' },
    { value: 'weekly', label: '周报' },
    { value: 'monthly', label: '月报' },
    { value: 'quarterly', label: '季报' },
  ];

  const provinceOptions = useMemo(() => {
    if (!dataScope.provinceIds) {
      return provinces.map((p) => ({ value: p.id, label: p.name }));
    }
    return provinces
      .filter((p) => dataScope.provinceIds!.includes(p.id))
      .map((p) => ({ value: p.id, label: p.name }));
  }, [provinces, dataScope]);

  const filteredReports = useMemo(() => {
    let reports = healthReports;

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      reports = reports.filter(
        (r) =>
          r.reportNo.toLowerCase().includes(keyword) ||
          r.regionName.toLowerCase().includes(keyword)
      );
    }

    return reports.sort(
      (a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime()
    );
  }, [healthReports, searchKeyword]);

  const handleViewDetail = async (report: HealthReport) => {
    try {
      const fullReport = await useDataStore.getState().generateHealthReport();
      setSelectedReport({ ...report, ...fullReport });
      setShowDetailDrawer(true);
    } catch (error) {
      setSelectedReport(report);
      setShowDetailDrawer(true);
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      await generateHealthReport();
      setShowGenerateModal(false);
    } catch (error) {
      console.error('生成报告失败:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getTypeBadge = (type: ReportType) => {
    const config = {
      weekly: { variant: 'primary' as const, label: '周报' },
      monthly: { variant: 'info' as const, label: '月报' },
      quarterly: { variant: 'success' as const, label: '季报' },
    };
    return config[type];
  };

  const reportStats = useMemo(() => {
    const weekly = healthReports.filter((r) => r.reportType === 'weekly').length;
    const monthly = healthReports.filter((r) => r.reportType === 'monthly').length;
    const quarterly = healthReports.filter((r) => r.reportType === 'quarterly').length;

    return { weekly, monthly, quarterly, total: healthReports.length };
  }, [healthReports]);

  const waterLevelChartData = useMemo(() => {
    if (!selectedReport?.waterLevelAnalysis) return { data: [], xAxisData: [] };

    const xAxisData = selectedReport.waterLevelAnalysis.regionalDistribution
      .slice(0, 10)
      .map((r) => r.regionName);
    const data = selectedReport.waterLevelAnalysis.regionalDistribution
      .slice(0, 10)
      .map((r) => ({
        name: r.regionName,
        value: r.averageLevel,
        itemStyle: {
          color:
            r.momChange > 0
              ? '#ef4444'
              : r.momChange < 0
              ? '#10b981'
              : '#3b82f6',
        },
      }));

    return { data, xAxisData };
  }, [selectedReport]);

  const subsidenceChartData = useMemo(() => {
    if (!selectedReport?.subsidenceAnalysis) return [];

    return selectedReport.subsidenceAnalysis.hotspotRegions
      .sort((a, b) => b.subsidenceRate - a.subsidenceRate)
      .slice(0, 10)
      .map((r) => ({
        name: r.regionName,
        value: r.subsidenceRate,
        itemStyle: {
          color:
            r.riskLevel === 'high'
              ? '#ef4444'
              : r.riskLevel === 'medium'
              ? '#f59e0b'
              : '#10b981',
        },
      }));
  }, [selectedReport]);

  return (
    <div className="relative min-h-full">
      <LoadingOverlay visible={loading} text="正在加载健康诊断报告..." />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-6 h-6 text-info-400" />
              健康诊断报告
            </h1>
            <p className="mt-1 text-dark-400">地下水健康状况自动诊断与优化方案推荐</p>
          </div>

          {isNational && (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setShowGenerateModal(true)}
            >
              生成周报
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总报告数"
            value={reportStats.total}
            unit="份"
            icon={<FileText className="w-5 h-5" />}
            color="primary"
          />
          <StatCard
            title="周报"
            value={reportStats.weekly}
            unit="份"
            icon={<Calendar className="w-5 h-5" />}
            color="info"
          />
          <StatCard
            title="月报"
            value={reportStats.monthly}
            unit="份"
            icon={<BarChart3 className="w-5 h-5" />}
            color="success"
          />
          <StatCard
            title="季报"
            value={reportStats.quarterly}
            unit="份"
            icon={<Activity className="w-5 h-5" />}
            color="warning"
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
                  placeholder="搜索报告编号、区域..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>

              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ReportType | '')}
                className="w-32"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>

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
            </div>

            <Button
              variant="ghost"
              leftIcon={<RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />}
              onClick={() =>
                loadHealthReports({
                  type: typeFilter || undefined,
                  regionId: selectedProvince,
                })
              }
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
                  报告编号
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  类型
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  区域
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  统计周期
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  水位同比
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  合规率
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  生成时间
                </th>
                <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReports.map((report) => {
                const typeBadge = getTypeBadge(report.reportType);
                const yoyChange = report.waterLevelAnalysis?.yoyChange || 0;
                const complianceRate = report.complianceAnalysis?.complianceRate || 0;

                return (
                  <tr
                    key={report.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleViewDetail(report)}
                  >
                    <td className="py-3 px-4 text-sm font-mono text-dark-300">
                      {report.reportNo}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-dark-500" />
                        <span className="text-sm text-white">{report.regionName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-dark-300">
                      {formatDate(report.periodStart, 'MM-dd')} ~{' '}
                      {formatDate(report.periodEnd, 'MM-dd')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {yoyChange > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-danger-400" />
                        ) : yoyChange < 0 ? (
                          <ArrowDownRight className="w-4 h-4 text-success-400" />
                        ) : (
                          <span className="w-4 h-4 text-dark-500">-</span>
                        )}
                        <span
                          className={cn(
                            'text-sm font-medium',
                            yoyChange > 0
                              ? 'text-danger-400'
                              : yoyChange < 0
                              ? 'text-success-400'
                              : 'text-dark-400'
                          )}
                        >
                          {yoyChange > 0 ? '+' : ''}
                          {yoyChange.toFixed(2)} m
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              complianceRate >= 90
                                ? 'bg-success-500'
                                : complianceRate >= 70
                                ? 'bg-warning-500'
                                : 'bg-danger-500'
                            )}
                            style={{ width: `${complianceRate}%` }}
                          />
                        </div>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            complianceRate >= 90
                              ? 'text-success-400'
                              : complianceRate >= 70
                              ? 'text-warning-400'
                              : 'text-danger-400'
                          )}
                        >
                          {complianceRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-dark-400">
                      {formatDate(report.createdAt, 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Download className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          下载
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          rightIcon={<ChevronRight className="w-4 h-4" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(report);
                          }}
                        >
                          查看
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReports.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">暂无健康诊断报告</p>
          </div>
        )}
      </Card>

      <Drawer
        visible={showDetailDrawer && !!selectedReport}
        title="健康诊断报告详情"
        onClose={() => {
          setShowDetailDrawer(false);
          setSelectedReport(null);
        }}
        width={800}
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {selectedReport.reportNo}
                  </h3>
                  <Badge variant={getTypeBadge(selectedReport.reportType).variant}>
                    {getTypeBadge(selectedReport.reportType).label}
                  </Badge>
                </div>
                <p className="text-dark-400">
                  {selectedReport.regionName} ·{' '}
                  {formatDate(selectedReport.periodStart, 'yyyy年MM月dd日')} ~{' '}
                  {formatDate(selectedReport.periodEnd, 'yyyy年MM月dd日')}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
              >
                下载报告
              </Button>
            </div>

            <Tabs
              tabs={[
                { key: 'water-level', label: '水位分析' },
                { key: 'subsidence', label: '沉降热点' },
                { key: 'compliance', label: '合规分析' },
                { key: 'recommendations', label: '优化方案' },
                { key: 'supervision', label: '监督重点' },
              ]}
            >
              <TabPanel activeKey="water-level" itemKey="water-level">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">平均水位埋深</p>
                      <p className="text-2xl font-bold text-primary-400">
                        {selectedReport.waterLevelAnalysis?.averageLevel.toFixed(2) || '--'}
                      </p>
                      <p className="text-xs text-dark-500">m</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">同比变化</p>
                      <p
                        className={cn(
                          'text-2xl font-bold',
                          (selectedReport.waterLevelAnalysis?.yoyChange || 0) > 0
                            ? 'text-danger-400'
                            : 'text-success-400'
                        )}
                      >
                        {(selectedReport.waterLevelAnalysis?.yoyChange || 0) > 0 ? '+' : ''}
                        {selectedReport.waterLevelAnalysis?.yoyChange.toFixed(2) || '--'}
                      </p>
                      <p className="text-xs text-dark-500">m</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">环比变化</p>
                      <p
                        className={cn(
                          'text-2xl font-bold',
                          (selectedReport.waterLevelAnalysis?.momChange || 0) > 0
                            ? 'text-danger-400'
                            : 'text-success-400'
                        )}
                      >
                        {(selectedReport.waterLevelAnalysis?.momChange || 0) > 0 ? '+' : ''}
                        {selectedReport.waterLevelAnalysis?.momChange.toFixed(2) || '--'}
                      </p>
                      <p className="text-xs text-dark-500">m</p>
                    </div>
                  </div>

                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4">各市县平均水位排名</h4>
                    <BarChart
                      data={waterLevelChartData.data}
                      height={350}
                      horizontal
                      yAxisName="市县"
                      xAxisName="水位埋深 (m)"
                      showGradient={false}
                    />
                  </Card>

                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4">区域水位详情</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              区域
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              平均水位
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              同比变化
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              环比变化
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedReport.waterLevelAnalysis?.regionalDistribution
                            .slice(0, 10)
                            .map((r) => (
                              <tr key={r.regionId} className="hover:bg-white/5">
                                <td className="py-2 px-3 text-sm text-white">
                                  {r.regionName}
                                </td>
                                <td className="py-2 px-3 text-sm text-right text-white">
                                  {r.averageLevel.toFixed(2)} m
                                </td>
                                <td
                                  className={cn(
                                    'py-2 px-3 text-sm text-right font-medium',
                                    r.yoyChange > 0
                                      ? 'text-danger-400'
                                      : r.yoyChange < 0
                                      ? 'text-success-400'
                                      : 'text-dark-400'
                                  )}
                                >
                                  {r.yoyChange > 0 ? '+' : ''}
                                  {r.yoyChange.toFixed(2)} m
                                </td>
                                <td
                                  className={cn(
                                    'py-2 px-3 text-sm text-right font-medium',
                                    r.momChange > 0
                                      ? 'text-danger-400'
                                      : r.momChange < 0
                                      ? 'text-success-400'
                                      : 'text-dark-400'
                                  )}
                                >
                                  {r.momChange > 0 ? '+' : ''}
                                  {r.momChange.toFixed(2)} m
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </TabPanel>

              <TabPanel activeKey="subsidence" itemKey="subsidence">
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">平均沉降速率</p>
                      <p className="text-2xl font-bold text-warning-400">
                        {selectedReport.subsidenceAnalysis?.averageRate.toFixed(2) || '--'}
                      </p>
                      <p className="text-xs text-dark-500">cm/年</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">最大沉降速率</p>
                      <p className="text-2xl font-bold text-danger-400">
                        {selectedReport.subsidenceAnalysis?.maxRate.toFixed(2) || '--'}
                      </p>
                      <p className="text-xs text-dark-500">cm/年</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">累计沉降量</p>
                      <p className="text-2xl font-bold text-primary-400">
                        {selectedReport.subsidenceAnalysis?.cumulativeSubsidence.toFixed(
                          1
                        ) || '--'}
                      </p>
                      <p className="text-xs text-dark-500">mm</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">热点地区</p>
                      <p className="text-2xl font-bold text-info-400">
                        {selectedReport.subsidenceAnalysis?.hotspotRegions.length || '--'}
                      </p>
                      <p className="text-xs text-dark-500">个</p>
                    </div>
                  </div>

                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4">沉降热点地区排名</h4>
                    <BarChart
                      data={subsidenceChartData}
                      height={350}
                      horizontal
                      yAxisName="地区"
                      xAxisName="沉降速率 (cm/年)"
                      showGradient={false}
                    />
                  </Card>

                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4">沉降热点地区详情</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              排名
                            </th>
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              地区
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              沉降速率
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              累计沉降
                            </th>
                            <th className="text-center py-2 px-3 text-xs font-medium text-dark-400">
                              风险等级
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedReport.subsidenceAnalysis?.hotspotRegions
                            .sort((a, b) => b.subsidenceRate - a.subsidenceRate)
                            .slice(0, 10)
                            .map((r, index) => {
                              const riskBadge = getRiskLevelBadge(r.riskLevel);
                              return (
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
                                  <td className="py-2 px-3 text-sm text-white">
                                    {r.regionName}
                                  </td>
                                  <td
                                    className={cn(
                                      'py-2 px-3 text-sm text-right font-medium',
                                      r.subsidenceRate > 2
                                        ? 'text-danger-400'
                                        : r.subsidenceRate > 1
                                        ? 'text-warning-400'
                                        : 'text-success-400'
                                    )}
                                  >
                                    {r.subsidenceRate.toFixed(2)} cm/年
                                  </td>
                                  <td className="py-2 px-3 text-sm text-right text-white">
                                    {r.cumulativeSubsidence.toFixed(1)} mm
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <Badge
                                      variant={riskBadge.variant as any}
                                      className="text-[10px]"
                                    >
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

              <TabPanel activeKey="compliance" itemKey="compliance">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">开采井总数</p>
                      <p className="text-2xl font-bold text-primary-400">
                        {selectedReport.complianceAnalysis?.totalWells || '--'}
                      </p>
                      <p className="text-xs text-dark-500">眼</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">合规井数</p>
                      <p className="text-2xl font-bold text-success-400">
                        {selectedReport.complianceAnalysis?.compliantWells || '--'}
                      </p>
                      <p className="text-xs text-dark-500">眼</p>
                    </div>
                    <div className="p-4 bg-dark-800/50 rounded-xl text-center">
                      <p className="text-xs text-dark-500 mb-1">合规率</p>
                      <p
                        className={cn(
                          'text-2xl font-bold',
                          (selectedReport.complianceAnalysis?.complianceRate || 0) >= 90
                            ? 'text-success-400'
                            : (selectedReport.complianceAnalysis?.complianceRate || 0) >= 70
                            ? 'text-warning-400'
                            : 'text-danger-400'
                        )}
                      >
                        {selectedReport.complianceAnalysis?.complianceRate.toFixed(1) || '--'}%
                      </p>
                    </div>
                  </div>

                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4">合规率分布</h4>
                    <div className="flex items-center justify-center">
                      <PieChart
                        data={[
                          {
                            name: '合规',
                            value: selectedReport.complianceAnalysis?.compliantWells || 0,
                          },
                          {
                            name: '不合规',
                            value:
                              (selectedReport.complianceAnalysis?.totalWells || 0) -
                              (selectedReport.complianceAnalysis?.compliantWells || 0),
                          },
                        ]}
                        height={280}
                        innerRadius={60}
                        color={['#10b981', '#ef4444']}
                      />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-danger-400" />
                      不合规开采井列表
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              井名
                            </th>
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              所属区域
                            </th>
                            <th className="text-left py-2 px-3 text-xs font-medium text-dark-400">
                              问题描述
                            </th>
                            <th className="text-right py-2 px-3 text-xs font-medium text-dark-400">
                              超采量
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {selectedReport.complianceAnalysis?.nonCompliantWells.map((w) => (
                            <tr key={w.wellId} className="hover:bg-white/5">
                              <td className="py-2 px-3 text-sm text-white">{w.wellName}</td>
                              <td className="py-2 px-3 text-sm text-dark-300">
                                {w.regionName}
                              </td>
                              <td className="py-2 px-3 text-sm text-dark-400">{w.issue}</td>
                              <td className="py-2 px-3 text-sm text-right font-medium text-danger-400">
                                +{(w.overExtractionAmount / 10000).toFixed(2)} 万m³
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </TabPanel>

              <TabPanel activeKey="recommendations" itemKey="recommendations">
                <div className="space-y-6">
                  <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl">
                    <h4 className="text-sm font-medium text-primary-400 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      优化压采方案
                    </h4>
                    <p className="text-sm text-dark-300">
                      基于当前月趋势分析，系统智能推荐以下优化方案以降低超采风险，改善地下水健康状况。
                    </p>
                  </div>

                  <div className="space-y-4">
                    {selectedReport.recommendations?.map((rec) => {
                      const typeConfig = {
                        extraction_control: {
                          icon: <TrendingDown className="w-4 h-4" />,
                          label: '压采控制',
                          color: 'warning',
                        },
                        recharge: {
                          icon: <Droplets className="w-4 h-4" />,
                          label: '人工回灌',
                          color: 'info',
                        },
                        monitoring: {
                          icon: <Activity className="w-4 h-4" />,
                          label: '监测强化',
                          color: 'primary',
                        },
                        management: {
                          icon: <Target className="w-4 h-4" />,
                          label: '管理优化',
                          color: 'success',
                        },
                      };

                      const config = typeConfig[rec.type];
                      const priorityConfig = {
                        high: {
                          variant: 'danger' as const,
                          label: '高优先级',
                        },
                        medium: {
                          variant: 'warning' as const,
                          label: '中优先级',
                        },
                        low: {
                          variant: 'default' as const,
                          label: '低优先级',
                        },
                      };

                      return (
                        <Card key={rec.id} className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'p-2 rounded-lg',
                                  config.color === 'warning' &&
                                    'bg-warning-500/20 text-warning-400',
                                  config.color === 'info' &&
                                    'bg-info-500/20 text-info-400',
                                  config.color === 'primary' &&
                                    'bg-primary-500/20 text-primary-400',
                                  config.color === 'success' &&
                                    'bg-success-500/20 text-success-400'
                                )}
                              >
                                {config.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-medium text-white">
                                    {rec.title}
                                  </h5>
                                  <Badge variant={priorityConfig[rec.priority].variant as any}>
                                    {priorityConfig[rec.priority].label}
                                  </Badge>
                                </div>
                                <p className="text-xs text-dark-500 mt-0.5">
                                  {config.label}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-dark-300 leading-relaxed">
                            {rec.content}
                          </p>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </TabPanel>

              <TabPanel activeKey="supervision" itemKey="supervision">
                <div className="space-y-6">
                  <div className="p-4 bg-warning-500/10 border border-warning-500/30 rounded-xl">
                    <h4 className="text-sm font-medium text-warning-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      监督重点区域
                    </h4>
                    <p className="text-sm text-dark-300">
                      以下区域需要重点监督管理，建议增加巡查频次，严格控制开采量。
                    </p>
                  </div>

                  <div className="space-y-4">
                    {selectedReport.supervisionPriorities?.map((sp, index) => (
                      <Card key={sp.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0',
                              index === 0
                                ? 'bg-danger-500/20 text-danger-400'
                                : index === 1
                                ? 'bg-warning-500/20 text-warning-400'
                                : 'bg-info-500/20 text-info-400'
                            )}
                          >
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="text-sm font-medium text-white">
                                {sp.regionName}
                              </h5>
                              <Badge variant="primary" className="text-[10px]">
                                {sp.focus}
                              </Badge>
                            </div>
                            <p className="text-sm text-dark-400">{sp.reason}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabPanel>
            </Tabs>
          </div>
        )}
      </Drawer>

      <Modal
        visible={showGenerateModal}
        title="生成健康诊断周报"
        onClose={() => setShowGenerateModal(false)}
        onConfirm={handleGenerateReport}
        confirmLoading={generating}
        confirmText="开始生成"
        width={480}
      >
        <div className="space-y-4">
          <div className="p-3 bg-primary-500/10 border border-primary-500/30 rounded-xl">
            <p className="text-sm text-primary-300">
              系统将根据最新监测数据自动生成本周地下水健康诊断报告，包含水位分析、沉降热点、合规检查和优化建议。
            </p>
          </div>

          <div className="p-4 bg-dark-800/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-400">报告类型</span>
              <Badge variant="primary">周报</Badge>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-400">统计周期</span>
              <span className="text-sm text-white">
                {formatDate(
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  'yyyy-MM-dd'
                )}{' '}
                ~ {formatDate(new Date(), 'yyyy-MM-dd')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-400">包含内容</span>
              <span className="text-sm text-white">
                水位分析、沉降热点、合规检查、优化方案、监督重点
              </span>
            </div>
          </div>

          <p className="text-xs text-dark-500">
            <Clock className="w-3 h-3 inline mr-1" />
            预计生成时间：10-15秒
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default HealthReportManagement;
