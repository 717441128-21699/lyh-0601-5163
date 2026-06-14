import { addDays, subDays, subMonths, format } from 'date-fns';
import type {
  Province,
  City,
  MonitoringWell,
  WaterLevelData,
  GNSSPoint,
  SubsidenceData,
  InSARData,
  RegionIndicators,
  Warning,
  WarningType,
  WarningLevel,
  WarningStatus,
  ApprovalStep,
  MiningPlan,
  HealthReport,
  User,
  UserRole,
  HydrogeologyParams,
} from '../../types';

const generateId = (): string => Math.random().toString(36).substring(2, 11);

const provincesData: { id: string; name: string; code: string; lng: number; lat: number }[] = [
  { id: '110000', name: '北京市', code: 'BJ', lng: 116.4074, lat: 39.9042 },
  { id: '120000', name: '天津市', code: 'TJ', lng: 117.2009, lat: 39.0842 },
  { id: '130000', name: '河北省', code: 'HE', lng: 114.5025, lat: 38.0455 },
  { id: '140000', name: '山西省', code: 'SX', lng: 112.5492, lat: 37.857 },
  { id: '150000', name: '内蒙古自治区', code: 'NM', lng: 111.7519, lat: 40.8415 },
  { id: '210000', name: '辽宁省', code: 'LN', lng: 123.4328, lat: 41.8045 },
  { id: '220000', name: '吉林省', code: 'JL', lng: 125.3245, lat: 43.8868 },
  { id: '230000', name: '黑龙江省', code: 'HL', lng: 126.6425, lat: 45.7565 },
  { id: '310000', name: '上海市', code: 'SH', lng: 121.4737, lat: 31.2304 },
  { id: '320000', name: '江苏省', code: 'JS', lng: 118.7675, lat: 32.0415 },
  { id: '330000', name: '浙江省', code: 'ZJ', lng: 120.1536, lat: 30.2875 },
  { id: '340000', name: '安徽省', code: 'AH', lng: 117.283, lat: 31.8612 },
  { id: '350000', name: '福建省', code: 'FJ', lng: 119.2965, lat: 26.0745 },
  { id: '360000', name: '江西省', code: 'JX', lng: 115.8922, lat: 28.6765 },
  { id: '370000', name: '山东省', code: 'SD', lng: 117.0009, lat: 36.6758 },
  { id: '410000', name: '河南省', code: 'HA', lng: 113.6654, lat: 34.7579 },
  { id: '420000', name: '湖北省', code: 'HB', lng: 114.2986, lat: 30.5844 },
  { id: '430000', name: '湖南省', code: 'HN', lng: 112.9823, lat: 28.1941 },
  { id: '440000', name: '广东省', code: 'GD', lng: 113.2644, lat: 23.1291 },
  { id: '450000', name: '广西壮族自治区', code: 'GX', lng: 108.3275, lat: 22.8155 },
  { id: '460000', name: '海南省', code: 'HI', lng: 110.1999, lat: 20.0442 },
  { id: '500000', name: '重庆市', code: 'CQ', lng: 106.5516, lat: 29.563 },
  { id: '510000', name: '四川省', code: 'SC', lng: 104.0657, lat: 30.6595 },
  { id: '520000', name: '贵州省', code: 'GZ', lng: 106.7135, lat: 26.5783 },
  { id: '530000', name: '云南省', code: 'YN', lng: 102.7123, lat: 25.0406 },
  { id: '540000', name: '西藏自治区', code: 'XZ', lng: 91.1322, lat: 29.6604 },
  { id: '610000', name: '陕西省', code: 'SN', lng: 108.948, lat: 34.2632 },
  { id: '620000', name: '甘肃省', code: 'GS', lng: 103.8343, lat: 36.0611 },
  { id: '630000', name: '青海省', code: 'QH', lng: 101.7782, lat: 36.6171 },
  { id: '640000', name: '宁夏回族自治区', code: 'NX', lng: 106.2782, lat: 38.4664 },
  { id: '650000', name: '新疆维吾尔自治区', code: 'XJ', lng: 87.6177, lat: 43.7928 },
];

