import {
  generateProvinces,
  generateCities,
  generateMonitoringWells,
  generateWaterLevelData,
  generateGNSSPoints,
  generateSubsidenceData,
  generateInSARData,
  generateHydrogeologyParams,
  generateRegionIndicators,
  generateWarnings,
  generateMiningPlan,
  generateHealthReport,
  generateUsers,
  generateId,
  provincesData,
} from './dataGenerator';
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
  WarningStatus,
  WarningType,
  MiningPlan,
  HealthReport,
  User,
  LoginResponse,
  HydrogeologyParams,
  UserRole,
  ApprovalStep,
} from '../../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let provinces: Province[];
let cities: City[];
let monitoringWells: MonitoringWell[];
let gnssPoints: GNSSPoint[];
let regionIndicators: RegionIndicators[];
let warnings: Warning[];
let users: User[];
let miningPlans: MiningPlan[];
let healthReports: HealthReport[];

const initializeData = () => {
  if (provinces) return;

  provinces = generateProvinces();
  cities = generateCities();
  monitoringWells = generateMonitoringWells(provinces, cities);
  gnssPoints = generateGNSSPoints(provinces, cities);
  regionIndicators = generateRegionIndicators(provinces, cities, '30d');
  warnings = generateWarnings(provinces);
  users = generateUsers();

  miningPlans = provinces
    .filter(p => ['130000', '370000', '410000', '320000'].includes(p.id))
    .map(p => generateMiningPlan(p, cities));

  healthReports = [];
  const reportProvinces = provinces.filter(p => ['130000', '370000', '410000'].includes(p.id));
  reportProvinces.forEach(province => {
    for (let i = 0; i < 12; i++) {
      healthReports.push(generateHealthReport(province, i));
    }
  });
};

initializeData();

