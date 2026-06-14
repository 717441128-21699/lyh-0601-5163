import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Droplets,
  TrendingDown,
  Activity,
  Layers,
  Calendar,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Info,
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
  Drawer,
} from '../components/common';
import {
  LineChart,
  MultiLineChart,
  BarChart,
  HeatMapChart,
  GaugeChart,
  PieChart,
} from '../components/charts';
import { useDataStore } from '../store/useDataStore';
import { usePermission } from '../hooks/usePermission';
import { cn } from '../lib/utils';
import { generateDateSeries } from '../utils/date';
import type { MonitoringWell, WaterLevelData, RegionIndicators } from '../types';

const RegionDetail: React.FC = () => {
  const { provinceId, cityId } = useParams<{ provinceId?: string; cityId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { canViewRegionData } = usePermission();

  const {
    loading,
    provinces,
    cities,
    monitoringWells,
    gnssPoints,
    regionIndicators,
    waterLevelData,
    loadProvinces,
    loadCities,
    loadMonitoringWells,
    loadGNSSPoints,
    loadRegionIndicators,
    loadWaterLevelData,
  } = useDataStore();

  const [selectedTimeRange, setSelectedTimeRange] = useState('90d');
  const [selectedAquifer, setSelectedAquifer] = useState('all');
  const [selectedWell, setSelectedWell] = useState<MonitoringWell | null>(null);
  const [showWellDetail, setShowWellDetail] = useState(false);
  const [wellWaterLevelData, setWellWaterLevelData] = useState<WaterLevelData[]>([]);
  const [wellLoading, setWellLoading] = useState(false);

  const currentRegionId = cityId || provinceId;
  const regionType = cityId ? 'city' : provinceId ? 'province' : 'national';

  const currentRegion = useMemo(() => {
    if (cityId) {
      return cities.find((c) => c.id === cityId);
    }
    if (provinceId) {
      return provinces.find((p) => p.id === provinceId);
    }
    return null;
  }, [provinceId, cityId, provinces, cities]);

  const regionIndicator = useMemo(() => {
    return regionIndicators.find((i) => i.regionId === currentRegionId);
  }, [regionIndicators, currentRegionId]);

  const regionCities = useMemo(() => {
    if (provinceId && !cityId) {
      return cities.filter((c) => c.provinceId === provinceId);
    }
    return [];
  }, [provinceId, cityId, cities]);

  const regionWells = useMemo(() => {
    let wells = monitoringWells;
    if (cityId) {
      wells = wells.filter((w) => w.cityId === cityId);
    } else if (provinceId) {
      wells = wells.filter((w) => w.provinceId === provinceId);
    }
    if (selectedAquifer !== 'all') {
      wells = wells.filter((w) => w.aquiferType === selectedAquifer);
    }
    return wells;
  }, [monitoringWells, provinceId, cityId, selectedAquifer]);

  useEffect(() => {
    if (!canViewRegionData(provinceId, cityId)) {
      navigate('/dashboard');
      return;
    }

    const loadData = async () => {
      await Promise.all([
        loadProvinces(),
        loadCities(provinceId),
        loadMonitoringWells(provinceId, cityId),
        loadGNSSPoints(provinceId, cityId),
        loadRegionIndicators(currentRegionId!, selectedTimeRange),
      ]);
    };
    loadData();
  }, [provinceId, cityId, selectedTimeRange]);

  const handleWellClick = async (well: MonitoringWell) => {
    setSelectedWell(well);
    setShowWellDetail(true);
    setWellLoading(true);
    try {
      const data = await loadWaterLevelData(well.id, 90);
      setWellWaterLevelData(data);
    } finally {
      setWellLoading(false);
    }
  };

  const waterLevelTrendData = useMemo(() => {
    const dates = generateDateSeries(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      new Date(),
      'day'
    );

    const series = regionWells.slice(0, 5).map((well) => ({
      name: well.name,
      data: dates.map(() => well.depthToWater + (Math.random() - 0.5) * 3),
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
    }));

    return { series, xAxisData: dates };
  }, [regionWells]);

  const subsidenceHeatmapData = useMemo(() => {
    const xLabels = generateDateSeries(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      new Date(),
      'month'
    );
    const yLabels = regionWells.slice(0, 8).map((w) => w.name);
    const data: Array<[number, number, number]> = [];

    for (let x = 0; x < xLabels.length; x++) {
      for (let y = 0; y < yLabels.length; y++) {
        data.push([x, y, Math.random() * 5]);
      }
    }

    return { xAxisData: xLabels, yAxisData: yLabels, data };
  }, [regionWells]);

  const miningWellDistribution = useMemo(() => {
    const types = [
      { name: '农业灌溉井', value: Math.floor(regionWells.length * 0.5) },
      { name: '工业用水井', value: Math.floor(regionWells.length * 0.25) },
      { name: '生活饮用水井', value: Math.floor(regionWells.length * 0.15) },
      { name: '生态补水井', value: Math.floor(regionWells.length * 0.05) },
      { name: '回灌井', value: Math.floor(regionWells.length * 0.05) },
    ];
    return types;
  }, [regionWells]);

  const cityRankingData = useMemo(() => {
    return regionCities
      .map((city) => {
        const indicator = regionIndicators.find((i) => i.regionId === city.id);
        return {
          name: city.name,
          value: indicator ? indicator.overexploitationRate * 100 : Math.random() * 40,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [regionCities, regionIndicators]);

  const getBreadcrumb = () => {
    const items = [];
    items.push({ label: '全国', path: '/dashboard' });
    if (provinceId) {
      const province = provinces.find((p) => p.id === provinceId);
      items.push({ label: province?.name || '', path: `/region/${provinceId}` });
    }
    if (cityId) {
      const city = cities.find((c) => c.id === cityId);
      items.push({ label: city?.name || '', path: `/region/${provinceId}/${cityId}` });
    }
    return items;
  };

  const breadcrumb = getBreadcrumb();

  const aquifers = [
    { value: 'all', label: '全部含水层' },
    { value: 'phreatic', label: '潜水含水层' },
    { value: 'confined', label: '承压含水层' },
    { value: 'karst', label: '岩溶含水层' },
    { value: 'fracture', label: '裂隙含水层' },
  ];

  const getAquiferLabel = (type: string) => {
    const map: Record<string, string> = {
      phreatic: '潜水',
      confined: '承压',
      karst: '岩溶',
      fracture: '裂隙',
    };
    return map[type] || type;
  };

  return (
    <div className="relative min-h-full">
      <LoadingOverlay visible={loading} text="正在加载区域数据..." />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
          <div className="flex items-center gap-2 text-sm">
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="w-4 h-4 text-dark-500" />}
                <button
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'hover:text-primary-400 transition-colors',
                    index === breadcrumb.length - 1 ? 'text-white font-medium' : 'text-dark-400'
                  )}
                >
                  {item.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <MapPin className="w-6 h-6 text-primary-400" />
              {currentRegion?.name || '区域详情'}
              {regionIndicator && (
                <Badge
                  variant={
                    regionIndicator.riskLevel === 'high'
                      ? 'danger'
                      : regionIndicator.riskLevel === 'medium'
                      ? 'warning'
                      : 'success'
                  }
                  className="ml-2"
                >
                  {regionIndicator.riskLevel === 'high'
                    ? '高风险'
                    : regionIndicator.riskLevel === 'medium'
                    ? '中风险'
                    : '低风险'}
                </Badge>
              )}
            </h1>
            <p className="mt-1 text-dark-400">
              {regionType === 'province' ? '省级' : regionType === 'city' ? '市级' : '全国'}监测详情
              {regionCities.length > 0 && ` · 下辖 ${regionCities.length} 个市县`}
            </p>
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
              <option value="180d">近半年</option>
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

            <Button
              variant="secondary"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => loadRegionIndicators(currentRegionId!, selectedTimeRange)}
            >
              刷新
            </Button>
          </div>
        </div>
      </div>

      {regionIndicator && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="超采率"
            value={(regionIndicator.overexploitationRate * 100).toFixed(1)}
            unit="%"
            trend={regionIndicator.overexploitationRate > 0.15 ? 'up' : 'stable'}
            trendValue={regionIndicator.overexploitationRate > 0.15 ? '高于警戒值' : '正常范围'}
            icon={<Droplets className="w-5 h-5" />}
            color={
              regionIndicator.overexploitationRate > 0.3
                ? 'danger'
                : regionIndicator.overexploitationRate > 0.15
                ? 'warning'
                : 'success'
            }
          />

          <StatCard
            title="累计沉降量"
            value={regionIndicator.cumulativeSubsidence.toFixed(1)}
            unit="mm"
            trend="up"
            trendValue={`沉降速率 ${regionIndicator.subsidenceRate.toFixed(2)} cm/年`}
            icon={<TrendingDown className="w-5 h-5" />}
            color={
              regionIndicator.subsidenceRate > 2
                ? 'danger'
                : regionIndicator.subsidenceRate > 1
                ? 'warning'
                : 'success'
            }
          />

          <StatCard
            title="地下水可开采余量"
            value={(
              (regionIndicator.allowableMining - regionIndicator.actualMining) /
              100000000
            ).toFixed(2)}
            unit="亿m³"
            trend="down"
            trendValue={`年开采量 ${(regionIndicator.actualMining / 100000000).toFixed(2)} 亿m³`}
            icon={<Activity className="w-5 h-5" />}
            color="info"
          />

          <StatCard
            title="监测井数量"
            value={regionWells.length}
            unit="眼"
            trend="stable"
            trendValue={`GNSS监测点 ${gnssPoints.filter(g => g.provinceId === provinceId).length} 个`}
            icon={<Layers className="w-5 h-5" />}
            color="primary"
          />
        </div>
      )}

      <Tabs
        tabs={[
          { key: 'water-level', label: '水位趋势' },
          { key: 'subsidence', label: '沉降漏斗' },
          { key: 'mining-wells', label: '开采井分布' },
          { key: 'cities', label: '下辖区域' },
        ]}
        className="mb-6"
      >
        <TabPanel activeKey="water-level" itemKey="water-level">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-0 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">近90天水位趋势对比</h3>
                    <p className="text-sm text-dark-400 mt-0.5">
                      显示区域内主要监测井的水位埋深变化曲线
                    </p>
                  </div>
                  <Info className="w-5 h-5 text-dark-500" />
                </div>
              </div>
              <div className="p-4">
                <MultiLineChart
                  series={waterLevelTrendData.series}
                  xAxisData={waterLevelTrendData.xAxisData}
                  yAxisName="水位埋深 (m)"
                  height={380}
                  showLegend
                />
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">当前超采指数</h3>
                <p className="text-sm text-dark-400 mt-0.5">区域综合评估</p>
              </div>
              <div className="p-4">
                {regionIndicator && (
                  <>
                    <GaugeChart
                      value={regionIndicator.overexploitationRate * 100}
                      max={50}
                      unit="%"
                      title="超采率"
                      height={250}
                      thresholds={[
                        { value: 15, color: '#10b981' },
                        { value: 30, color: '#f59e0b' },
                        { value: 50, color: '#ef4444' },
                      ]}
                    />
                    <div className="mt-4 p-3 bg-dark-800/50 rounded-xl">
                      <h4 className="text-sm font-medium text-white mb-2">水位同比变化</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-dark-500">较上月</p>
                          <p className="text-lg font-semibold text-danger-400">-0.42 m</p>
                        </div>
                        <div>
                          <p className="text-xs text-dark-500">较去年同期</p>
                          <p className="text-lg font-semibold text-danger-400">-1.28 m</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeKey="subsidence" itemKey="subsidence">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-0 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">沉降漏斗动态演变</h3>
                    <p className="text-sm text-dark-400 mt-0.5">
                      各监测点近12个月沉降速率热力图
                    </p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                </div>
              </div>
              <div className="p-4">
                <HeatMapChart
                  xAxisData={subsidenceHeatmapData.xAxisData}
                  yAxisData={subsidenceHeatmapData.yAxisData}
                  data={subsidenceHeatmapData.data}
                  height={380}
                  min={0}
                  max={5}
                />
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">沉降风险评估</h3>
                <p className="text-sm text-dark-400 mt-0.5">区域沉降指标详情</p>
              </div>
              <div className="p-4">
                {regionIndicator && (
                  <div className="space-y-4">
                    <div className="p-3 bg-dark-800/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-dark-400">沉降速率</span>
                        <span
                          className={cn(
                            'text-lg font-semibold',
                            regionIndicator.subsidenceRate > 2
                              ? 'text-danger-400'
                              : regionIndicator.subsidenceRate > 1
                              ? 'text-warning-400'
                              : 'text-success-400'
                          )}
                        >
                          {regionIndicator.subsidenceRate.toFixed(2)} cm/年
                        </span>
                      </div>
                      <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            regionIndicator.subsidenceRate > 2
                              ? 'bg-danger-500'
                              : regionIndicator.subsidenceRate > 1
                              ? 'bg-warning-500'
                              : 'bg-success-500'
                          )}
                          style={{
                            width: `${Math.min((regionIndicator.subsidenceRate / 5) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-dark-500 mt-1">警戒值: 2 cm/年</p>
                    </div>

                    <div className="p-3 bg-dark-800/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-dark-400">累计沉降量</span>
                        <span className="text-lg font-semibold text-primary-400">
                          {regionIndicator.cumulativeSubsidence.toFixed(1)} mm
                        </span>
                      </div>
                      <p className="text-xs text-dark-500">
                        近10年累计沉降 {regionIndicator.cumulativeSubsidence * 10} mm
                      </p>
                    </div>

                    <div className="p-3 bg-dark-800/50 rounded-xl">
                      <h4 className="text-sm font-medium text-white mb-2">沉降漏斗影响范围</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-dark-700/50 rounded-lg text-center">
                          <p className="text-lg font-semibold text-danger-400">
                            {(Math.random() * 500 + 100).toFixed(0)}
                          </p>
                          <p className="text-xs text-dark-500">重度沉降区 (km²)</p>
                        </div>
                        <div className="p-2 bg-dark-700/50 rounded-lg text-center">
                          <p className="text-lg font-semibold text-warning-400">
                            {(Math.random() * 1000 + 500).toFixed(0)}
                          </p>
                          <p className="text-xs text-dark-500">中度沉降区 (km²)</p>
                        </div>
                        <div className="p-2 bg-dark-700/50 rounded-lg text-center">
                          <p className="text-lg font-semibold text-info-400">
                            {(Math.random() * 2000 + 1000).toFixed(0)}
                          </p>
                          <p className="text-xs text-dark-500">轻度沉降区 (km²)</p>
                        </div>
                        <div className="p-2 bg-dark-700/50 rounded-lg text-center">
                          <p className="text-lg font-semibold text-success-400">
                            {(Math.random() * 5000 + 3000).toFixed(0)}
                          </p>
                          <p className="text-xs text-dark-500">稳定区 (km²)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeKey="mining-wells" itemKey="mining-wells">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-0 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">开采井列表</h3>
                    <p className="text-sm text-dark-400 mt-0.5">
                      区域内所有监测井信息（共 {regionWells.length} 眼）
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-dark-800/95 backdrop-blur">
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                        井编号
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                        井名
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                        类型
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                        含水层
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                        水位埋深
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                        状态
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {regionWells.map((well) => (
                      <tr
                        key={well.id}
                        className="hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => handleWellClick(well)}
                      >
                        <td className="py-3 px-4 text-sm font-mono text-dark-300">{well.wellCode}</td>
                        <td className="py-3 px-4 text-sm text-white font-medium">{well.name}</td>
                        <td className="py-3 px-4">
                          <Badge variant="info" className="text-[10px]">
                            {well.type === 'observation' ? '观测井' : well.type === 'mining' ? '开采井' : '回灌井'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-dark-300">{getAquiferLabel(well.aquiferType)}</td>
                        <td className="py-3 px-4 text-sm text-white">{well.depthToWater.toFixed(1)} m</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={well.status === 'online' ? 'success' : well.status === 'maintenance' ? 'warning' : 'default'}
                            dot
                            className="text-[10px]"
                          >
                            {well.status === 'online' ? '在线' : well.status === 'offline' ? '离线' : '维护中'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWellClick(well);
                            }}
                          >
                            详情
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">开采井类型分布</h3>
                <p className="text-sm text-dark-400 mt-0.5">按用途分类统计</p>
              </div>
              <div className="p-4">
                <PieChart
                  data={miningWellDistribution}
                  height={280}
                  innerRadius={50}
                  showLabel={false}
                />
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeKey="cities" itemKey="cities">
          {cityRankingData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">各市县超采率排名</h3>
                  <p className="text-sm text-dark-400 mt-0.5">下辖区域超采情况对比</p>
                </div>
                <div className="p-4">
                  <BarChart
                    data={cityRankingData}
                    height={500}
                    horizontal
                    yAxisName="市县"
                    xAxisName="超采率 (%)"
                    showGradient={false}
                  />
                </div>
              </Card>

              <Card className="p-0 overflow-hidden">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-white">区域详情列表</h3>
                  <p className="text-sm text-dark-400 mt-0.5">点击可查看详细数据</p>
                </div>
                <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-dark-800/95 backdrop-blur">
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                          排名
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                          区域
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                          超采率
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                          沉降速率
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                          风险等级
                        </th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-dark-400 uppercase">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {cityRankingData.map((city, index) => {
                        const cityData = cities.find((c) => c.name === city.name);
                        const indicator = regionIndicators.find(
                          (i) => i.regionId === cityData?.id
                        );
                        const riskLevel =
                          city.value > 30
                            ? { variant: 'danger' as const, label: '高风险' }
                            : city.value > 15
                            ? { variant: 'warning' as const, label: '中风险' }
                            : { variant: 'success' as const, label: '低风险' };

                        return (
                          <tr
                            key={cityData?.id}
                            className="hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => navigate(`/region/${provinceId}/${cityData?.id}`)}
                          >
                            <td className="py-3 px-4">
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
                            <td className="py-3 px-4 text-sm text-white font-medium">{city.name}</td>
                            <td className="py-3 px-4">
                              <span
                                className={cn(
                                  'text-sm font-semibold',
                                  city.value > 30
                                    ? 'text-danger-400'
                                    : city.value > 15
                                    ? 'text-warning-400'
                                    : 'text-success-400'
                                )}
                              >
                                {city.value.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-dark-300">
                              {indicator?.subsidenceRate.toFixed(2) || '--'} cm/年
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={riskLevel.variant} className="text-[10px]">
                                {riskLevel.label}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/region/${provinceId}/${cityData?.id}`);
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
          ) : (
            <Card className="p-8 text-center">
              <MapPin className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">当前为市级区域，无下辖区域数据</p>
            </Card>
          )}
        </TabPanel>
      </Tabs>

      <Drawer
        visible={showWellDetail}
        title={selectedWell?.name || '监测井详情'}
        onClose={() => setShowWellDetail(false)}
        width={520}
      >
        {selectedWell && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-dark-800/50 rounded-xl">
                <p className="text-xs text-dark-500 mb-1">井编号</p>
                <p className="text-sm font-mono text-white">{selectedWell.wellCode}</p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-xl">
                <p className="text-xs text-dark-500 mb-1">井类型</p>
                <p className="text-sm text-white">
                  {selectedWell.type === 'observation'
                    ? '观测井'
                    : selectedWell.type === 'mining'
                    ? '开采井'
                    : '回灌井'}
                </p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-xl">
                <p className="text-xs text-dark-500 mb-1">含水层</p>
                <p className="text-sm text-white">{getAquiferLabel(selectedWell.aquiferType)}</p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-xl">
                <p className="text-xs text-dark-500 mb-1">井深</p>
                <p className="text-sm text-white">{selectedWell.wellDepth} m</p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-xl">
                <p className="text-xs text-dark-500 mb-1">当前水位埋深</p>
                <p className="text-sm font-semibold text-primary-400">
                  {selectedWell.depthToWater.toFixed(2)} m
                </p>
              </div>
              <div className="p-3 bg-dark-800/50 rounded-xl">
                <p className="text-xs text-dark-500 mb-1">运行状态</p>
                <p className="text-sm">
                  <Badge
                    variant={selectedWell.status === 'online' ? 'success' : selectedWell.status === 'maintenance' ? 'warning' : 'default'}
                    dot
                  >
                    {selectedWell.status === 'online'
                      ? '在线'
                      : selectedWell.status === 'offline'
                      ? '离线'
                      : '维护中'}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="p-3 bg-dark-800/50 rounded-xl">
              <p className="text-xs text-dark-500 mb-1">地理位置</p>
              <p className="text-sm text-white font-mono">
                经度: {selectedWell.longitude.toFixed(6)}° · 纬度: {selectedWell.latitude.toFixed(6)}°
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-white mb-3">近90天水位趋势</h4>
              {wellLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent" />
                </div>
              ) : wellWaterLevelData.length > 0 ? (
                <LineChart
                  data={wellWaterLevelData.map((d) => ({
                    name: d.recordTime,
                    value: d.waterLevel,
                  }))}
                  xAxisData={wellWaterLevelData.map((d) =>
                    new Date(d.recordTime).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                    })
                  )}
                  yAxisName="水位埋深 (m)"
                  height={260}
                  color="#3b82f6"
                />
              ) : (
                <div className="h-64 flex items-center justify-center text-dark-500">
                  暂无水位数据
                </div>
              )}
            </div>

            <div className="p-3 bg-dark-800/50 rounded-xl">
              <h4 className="text-sm font-medium text-white mb-2">水文地质参数</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-500">渗透系数</span>
                  <span className="text-white">{(Math.random() * 5 + 0.5).toFixed(2)} m/d</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">导水系数</span>
                  <span className="text-white">{(Math.random() * 500 + 100).toFixed(1)} m²/d</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">给水度</span>
                  <span className="text-white">{(Math.random() * 0.2 + 0.05).toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-500">储水系数</span>
                  <span className="text-white">{(Math.random() * 0.001 + 0.0001).toFixed(5)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RegionDetail;