const aquifers = ['浅层含水层', '中层含水层', '深层含水层', '岩溶含水层', '裂隙含水层'];

const cityNames = ['市辖区', 'A市', 'B市', 'C市', 'D市', 'E市', 'F市', 'G市', 'H市'];

export const generateProvinces = (): Province[] => {
  return provincesData.map(p => ({
    id: p.id,
    name: p.name,
    code: p.code,
  }));
};

export const generateCities = (): City[] => {
  const cities: City[] = [];
  provincesData.forEach(province => {
    const cityCount = Math.floor(Math.random() * 8) + 3;
    for (let i = 0; i < cityCount; i++) {
      cities.push({
        id: `${province.id}${String(i + 1).padStart(4, '0')}`,
        provinceId: province.id,
        name: i === 0 ? `${province.name.replace('省', '').replace('自治区', '').replace('市', '')}市` : `${province.name.slice(0, 2)}${String.fromCharCode(65 + i)}市`,
        code: `${province.code}${String(i + 1).padStart(2, '0')}`,
      });
    }
  });
  return cities;
};

const wellTypes: ('observation' | 'mining' | 'recharge')[] = ['observation', 'mining', 'recharge'];
const aquiferTypes = ['孔隙水', '裂隙水', '岩溶水', '承压水', '潜水'];

export const generateMonitoringWells = (provinces: Province[], cities: City[]): MonitoringWell[] => {
  const wells: MonitoringWell[] = [];
  let wellIndex = 1;

  provinces.forEach(province => {
    const provinceCities = cities.filter(c => c.provinceId === province.id);
    const wellCount = Math.floor(Math.random() * 15) + 10;

    for (let i = 0; i < wellCount; i++) {
      const city = provinceCities[Math.floor(Math.random() * provinceCities.length)];
      const provData = provincesData.find(p => p.id === province.id)!;
      const lngOffset = (Math.random() - 0.5) * 2;
      const latOffset = (Math.random() - 0.5) * 2;
      const wellDepth = Math.floor(Math.random() * 300) + 50;
      const depthToWater = Math.floor(Math.random() * 40) + 5;
      const aquifer = aquifers[Math.floor(Math.random() * aquifers.length)];
      const aquiferType = aquiferTypes[Math.floor(Math.random() * aquiferTypes.length)];
      const type = wellTypes[Math.floor(Math.random() * wellTypes.length)];

      wells.push({
        id: generateId(),
        wellNo: `JW${String(wellIndex++).padStart(6, '0')}`,
        wellCode: `JC-${province.code}-${String(wellIndex).padStart(5, '0')}`,
        name: `${city.name}${i + 1}号监测井`,
        provinceId: province.id,
        cityId: city.id,
        aquifer,
        aquiferType,
        longitude: provData.lng + lngOffset,
        latitude: provData.lat + latOffset,
        depth: wellDepth,
        wellDepth,
        depthToWater,
        type,
        status: Math.random() > 0.1 ? 'online' : (Math.random() > 0.5 ? 'offline' : 'maintenance'),
        dailyExtraction: Math.floor(Math.random() * 5000) + 500,
        compliant: Math.random() > 0.2,
        createdAt: subDays(new Date(), Math.random() * 365).toISOString(),
        updatedAt: subDays(new Date(), Math.random() * 30).toISOString(),
      });
    }
  });

  return wells;
};

export const generateWaterLevelData = (wellId: string, days: number = 90): WaterLevelData[] => {
  const data: WaterLevelData[] = [];
  const baseLevel = Math.floor(Math.random() * 30) + 10;
  let currentLevel = baseLevel;

  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const seasonalVariation = Math.sin((i / 365) * Math.PI * 2) * 2;
    const dailyVariation = (Math.random() - 0.5) * 0.5;
    const trend = (days - i) * 0.01;

    currentLevel = baseLevel + seasonalVariation + dailyVariation + trend;

    data.push({
      wellId,
      timestamp: date.toISOString(),
      recordTime: format(date, 'yyyy-MM-dd'),
      waterLevel: Math.round(currentLevel * 100) / 100,
      temperature: Math.round((15 + Math.random() * 5) * 10) / 10,
      conductivity: Math.round((500 + Math.random() * 300) * 10) / 10,
    });
  }

  return data;
};

