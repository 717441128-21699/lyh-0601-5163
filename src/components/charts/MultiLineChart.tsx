import React from 'react';
import { BaseChart } from './BaseChart';

interface MultiLineChartProps {
  series: Array<{
    name: string;
    data: number[];
    color?: string;
  }>;
  xAxisData: string[];
  title?: string;
  subtitle?: string;
  yAxisName?: string;
  height?: number;
  smooth?: boolean;
  areaStyle?: boolean;
  showLegend?: boolean;
  className?: string;
}

const defaultColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  series,
  xAxisData,
  title,
  subtitle,
  yAxisName,
  height = 300,
  smooth = true,
  areaStyle = false,
  showLegend = true,
  className,
}) => {
  const option = {
    title: title
      ? {
          text: title,
          subtext: subtitle,
          textStyle: {
            color: '#f1f5f9',
            fontSize: 14,
            fontWeight: 600,
          },
          subtextStyle: {
            color: '#64748b',
            fontSize: 12,
          },
          left: 'center',
        }
      : undefined,
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: {
        color: '#f1f5f9',
      },
      axisPointer: {
        type: 'cross' as const,
        lineStyle: {
          color: 'rgba(59, 130, 246, 0.5)',
        },
      },
    },
    legend: showLegend
      ? {
          data: series.map((s) => s.name),
          textStyle: {
            color: '#94a3b8',
          },
          top: 0,
        }
      : undefined,
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: title ? '60px' : '30px',
      containLabel: true,
    },
    xAxis: {
      type: 'category' as const,
      boundaryGap: false,
      data: xAxisData,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
      },
      axisTick: {
        show: false,
      },
    },
    yAxis: {
      type: 'value' as const,
      name: yAxisName,
      nameTextStyle: {
        color: '#64748b',
        fontSize: 11,
      },
      axisLine: {
        show: false,
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
    series: series.map((s, index) => ({
      name: s.name,
      type: 'line' as const,
      smooth,
      symbol: 'circle' as const,
      symbolSize: 6,
      showSymbol: false,
      itemStyle: {
        color: s.color || defaultColors[index % defaultColors.length],
      },
      lineStyle: {
        width: 2,
        color: s.color || defaultColors[index % defaultColors.length],
      },
      areaStyle: areaStyle
        ? {
            color: {
              type: 'linear' as const,
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: `${s.color || defaultColors[index % defaultColors.length]}30`,
                },
                {
                  offset: 1,
                  color: `${s.color || defaultColors[index % defaultColors.length]}05`,
                },
              ],
            },
          }
        : undefined,
      data: s.data,
      emphasis: {
        focus: 'series' as const,
        itemStyle: {
          borderWidth: 2,
          borderColor: s.color || defaultColors[index % defaultColors.length],
        },
      },
    })),
  };

  return <BaseChart option={option} height={height} className={className} />;
};