export const mockApi = {
  auth: {
    login: async (username: string, password: string): Promise<LoginResponse> => {
      await delay(800);
      const user = users.find(u => u.username === username);
      if (!user || password !== '123456') {
        throw new Error('用户名或密码错误');
      }
      localStorage.setItem('mock_user_id', user.id);
      return {
        token: 'mock_token_' + Date.now(),
        user,
        permissions: ['view', 'edit', 'approve'],
      };
    },
    logout: async (): Promise<void> => {
      await delay(300);
      localStorage.removeItem('mock_user_id');
    },
    getCurrentUser: async (): Promise<User | null> => {
      await delay(300);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('mock_user_id');
      if (!token || !userId) return null;
      const user = users.find(u => u.id === userId);
      return user || users[0];
    },
  },

  region: {
    getProvinces: async (): Promise<Province[]> => {
      await delay(300);
      return provinces;
    },
    getCities: async (provinceId?: string): Promise<City[]> => {
      await delay(300);
      if (provinceId) {
        return cities.filter(c => c.provinceId === provinceId);
      }
      return cities;
    },
    getChinaGeoJson: async (): Promise<any> => {
      await delay(200);
      return {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', properties: { name: '北京' }, geometry: { type: 'Polygon', coordinates: [[[115.5, 39.5], [117.5, 39.5], [117.5, 41.0], [115.5, 41.0], [115.5, 39.5]]] } },
          { type: 'Feature', properties: { name: '天津' }, geometry: { type: 'Polygon', coordinates: [[[116.7, 38.7], [118.0, 38.7], [118.0, 40.2], [116.7, 40.2], [116.7, 38.7]]] } },
          { type: 'Feature', properties: { name: '上海' }, geometry: { type: 'Polygon', coordinates: [[[120.9, 30.7], [122.0, 30.7], [122.0, 31.8], [120.9, 31.8], [120.9, 30.7]]] } },
          { type: 'Feature', properties: { name: '重庆' }, geometry: { type: 'Polygon', coordinates: [[[105.3, 28.2], [110.2, 28.2], [110.2, 32.2], [105.3, 32.2], [105.3, 28.2]]] } },
          { type: 'Feature', properties: { name: '河北' }, geometry: { type: 'Polygon', coordinates: [[[113.5, 36.0], [119.8, 36.0], [119.8, 42.6], [113.5, 42.6], [113.5, 36.0]]] } },
          { type: 'Feature', properties: { name: '山西' }, geometry: { type: 'Polygon', coordinates: [[[110.4, 34.5], [114.6, 34.5], [114.6, 40.5], [110.4, 40.5], [110.4, 34.5]]] } },
          { type: 'Feature', properties: { name: '辽宁' }, geometry: { type: 'Polygon', coordinates: [[[119.0, 38.4], [125.8, 38.4], [125.8, 43.5], [119.0, 43.5], [119.0, 38.4]]] } },
          { type: 'Feature', properties: { name: '吉林' }, geometry: { type: 'Polygon', coordinates: [[[121.6, 41.0], [131.3, 41.0], [131.3, 46.3], [121.6, 46.3], [121.6, 41.0]]] } },
          { type: 'Feature', properties: { name: '黑龙江' }, geometry: { type: 'Polygon', coordinates: [[[121.5, 43.4], [135.0, 43.4], [135.0, 53.5], [121.5, 53.5], [121.5, 43.4]]] } },
          { type: 'Feature', properties: { name: '江苏' }, geometry: { type: 'Polygon', coordinates: [[[116.4, 30.8], [121.9, 30.8], [121.9, 35.1], [116.4, 35.1], [116.4, 30.8]]] } },
          { type: 'Feature', properties: { name: '浙江' }, geometry: { type: 'Polygon', coordinates: [[[118.0, 27.0], [123.0, 27.0], [123.0, 31.2], [118.0, 31.2], [118.0, 27.0]]] } },
          { type: 'Feature', properties: { name: '安徽' }, geometry: { type: 'Polygon', coordinates: [[[114.8, 29.4], [119.6, 29.4], [119.6, 34.6], [114.8, 34.6], [114.8, 29.4]]] } },
          { type: 'Feature', properties: { name: '福建' }, geometry: { type: 'Polygon', coordinates: [[[116.0, 23.5], [120.5, 23.5], [120.5, 28.3], [116.0, 28.3], [116.0, 23.5]]] } },
          { type: 'Feature', properties: { name: '江西' }, geometry: { type: 'Polygon', coordinates: [[[113.5, 24.5], [118.5, 24.5], [118.5, 30.1], [113.5, 30.1], [113.5, 24.5]]] } },
          { type: 'Feature', properties: { name: '山东' }, geometry: { type: 'Polygon', coordinates: [[[114.8, 34.2], [122.7, 34.2], [122.7, 38.4], [114.8, 38.4], [114.8, 34.2]]] } },
          { type: 'Feature', properties: { name: '河南' }, geometry: { type: 'Polygon', coordinates: [[[110.4, 31.4], [116.6, 31.4], [116.6, 36.4], [110.4, 36.4], [110.4, 31.4]]] } },
          { type: 'Feature', properties: { name: '湖北' }, geometry: { type: 'Polygon', coordinates: [[[108.3, 29.0], [116.1, 29.0], [116.1, 33.3], [108.3, 33.3], [108.3, 29.0]]] } },
          { type: 'Feature', properties: { name: '湖南' }, geometry: { type: 'Polygon', coordinates: [[[108.8, 24.6], [114.3, 24.6], [114.3, 30.1], [108.8, 30.1], [108.8, 24.6]]] } },
          { type: 'Feature', properties: { name: '广东' }, geometry: { type: 'Polygon', coordinates: [[[109.5, 20.2], [117.3, 20.2], [117.3, 25.5], [109.5, 25.5], [109.5, 20.2]]] } },
          { type: 'Feature', properties: { name: '广西' }, geometry: { type: 'Polygon', coordinates: [[[104.3, 20.5], [112.1, 20.5], [112.1, 26.4], [104.3, 26.4], [104.3, 20.5]]] } },
          { type: 'Feature', properties: { name: '海南' }, geometry: { type: 'Polygon', coordinates: [[[108.6, 18.2], [111.1, 18.2], [111.1, 20.2], [108.6, 20.2], [108.6, 18.2]]] } },
          { type: 'Feature', properties: { name: '四川' }, geometry: { type: 'Polygon', coordinates: [[[97.4, 26.0], [108.5, 26.0], [108.5, 34.3], [97.4, 34.3], [97.4, 26.0]]] } },
          { type: 'Feature', properties: { name: '贵州' }, geometry: { type: 'Polygon', coordinates: [[[103.5, 24.6], [109.6, 24.6], [109.6, 29.2], [103.5, 29.2], [103.5, 24.6]]] } },
          { type: 'Feature', properties: { name: '云南' }, geometry: { type: 'Polygon', coordinates: [[[97.5, 21.1], [106.2, 21.1], [106.2, 29.2], [97.5, 29.2], [97.5, 21.1]]] } },
          { type: 'Feature', properties: { name: '西藏' }, geometry: { type: 'Polygon', coordinates: [[[78.4, 26.8], [99.1, 26.8], [99.1, 36.5], [78.4, 36.5], [78.4, 26.8]]] } },
          { type: 'Feature', properties: { name: '陕西' }, geometry: { type: 'Polygon', coordinates: [[[105.5, 31.7], [111.2, 31.7], [111.2, 39.6], [105.5, 39.6], [105.5, 31.7]]] } },
          { type: 'Feature', properties: { name: '甘肃' }, geometry: { type: 'Polygon', coordinates: [[[92.2, 32.5], [108.7, 32.5], [108.7, 42.8], [92.2, 42.8], [92.2, 32.5]]] } },
          { type: 'Feature', properties: { name: '青海' }, geometry: { type: 'Polygon', coordinates: [[[89.4, 31.6], [103.1, 31.6], [103.1, 39.2], [89.4, 39.2], [89.4, 31.6]]] } },
          { type: 'Feature', properties: { name: '内蒙古' }, geometry: { type: 'Polygon', coordinates: [[[97.2, 37.4], [126.1, 37.4], [126.1, 53.6], [97.2, 53.6], [97.2, 37.4]]] } },
          { type: 'Feature', properties: { name: '宁夏' }, geometry: { type: 'Polygon', coordinates: [[[104.3, 35.2], [107.7, 35.2], [107.7, 39.4], [104.3, 39.4], [104.3, 35.2]]] } },
          { type: 'Feature', properties: { name: '新疆' }, geometry: { type: 'Polygon', coordinates: [[[73.5, 34.2], [96.4, 34.2], [96.4, 49.2], [73.5, 49.2], [73.5, 34.2]]] } },
          { type: 'Feature', properties: { name: '台湾' }, geometry: { type: 'Polygon', coordinates: [[[120.0, 21.9], [122.0, 21.9], [122.0, 25.3], [120.0, 25.3], [120.0, 21.9]]] } },
          { type: 'Feature', properties: { name: '香港' }, geometry: { type: 'Polygon', coordinates: [[[113.8, 22.1], [114.3, 22.1], [114.3, 22.6], [113.8, 22.6], [113.8, 22.1]]] } },
          { type: 'Feature', properties: { name: '澳门' }, geometry: { type: 'Polygon', coordinates: [[[113.5, 22.1], [113.6, 22.1], [113.6, 22.2], [113.5, 22.2], [113.5, 22.1]]] } },
        ],
      };
    },
  },

  monitoring: {
    getMonitoringWells: async (provinceId?: string, cityId?: string): Promise<MonitoringWell[]> => {
      await delay(400);
      let result = monitoringWells;
      if (provinceId) {
        result = result.filter(w => w.provinceId === provinceId);
      }
      if (cityId) {
        result = result.filter(w => w.cityId === cityId);
      }
      return result;
    },
    getWaterLevelData: async (wellId: string, days: number = 90): Promise<WaterLevelData[]> => {
      await delay(500);
      return generateWaterLevelData(wellId, days);
    },
    getGNSSPoints: async (provinceId?: string, cityId?: string): Promise<GNSSPoint[]> => {
      await delay(400);
      let result = gnssPoints;
      if (provinceId) {
        result = result.filter(p => p.provinceId === provinceId);
      }
      if (cityId) {
        result = result.filter(p => p.cityId === cityId);
      }
      return result;
    },
    getSubsidenceData: async (pointId: string, months: number = 24): Promise<SubsidenceData[]> => {
      await delay(500);
      return generateSubsidenceData(pointId, months);
    },
    getInSARData: async (regionId: string): Promise<InSARData> => {
      await delay(600);
      return generateInSARData(regionId);
    },
    getHydrogeologyParams: async (regionId: string): Promise<HydrogeologyParams[]> => {
      await delay(400);
      return generateHydrogeologyParams(regionId);
    },
  },

  indicators: {
    getNationalIndicators: async (timeRange: string = '30d'): Promise<RegionIndicators[]> => {
      await delay(500);
      return regionIndicators.filter(i => i.regionType === 'province');
    },
    getRegionIndicators: async (regionId: string, timeRange: string = '30d'): Promise<RegionIndicators> => {
      await delay(400);
      const indicator = regionIndicators.find(i => i.regionId === regionId);
      if (!indicator) {
        throw new Error('Region not found');
      }
      return indicator;
    },
    getRegionIndicatorsList: async (provinceId?: string, timeRange: string = '30d'): Promise<RegionIndicators[]> => {
      await delay(500);
      if (provinceId) {
        return regionIndicators.filter(i => i.regionType === 'city' && cities.find(c => c.id === i.regionId)?.provinceId === provinceId);
      }
      return regionIndicators;
    },
  },

  warning: {
    getWarnings: async (
      params: {
        status?: WarningStatus;
        type?: WarningType;
        regionId?: string;
        page?: number;
        pageSize?: number;
      } = {}
    ): Promise<{ data: Warning[]; total: number }> => {
      await delay(500);
      let result = [...warnings];

      if (params.status) {
        result = result.filter(w => w.status === params.status);
      }
      if (params.type) {
        result = result.filter(w => w.type === params.type);
      }
      if (params.regionId) {
        result = result.filter(w => w.regionId === params.regionId);
      }

      const total = result.length;
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;

      return {
        data: result.slice(start, end),
        total,
      };
    },
    getWarningById: async (id: string): Promise<Warning> => {
      await delay(300);
      const warning = warnings.find(w => w.id === id);
      if (!warning) {
        throw new Error('Warning not found');
      }
      return warning;
    },
    confirmWarning: async (id: string, opinion: string): Promise<Warning> => {
      await delay(500);
      const warning = warnings.find(w => w.id === id);
      if (!warning) throw new Error('Warning not found');

      warning.status = 'confirmed';
      const step = warning.approvalProcess.find(s => s.stepOrder === 1);
      if (step) {
        step.status = 'approved';
        step.approverName = '当前用户';
        step.approvedAt = new Date().toISOString();
        step.opinion = opinion;
      }

      return warning;
    },
    reviewWarning: async (id: string, opinion: string): Promise<Warning> => {
      await delay(500);
      const warning = warnings.find(w => w.id === id);
      if (!warning) throw new Error('Warning not found');

      warning.status = 'reviewing';
      const step = warning.approvalProcess.find(s => s.stepOrder === 2);
      if (step) {
        step.status = 'approved';
        step.approverName = '当前用户';
        step.approvedAt = new Date().toISOString();
        step.opinion = opinion;
      }

      return warning;
    },
    approveWarning: async (id: string, opinion: string): Promise<Warning> => {
      await delay(500);
      const warning = warnings.find(w => w.id === id);
      if (!warning) throw new Error('Warning not found');

      warning.status = 'approved';
      const step = warning.approvalProcess.find(s => s.stepOrder === 3);
      if (step) {
        step.status = 'approved';
        step.approverName = '当前用户';
        step.approvedAt = new Date().toISOString();
        step.opinion = opinion;
      }

      return warning;
    },
    rejectWarning: async (id: string, opinion: string): Promise<Warning> => {
      await delay(500);
      const warning = warnings.find(w => w.id === id);
      if (!warning) throw new Error('Warning not found');

      warning.status = 'rejected';
      const pendingStep = warning.approvalProcess.find(s => s.status === 'pending');
      if (pendingStep) {
        pendingStep.status = 'rejected';
        pendingStep.approverName = '当前用户';
        pendingStep.approvedAt = new Date().toISOString();
        pendingStep.opinion = opinion;
      }

      return warning;
    },
    closeWarning: async (id: string): Promise<Warning> => {
      await delay(500);
      const warning = warnings.find(w => w.id === id);
      if (!warning) throw new Error('Warning not found');

      warning.status = 'closed';
      return warning;
    },
  },

  mining: {
    getMiningPlans: async (year?: number, provinceId?: string): Promise<MiningPlan[]> => {
      await delay(500);
      let result = miningPlans;
      if (year) {
        result = result.filter(p => p.year === year);
      }
      if (provinceId) {
        result = result.filter(p => p.provinceId === provinceId);
      }
      return result;
    },
    getMiningPlanById: async (id: string): Promise<MiningPlan> => {
      await delay(400);
      const plan = miningPlans.find(p => p.id === id);
      if (!plan) throw new Error('Mining plan not found');
      return plan;
    },
    uploadMiningPlan: async (data: any[]): Promise<MiningPlan> => {
      await delay(1000);
      if (!data || data.length === 0) {
        throw new Error('上传数据为空');
      }

      const firstRow = data[0];
      const provinceId = firstRow.regionCode
        ? String(firstRow.regionCode).slice(0, 2) + '0000'
        : provinces[0].id;
      const province = provinces.find(p => p.id === provinceId) || provinces[0];
      const year = new Date().getFullYear();

      const regionalPlans = data.map((row: any) => {
        const cityId = row.regionCode || String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        const cityName = row.regionName || '未知区域';
        const planned = Number(row.plannedExtraction) || Math.floor(Math.random() * 50000) + 10000;
        const allowable = Math.floor(planned / (0.9 + Math.random() * 0.3));
        return {
          regionId: cityId,
          regionName: cityName,
          plannedExtraction: planned,
          allowableExtraction: allowable,
          predictedRisk: (planned > allowable * 1.1 ? 'high' : planned > allowable ? 'medium' : 'low') as 'low' | 'medium' | 'high',
        };
      });

      const totalExtraction = regionalPlans.reduce((sum: number, r: any) => sum + r.plannedExtraction, 0);
      const totalAllowable = regionalPlans.reduce((sum: number, r: any) => sum + r.allowableExtraction, 0);

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

      const highRiskRegions = regionalPlans.filter((r: any) => r.predictedRisk === 'high');
      const targetRegions = highRiskRegions.slice(0, 3).map((r: any) => ({
        regionId: r.regionId,
        regionName: r.regionName,
        currentExtraction: r.plannedExtraction,
        suggestedReduction: Math.floor(r.plannedExtraction * 0.15),
        reason: `该区域${r.predictedRisk === 'high' ? '超采风险较高' : '已接近开采红线'}，建议压采${Math.floor(r.plannedExtraction * 0.15)}万m³`,
      }));

      const rechargeWells = Array.from({ length: 5 }, (_, i) => {
        const provData = provincesData.find((p: any) => p.id === province.id) || provincesData[0];
        return {
          wellNo: `HG${String(i + 1).padStart(4, '0')}`,
          name: `${province.name}回灌${i + 1}号井`,
          longitude: provData.lng + (Math.random() - 0.5) * 3,
          latitude: provData.lat + (Math.random() - 0.5) * 3,
          suggestedRechargeAmount: Math.floor(Math.random() * 5000) + 2000,
          aquifer: firstRow.aquifer || '潜水含水层',
          priority: i + 1,
        };
      });

      const plan: MiningPlan = {
        id: generateId(),
        planNo: `KH${year}${province.code || province.id}`,
        year,
        provinceId: province.id,
        provinceName: province.name,
        totalExtraction,
        regionalPlans,
        status: 'draft',
        riskPrediction,
        optimizationSuggestion: {
          targetRegions,
          rechargeWells,
          totalReductionTarget: targetRegions.reduce((sum: number, r: any) => sum + r.suggestedReduction, 0),
          estimatedEffect: `实施后预计可降低超采率${Math.floor(Math.random() * 15 + 10)}个百分点，有效缓解地面沉降趋势。`,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      miningPlans.push(plan);
      return plan;
    },
    submitMiningPlan: async (id: string): Promise<MiningPlan> => {
      await delay(500);
      const plan = miningPlans.find(p => p.id === id);
      if (!plan) throw new Error('Mining plan not found');
      plan.status = 'submitted';
      return plan;
    },
    approveMiningPlan: async (id: string): Promise<MiningPlan> => {
      await delay(500);
      const plan = miningPlans.find(p => p.id === id);
      if (!plan) throw new Error('Mining plan not found');
      plan.status = 'approved';
      return plan;
    },
  },

  report: {
    getReports: async (
      params: {
        type?: 'weekly' | 'monthly' | 'quarterly';
        regionId?: string;
        startDate?: string;
        endDate?: string;
      } = {}
    ): Promise<HealthReport[]> => {
      await delay(500);
      let result = [...healthReports];

      if (params.type) {
        result = result.filter(r => r.reportType === params.type);
      }
      if (params.regionId) {
        result = result.filter(r => r.regionId === params.regionId);
      }
      if (params.startDate) {
        result = result.filter(r => r.periodStart >= params.startDate!);
      }
      if (params.endDate) {
        result = result.filter(r => r.periodEnd <= params.endDate!);
      }

      return result.sort((a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime());
    },
    getReportById: async (id: string): Promise<HealthReport> => {
      await delay(400);
      const report = healthReports.find(r => r.id === id);
      if (!report) throw new Error('Report not found');
      return report;
    },
    generateReport: async (): Promise<HealthReport> => {
      await delay(1500);
      const userId = localStorage.getItem('mock_user_id');
      const currentUser = users.find(u => u.id === userId);
      let province: Province;
      if (currentUser?.provinceId) {
        province = provinces.find(p => p.id === currentUser.provinceId) || provinces[0];
      } else {
        province = provinces[Math.floor(Math.random() * provinces.length)];
      }
      const report = generateHealthReport(province, 0);
      healthReports.unshift(report);
      return report;
    },
  },

  user: {
    getUsers: async (): Promise<User[]> => {
      await delay(400);
      return users;
    },
    createUser: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
      await delay(500);
      const newUser: User = {
        ...userData,
        id: Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(newUser);
      return newUser;
    },
    updateUser: async (data: { id: string } & Partial<User>): Promise<User> => {
      await delay(500);
      const { id, ...userData } = data;
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      users[index] = { ...users[index], ...userData, updatedAt: new Date().toISOString() };
      return users[index];
    },
    deleteUser: async (id: string): Promise<void> => {
      await delay(500);
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('User not found');
      users.splice(index, 1);
    },
  },
};