export const generateGNSSPoints = (provinces: Province[], cities: City[]): GNSSPoint[] => {
  const points: GNSSPoint[] = [];
  let pointIndex = 1;

  provinces.forEach(province => {
    const provinceCities = cities.filter(c => c.provinceId === province.id);
    const pointCount = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < pointCount; i++) {
      const city = provinceCities[Math.floor(Math.random() * provinceCities.length)];
      const provData = provincesData.find(p => p.id === province.id)!;
      const lngOffset = (Math.random() - 0.5) * 2;
      const latOffset = (Math.random() - 0.5) * 2;

      points.push({
        id: generateId(),
        pointNo: `GNSS${String(pointIndex++).padStart(6, '0')}`,
        name: `${city.name}GNSS${i + 1}号点`,
        provinceId: province.id,
        cityId: city.id,
        longitude: provData.lng + lngOffset,
        latitude: provData.lat + latOffset,
        elevation: Math.floor(Math.random() * 2000) + 50,
        createdAt: subDays(new Date(), Math.random() * 365).toISOString(),
        updatedAt: subDays(new Date(), Math.random() * 7).toISOString(),
      });
    }
  });

  return points;
};

export const generateSubsidenceData = (pointId: string, months: number = 24): SubsidenceData[] => {
  const data: SubsidenceData[] = [];
  let cumulative = 0;
  const baseRate = (Math.random() * 3 + 0.5) / 12;

  for (let i = months; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const variation = (Math.random() - 0.5) * 0.1;
    const monthlySubsidence = baseRate + variation;
    cumulative += monthlySubsidence;

    data.push({
      pointId,
      timestamp: date.toISOString(),
      cumulativeSubsidence: Math.round(cumulative * 100) / 100,
      subsidenceRate: Math.round(monthlySubsidence * 12 * 100) / 100,
    });
  }

  return data;
};

export const generateInSARData = (regionId: string): InSARData => {
  const data = [];
  const provData = provincesData.find(p => p.id === regionId) || provincesData[0];

  for (let i = 0; i < 100; i++) {
    const lngOffset = (Math.random() - 0.5) * 5;
    const latOffset = (Math.random() - 0.5) * 5;
    data.push({
      longitude: provData.lng + lngOffset,
      latitude: provData.lat + latOffset,
      subsidenceRate: Math.round((Math.random() * 4) * 100) / 100,
      cumulativeSubsidence: Math.round((Math.random() * 15) * 100) / 100,
    });
  }

  const rates = data.map(d => d.subsidenceRate);
  return {
    regionId,
    timestamp: format(new Date(), 'yyyy-MM-01'),
    data,
    averageRate: Math.round(rates.reduce((a, b) => a + b, 0) / rates.length * 100) / 100,
    maxRate: Math.round(Math.max(...rates) * 100) / 100,
  };
};

export const generateHydrogeologyParams = (regionId: string): HydrogeologyParams[] => {
  return aquifers.map(aquifer => ({
    regionId,
    aquifer,
    permeabilityCoefficient: Math.round((Math.random() * 50 + 1) * 100) / 100,
    storageCoefficient: Math.round((Math.random() * 0.1 + 0.01) * 10000) / 10000,
    transmissivity: Math.round((Math.random() * 1000 + 100) * 100) / 100,
    specificYield: Math.round((Math.random() * 0.3 + 0.05) * 100) / 100,
  }));
};

