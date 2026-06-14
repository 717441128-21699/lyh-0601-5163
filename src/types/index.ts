export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'national' | 'provincial' | 'municipal' | 'station';

export interface User extends BaseEntity {
  username: string;
  name: string;
  role: UserRole;
  provinceId?: string;
  provinceName?: string;
  cityId?: string;
  cityName?: string;
  stationId?: string;
  email: string;
  phone: string;
  status: 'active' | 'disabled';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  permissions: string[];
}

export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface City {
  id: string;
  provinceId: string;
  name: string;
  code: string;
}

export type WellType = 'observation' | 'mining' | 'recharge';

export interface MonitoringWell extends BaseEntity {
  wellNo: string;
  wellCode: string;
  name: string;
  provinceId: string;
  cityId: string;
  aquifer: string;
  aquiferType: string;
  longitude: number;
  latitude: number;
  depth: number;
  wellDepth: number;
  depthToWater: number;
  type: WellType;
  status: 'online' | 'offline' | 'maintenance';
  dailyExtraction?: number;
  compliant?: boolean;
}

export interface WaterLevelData {
  wellId: string;
  timestamp: string;
  recordTime: string;
  waterLevel: number;
  temperature: number;
  conductivity: number;
}

export interface HydrogeologyParams {
  regionId: string;
  aquifer: string;
  permeabilityCoefficient: number;
  storageCoefficient: number;
  transmissivity: number;
  specificYield: number;
}

export interface GNSSPoint extends BaseEntity {
  pointNo: string;
  name: string;
  provinceId: string;
  cityId: string;
  longitude: number;
  latitude: number;
  elevation: number;
}

export interface SubsidenceData {
  pointId: string;
  timestamp: string;
  cumulativeSubsidence: number;
  subsidenceRate: number;
}

export interface InSARDataPoint {
  longitude: number;
  latitude: number;
  subsidenceRate: number;
  cumulativeSubsidence: number;
}

export interface InSARData {
  regionId: string;
  timestamp: string;
  data: InSARDataPoint[];
  averageRate: number;
  maxRate: number;
}

export interface RegionIndicators {
  regionId: string;
  regionName: string;
  regionType: 'province' | 'city';
  timeRange: string;
  overexploitationRate: number;
  cumulativeSubsidence: number;
  subsidenceRate: number;
  allowableExtraction: number;
  actualExtraction: number;
  allowableMining: number;
  actualMining: number;
  remainingAllowable: number;
  waterLevelDepth: number;
  historicalMeanDepth: number;
  depthAnomaly: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export type WarningType = 'water_level' | 'subsidence';
export type WarningLevel = 'primary' | 'secondary' | 'tertiary';
export type WarningStatus = 'pending_confirm' | 'confirmed' | 'reviewing' | 'approved' | 'rejected' | 'closed';

export interface ApprovalStep {
  id: string;
  stepOrder: number;
  stepName: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  approverName?: string;
  approvedAt?: string;
  opinion: string;
  attachments: string[];
}

export interface Warning extends BaseEntity {
  warningNo: string;
  type: WarningType;
  level: WarningLevel;
  regionId: string;
  regionName: string;
  triggerCondition: string;
  triggerValue: number;
  threshold: number;
  continuousMonths: number;
  status: WarningStatus;
  affectedArea: number;
  affectedPopulation: number;
  description: string;
  approvalProcess: ApprovalStep[];
  riskLevel: 'low' | 'medium' | 'high';
  triggeredAt: string;
}

export type MiningPlanStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface RegionalMiningPlan {
  regionId: string;
  regionName: string;
  plannedExtraction: number;
  allowableExtraction: number;
  predictedRisk: 'low' | 'medium' | 'high';
}

export interface RiskPrediction {
  month: string;
  predictedExtraction: number;
  allowableExtraction: number;
  riskLevel: 'low' | 'medium' | 'high';
  overexploitationAmount: number;
}

export interface TargetRegion {
  regionId: string;
  regionName: string;
  currentExtraction: number;
  suggestedReduction: number;
  reason: string;
}

export interface RechargeWell {
  wellNo: string;
  name: string;
  longitude: number;
  latitude: number;
  suggestedRechargeAmount: number;
  aquifer: string;
  priority: number;
}

export interface OptimizationSuggestion {
  targetRegions: TargetRegion[];
  rechargeWells: RechargeWell[];
  totalReductionTarget: number;
  estimatedEffect: string;
}

export interface MiningPlan extends BaseEntity {
  planNo: string;
  year: number;
  provinceId: string;
  provinceName: string;
  totalExtraction: number;
  regionalPlans: RegionalMiningPlan[];
  status: MiningPlanStatus;
  riskPrediction: RiskPrediction[];
  optimizationSuggestion: OptimizationSuggestion;
}

export type ReportType = 'weekly' | 'monthly' | 'quarterly';

export interface RegionalLevel {
  regionId: string;
  regionName: string;
  averageLevel: number;
  yoyChange: number;
  momChange: number;
}

export interface WaterLevelAnalysis {
  averageLevel: number;
  yoyChange: number;
  momChange: number;
  regionalDistribution: RegionalLevel[];
}

export interface HotspotRegion {
  regionId: string;
  regionName: string;
  subsidenceRate: number;
  cumulativeSubsidence: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface SubsidenceAnalysis {
  hotspotRegions: HotspotRegion[];
  averageRate: number;
  maxRate: number;
  cumulativeSubsidence: number;
}

export interface NonCompliantWell {
  wellId: string;
  wellName: string;
  regionName: string;
  issue: string;
  overExtractionAmount: number;
}

export interface ComplianceAnalysis {
  totalWells: number;
  compliantWells: number;
  complianceRate: number;
  nonCompliantWells: NonCompliantWell[];
}

export type RecommendationType = 'extraction_control' | 'recharge' | 'monitoring' | 'management';

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SupervisionPriority {
  id: string;
  regionId: string;
  regionName: string;
  focus: string;
  reason: string;
}

export interface HealthReport extends BaseEntity {
  reportNo: string;
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
  regionId: string;
  regionName: string;
  waterLevelAnalysis: WaterLevelAnalysis;
  subsidenceAnalysis: SubsidenceAnalysis;
  complianceAnalysis: ComplianceAnalysis;
  recommendations: Recommendation[];
  supervisionPriorities: SupervisionPriority[];
}

export interface MapPoint {
  name: string;
  value: [number, number, number];
  regionId?: string;
}

export interface FunnelDataPoint {
  x: number;
  y: number;
  value: number;
}

export type TimeRange = '7d' | '30d' | '90d' | '180d' | '1y';

export interface FilterState {
  provinceId?: string;
  cityId?: string;
  aquifer?: string;
  timeRange: TimeRange;
}
