import type { RegionIndicators, WaterLevelData, SubsidenceData } from '../types';

export const calculateOverexploitationRate = (
  actualExtraction: number,
  allowableExtraction: number
): number => {
  if (allowableExtraction === 0) return 0;
  return Math.max(0, ((actualExtraction - allowableExtraction) / allowableExtraction) * 100);
};

export const calculateSubsidenceRate = (
  subsidenceData: SubsidenceData[]
): number => {
  if (subsidenceData.length < 2) return 0;
  const first = subsidenceData[0];
  const last = subsidenceData[subsidenceData.length - 1];
  const timeDiff = (new Date(last.timestamp).getTime() - new Date(first.timestamp).getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (timeDiff === 0) return 0;
  return (last.cumulativeSubsidence - first.cumulativeSubsidence) / timeDiff;
};

export const calculateWaterLevelTrend = (
  waterLevelData: WaterLevelData[]
): { trend: 'rising' | 'falling' | 'stable'; rate: number } => {
  if (waterLevelData.length < 2) return { trend: 'stable', rate: 0 };

  const n = waterLevelData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

  waterLevelData.forEach((data, i) => {
    sumX += i;
    sumY += data.waterLevel;
    sumXY += i * data.waterLevel;
    sumXX += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

  if (Math.abs(slope) < 0.01) return { trend: 'stable', rate: slope };
  return slope > 0 ? { trend: 'rising', rate: slope } : { trend: 'falling', rate: slope };
};

export const calculateDepthAnomaly = (
  currentDepth: number,
  historicalMean: number
): { percentage: number; status: 'normal' | 'warning' | 'danger' } => {
  const percentage = ((currentDepth - historicalMean) / historicalMean) * 100;

  if (percentage > 30) return { percentage, status: 'danger' };
  if (percentage > 15) return { percentage, status: 'warning' };
  return { percentage, status: 'normal' };
};

export const calculateRemainingAllowable = (
  allowableExtraction: number,
  actualExtraction: number
): number => {
  return Math.max(0, allowableExtraction - actualExtraction);
};

export const calculateComplianceRate = (
  compliant: number,
  total: number
): number => {
  if (total === 0) return 100;
  return (compliant / total) * 100;
};

export const calculateRiskLevel = (
  overexploitationRate: number,
  subsidenceRate: number
): 'low' | 'medium' | 'high' => {
  if (overexploitationRate > 30 || subsidenceRate > 2) return 'high';
  if (overexploitationRate > 15 || subsidenceRate > 1) return 'medium';
  return 'low';
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
};

export const formatUnit = (num: number, unit: string, decimals: number = 2): string => {
  if (Math.abs(num) >= 100000000) {
    return `${(num / 100000000).toFixed(decimals)}亿${unit}`;
  }
  if (Math.abs(num) >= 10000) {
    return `${(num / 10000).toFixed(decimals)}万${unit}`;
  }
  return `${num.toFixed(decimals)}${unit}`;
};

export const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#dc2626',
  };
  return colors[risk];
};

export const getOverexploitationColor = (rate: number): string => {
  if (rate > 40) return '#dc2626';
  if (rate > 20) return '#f59e0b';
  if (rate > 10) return '#eab308';
  if (rate > 0) return '#84cc16';
  return '#10b981';
};

export const getSubsidenceColor = (rate: number): string => {
  if (rate > 3) return '#dc2626';
  if (rate > 2) return '#f59e0b';
  if (rate > 1) return '#eab308';
  if (rate > 0.5) return '#84cc16';
  return '#10b981';
};

export const generateRiskPrediction = (
  historicalData: RegionIndicators[],
  plannedExtraction: number[],
  allowableExtraction: number
) => {
  return plannedExtraction.map((extraction, i) => {
    const riskLevel = extraction > allowableExtraction ? (extraction > allowableExtraction * 1.2 ? 'high' : 'medium') : 'low';
    return {
      month: `2024-${String(i + 1).padStart(2, '0')}`,
      predictedExtraction: extraction,
      allowableExtraction,
      riskLevel,
      overexploitationAmount: Math.max(0, extraction - allowableExtraction),
    };
  });
};