export const generateRegionIndicators = (
  provinces: Province[],
  cities: City[],
  timeRange: string = '30d'
): RegionIndicators[] => {
  const indicators: RegionIndicators[] = [];

  const getRiskLevel = (overRate: number, subRate: number): 'low' | 'medium' | 'high' => {
    if (overRate > 30 || subRate > 2) return 'high';
    if (overRate > 15 || subRate > 1) return 'medium';
    return 'low';
  };

  provinces.forEach(province => {
    const overexploitationRate = Math.round((Math.random() * 50) * 10) / 10;
    const subsidenceRate = Math.round((Math.random() * 3.5) * 100) / 100;
    const allowableExtraction = Math.floor(Math.random() * 500000) + 100000;
    const actualExtraction = Math.floor(allowableExtraction * (1 + overexploitationRate / 100));
    const riskLevel = getRiskLevel(overexploitationRate, subsidenceRate);

    indicators.push({
      regionId: province.id,
      regionName: province.name,
      regionType: 'province',
      timeRange,
      overexploitationRate,
      cumulativeSubsidence: Math.round((Math.random() * 20 + 5) * 100) / 100,
      subsidenceRate,
      allowableExtraction,
      actualExtraction,
      allowableMining: allowableExtraction,
      actualMining: actualExtraction,
      remainingAllowable: Math.max(0, allowableExtraction - actualExtraction),
      waterLevelDepth: Math.round((Math.random() * 20 + 10) * 10) / 10,
      historicalMeanDepth: Math.round((Math.random() * 15 + 8) * 10) / 10,
      depthAnomaly: Math.round((Math.random() * 40 - 10) * 10) / 10,
      riskLevel,
    });

    const provinceCities = cities.filter(c => c.provinceId === province.id);
    provinceCities.forEach(city => {
      const cityOverRate = Math.round((Math.random() * 60) * 10) / 10;
      const citySubRate = Math.round((Math.random() * 4) * 100) / 100;
      const cityAllowable = Math.floor(allowableExtraction / provinceCities.length * (0.8 + Math.random() * 0.4));
      const cityActual = Math.floor(cityAllowable * (1 + cityOverRate / 100));
      const cityRiskLevel = getRiskLevel(cityOverRate, citySubRate);

      indicators.push({
        regionId: city.id,
        regionName: city.name,
        regionType: 'city',
        timeRange,
        overexploitationRate: cityOverRate,
        cumulativeSubsidence: Math.round((Math.random() * 25 + 3) * 100) / 100,
        subsidenceRate: citySubRate,
        allowableExtraction: cityAllowable,
        actualExtraction: cityActual,
        allowableMining: cityAllowable,
        actualMining: cityActual,
        remainingAllowable: Math.max(0, cityAllowable - cityActual),
        waterLevelDepth: Math.round((Math.random() * 25 + 8) * 10) / 10,
        historicalMeanDepth: Math.round((Math.random() * 18 + 6) * 10) / 10,
        depthAnomaly: Math.round((Math.random() * 50 - 15) * 10) / 10,
        riskLevel: cityRiskLevel,
      });
    });
  });

  return indicators;
};

const warningTypes: WarningType[] = ['water_level', 'subsidence'];
const warningLevels: WarningLevel[] = ['primary', 'secondary', 'tertiary'];
const warningStatuses: WarningStatus[] = ['pending_confirm', 'confirmed', 'reviewing', 'approved', 'rejected', 'closed'];

const generateApprovalSteps = (status: WarningStatus): ApprovalStep[] => {
  const steps: ApprovalStep[] = [
    { id: generateId(), stepOrder: 1, stepName: '监测站确认', role: 'station', status: 'pending', opinion: '', attachments: [] },
    { id: generateId(), stepOrder: 2, stepName: '省水利厅复核', role: 'provincial', status: 'pending', opinion: '', attachments: [] },
    { id: generateId(), stepOrder: 3, stepName: '水利部批准', role: 'national', status: 'pending', opinion: '', attachments: [] },
  ];

  if (status === 'pending_confirm') {
    steps[0].status = 'pending';
  } else if (status === 'confirmed') {
    steps[0].status = 'approved';
    steps[0].approverName = '张站长';
    steps[0].approvedAt = subDays(new Date(), 2).toISOString();
    steps[0].opinion = '数据核实无误，情况属实';
    steps[1].status = 'pending';
  } else if (status === 'reviewing') {
    steps[0].status = 'approved';
    steps[0].approverName = '张站长';
    steps[0].approvedAt = subDays(new Date(), 5).toISOString();
    steps[0].opinion = '数据核实无误，情况属实';
    steps[1].status = 'approved';
    steps[1].approverName = '李厅长';
    steps[1].approvedAt = subDays(new Date(), 3).toISOString();
    steps[1].opinion = '复核通过，建议实施压采方案';
    steps[2].status = 'pending';
  } else if (status === 'approved') {
    steps.forEach((step, i) => {
      step.status = 'approved';
      step.approverName = ['张站长', '李厅长', '王部长'][i];
      step.approvedAt = subDays(new Date(), 7 - i * 2).toISOString();
      step.opinion = ['数据核实无误', '复核通过', '批准实施'][i];
    });
  } else if (status === 'rejected') {
    steps[0].status = 'approved';
    steps[0].approverName = '张站长';
    steps[0].approvedAt = subDays(new Date(), 10).toISOString();
    steps[1].status = 'rejected';
    steps[1].approverName = '李厅长';
    steps[1].approvedAt = subDays(new Date(), 8).toISOString();
    steps[1].opinion = '数据存在疑问，需重新核实';
    steps[2].status = 'pending';
  }

  return steps;
};

