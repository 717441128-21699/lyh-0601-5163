import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Activity,
  RefreshCw,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Input';
import {
  StatCard,
  LoadingOverlay,
  Tabs,
  TabPanel,
} from '../components/common';
import {
  ChinaMap,
  BarChart,
  LineChart,
  PieChart,
  GaugeChart,
  MultiLineChart,
} from '../components/charts';
import { useDataStore } from '../store/useDataStore';
import { useWarningStore } from '../store/useWarningStore';
import { usePermission } from '../hooks/usePermission';
import { cn } from '../lib/utils';
import { getRiskLevelBadge } from '../components/ui/Badge';
import { generateDateSeries } from '../utils/date';
import { getOverexploitationColor } from '../utils/calculation';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isNational, dataScope } = usePermission();
  const {
    loading,
    provinces,
    regionIndicators,
    monitoringWells,
    gnssPoints,
    loadProvinces,
    loadNationalIndicators,
    loadMonitoringWells,
    loadGNSSPoints,
  } = useDataStore();
  const { warnings, loadWarnings } = useWarningStore();

  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedAquifer, setSelectedAquifer] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(undefined);

  const aquifers = [
    { value: 'all', label: '全部含水层' },
    { value: 'phreatic', label: '潜水含水层' },
    { value: 'confined', label: '承压含水层' },
    { value: 'karst', label: '岩溶含水层' },
    { value: 'fracture', label: '裂隙含水层' },
  ];

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadProvinces(),
        loadNationalIndicators(selectedTimeRange),
        loadMonitoringWells(selectedProvince),
        loadGNSSPoints(selectedProvince),
        loadWarnings({ page: 1, pageSize: 5 }),
      ]);
    };
    loadData();
  }, [selectedTimeRange, selectedProvince, loadProvinces, loadNationalIndicators, loadMonitoringWells, loadGNSSPoints, loadWarnings]);

  const mapData = useMemo(() => {
    return regionIndicators
      .filter((i) => i.regionType === 'province')
      .map((i) => ({
        name: provinces.find((p) => p.id === i.regionId)?.name || '',
        value: i.overexploitationRate * 100,
      }));
  }, [regionIndicators, provinces]);

  const riskRankingData = useMemo(() => {
    return [...regionIndicators]
      .filter((i) => i.regionType === 'province')
      .sort((a, b) => b.subsidenceRate - a.subsidenceRate)
      .slice(0, 10)
      .map((i) => ({
        name: provinces.find((p) => p.id === i.regionId)?.name || '',
        value: i.subsidenceRate,
        itemStyle: {
          color:
            i.subsidenceRate > 2
              ? '#ef4444'
              : i.subsidenceRate > 1
              ? '#f59e0b'
              : '#10b981',
        },
      }));
  }, [regionIndicators, provinces]);

  const waterLevelTrendData = useMemo(() => {
    const dates = generateDateSeries(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date(),
      'day'
    );
    const avgLevel = dates.map((_, index) => ({
      name: dates[index],
      value: 5 - Math.random() * 2 - index * 0.01,
    }));
    return { data: avgLevel, xAxisData: dates };
  }, []);

  const warningStats = useMemo(() => {
    const active = warnings.filter((w) => w.status !== 'closed' && w.status !== 'rejected').length;
    const waterLevel = warnings.filter((w) => w.type === 'water_level').length;
    const subsidence = warnings.filter((w) => w.type === 'subsidence').length;
    const pending = warnings.filter((w) => w.status === 'pending_confirm' || w.status === 'confirmed' || w.status === 'reviewing').length;

    return [
      { name: '水位预警', value: waterLevel },
      { name: '沉降预警', value: subsidence },
      { name: '待处理', value: pending },
      { name: '活跃预警', value: active },
    ];
  }, [warnings]);

  const handleRegionClick = (regionName: string) => {
    const province = provinces.find((p) => p.name === regionName);
    if (province) {
      navigate(`/region/${province.id}`);
    }
  };

  const nationalStats = useMemo(() => {
    const provinceIndicators = regionIndicators.filter((i) => i.regionType === 'province');
    const avgOverRate = provinceIndicators.length > 0
      ? provinceIndicators.reduce((sum, i) => sum + i.overexploitationRate, 0) / provinceIndicators.length
      : 0;
    const avgSubsidenceRate = provinceIndicators.length > 0
      ? provinceIndicators.reduce((sum, i) => sum + i.subsidenceRate, 0) / provinceIndicators.length
      : 0;
    const totalAllowable = provinceIndicators.reduce((sum, i) => sum + i.allowableMining, 0);
    const totalActual = provinceIndicators.reduce((sum, i) => sum + i.actualMining, 0);
    const remaining = totalAllowable - totalActual;

    return {
      avgOverRate: (avgOverRate * 100).toFixed(1),
      avgSubsidenceRate: avgSubsidenceRate.toFixed(2),
      remaining: (remaining / 100000000).toFixed(2),
      totalWells: monitoringWells.length,
      totalGNSS: gnssPoints.length,
    };
  }, [regionIndicators, monitoringWells, gnssPoints]);

  const provinceOptions = useMemo(() => {
    const filtered = dataScope.provinceIds
      ? provinces.filter((p) => dataScope.provinceIds!.includes(p.id))
      : provinces;
    return filtered.map((p) => ({ value: p.id, label: p.name }));
  }, [provinces, dataScope]);

  return (
    <div className="relative min-h-full">
      <LoadingOverlay visible={loading} text="正在加载监测数据..." />

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">地下水超采与地面沉降监测</h1>
            <p className="mt-1 text-dark-400">全国实时监测数据看板 · 数据每5分钟自动更新</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-32"
            >
              <option value="7d">近7天</option>
              <option value="30d">近30天</option>
              <option value="90d">近90天</option>
              <option value="1y">近1年</option>
            </Select>

            <Select
              value={selectedAquifer}
              onChange={(e) => setSelectedAquifer(e.target.value)}
              className="w-40"
            >
              {aquifers.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </Select>

            {isNational && (
              <Select
                value={selectedProvince || ''}
                onChange={(e) => setSelectedProvince(e.target.value || undefined)}
                className="w-36"
              >
                <option value="">全国</option>
                {provinceOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            )}

            <Button
              variant="secondary"
              leftIcon={<RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />}
              onClick={() => loadNationalIndicators(selectedTimeRange)}
            >
              刷新数据
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="平均超采率"
          value={nationalStats.avgOverRate}
          unit="%"
          trend="up"
          trendValue="同比上升2.3%"
          icon={<Droplets className="w-5 h-5" />}
          color={parseFloat(nationalStats.avgOverRate) > 30 ? 'danger' : parseFloat(nationalStats.avgOverRate) > 15 ? 'warning' : 'primary'}
          onClick={() => navigate('/region')}
        />

        <StatCard
          title="平均沉降速率"
          value={nationalStats.avgSubsidenceRate}
          unit="cm/年"
          trend={parseFloat(nationalStats.avgSubsidenceRate) > 1.5 ? 'up' : 'down'}
          trendValue={parseFloat(nationalStats.avgSubsidenceRate) > 1.5 ? '高于警戒值' : '在安全范围内'}
          icon={<TrendingDown className="w-5 h-5" />}
          color={parseFloat(nationalStats.avgSubsidenceRate) > 2 ? 'danger' : parseFloat(nationalStats.avgSubsidenceRate) > 1 ? 'warning' : 'success'}
        />

        <StatCard
          title="可开采余量"
          value={nationalStats.remaining}
          unit="亿m³"
          trend="down"
          trendValue="较上月减少0.5%"
          icon={<Activity className="w-5 h-5" />}
          color="info"
        />

        <StatCard
          title="监测站点"
          value={nationalStats.totalWells + nationalStats.totalGNSS}
          unit="个"
          trend="up"
          trendValue={`水位井 ${nationalStats.totalWells} · GNSS ${nationalStats.totalGNSS}`}
          icon={<MapPin className="w-5 h-5" />}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">全国地下水超采热力图</h3>
                <p className="text-sm text-dark-400 mt-0.5">按省份超采率分布，点击省份可查看详情</p>
              </div>
              <Badge variant="primary" dot>
                实时更新
              </Badge>
            </div>
          </div>
          <div className="p-4">
            <ChinaMap
              data={mapData}
              height={480}
              min={0}
              max={50}
              onRegionClick={handleRegionClick}
              visualMapText={['>50%', '0%']}
            />
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">沉降风险排名</h3>
                <p className="text-sm text-dark-400 mt-0.5">Top 10 沉降速率省份</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-warning-500" />
            </div>
          </div>
          <div className="p-4">
            <BarChart
              data={riskRankingData}
              height={480}
              horizontal
              yAxisName="省份"
              xAxisName="沉降速率 (cm/年)"
              showGradient={false}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">近90天水位趋势</h3>
            <p className="text-sm text-dark-400 mt-0.5">全国平均水位埋深变化</p>
          </div>
          <div className="p-4">
            <LineChart
              data={waterLevelTrendData.data}
              xAxisData={waterLevelTrendData.xAxisData}
              yAxisName="水位埋深 (m)"
              height={280}
              color="#3b82f6"
            />
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">预警统计</h3>
            <p className="text-sm text-dark-400 mt-0.5">当前预警类型分布</p>
          </div>
          <div className="p-4">
            <PieChart
              data={warningStats}
              height={280}
              innerRadius={50}
              showLabel={false}
            />
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">超采风险指数</h3>
            <p className="text-sm text-dark-400 mt-0.5">全国综合评估</p>
          </div>
          <div className="p-4 flex flex-col items-center justify-center">
            <GaugeChart
              value={parseFloat(nationalStats.avgOverRate)}
              max={50}
              unit="%"
              title="超采风险"
              height={220}
              thresholds={[
                { value: 15, color: '#10b981' },
                { value: 30, color: '#f59e0b' },
                { value: 50, color: '#ef4444' },
              ]}
            />
            <div className="mt-2 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-dark-500">低风险</p>
                <p className="text-sm font-medium text-success-400">{'<'}15%</p>
              </div>
              <div>
                <p className="text-xs text-dark-500">中风险</p>
                <p className="text-sm font-medium text-warning-400">15-30%</p>
              </div>
              <div>
                <p className="text-xs text-dark-500">高风险</p>
                <p className="text-sm font-medium text-danger-400">{'>'}30%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">最新预警信息</h3>
              <p className="text-sm text-dark-400 mt-0.5">系统自动生成的预警列表</p>
            </div>
            <Button
              variant="ghost"
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
              onClick={() => navigate('/warning')}
            >
              查看全部
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase tracking-wider">
                  预警等级
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
              {warnings.slice(0, 5).map((warning) => {
                const levelBadge = getRiskLevelBadge(warning.riskLevel);
                const typeBadge = warning.type === 'water_level'
                  ? { variant: 'primary' as const, label: '水位预警' }
                  : { variant: 'danger' as const, label: '沉降预警' };
                const statusBadge = warning.status === 'pending_confirm'
                  ? { variant: 'warning' as const, label: '待确认' }
                  : warning.status === 'confirmed'
                  ? { variant: 'info' as const, label: '已确认' }
                  : warning.status === 'reviewing'
                  ? { variant: 'primary' as const, label: '审核中' }
                  : warning.status === 'approved'
                  ? { variant: 'success' as const, label: '已批准' }
                  : warning.status === 'rejected'
                  ? { variant: 'danger' as const, label: '已驳回' }
                  : { variant: 'default' as const, label: '已关闭' };

                return (
                  <tr
                    key={warning.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/warning/${warning.id}`)}
                  >
                    <td className="py-3 px-4">
                      <Badge variant={levelBadge.variant as any} dot>
                        {levelBadge.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-white">
                      {warning.regionName}
                    </td>
                    <td className="py-3 px-4 text-sm text-dark-300 max-w-xs truncate">
                      {warning.description}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusBadge.variant as any}>{statusBadge.label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-dark-400">
                      {new Date(warning.triggeredAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/warning/${warning.id}`);
                        }}
                      >
                        查看
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
