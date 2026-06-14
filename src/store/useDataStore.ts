import { create } from 'zustand';
import { mockApi } from '../services/mock';
import type {
  Province,
  City,
  MonitoringWell,
  WaterLevelData,
  GNSSPoint,
  SubsidenceData,
  InSARData,
  RegionIndicators,
  MiningPlan,
  HealthReport,
  HydrogeologyParams,
  TimeRange,
  FilterState,
} from '../types';

interface DataState {
  provinces: Province[];
  cities: City[];
  monitoringWells: MonitoringWell[];
  waterLevelData: WaterLevelData[];
  gnssPoints: GNSSPoint[];
  regionIndicators: RegionIndicators[];
  miningPlans: MiningPlan[];
  healthReports: HealthReport[];

  selectedWellData: WaterLevelData[];
  selectedPointData: SubsidenceData[];
  selectedRegionInSAR: InSARData | null;
  selectedRegionParams: HydrogeologyParams[];
  selectedRegionIndicators: RegionIndicators | null;

  filters: FilterState;
  loading: boolean;
  error: string | null;

  setFilters: (filters: Partial<FilterState>) => void;
  loadProvinces: () => Promise<void>;
  loadCities: (provinceId?: string) => Promise<void>;
  loadMonitoringWells: (provinceId?: string, cityId?: string) => Promise<void>;
  loadWaterLevelData: (wellId: string, days?: number) => Promise<WaterLevelData[]>;
  loadGNSSPoints: (provinceId?: string, cityId?: string) => Promise<void>;
  loadSubsidenceData: (pointId: string, months?: number) => Promise<void>;
  loadInSARData: (regionId: string) => Promise<void>;
  loadHydrogeologyParams: (regionId: string) => Promise<void>;
  loadNationalIndicators: (timeRange?: string) => Promise<void>;
  loadRegionIndicators: (regionId: string, timeRange?: string) => Promise<void>;
  loadMiningPlans: (year?: number, provinceId?: string) => Promise<void>;
  loadHealthReports: (params?: {
    type?: 'weekly' | 'monthly' | 'quarterly';
    regionId?: string;
  }) => Promise<void>;
  generateHealthReport: () => Promise<HealthReport>;
  uploadMiningPlan: (data: any[]) => Promise<MiningPlan>;
  submitMiningPlan: (id: string) => Promise<MiningPlan>;
  clearError: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  provinces: [],
  cities: [],
  monitoringWells: [],
  waterLevelData: [],
  gnssPoints: [],
  regionIndicators: [],
  miningPlans: [],
  healthReports: [],

  selectedWellData: [],
  selectedPointData: [],
  selectedRegionInSAR: null,
  selectedRegionParams: [],
  selectedRegionIndicators: null,

  filters: {
    provinceId: undefined,
    cityId: undefined,
    aquifer: undefined,
    timeRange: '90d',
  },

  loading: false,
  error: null,

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  loadProvinces: async () => {
    set({ loading: true });
    try {
      const data = await mockApi.region.getProvinces();
      set({ provinces: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadCities: async (provinceId) => {
    set({ loading: true });
    try {
      const data = await mockApi.region.getCities(provinceId);
      set({ cities: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadMonitoringWells: async (provinceId, cityId) => {
    set({ loading: true });
    try {
      const data = await mockApi.monitoring.getMonitoringWells(provinceId, cityId);
      set({ monitoringWells: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadWaterLevelData: async (wellId, days = 90) => {
    set({ loading: true });
    try {
      const data = await mockApi.monitoring.getWaterLevelData(wellId, days);
      set({ selectedWellData: data, waterLevelData: data, loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  loadGNSSPoints: async (provinceId, cityId) => {
    set({ loading: true });
    try {
      const data = await mockApi.monitoring.getGNSSPoints(provinceId, cityId);
      set({ gnssPoints: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadSubsidenceData: async (pointId, months = 24) => {
    set({ loading: true });
    try {
      const data = await mockApi.monitoring.getSubsidenceData(pointId, months);
      set({ selectedPointData: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadInSARData: async (regionId) => {
    set({ loading: true });
    try {
      const data = await mockApi.monitoring.getInSARData(regionId);
      set({ selectedRegionInSAR: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadHydrogeologyParams: async (regionId) => {
    set({ loading: true });
    try {
      const data = await mockApi.monitoring.getHydrogeologyParams(regionId);
      set({ selectedRegionParams: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadNationalIndicators: async (timeRange = '30d') => {
    set({ loading: true });
    try {
      const data = await mockApi.indicators.getNationalIndicators(timeRange);
      set({ regionIndicators: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadRegionIndicators: async (regionId, timeRange = '30d') => {
    set({ loading: true });
    try {
      const data = await mockApi.indicators.getRegionIndicators(regionId, timeRange);
      set({ selectedRegionIndicators: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadMiningPlans: async (year, provinceId) => {
    set({ loading: true });
    try {
      const data = await mockApi.mining.getMiningPlans(year, provinceId);
      set({ miningPlans: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadHealthReports: async (params) => {
    set({ loading: true });
    try {
      const data = await mockApi.report.getReports(params);
      set({ healthReports: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  generateHealthReport: async () => {
    set({ loading: true });
    try {
      const report = await mockApi.report.generateReport();
      set((state) => ({
        healthReports: [report, ...state.healthReports],
        loading: false,
      }));
      return report;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  uploadMiningPlan: async (data) => {
    set({ loading: true });
    try {
      const plan = await mockApi.mining.uploadMiningPlan(data);
      set((state) => ({
        miningPlans: [plan, ...state.miningPlans],
        loading: false,
      }));
      return plan;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  submitMiningPlan: async (id) => {
    set({ loading: true });
    try {
      const plan = await mockApi.mining.submitMiningPlan(id);
      set((state) => ({
        miningPlans: state.miningPlans.map((p) => (p.id === id ? plan : p)),
        loading: false,
      }));
      return plan;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