export const generateWarnings = (provinces: Province[]): Warning[] => {
  const warnings: Warning[] = [];
  const highRiskProvinces = provinces.filter(p => ['130000', '370000', '410000', '320000', '110000'].includes(p.id));

  highRiskProvinces.forEach((province, index) => {
    const type = warningTypes[index % 2];
    const level: WarningLevel = 'primary';
    const status: WarningStatus = ['pending_confirm', 'confirmed', 'reviewing', 'approved'][index % 4] as WarningStatus;

    const triggerValue = type === 'water_level' ? Math.round((30 + Math.random() * 20) * 10) / 10 : Math.round((2 + Math.random() * 2) * 100) / 100;
    const threshold = type === 'water_level' ? 30 : 2;

    const triggeredAt = subDays(new Date(), Math.random() * 30 + 5).toISOString();
    const riskLevel: 'low' | 'medium' | 'high' = level === 'primary' ? 'high' : level === 'secondary' ? 'medium' : 'low';

    warnings.push({
      id: generateId(),
      warningNo: `YJ${format(new Date(), 'yyyyMM')}${String(index + 1).padStart(4, '0')}`,
      type,
      level,
      regionId: province.id,
      regionName: province.name,
      triggerCondition: type === 'water_level' ? '连续3个月水位降深超过历史同期均值30%' : '沉降速率连续2个月超过2cm/年',
      triggerValue,
      threshold,
      continuousMonths: Math.floor(Math.random() * 3) + 3,
      status,
      affectedArea: Math.floor(Math.random() * 5000) + 1000,
      affectedPopulation: Math.floor(Math.random() * 500000) + 100000,
      description: type === 'water_level'
        ? `${province.name}近期地下水水位持续下降，已连续多月超过历史同期均值，超采情况严重，需立即采取措施。`
        : `${province.name}地面沉降速率持续超过预警阈值，存在地质灾害风险，需尽快实施压采或回灌方案。`,
      approvalProcess: generateApprovalSteps(status),
      riskLevel,
      triggeredAt,
      createdAt: subDays(new Date(), Math.random() * 30).toISOString(),
      updatedAt: subDays(new Date(), Math.random() * 7).toISOString(),
    });
  });

  return warnings;
};

export const generateMiningPlan = (province: Province, cities: City[]): MiningPlan => {
  const provinceCities = cities.filter(c => c.provinceId === province.id);
  const year = new Date().getFullYear();

  const regionalPlans = provinceCities.map(city => {
    const allowable = Math.floor(Math.random() * 50000) + 10000;
    const planned = Math.floor(allowable * (0.9 + Math.random() * 0.4));
    return {
      regionId: city.id,
      regionName: city.name,
      plannedExtraction: planned,
      allowableExtraction: allowable,
      predictedRisk: (planned > allowable * 1.1 ? 'high' : planned > allowable ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    };
  });

  const totalExtraction = regionalPlans.reduce((sum, r) => sum + r.plannedExtraction, 0);
  const totalAllowable = regionalPlans.reduce((sum, r) => sum + r.allowableExtraction, 0);

  const riskPrediction = Array.from({ length: 12 }, (_, i) => {
    const monthFactor = 0.8 + Math.sin((i / 12) * Math.PI * 2) * 0.2;
    const predicted = Math.floor((totalExtraction / 12) * monthFactor * (0.9 + Math.random() * 0.2));
    const allowable = Math.floor(totalAllowable / 12);
    return {
      month: `${year}-${String(i + 1).padStart(2, '0')}`,
      predictedExtraction: predicted,
      allowableExtraction: allowable,
      riskLevel: (predicted > allowable * 1.2 ? 'high' : predicted > allowable ? 'medium' : 'low') as 'low' | 'medium' | 'high',
      overexploitationAmount: Math.max(0, predicted - allowable),
    };
  });

  const highRiskRegions = regionalPlans.filter(r => r.predictedRisk === 'high');
  const targetRegions = highRiskRegions.slice(0, 3).map(r => ({
    regionId: r.regionId,
    regionName: r.regionName,
    currentExtraction: r.plannedExtraction,
    suggestedReduction: Math.floor(r.plannedExtraction * 0.15),
    reason: `该区域${r.predictedRisk === 'high' ? '超采风险较高' : '已接近开采红线'}，建议压采${Math.floor(r.plannedExtraction * 0.15)}万m³`,
  }));

  const rechargeWells = Array.from({ length: 5 }, (_, i) => {
    const provData = provincesData.find(p => p.id === province.id)!;
    return {
      wellNo: `HG${String(i + 1).padStart(4, '0')}`,
      name: `${province.name}回灌${i + 1}号井`,
      longitude: provData.lng + (Math.random() - 0.5) * 3,
      latitude: provData.lat + (Math.random() - 0.5) * 3,
      suggestedRechargeAmount: Math.floor(Math.random() * 5000) + 2000,
      aquifer: aquifers[Math.floor(Math.random() * aquifers.length)],
      priority: i + 1,
    };
  });

  return {
    id: generateId(),
    planNo: `KH${year}${province.code}`,
    year,
    provinceId: province.id,
    provinceName: province.name,
    totalExtraction,
    regionalPlans,
    status: Math.random() > 0.5 ? 'approved' : 'draft',
    riskPrediction,
    optimizationSuggestion: {
      targetRegions,
      rechargeWells,
      totalReductionTarget: targetRegions.reduce((sum, r) => sum + r.suggestedReduction, 0),
      estimatedEffect: `实施后预计可降低超采率${Math.floor(Math.random() * 15 + 10)}个百分点，有效缓解地面沉降趋势。`,
    },
    createdAt: subDays(new Date(), Math.random() * 180).toISOString(),
    updatedAt: subDays(new Date(), Math.random() * 30).toISOString(),
  };
};

export const generateHealthReport = (province: Province, weekOffset: number): HealthReport => {
  const { start, end } = (() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 - weekOffset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return { start: weekStart, end: weekEnd };
  })();

  return {
    id: generateId(),
    reportNo: `BG${format(start, 'yyyyMMdd')}`,
    reportType: 'weekly',
    periodStart: format(start, 'yyyy-MM-dd'),
    periodEnd: format(end, 'yyyy-MM-dd'),
    regionId: province.id,
    regionName: province.name,
    waterLevelAnalysis: {
      averageLevel: Math.round((Math.random() * 20 + 10) * 10) / 10,
      yoyChange: Math.round((Math.random() * 20 - 10) * 10) / 10,
      momChange: Math.round((Math.random() * 10 - 5) * 10) / 10,
      regionalDistribution: [],
    },
    subsidenceAnalysis: {
      hotspotRegions: Array.from({ length: 3 }, () => ({
        regionId: generateId(),
        regionName: `${province.name.slice(0, 2)}${['A', 'B', 'C'][Math.floor(Math.random() * 3)]}市`,
        subsidenceRate: Math.round((Math.random() * 3 + 1) * 100) / 100,
        cumulativeSubsidence: Math.round((Math.random() * 15 + 5) * 100) / 100,
        riskLevel: Math.random() > 0.5 ? 'high' : 'medium',
      })),
      averageRate: Math.round((Math.random() * 2 + 0.5) * 100) / 100,
      maxRate: Math.round((Math.random() * 3 + 2) * 100) / 100,
      cumulativeSubsidence: Math.round((Math.random() * 30 + 10) * 100) / 100,
    },
    complianceAnalysis: {
      totalWells: Math.floor(Math.random() * 100) + 50,
      compliantWells: Math.floor(Math.random() * 40) + 40,
      complianceRate: 0,
      nonCompliantWells: Array.from({ length: 5 }, (_, i) => ({
        wellId: generateId(),
        wellName: `${province.name.slice(0, 2)}${i + 1}号井`,
        regionName: `${province.name.slice(0, 2)}区`,
        issue: '超量开采',
        overExtractionAmount: Math.floor(Math.random() * 5000) + 1000,
      })),
    },
    recommendations: [
      {
        id: generateId(),
        type: 'extraction_control',
        title: '实施分区压采方案',
        content: '建议对超采严重区域实施阶梯式压采，优先压减高耗水行业用水量。',
        priority: 'high',
      },
      {
        id: generateId(),
        type: 'recharge',
        title: '加快回灌工程建设',
        content: '在沉降漏斗区建设人工回灌井，利用汛期雨洪水进行地下水补给。',
        priority: 'high',
      },
      {
        id: generateId(),
        type: 'monitoring',
        title: '加密监测频率',
        content: '对高风险区域增加监测频次，实时掌握水位和沉降动态变化。',
        priority: 'medium',
      },
      {
        id: generateId(),
        type: 'management',
        title: '完善取水许可制度',
        content: '严格取水许可审批，建立取水户信用档案，实施黑名单制度。',
        priority: 'medium',
      },
    ],
    supervisionPriorities: [
      {
        id: generateId(),
        regionId: generateId(),
        regionName: `${province.name.slice(0, 2)}东部平原区`,
        focus: '地下水开采管控',
        reason: '该区域超采率超过40%，为国家级超采综合治理重点区域。',
      },
      {
        id: generateId(),
        regionId: generateId(),
        regionName: `${province.name.slice(0, 2)}中部工业区`,
        focus: '工业用水计量',
        reason: '工业用水量占比大，部分企业存在无证取水、超量取水问题。',
      },
    ],
    createdAt: end.toISOString(),
    updatedAt: end.toISOString(),
  };
};

export const generateUsers = (): User[] => {
  return [
    {
      id: generateId(),
      username: 'admin',
      name: '王部长',
      role: 'national',
      email: 'admin@mwr.gov.cn',
      phone: '13800138000',
      status: 'active',
      provinceName: '',
      cityName: '',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: generateId(),
      username: 'hebei',
      name: '李厅长',
      role: 'provincial',
      provinceId: '130000',
      provinceName: '河北省',
      cityName: '',
      email: 'li@hebei.gov.cn',
      phone: '13900139000',
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: generateId(),
      username: 'admin_shandong',
      name: '赵厅长',
      role: 'provincial',
      provinceId: '370000',
      provinceName: '山东省',
      cityName: '',
      email: 'zhao@shandong.gov.cn',
      phone: '13900139001',
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: generateId(),
      username: 'admin_henan',
      name: '孙厅长',
      role: 'provincial',
      provinceId: '410000',
      provinceName: '河南省',
      cityName: '',
      email: 'sun@henan.gov.cn',
      phone: '13900139002',
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: generateId(),
      username: 'shijiazhuang',
      name: '周局长',
      role: 'municipal',
      provinceId: '130000',
      cityId: '130000010000',
      provinceName: '河北省',
      cityName: '石家庄市',
      email: 'zhou@sjz.gov.cn',
      phone: '13700137000',
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: generateId(),
      username: 'station1',
      name: '张站长',
      role: 'station',
      provinceId: '130000',
      cityId: '130000010000',
      provinceName: '河北省',
      cityName: '石家庄市',
      email: 'zhang@station.gov.cn',
      phone: '13600136000',
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];
};

export const getProvinceCenter = (provinceId: string): { lng: number; lat: number; name: string } => {
  const prov = provincesData.find(p => p.id === provinceId);
  return prov ? { lng: prov.lng, lat: prov.lat, name: prov.name } : { lng: 104, lat: 35, name: '全国' };
};
